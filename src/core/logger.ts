/**
 * Logger implementation for structured logging with file support
 */

import { open, mkdir, rename, type FileHandle } from 'fs/promises'
import { statfs } from 'fs/promises' // Issue #6: Disk space check (Node 18+)
import { join } from 'path'
import type { Logger, LogLevel, LogEntry, LoggerConfig } from '../types.js'

/**
 * Default logger configuration
 */
const DEFAULT_LOGGER_CONFIG: Required<LoggerConfig> = {
  level: 'info',
  enableFileLog: false,
  outputDir: '.mcp-artifacts',
  bufferSize: 100,
  flushInterval: 5000,
}

/**
 * Log level priorities for filtering
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Internal file writer with buffering for async log writing
 */
class FileWriter {
  private buffer: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout
  private fileHandle?: FileHandle
  private disposed = false
  private filePath?: string
  private flushInProgress = false // Issue #2: Prevent concurrent flushes
  private failureCount = 0 // Issue #1: Circuit breaker for persistent failures
  private readonly MAX_FAILURES = 3 // Disable after 3 consecutive failures

  constructor(
    private sessionId: string,
    private outputDir: string,
    private bufferSize: number,
    private flushInterval: number
  ) {
    this.startFlushTimer()
  }

  /**
   * Add log entry to buffer (non-blocking)
   */
  write(entry: LogEntry): void {
    if (this.disposed) return

    this.buffer.push(entry)

    // Trigger flush if buffer is full
    if (this.buffer.length >= this.bufferSize) {
      // Fire-and-forget flush (non-blocking)
      void this.flush().catch((err) => {
        console.error('Failed to flush log buffer:', err)
      })
    }
  }

  /**
   * Flush buffer to file
   */
  async flush(): Promise<void> {
    // Issue #2: Prevent concurrent flushes
    if (this.buffer.length === 0 || this.disposed || this.flushInProgress) return

    this.flushInProgress = true
    try {
      // Extract buffer entries
      const entries = this.buffer.splice(0, this.buffer.length)
      const lines =
        entries
          .map((e) => {
            try {
              // Issue #13: Handle circular references
              return JSON.stringify(e)
            } catch (error) {
              return JSON.stringify({
                ...e,
                context: '<Serialization failed: circular reference>',
                _serializationError: error instanceof Error ? error.message : String(error),
              })
            }
          })
          .join('\n') + '\n'

      try {
        // Ensure file handle is open
        if (!this.fileHandle) {
          await this.ensureLogDirectory()
          this.filePath = join(this.outputDir, 'logs', `session-${this.sessionId}.log`)
          this.fileHandle = await open(this.filePath, 'a')
        }

        // Issue #6: Check disk space before writing
        await this.checkDiskSpace()
        if (this.disposed) return // Disk space check may have disabled logging

        // Issue #8: Rotate file if too large
        await this.rotateIfNeeded()

        // Write to file
        await this.fileHandle.write(lines)

        // Issue #1: Reset failure count on success
        this.failureCount = 0
      } catch (error) {
        const err = error instanceof Error ? error.message : String(error)

        // Handle disk full error
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOSPC') {
          console.error('Disk full, disabling file logging')
          // Issue #4: Close file handle before disposing to prevent leak
          if (this.fileHandle) {
            await this.fileHandle.close().catch(() => {})
            this.fileHandle = undefined
          }
          this.disposed = true
          return
        }

        console.error('Failed to write logs to file:', err)

        // Issue #1: Circuit breaker - disable after too many failures
        this.failureCount++
        if (this.failureCount >= this.MAX_FAILURES) {
          console.error(`Too many flush failures (${this.failureCount}), disabling file logging`)
          // Issue #4: Close file handle before disposing
          if (this.fileHandle) {
            await this.fileHandle.close().catch(() => {})
            this.fileHandle = undefined
          }
          this.disposed = true
          return
        }

        // Issue #1: Smart retry with buffer size limit
        // Only keep the most recent entries to prevent unbounded growth
        const entriesToKeep = Math.min(entries.length, this.bufferSize - this.buffer.length)
        if (entriesToKeep > 0) {
          // Keep newest entries, drop oldest
          this.buffer.unshift(...entries.slice(-entriesToKeep))
          if (entriesToKeep < entries.length) {
            console.warn(
              `Dropped ${entries.length - entriesToKeep} old log entries due to buffer limit`
            )
          }
        } else {
          console.warn(`Buffer full, dropped ${entries.length} failed log entries`)
        }
      }
    } finally {
      this.flushInProgress = false
    }
  }

  /**
   * Dispose writer and flush remaining buffer
   */
  async dispose(): Promise<void> {
    this.disposed = true
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    await this.flush()
    if (this.fileHandle) {
      await this.fileHandle.close()
      this.fileHandle = undefined
    }
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      void this.flush().catch((err) => {
        console.error('Scheduled flush failed:', err)
      })
    }, this.flushInterval)
  }

  /**
   * Ensure log directory exists
   */
  private async ensureLogDirectory(): Promise<void> {
    const logDir = join(this.outputDir, 'logs')
    await mkdir(logDir, { recursive: true })
  }

  /**
   * Check disk space and warn/disable if low (Issue #6)
   */
  private async checkDiskSpace(): Promise<void> {
    if (!this.fileHandle || !this.filePath) return

    try {
      const stats = await statfs(this.outputDir)
      const freeBytes = BigInt(stats.bsize) * BigInt(stats.bavail)
      const freeMB = Number(freeBytes / BigInt(1024 * 1024))

      if (freeMB < 100) {
        console.warn(`[Logger] Low disk space: ${freeMB.toFixed(2)}MB remaining`)
      }

      if (freeMB < 10) {
        console.error('[Logger] Critical disk space (<10MB), disabling file logging')
        // Close file handle and dispose
        await this.fileHandle.close().catch(() => {})
        this.fileHandle = undefined
        this.disposed = true
      }
    } catch (error) {
      // statfs may not be available on all platforms/Node versions
      // Silently ignore to avoid breaking on older Node versions
    }
  }

  /**
   * Rotate log file if it exceeds 10MB (Issue #8)
   */
  private async rotateIfNeeded(): Promise<void> {
    if (!this.fileHandle || !this.filePath) return

    try {
      const stats = await this.fileHandle.stat()
      const sizeMB = stats.size / (1024 * 1024)

      if (sizeMB > 10) {
        console.warn(`[Logger] Log file exceeds 10MB (${sizeMB.toFixed(2)}MB), rotating...`)

        // Close current file
        await this.fileHandle.close()

        // Rename to timestamped backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) // Remove .xxxZ
        const rotatedPath = `${this.filePath}.${timestamp}`
        await rename(this.filePath, rotatedPath)
        console.error(`[Logger] Rotated log file to: ${rotatedPath}`)

        // Reopen new file
        this.fileHandle = await open(this.filePath, 'a')
      }
    } catch (error) {
      console.error('[Logger] Failed to rotate log file:', error)
      // Continue with existing file handle
    }
  }
}

/**
 * Console-based logger implementation
 */
export class ConsoleLogger implements Logger {
  private sessionId?: string
  private toolName?: string
  private config: Required<LoggerConfig>
  private fileWriter?: FileWriter

  constructor(sessionId?: string, toolName?: string, config?: LoggerConfig) {
    this.sessionId = sessionId
    this.toolName = toolName
    this.config = this.mergeConfig(config)

    // Initialize file writer if enabled
    if (this.config.enableFileLog && sessionId) {
      this.fileWriter = new FileWriter(
        sessionId,
        this.config.outputDir,
        this.config.bufferSize,
        this.config.flushInterval
      )
    }
  }

  /**
   * Merge user config with defaults and validate values (Issue #7)
   */
  private mergeConfig(userConfig?: LoggerConfig): Required<LoggerConfig> {
    // Start with defaults
    const merged = {
      ...DEFAULT_LOGGER_CONFIG,
      ...userConfig,
    }

    // Issue #7: Validate and clamp buffer size (10 - 10000)
    const rawBufferSize = merged.bufferSize
    merged.bufferSize = Math.max(10, Math.min(merged.bufferSize, 10000))
    if (rawBufferSize !== merged.bufferSize) {
      console.warn(
        `Logger bufferSize clamped to ${merged.bufferSize} (was ${rawBufferSize}). Valid range: 10-10000`
      )
    }

    // Issue #7: Validate and clamp flush interval (100ms - 60s)
    const rawFlushInterval = merged.flushInterval
    merged.flushInterval = Math.max(100, Math.min(merged.flushInterval, 60000))
    if (rawFlushInterval !== merged.flushInterval) {
      console.warn(
        `Logger flushInterval clamped to ${merged.flushInterval}ms (was ${rawFlushInterval}ms). Valid range: 100-60000ms`
      )
    }

    // Issue #7: Validate log level
    const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    if (!validLevels.includes(merged.level)) {
      console.warn(
        `Invalid log level "${merged.level}", using default "info". Valid levels: ${validLevels.join(', ')}`
      )
      merged.level = 'info'
    }

    // Issue #7: Validate outputDir is non-empty string
    if (typeof merged.outputDir !== 'string' || merged.outputDir.trim() === '') {
      console.warn(`Invalid outputDir "${merged.outputDir}", using default ".mcp-artifacts"`)
      merged.outputDir = '.mcp-artifacts'
    }

    return merged
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level]
  }

  /**
   * Create log entry with metadata
   */
  private createEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      sessionId: this.sessionId,
      toolName: this.toolName,
      context,
    }
  }

  /**
   * Format log entry for console output
   */
  private format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    const sessionInfo = entry.sessionId ? ` [${entry.sessionId}]` : ''
    const toolInfo = entry.toolName ? ` [${entry.toolName}]` : ''
    const contextInfo = entry.context ? ` ${JSON.stringify(entry.context)}` : ''

    return `${timestamp} ${level}${sessionInfo}${toolInfo}: ${entry.message}${contextInfo}`
  }

  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('info')) return
    const entry = this.createEntry('info', message, context)
    this.log(entry)
  }

  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return
    const entry = this.createEntry('warn', message, context)
    this.log(entry)
  }

  error(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('error')) return
    const entry = this.createEntry('error', message, context)
    this.log(entry)
  }

  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('debug')) return
    const entry = this.createEntry('debug', message, context)
    this.log(entry)
  }

  /**
   * Log entry to console and optionally to file
   */
  private log(entry: LogEntry): void {
    // Console output (always)
    console.error(this.format(entry))

    // File output (if enabled)
    this.fileWriter?.write(entry)
  }

  /**
   * Flush log buffer to file
   */
  async flush(): Promise<void> {
    await this.fileWriter?.flush()
  }

  /**
   * Dispose logger and flush buffer
   */
  async dispose(): Promise<void> {
    await this.fileWriter?.dispose()
  }

  /**
   * Create a child logger with specific tool name
   */
  child(toolName: string): Logger {
    return new ConsoleLogger(this.sessionId, toolName, this.config)
  }
}

/**
 * Create a logger for a session
 */
export function createLogger(sessionId: string, config?: LoggerConfig): Logger {
  return new ConsoleLogger(sessionId, undefined, config)
}
