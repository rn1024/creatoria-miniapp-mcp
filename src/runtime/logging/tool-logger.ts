/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tool call logger wrapper for automatic logging
 */

import type { Logger, ToolCallRecord } from '../../types.js'
import type { SessionState } from '../../types.js'

/**
 * Maximum size for logged arguments/results (1KB)
 */
const MAX_LOG_SIZE = 1024

/**
 * Maximum recursion depth for sanitization
 */
const MAX_SANITIZE_DEPTH = 5

/**
 * Maximum number of tool call records to keep in memory (F3)
 */
const MAX_TOOL_CALL_RECORDS = 1000

/**
 * Sensitive key patterns to redact from logs (Issue #3: Enhanced sanitization)
 * Uses regex for case-insensitive matching and pattern variations
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /passwd/i,
  /pwd/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /auth/i,
  /authorization/i,
  /bearer/i,
  /credential/i,
  /private[_-]?key/i,
  /access[_-]?key/i,
  /session[_-]?id/i,
  /csrf/i,
  /xsrf/i,
  /jwt/i,
  // WeChat specific PII
  /openid/i,
  /unionid/i,
  /app[_-]?secret/i,
]

/**
 * Tool logger wrapper for automatic START/END/ERROR logging
 */
export class ToolLogger {
  private capturing = false // Issue #P2: Prevent recursive snapshot triggers

  constructor(
    private logger: Logger,
    private config?: import('../../types.js').LoggerConfig
  ) {}

  /**
   * Wrap a tool handler with automatic logging
   *
   * @param toolName - Name of the tool (e.g., "page_query")
   * @param handler - Original tool handler function
   * @returns Wrapped handler with automatic logging
   */
  wrap<TArgs, TResult>(
    toolName: string,
    handler: (session: SessionState, args: TArgs) => Promise<TResult>
  ): (session: SessionState, args: TArgs) => Promise<TResult> {
    return async (session: SessionState, args: TArgs): Promise<TResult> => {
      const startTime = Date.now()
      const childLogger = this.logger.child(toolName)

      // Log START
      childLogger.info('Tool call started', {
        phase: 'START',
        args: this.sanitizeArgs(args),
      })

      try {
        // Execute tool
        const result = await handler(session, args)
        const duration = Date.now() - startTime

        // Log END
        childLogger.info('Tool call completed', {
          phase: 'END',
          duration,
          result: this.sanitizeResult(result),
        })

        // F3: Record successful tool call
        this.recordToolCall(session, {
          timestamp: new Date(startTime),
          toolName,
          duration,
          success: true,
          result: this.sanitizeResult(result),
        })

        return result
      } catch (error) {
        const duration = Date.now() - startTime

        // Log ERROR
        childLogger.error('Tool call failed', {
          phase: 'ERROR',
          duration,
          error: error instanceof Error ? error.message : String(error),
          stackTrace: error instanceof Error ? error.stack : undefined,
        })

        // F2: Capture failure snapshot (fire-and-forget, non-blocking)
        let snapshotPath: string | undefined
        if (this.config?.enableFailureSnapshot) {
          snapshotPath = await this.captureFailureSnapshot({
            session,
            toolName,
            args,
            error: error instanceof Error ? error : new Error(String(error)),
            duration,
          }).catch((e) => {
            childLogger.warn('Snapshot capture failed', {
              error: e instanceof Error ? e.message : String(e),
            })
            return undefined
          })
        }

        // F3: Record failed tool call
        this.recordToolCall(session, {
          timestamp: new Date(startTime),
          toolName,
          duration,
          success: false,
          error: {
            message: this.sanitizeErrorMessage(
              error instanceof Error ? error.message : String(error)
            ),
            snapshotPath,
          },
        })

        throw error // Re-throw to preserve error handling
      }
    }
  }

  /**
   * Check if a key name matches sensitive patterns (Issue #3)
   */
  private isSensitiveKey(key: string): boolean {
    return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))
  }

  /**
   * Sanitize arguments for logging (remove sensitive data, limit size)
   * Issue #3: Enhanced with deep recursion and pattern matching
   */
  private sanitizeArgs(args: any, depth = 0): any {
    if (args === null || args === undefined) {
      return args
    }

    // Prevent infinite recursion
    if (depth > MAX_SANITIZE_DEPTH) {
      return '<Max sanitization depth reached>'
    }

    try {
      // For primitives, handle directly
      if (typeof args !== 'object') {
        if (typeof args === 'string' && args.length > MAX_LOG_SIZE) {
          return args.substring(0, MAX_LOG_SIZE) + `... (${args.length} bytes total)`
        }
        return args
      }

      // Handle arrays
      if (Array.isArray(args)) {
        return args.map((item) => this.sanitizeArgs(item, depth + 1))
      }

      // Handle objects with deep sanitization
      const sanitized: any = {}
      for (const [key, value] of Object.entries(args)) {
        // Redact sensitive keys (Issue #3: Pattern-based matching)
        if (this.isSensitiveKey(key)) {
          sanitized[key] = '[REDACTED]'
          continue
        }

        // Truncate large strings
        if (typeof value === 'string' && value.length > MAX_LOG_SIZE) {
          sanitized[key] = value.substring(0, MAX_LOG_SIZE) + `... (${value.length} bytes total)`
          continue
        }

        // Convert buffers to placeholder
        if (
          value &&
          typeof value === 'object' &&
          'type' in value &&
          value.type === 'Buffer' &&
          'data' in value
        ) {
          const bufferData = value.data as any
          sanitized[key] = `<Buffer ${bufferData?.length || 0} bytes>`
          continue
        }

        // Recursively sanitize nested objects/arrays (Issue #3: Deep sanitization)
        if (value && typeof value === 'object') {
          sanitized[key] = this.sanitizeArgs(value, depth + 1)
          continue
        }

        sanitized[key] = value
      }

      return sanitized
    } catch (error) {
      // If sanitization fails, return placeholder
      return '<Failed to sanitize args>'
    }
  }

  /**
   * Sanitize result for logging (limit size, remove large objects)
   * Issue #3: Use same deep sanitization as args
   */
  private sanitizeResult(result: any, depth = 0): any {
    if (result === null || result === undefined) {
      return result
    }

    // Prevent infinite recursion
    if (depth > MAX_SANITIZE_DEPTH) {
      return '<Max sanitization depth reached>'
    }

    try {
      // For simple types, return as-is
      if (typeof result !== 'object') {
        if (typeof result === 'string' && result.length > MAX_LOG_SIZE) {
          return result.substring(0, MAX_LOG_SIZE) + `... (${result.length} bytes total)`
        }
        return result
      }

      // Handle arrays
      if (Array.isArray(result)) {
        if (result.length > 10) {
          return [
            ...result.slice(0, 10).map((item) => this.sanitizeResult(item, depth + 1)),
            `... (${result.length - 10} more items)`,
          ]
        }
        return result.map((item) => this.sanitizeResult(item, depth + 1))
      }

      // For objects, sanitize with deep recursion
      const sanitized: any = {}
      for (const [key, value] of Object.entries(result)) {
        // Redact sensitive keys in results too (Issue #3)
        if (this.isSensitiveKey(key)) {
          sanitized[key] = '[REDACTED]'
          continue
        }

        // Truncate large strings
        if (typeof value === 'string' && value.length > MAX_LOG_SIZE) {
          sanitized[key] = value.substring(0, MAX_LOG_SIZE) + `... (${value.length} bytes total)`
          continue
        }

        // Convert buffers to placeholder
        if (
          value &&
          typeof value === 'object' &&
          'type' in value &&
          value.type === 'Buffer' &&
          'data' in value
        ) {
          const bufferData = value.data as any
          sanitized[key] = `<Buffer ${bufferData?.length || 0} bytes>`
          continue
        }

        // Recursively sanitize nested objects/arrays
        if (value && typeof value === 'object') {
          sanitized[key] = this.sanitizeResult(value, depth + 1)
          continue
        }

        sanitized[key] = value
      }

      return sanitized
    } catch (error) {
      // If sanitization fails, return placeholder
      return '<Failed to sanitize result>'
    }
  }

  /**
   * Capture failure snapshot when tool call fails (F2 feature)
   *
   * Creates a failure directory with:
   * - snapshot.json: Page data
   * - snapshot.png: Screenshot
   * - error-context.json: Error details + tool context
   *
   * @param context Failure context
   * @returns Relative path to the failure directory (for F3 reporting)
   */
  private async captureFailureSnapshot(context: {
    session: import('../../types.js').SessionState
    toolName: string
    args: any
    error: Error
    duration: number
  }): Promise<string | undefined> {
    const { session, toolName, args, error, duration } = context
    const logger = this.logger

    // Issue #P2: Prevent recursive snapshot triggers
    if (this.capturing) {
      logger?.debug('Skipping failure snapshot: already capturing')
      return undefined
    }

    this.capturing = true
    try {
      // 1. Check prerequisites
      if (!this.config?.enableFailureSnapshot) {
        return undefined // Feature disabled
      }

      if (!session.miniProgram) {
        logger?.debug('Skipping failure snapshot: miniProgram not connected')
        return undefined
      }

      if (!session.outputManager) {
        logger?.debug('Skipping failure snapshot: outputManager not available')
        return undefined
      }

      // 2. Create failure directory
      // Issue #P1: Sanitize toolName to prevent path traversal
      const sanitizedToolName = toolName.replace(/[^a-zA-Z0-9_-]/g, '_')

      // Issue #P1: Preserve millisecond precision to avoid collisions
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_')
      const failureDirName = `${sanitizedToolName}-${timestamp}`
      const failureDir = `failures/${failureDirName}`

      const outputManager = session.outputManager
      await outputManager.ensureOutputDir()

      // Create failures subdirectory
      const { mkdir } = await import('fs/promises')
      const { join } = await import('path')
      const failurePath = join(outputManager.getOutputDir(), failureDir)
      await mkdir(failurePath, { recursive: true })

      logger?.info('Capturing failure snapshot', { path: failurePath })

      // 3. Capture page snapshot
      const snapshotFilename = join(failureDir, 'snapshot.json')

      const snapshotTools = await import('../../tools/snapshot.js')
      await snapshotTools.snapshotPage(session, {
        filename: snapshotFilename,
        includeScreenshot: true,
        fullPage: false,
      })

      // 4. Save error context
      const errorContext = {
        toolName,
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          // Issue #P2: Sanitize stack trace to remove sensitive paths
          stack: this.sanitizeStackTrace(error.stack),
          code: (error as any).code,
        },
        args: this.sanitizeArgs(args), // Reuse existing sanitization
        duration,
      }

      const contextFilename = join(failureDir, 'error-context.json')
      await outputManager.writeFile(
        contextFilename,
        Buffer.from(JSON.stringify(errorContext, null, 2))
      )

      logger?.info('Failure snapshot captured successfully', {
        path: failurePath,
        files: ['snapshot.json', 'snapshot.png', 'error-context.json'],
      })

      // F3: Return relative path for report linking
      return failureDir
    } catch (snapshotError) {
      // Snapshot capture failed - log but don't throw
      logger?.warn('Failed to capture failure snapshot', {
        error: snapshotError instanceof Error ? snapshotError.message : String(snapshotError),
      })
      return undefined
    } finally {
      this.capturing = false
    }
  }

  /**
   * Record a tool call to session report data (F3 feature)
   *
   * Adds a tool call record to the session's reportData. Implements
   * memory protection by limiting to MAX_TOOL_CALL_RECORDS with FIFO eviction.
   *
   * @param session Session state
   * @param record Tool call record to add
   */
  private recordToolCall(session: SessionState, record: ToolCallRecord): void {
    // Skip if session reporting is not enabled
    if (!session.reportData) {
      return
    }

    // Add record to the array
    session.reportData.toolCalls.push(record)

    // F3-P2: Memory protection with batch eviction for better performance
    // Instead of shift() every time (O(n)), we batch-remove when hitting 1.5x limit
    // This reduces eviction frequency from every call to every 500 calls
    const currentLength = session.reportData.toolCalls.length
    if (currentLength >= MAX_TOOL_CALL_RECORDS * 1.5) {
      // Remove oldest 50% to get back to limit
      const removeCount = Math.floor(MAX_TOOL_CALL_RECORDS * 0.5)
      const removed = session.reportData.toolCalls.splice(0, removeCount)

      this.logger?.debug('Tool call records evicted (memory limit)', {
        removedCount: removed.length,
        oldestTool: removed[0]?.toolName,
        oldestTimestamp: removed[0]?.timestamp,
        newestRemovedTool: removed[removed.length - 1]?.toolName,
        currentCount: session.reportData.toolCalls.length,
        maxCount: MAX_TOOL_CALL_RECORDS,
      })
    }
  }

  /**
   * Sanitize error message to remove sensitive information (F3-S1)
   *
   * Removes:
   * - File paths (Unix, Linux, Windows)
   * - API keys and tokens (32+ character alphanumeric strings)
   * - Stack trace locations
   *
   * @param message Raw error message
   * @returns Sanitized error message with placeholders
   */
  private sanitizeErrorMessage(message: string): string {
    if (!message) return message

    try {
      return (
        message
          // Replace Unix user paths: /Users/username/ -> /Users/<user>/
          .replace(/\/Users\/[^/]+\//g, '/Users/<user>/')
          // Replace Linux home paths: /home/username/ -> /home/<user>/
          .replace(/\/home\/[^/]+\//g, '/home/<user>/')
          // Replace Windows user paths: C:\Users\username\ -> C:\Users\<user>\
          .replace(/C:\\Users\\[^\\]+\\/gi, 'C:\\Users\\<user>\\')
          // Replace common environment paths
          .replace(/\/opt\/[^/\s]+\//g, '/opt/<app>/')
          .replace(/\/var\/[^/\s]+\//g, '/var/<app>/')
          // Replace long alphanumeric strings with underscores/hyphens (likely API keys/tokens)
          .replace(/\b[a-zA-Z0-9_-]{32,}\b/g, '<REDACTED>')
          // Replace stack trace locations: "at path:line:col" or " at path:line:col" -> "at <path>:<line>:<col>"
          .replace(/\bat\s+[^:\s]+:\d+:\d+/g, 'at <path>:<line>:<col>')
      )
    } catch (error) {
      // If sanitization fails, return placeholder to avoid leaking raw message
      return '<Failed to sanitize error message>'
    }
  }

  /**
   * Sanitize stack trace to remove sensitive file paths (Issue #P2)
   *
   * Removes:
   * - Absolute user paths (/Users/<username>/, /home/<username>/)
   * - Windows paths (C:\Users\<username>\)
   * - Environment-specific paths
   *
   * @param stack Raw stack trace
   * @returns Sanitized stack trace with placeholders
   */
  private sanitizeStackTrace(stack: string | undefined): string | undefined {
    if (!stack) return stack

    try {
      return (
        stack
          // Replace Unix user paths: /Users/username/ -> /Users/<user>/
          .replace(/\/Users\/[^/]+\//g, '/Users/<user>/')
          // Replace Linux home paths: /home/username/ -> /home/<user>/
          .replace(/\/home\/[^/]+\//g, '/home/<user>/')
          // Replace Windows user paths: C:\Users\username\ -> C:\Users\<user>\
          .replace(/C:\\Users\\[^\\]+\\/gi, 'C:\\Users\\<user>\\')
          // Replace common environment variables that may leak info
          .replace(/\/opt\/[^/]+\//g, '/opt/<app>/')
          .replace(/\/var\/[^/]+\//g, '/var/<app>/')
      )
    } catch (error) {
      // If sanitization fails, return placeholder to avoid leaking raw stack
      return '<Stack trace sanitization failed>'
    }
  }
}
