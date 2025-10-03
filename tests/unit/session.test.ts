/**
 * Unit tests for SessionStore
 */

import { SessionStore } from '../../src/core/session'

describe('SessionStore', () => {
  let store: SessionStore

  beforeEach(() => {
    store = new SessionStore({ sessionTimeout: 1000 }) // 1 second timeout for testing
  })

  afterEach(async () => {
    await store.dispose()
  })

  describe('Session Creation', () => {
    it('should create a new session', () => {
      const session = store.getOrCreate('test-session')
      expect(session).toBeDefined()
      expect(session.sessionId).toBe('test-session')
      expect(session.pages).toEqual([])
      expect(session.elements.size).toBe(0)
    })

    it('should respect custom outputDir configuration', async () => {
      const customStore = new SessionStore({
        sessionTimeout: 1000,
        outputDir: '/custom/output/path',
      })

      const session = customStore.getOrCreate('test-session')
      expect(session.outputDir).toContain('/custom/output/path')
      expect(session.outputDir).toContain('test-session')

      await customStore.dispose()
    })

    it('should return existing session on getOrCreate', () => {
      const session1 = store.getOrCreate('test-session')
      const session2 = store.getOrCreate('test-session')
      expect(session1).toBe(session2)
    })

    it('should generate unique output directories', () => {
      const session1 = store.getOrCreate('session-1')
      const session2 = store.getOrCreate('session-2')
      expect(session1.outputDir).not.toBe(session2.outputDir)
      expect(session1.outputDir).toContain('session-1')
      expect(session2.outputDir).toContain('session-2')
    })

    it('should create logger for new session', () => {
      const session = store.getOrCreate('test-session')
      expect(session.logger).toBeDefined()
      expect(typeof session.logger?.info).toBe('function')
      expect(typeof session.logger?.warn).toBe('function')
      expect(typeof session.logger?.error).toBe('function')
      expect(typeof session.logger?.debug).toBe('function')
    })

    it('should create output manager for new session', () => {
      const session = store.getOrCreate('test-session')
      expect(session.outputManager).toBeDefined()
      expect(typeof session.outputManager?.getOutputDir).toBe('function')
      expect(typeof session.outputManager?.generateFilename).toBe('function')
      expect(typeof session.outputManager?.writeFile).toBe('function')
      expect(typeof session.outputManager?.ensureOutputDir).toBe('function')
    })
  })

  describe('Session Lifecycle', () => {
    it('should check if session exists', () => {
      expect(store.has('test-session')).toBe(false)
      store.getOrCreate('test-session')
      expect(store.has('test-session')).toBe(true)
    })

    it('should get session by ID', () => {
      store.getOrCreate('test-session')
      const session = store.get('test-session')
      expect(session).toBeDefined()
      expect(session?.sessionId).toBe('test-session')
    })

    it('should delete session', async () => {
      store.getOrCreate('test-session')
      expect(store.has('test-session')).toBe(true)
      await store.delete('test-session')
      expect(store.has('test-session')).toBe(false)
    })

    it('should update activity timestamp', () => {
      const session = store.getOrCreate('test-session')
      const originalTime = session.lastActivity.getTime()

      // Wait a bit
      setTimeout(() => {
        store.updateActivity('test-session')
        const updatedSession = store.get('test-session')
        expect(updatedSession?.lastActivity.getTime()).toBeGreaterThan(originalTime)
      }, 10)
    })
  })

  describe('Session Expiration', () => {
    it('should expire inactive sessions', async () => {
      store.getOrCreate('test-session')
      expect(store.has('test-session')).toBe(true)

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 1100))

      // Session should be expired and auto-cleaned on get
      const session = store.get('test-session')
      expect(session).toBeUndefined()
      expect(store.has('test-session')).toBe(false)
    })

    it('should not expire active sessions', async () => {
      store.getOrCreate('test-session')

      // Keep updating activity
      await new Promise((resolve) => setTimeout(resolve, 500))
      store.updateActivity('test-session')

      await new Promise((resolve) => setTimeout(resolve, 600))

      // Session should still exist
      const session = store.get('test-session')
      expect(session).toBeDefined()
    })

    it('should cleanup expired sessions manually', async () => {
      store.getOrCreate('session-1')
      store.getOrCreate('session-2')

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100))

      const cleaned = await store.cleanupExpired()
      expect(cleaned).toBe(2)
      expect(store.has('session-1')).toBe(false)
      expect(store.has('session-2')).toBe(false)
    })
  })

  describe('Session Metrics', () => {
    it('should return metrics for empty store', () => {
      const metrics = store.getMetrics()
      expect(metrics.totalSessions).toBe(0)
      expect(metrics.activeSessions).toBe(0)
      expect(metrics.oldestSession).toBeUndefined()
      expect(metrics.totalElements).toBe(0)
    })

    it('should calculate metrics correctly', () => {
      store.getOrCreate('session-1')
      store.getOrCreate('session-2')

      const metrics = store.getMetrics()
      expect(metrics.totalSessions).toBe(2)
      expect(metrics.activeSessions).toBe(2)
      expect(metrics.oldestSession).toBeDefined()
      expect(metrics.totalElements).toBe(0)
    })

    it('should track element count', () => {
      const session = store.getOrCreate('session-1')
      session.elements.set('elem-1', { element: {}, pagePath: 'pages/test', cachedAt: new Date() })
      session.elements.set('elem-2', { element: {}, pagePath: 'pages/test', cachedAt: new Date() })

      const metrics = store.getMetrics()
      expect(metrics.totalElements).toBe(2)
    })
  })

  describe('Resource Cleanup', () => {
    it('should cleanup miniProgram on session delete', async () => {
      const session = store.getOrCreate('test-session')
      const mockDisconnect = jest.fn()
      session.miniProgram = { disconnect: mockDisconnect }

      await store.delete('test-session')
      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('should cleanup IDE process on session delete', async () => {
      const session = store.getOrCreate('test-session')
      const mockKill = jest.fn()
      session.ideProcess = { kill: mockKill } as any

      await store.delete('test-session')
      expect(mockKill).toHaveBeenCalled()
    })

    it('should clear element cache on session delete', async () => {
      const session = store.getOrCreate('test-session')
      session.elements.set('elem-1', { element: {}, pagePath: 'pages/test', cachedAt: new Date() })
      expect(session.elements.size).toBe(1)

      await store.delete('test-session')
      // Session no longer exists
      expect(store.has('test-session')).toBe(false)
    })

    it('should dispose all sessions', async () => {
      store.getOrCreate('session-1')
      store.getOrCreate('session-2')
      store.getOrCreate('session-3')

      expect(store.getMetrics().totalSessions).toBe(3)
      await store.dispose()
      expect(store.getMetrics().totalSessions).toBe(0)
    })
  })

  describe('Session IDs', () => {
    it('should return all session IDs', () => {
      store.getOrCreate('session-1')
      store.getOrCreate('session-2')
      store.getOrCreate('session-3')

      const ids = store.getAllSessionIds()
      expect(ids).toHaveLength(3)
      expect(ids).toContain('session-1')
      expect(ids).toContain('session-2')
      expect(ids).toContain('session-3')
    })
  })
})
