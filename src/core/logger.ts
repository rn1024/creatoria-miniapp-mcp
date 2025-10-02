/**
 * Logger implementation for structured logging
 */

import type { Logger, LogLevel, LogEntry } from '../types.js'

/**
 * Console-based logger implementation
 */
export class ConsoleLogger implements Logger {
  private sessionId?: string
  private toolName?: string

  constructor(sessionId?: string, toolName?: string) {
    this.sessionId = sessionId
    this.toolName = toolName
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
    const entry = this.createEntry('info', message, context)
    console.error(this.format(entry))
  }

  warn(message: string, context?: Record<string, any>): void {
    const entry = this.createEntry('warn', message, context)
    console.error(this.format(entry))
  }

  error(message: string, context?: Record<string, any>): void {
    const entry = this.createEntry('error', message, context)
    console.error(this.format(entry))
  }

  debug(message: string, context?: Record<string, any>): void {
    const entry = this.createEntry('debug', message, context)
    console.error(this.format(entry))
  }

  /**
   * Create a child logger with specific tool name
   */
  child(toolName: string): Logger {
    return new ConsoleLogger(this.sessionId, toolName)
  }
}

/**
 * Create a logger for a session
 */
export function createLogger(sessionId: string): Logger {
  return new ConsoleLogger(sessionId)
}
