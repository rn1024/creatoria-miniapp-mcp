/**
 * Tool call logger wrapper for automatic logging
 */

import type { Logger } from '../types.js'
import type { SessionState } from '../types.js'

/**
 * Maximum size for logged arguments/results (1KB)
 */
const MAX_LOG_SIZE = 1024

/**
 * Maximum recursion depth for sanitization
 */
const MAX_SANITIZE_DEPTH = 5

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
  constructor(private logger: Logger) {}

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
}
