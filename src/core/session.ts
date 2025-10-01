/**
 * Session management for MCP connections
 * Each session maintains isolated state for miniProgram instances and elements
 */

import type { SessionState } from '../types.js'

export class SessionStore {
  private sessions = new Map<string, SessionState>()

  get(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId)
  }

  set(sessionId: string, state: SessionState): void {
    this.sessions.set(sessionId, state)
  }

  delete(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      // Clean up miniProgram instance if exists
      if (session.miniProgram) {
        try {
          session.miniProgram.disconnect?.()
        } catch (error) {
          console.error(`Failed to disconnect miniProgram for session ${sessionId}:`, error)
        }
      }
      // Clean up IDE process if exists
      if (session.ideProcess) {
        try {
          session.ideProcess.kill?.()
        } catch (error) {
          console.error(`Failed to kill IDE process for session ${sessionId}:`, error)
        }
      }
    }
    this.sessions.delete(sessionId)
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId)
  }

  dispose(): void {
    for (const sessionId of this.sessions.keys()) {
      this.delete(sessionId)
    }
  }

  getOrCreate(sessionId: string): SessionState {
    let session = this.get(sessionId)
    if (!session) {
      session = {
        sessionId,
        elements: new Map(),
        createdAt: new Date(),
        lastActivity: new Date(),
      }
      this.set(sessionId, session)
    }
    return session
  }

  updateActivity(sessionId: string): void {
    const session = this.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
    }
  }
}

// Global session store
export const sessionStore = new SessionStore()
