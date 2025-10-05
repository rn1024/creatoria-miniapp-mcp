import { join } from 'path'
import type { SessionState, SessionConfig, SessionMetrics, LoggerConfig } from '../../types.js'
import { createLogger } from '../logging/index.js'
import { createOutputManager } from '../outputs/index.js'
import { cleanupSessionResources } from './utils/cleanup.js'

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

    this.startCleanupTimer()
  }

  get(sessionId: string): SessionState | undefined {
    const session = this.sessions.get(sessionId)
    if (session && this.isSessionExpired(session)) {
      console.error(`Session ${sessionId} has expired, cleaning up...`)
      this.sessions.delete(sessionId)
      void cleanupSessionResources(session, sessionId).catch((error) => {
        console.error(`Failed to cleanup expired session ${sessionId}:`, error)
      })
      return undefined
    }
    return session
  }

  set(sessionId: string, state: SessionState): void {
    this.sessions.set(sessionId, state)
  }

  async delete(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      this.sessions.delete(sessionId)
      return
    }

    this.sessions.delete(sessionId)
    await cleanupSessionResources(session, sessionId)
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId)
  }

  async dispose(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }

    const deletions = Array.from(this.sessions.keys()).map((sessionId) =>
      this.delete(sessionId).catch((error) => {
        console.error(`Failed to delete session ${sessionId} during dispose:`, error)
      })
    )

    await Promise.all(deletions)
    console.error('All sessions disposed')
  }

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

  updateActivity(sessionId: string): void {
    const session = this.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
    }
  }

  private isSessionExpired(session: SessionState): boolean {
    const now = Date.now()
    const lastActivity = session.lastActivity.getTime()
    return now - lastActivity > this.sessionTimeout
  }

  private startCleanupTimer(): void {
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
          const deletions = expiredSessions.map((sessionId) =>
            this.delete(sessionId).catch((error) => {
              console.error(`Failed to delete expired session ${sessionId}:`, error)
            })
          )
          await Promise.all(deletions)
        }
      },
      5 * 60 * 1000
    )

    this.cleanupInterval.unref()
  }

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

  getAllSessionIds(): string[] {
    return Array.from(this.sessions.keys())
  }

  async cleanupExpired(): Promise<number> {
    const expiredSessions: string[] = []

    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        expiredSessions.push(sessionId)
      }
    }

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
