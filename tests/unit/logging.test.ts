import {
  logStart,
  logRead,
  logStop,
  logClear,
} from '../../src/capabilities/logging/handlers/index.js'
import type { SessionState } from '../../src/types.js'

describe('Logging Tools', () => {
  let mockSession: SessionState
  let consoleHandler: ((data: any) => void) | undefined
  let errorHandler: ((data: any) => void) | undefined

  beforeEach(() => {
    consoleHandler = undefined
    errorHandler = undefined

    mockSession = {
      sessionId: 'test-session',
      pages: [],
      elements: new Map(),
      outputDir: '/tmp/test-output',
      createdAt: new Date(),
      lastActivity: new Date(),
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        child: jest.fn().mockReturnThis(),
      },
      miniProgram: {
        on: jest.fn((event: string, handler: any) => {
          if (event === 'console') consoleHandler = handler
          if (event === 'error') errorHandler = handler
        }),
        off: jest.fn(),
      },
    }
    jest.clearAllMocks()
  })

  describe('logStart', () => {
    it('should start listening to console and error events', async () => {
      const result = await logStart(mockSession)

      expect(result.success).toBe(true)
      expect(result.isListening).toBe(true)
      expect(mockSession.miniProgram!.on).toHaveBeenCalledWith(
        'console',
        expect.any(Function)
      )
      expect(mockSession.miniProgram!.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      )
      expect(mockSession.logBuffer?.isListening).toBe(true)
      expect(mockSession.logBuffer?.maxEntries).toBe(1000)
    })

    it('should use custom maxEntries', async () => {
      const result = await logStart(mockSession, { maxEntries: 500 })

      expect(result.success).toBe(true)
      expect(mockSession.logBuffer?.maxEntries).toBe(500)
    })

    it('should throw if miniProgram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(logStart(mockSession)).rejects.toThrow(
        'MiniProgram not connected'
      )
    })

    it('should return existing state if already listening', async () => {
      await logStart(mockSession)
      const result = await logStart(mockSession)

      expect(result.success).toBe(true)
      expect(result.message).toContain('Already listening')
      // on() should only be called once (the first start)
      expect(mockSession.miniProgram!.on).toHaveBeenCalledTimes(2)
    })
  })

  describe('logStart -> console event buffering', () => {
    it('should buffer console events', async () => {
      await logStart(mockSession)

      consoleHandler!({ type: 'log', args: ['hello', 'world'] })

      expect(mockSession.logBuffer?.entries).toHaveLength(1)
      expect(mockSession.logBuffer?.entries[0]).toMatchObject({
        type: 'log',
        args: ['hello', 'world'],
      })
    })

    it('should buffer error events', async () => {
      await logStart(mockSession)

      errorHandler!({ message: 'Something broke', stack: 'at line 1' })

      expect(mockSession.logBuffer?.entries).toHaveLength(1)
      expect(mockSession.logBuffer?.entries[0]).toMatchObject({
        message: 'Something broke',
        stack: 'at line 1',
      })
    })

    it('should respect maxEntries and trim oldest', async () => {
      await logStart(mockSession, { maxEntries: 3 })

      consoleHandler!({ type: 'log', args: ['a'] })
      consoleHandler!({ type: 'log', args: ['b'] })
      consoleHandler!({ type: 'log', args: ['c'] })
      consoleHandler!({ type: 'log', args: ['d'] })

      expect(mockSession.logBuffer?.entries).toHaveLength(3)
      expect((mockSession.logBuffer?.entries[0] as any).args).toEqual(['b'])
      expect((mockSession.logBuffer?.entries[2] as any).args).toEqual(['d'])
    })
  })

  describe('logRead', () => {
    beforeEach(async () => {
      await logStart(mockSession)
    })

    it('should throw if log collection not started', async () => {
      mockSession.logBuffer = undefined

      await expect(logRead(mockSession)).rejects.toThrow(
        'Log collection not started'
      )
    })

    it('should return all entries with default params', async () => {
      consoleHandler!({ type: 'log', args: ['hello'] })
      consoleHandler!({ type: 'error', args: ['oops'] })

      const result = await logRead(mockSession)

      expect(result.success).toBe(true)
      expect(result.count).toBe(2)
      expect(result.totalInBuffer).toBe(2)
    })

    it('should filter by level', async () => {
      consoleHandler!({ type: 'log', args: ['hello'] })
      consoleHandler!({ type: 'error', args: ['oops'] })
      consoleHandler!({ type: 'warn', args: ['careful'] })

      const result = await logRead(mockSession, { level: 'error' })

      expect(result.count).toBe(1)
      expect('type' in result.entries[0] && result.entries[0].type).toBe('error')
    })

    it('should limit count', async () => {
      for (let i = 0; i < 10; i++) {
        consoleHandler!({ type: 'log', args: [`msg-${i}`] })
      }

      const result = await logRead(mockSession, { count: 3 })

      expect(result.count).toBe(3)
      expect(result.totalInBuffer).toBe(10)
      // Should be the last 3
      expect((result.entries[2] as any).args).toEqual(['msg-9'])
    })

    it('should filter by after timestamp', async () => {
      consoleHandler!({ type: 'log', args: ['old'] })

      const after = new Date().toISOString()
      // Small delay to ensure timestamp difference
      await new Promise((r) => setTimeout(r, 10))

      consoleHandler!({ type: 'log', args: ['new'] })

      const result = await logRead(mockSession, { after })

      expect(result.count).toBe(1)
      expect((result.entries[0] as any).args).toEqual(['new'])
    })
  })

  describe('logStop', () => {
    it('should stop listening and clear buffer', async () => {
      await logStart(mockSession)
      consoleHandler!({ type: 'log', args: ['hello'] })

      const result = await logStop(mockSession)

      expect(result.success).toBe(true)
      expect(result.entriesCollected).toBe(1)
      expect(mockSession.miniProgram!.off).toHaveBeenCalledWith(
        'console',
        expect.any(Function)
      )
      expect(mockSession.miniProgram!.off).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      )
      expect(mockSession.logBuffer?.isListening).toBe(false)
      expect(mockSession.logBuffer?.entries).toHaveLength(0)
    })

    it('should handle already stopped state', async () => {
      const result = await logStop(mockSession)

      expect(result.success).toBe(true)
      expect(result.message).toContain('not active')
    })
  })

  describe('logClear', () => {
    it('should clear buffer entries but keep listening', async () => {
      await logStart(mockSession)
      consoleHandler!({ type: 'log', args: ['hello'] })

      const result = await logClear(mockSession)

      expect(result.success).toBe(true)
      expect(result.cleared).toBe(1)
      expect(mockSession.logBuffer?.isListening).toBe(true)
      expect(mockSession.logBuffer?.entries).toHaveLength(0)
    })

    it('should throw if log collection not started', async () => {
      mockSession.logBuffer = undefined

      await expect(logClear(mockSession)).rejects.toThrow(
        'Log collection not started'
      )
    })
  })
})
