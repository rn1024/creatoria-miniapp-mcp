/**
 * Session management for MCP connections
 * Each session maintains isolated state for miniProgram instances and elements
 */

import { join } from 'path'
import type { SessionState, SessionConfig, SessionMetrics } from '../types.js'
import { createLogger } from './logger.js'
import { createOutputManager } from './output.js'

const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const DEFAULT_OUTPUT_DIR = '.mcp-artifacts'

export class SessionStore {
  private sessions = new Map<string, SessionState>()
  private sessionTimeout: number
  private outputDir: string
  private cleanupInterval?: NodeJS.Timeout

  constructor(config: { sessionTimeout?: number; outputDir?: string } = {}) {
    this.sessionTimeout = config.sessionTimeout || DEFAULT_SESSION_TIMEOUT
    this.outputDir = config.outputDir || DEFAULT_OUTPUT_DIR

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
      this.delete(sessionId)
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
   * Delete session and cleanup resources
   */
  delete(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      // Clean up miniProgram instance
      if (session.miniProgram) {
        try {
          if (typeof session.miniProgram.disconnect === 'function') {
            session.miniProgram.disconnect()
          }
          console.error(`Disconnected miniProgram for session ${sessionId}`)
        } catch (error) {
          console.error(`Failed to disconnect miniProgram for session ${sessionId}:`, error)
        }
      }

      // Clean up IDE process
      if (session.ideProcess) {
        try {
          if (typeof session.ideProcess.kill === 'function') {
            session.ideProcess.kill()
          }
          console.error(`Killed IDE process for session ${sessionId}`)
        } catch (error) {
          console.error(`Failed to kill IDE process for session ${sessionId}:`, error)
        }
      }

      // Clear element cache
      session.elements.clear()

      console.error(`Session ${sessionId} cleaned up successfully`)
    }
    this.sessions.delete(sessionId)
  }

  /**
   * Check if session exists
   */
  has(sessionId: string): boolean {
    return this.sessions.has(sessionId)
  }

  /**
   * Dispose all sessions
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }

    for (const sessionId of this.sessions.keys()) {
      this.delete(sessionId)
    }
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

      session = {
        sessionId,
        pages: [],
        elements: new Map(),
        outputDir,
        createdAt: new Date(),
        lastActivity: new Date(),
        config,
        logger: createLogger(sessionId),
        outputManager: createOutputManager(outputDir),
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
      () => {
        const now = Date.now()
        const expiredSessions: string[] = []

        for (const [sessionId, session] of this.sessions.entries()) {
          if (this.isSessionExpired(session)) {
            expiredSessions.push(sessionId)
          }
        }

        if (expiredSessions.length > 0) {
          console.error(`Cleaning up ${expiredSessions.length} expired sessions`)
          for (const sessionId of expiredSessions) {
            this.delete(sessionId)
          }
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
  cleanupExpired(): number {
    const expiredSessions: string[] = []

    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        expiredSessions.push(sessionId)
      }
    }

    for (const sessionId of expiredSessions) {
      this.delete(sessionId)
    }

    return expiredSessions.length
  }
}

// Note: sessionStore should be created in server.ts with proper configuration
// This allows outputDir and other options to be configured via ServerConfig
