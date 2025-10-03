/**
 * Session management for MCP connections
 * Each session maintains isolated state for miniProgram instances and elements
 */

import { join } from 'path'
import type { SessionState, SessionConfig, SessionMetrics, LoggerConfig } from '../types.js'
import { createLogger } from './logger.js'
import { createOutputManager } from './output.js'
import { generateAndSaveReports } from './report-generator.js'

const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const DEFAULT_OUTPUT_DIR = '.mcp-artifacts'

export class SessionStore {
  private sessions = new Map<string, SessionState>()
  private sessionTimeout: number
  private outputDir: string
  private loggerConfig?: LoggerConfig
  private enableSessionReport: boolean
  private cleanupInterval?: NodeJS.Timeout

  constructor(
    config: {
      sessionTimeout?: number
      outputDir?: string
      loggerConfig?: LoggerConfig
      enableSessionReport?: boolean
    } = {}
  ) {
    this.sessionTimeout = config.sessionTimeout || DEFAULT_SESSION_TIMEOUT
    this.outputDir = config.outputDir || DEFAULT_OUTPUT_DIR
    this.loggerConfig = config.loggerConfig
    this.enableSessionReport = config.enableSessionReport || false

    // Start periodic cleanup of timed-out sessions
    this.startCleanupTimer()
  }

  /**
   * Get session by ID
   */
  get(sessionId: string): SessionState | undefined {
    const session = this.sessions.get(sessionId)
    if (session && this.isSessionExpired(session)) {
      console.error(`Session ${sessionId} has expired, cleaning up...`)
      // Remove from map immediately (synchronous)
      this.sessions.delete(sessionId)
      // Fire-and-forget cleanup of resources (async operation)
      void this.cleanupSessionResources(session, sessionId).catch((error) => {
        console.error(`Failed to cleanup expired session ${sessionId}:`, error)
      })
      return undefined
    }
    return session
  }

  /**
   * Set session state
   */
  set(sessionId: string, state: SessionState): void {
    this.sessions.set(sessionId, state)
  }

  /**
   * Cleanup session resources (internal helper)
   *
   * @throws AggregateError if cleanup operations fail
   */
  private async cleanupSessionResources(session: SessionState, sessionId: string): Promise<void> {
    const errors: Error[] = []

    // F3: Generate session reports before cleanup (fire-and-forget)
    if (session.reportData) {
      try {
        await generateAndSaveReports(session)
        console.error(`Session reports generated for ${sessionId}`)
      } catch (error) {
        // Don't add to errors - report generation failure shouldn't block cleanup
        console.error(`Failed to generate session reports for ${sessionId}:`, error)
      }
    }

    // Issue #5: Dispose logger after report generation (to capture report logs)
    if (session.logger?.dispose) {
      try {
        await session.logger.dispose()
        console.error(`Logger disposed for session ${sessionId}`)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        errors.push(new Error(`Failed to dispose logger: ${err.message}`))
        console.error(`Failed to dispose logger for session ${sessionId}:`, error)
      }
    }

    // Clean up miniProgram instance (async operation)
    if (session.miniProgram) {
      try {
        if (typeof session.miniProgram.disconnect === 'function') {
          await session.miniProgram.disconnect()
        }
        console.error(`Disconnected miniProgram for session ${sessionId}`)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        errors.push(new Error(`Failed to disconnect miniProgram: ${err.message}`))
        console.error(`Failed to disconnect miniProgram for session ${sessionId}:`, error)
      }
    }

    // Clean up IDE process (async operation - wait for exit)
    const ideProcess = session.ideProcess
    if (ideProcess) {
      try {
        if (typeof ideProcess.kill === 'function') {
          // Wait for process to actually exit (only if once method exists)
          if (typeof ideProcess.once === 'function') {
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('IDE process did not exit within 5 seconds'))
              }, 5000)

              ideProcess.once('exit', () => {
                clearTimeout(timeout)
                resolve()
              })

              ideProcess.kill()
            })
          } else {
            // For test mocks or processes without event emitter
            ideProcess.kill()
          }
        }
        console.error(`Killed IDE process for session ${sessionId}`)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        errors.push(new Error(`Failed to kill IDE process: ${err.message}`))
        console.error(`Failed to kill IDE process for session ${sessionId}:`, error)
      }
    }

    // Clear element cache (sync operation)
    try {
      session.elements.clear()
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      errors.push(new Error(`Failed to clear element cache: ${err.message}`))
    }

    // If there were any errors, throw AggregateError
    if (errors.length > 0) {
      console.error(`Session ${sessionId} cleanup completed with ${errors.length} error(s)`)
      throw new AggregateError(errors, `Session cleanup had ${errors.length} error(s)`)
    }

    console.error(`Session ${sessionId} cleaned up successfully`)
  }

  /**
   * Delete session and cleanup resources
   *
   * Properly cleans up all async resources:
   * - Disconnects from miniProgram
   * - Kills IDE process and waits for exit
   * - Clears element cache
   *
   * @throws AggregateError if cleanup operations fail
   */
  async delete(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      this.sessions.delete(sessionId)
      return
    }

    // Remove from session map first
    this.sessions.delete(sessionId)

    // Cleanup resources
    await this.cleanupSessionResources(session, sessionId)
  }

  /**
   * Check if session exists
   */
  has(sessionId: string): boolean {
    return this.sessions.has(sessionId)
  }

  /**
   * Dispose all sessions
   *
   * Async method to properly cleanup all resources
   */
  async dispose(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }

    // Delete all sessions in parallel
    const deletions = Array.from(this.sessions.keys()).map((sessionId) =>
      this.delete(sessionId).catch((error) => {
        console.error(`Failed to delete session ${sessionId} during dispose:`, error)
      })
    )

    await Promise.all(deletions)
    console.error('All sessions disposed')
  }

  /**
   * Get or create session
   */
  getOrCreate(sessionId: string, config?: SessionConfig): SessionState {
    let session = this.get(sessionId)
    if (!session) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const outputDir = join(this.outputDir, `${sessionId}-${timestamp}`)
      const now = new Date()

      session = {
        sessionId,
        pages: [],
        elements: new Map(),
        outputDir,
        createdAt: now,
        lastActivity: now,
        config,
        logger: createLogger(sessionId, this.loggerConfig),
        loggerConfig: this.loggerConfig,
        outputManager: createOutputManager(outputDir),
        // F3: Initialize report data if enabled
        reportData: this.enableSessionReport
          ? {
              toolCalls: [],
              startTime: now,
            }
          : undefined,
      }
      this.set(sessionId, session)
      console.error(`Created new session: ${sessionId}`)
    }
    return session
  }

  /**
   * Update session activity timestamp
   */
  updateActivity(sessionId: string): void {
    const session = this.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
    }
  }

  /**
   * Check if session has expired
   */
  private isSessionExpired(session: SessionState): boolean {
    const now = Date.now()
    const lastActivity = session.lastActivity.getTime()
    return now - lastActivity > this.sessionTimeout
  }

  /**
   * Cleanup expired sessions periodically
   */
  private startCleanupTimer(): void {
    // Check every 5 minutes
    this.cleanupInterval = setInterval(
      async () => {
        const expiredSessions: string[] = []

        for (const [sessionId, session] of this.sessions.entries()) {
          if (this.isSessionExpired(session)) {
            expiredSessions.push(sessionId)
          }
        }

        if (expiredSessions.length > 0) {
          console.error(`Cleaning up ${expiredSessions.length} expired sessions`)
          // Delete expired sessions in parallel with error handling
          const deletions = expiredSessions.map((sessionId) =>
            this.delete(sessionId).catch((error) => {
              console.error(`Failed to delete expired session ${sessionId}:`, error)
            })
          )
          await Promise.all(deletions)
        }
      },
      5 * 60 * 1000
    ) // 5 minutes

    // Don't block process exit
    this.cleanupInterval.unref()
  }

  /**
   * Get session metrics for monitoring
   */
  getMetrics(): SessionMetrics {
    const sessions = Array.from(this.sessions.values())
    let oldestSession: { sessionId: string; age: number } | undefined
    let totalElements = 0

    if (sessions.length > 0) {
      const oldest = sessions.reduce((prev, curr) =>
        prev.createdAt < curr.createdAt ? prev : curr
      )
      oldestSession = {
        sessionId: oldest.sessionId,
        age: Date.now() - oldest.createdAt.getTime(),
      }
    }

    for (const session of sessions) {
      totalElements += session.elements.size
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions: sessions.filter((s) => !this.isSessionExpired(s)).length,
      oldestSession,
      totalElements,
    }
  }

  /**
   * Get all session IDs
   */
  getAllSessionIds(): string[] {
    return Array.from(this.sessions.keys())
  }

  /**
   * Clear expired sessions manually
   */
  async cleanupExpired(): Promise<number> {
    const expiredSessions: string[] = []

    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        expiredSessions.push(sessionId)
      }
    }

    // Delete all expired sessions in parallel
    await Promise.all(
      expiredSessions.map((sessionId) =>
        this.delete(sessionId).catch((error) => {
          console.error(`Failed to delete expired session ${sessionId}:`, error)
        })
      )
    )

    return expiredSessions.length
  }
}

// Note: sessionStore should be created in server.ts with proper configuration
// This allows outputDir and other options to be configured via ServerConfig
