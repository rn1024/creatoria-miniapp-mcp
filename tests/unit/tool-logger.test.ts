/**
 * Unit tests for ToolLogger (including F2 Failure Snapshot)
 */

import { ToolLogger } from '../../src/core/tool-logger'
import type { SessionState, Logger, LoggerConfig } from '../../src/types'
import * as snapshotTools from '../../src/tools/snapshot'

// Mock snapshot tools
jest.mock('../../src/tools/snapshot')

describe('ToolLogger', () => {
  let mockLogger: Logger
  let mockSession: SessionState
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    // Mock logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn().mockReturnThis(),
    }

    // Mock output manager
    const mockOutputManager = {
      ensureOutputDir: jest.fn().mockResolvedValue(undefined),
      generateFilename: jest.fn((type: string, ext: string) => `${type}-${Date.now()}.${ext}`),
      writeFile: jest.fn((filename: string) => Promise.resolve(`/tmp/test/${filename}`)),
      getOutputDir: jest.fn(() => '/tmp/test-output'),
    }

    // Mock session
    mockSession = {
      sessionId: 'test-session',
      pages: [],
      elements: new Map(),
      outputDir: '/tmp/test-output',
      outputManager: mockOutputManager as any,
      miniProgram: {} as any,
      createdAt: new Date(),
      lastActivity: new Date(),
      logger: mockLogger,
    }

    jest.clearAllMocks()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('Basic functionality', () => {
    it('should wrap handler with START/END logging on success', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const mockHandler = jest.fn().mockResolvedValue({ success: true, data: 'test' })

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      const result = await wrapped(mockSession, { arg1: 'value1' })

      expect(result).toEqual({ success: true, data: 'test' })
      expect(mockLogger.child).toHaveBeenCalledWith('test_tool')
      expect(mockLogger.info).toHaveBeenCalledWith('Tool call started', {
        phase: 'START',
        args: expect.objectContaining({ arg1: 'value1' }),
      })
      expect(mockLogger.info).toHaveBeenCalledWith('Tool call completed', {
        phase: 'END',
        duration: expect.any(Number),
        result: expect.objectContaining({ success: true, data: 'test' }),
      })
      expect(mockLogger.error).not.toHaveBeenCalled()
    })

    it('should wrap handler with ERROR logging on failure', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const testError = new Error('Test error')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(wrapped(mockSession, { arg1: 'value1' })).rejects.toThrow('Test error')

      expect(mockLogger.error).toHaveBeenCalledWith('Tool call failed', {
        phase: 'ERROR',
        duration: expect.any(Number),
        error: 'Test error',
        stackTrace: expect.any(String),
      })
    })

    it('should sanitize sensitive data in arguments', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const mockHandler = jest.fn().mockResolvedValue({ success: true })

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await wrapped(mockSession, {
        username: 'john',
        password: 'secret123',
        apiKey: 'sk-12345',
        normalField: 'visible',
      })

      expect(mockLogger.info).toHaveBeenCalledWith('Tool call started', {
        phase: 'START',
        args: {
          username: 'john',
          password: '[REDACTED]',
          apiKey: '[REDACTED]',
          normalField: 'visible',
        },
      })
    })

    it('should truncate large string arguments', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const mockHandler = jest.fn().mockResolvedValue({ success: true })
      const largeString = 'x'.repeat(2000)

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await wrapped(mockSession, { data: largeString })

      expect(mockLogger.info).toHaveBeenCalledWith('Tool call started', {
        phase: 'START',
        args: {
          data: expect.stringContaining('... (2000 bytes total)'),
        },
      })
    })
  })

  describe('F2: Failure Snapshot Collection', () => {
    beforeEach(() => {
      // Mock fs/promises for failure directory creation
      jest.mock('fs/promises', () => ({
        mkdir: jest.fn().mockResolvedValue(undefined),
      }))

      // Mock path
      jest.mock('path', () => ({
        join: jest.fn((...args: string[]) => args.join('/')),
      }))

      // Mock snapshotPage
      ;(snapshotTools.snapshotPage as jest.Mock).mockResolvedValue({
        success: true,
        snapshotPath: '/tmp/test/snapshot.json',
        screenshotPath: '/tmp/test/snapshot.png',
      })
    })

    it('should capture failure snapshot when enabled and tool fails', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Tool execution failed')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(wrapped(mockSession, { testArg: 'value' })).rejects.toThrow(
        'Tool execution failed'
      )

      // Wait for async snapshot capture to complete
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Capturing failure snapshot',
        expect.objectContaining({
          path: expect.stringContaining('failures/test_tool-'),
        })
      )

      expect(snapshotTools.snapshotPage).toHaveBeenCalledWith(mockSession, {
        filename: expect.stringContaining('failures/test_tool-'),
        includeScreenshot: true,
        fullPage: false,
      })

      expect(mockSession.outputManager?.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('error-context.json'),
        expect.any(Buffer)
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Failure snapshot captured successfully',
        expect.objectContaining({
          files: ['snapshot.json', 'snapshot.png', 'error-context.json'],
        })
      )
    })

    it('should not capture snapshot when feature disabled', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: false,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Tool execution failed')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(wrapped(mockSession, { testArg: 'value' })).rejects.toThrow(
        'Tool execution failed'
      )

      // Wait to ensure no async snapshot capture
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(snapshotTools.snapshotPage).not.toHaveBeenCalled()
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        'Capturing failure snapshot',
        expect.any(Object)
      )
    })

    it('should skip snapshot when miniProgram not connected', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Tool execution failed')
      const mockHandler = jest.fn().mockRejectedValue(testError)
      const sessionWithoutMP = { ...mockSession, miniProgram: undefined }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(wrapped(sessionWithoutMP, { testArg: 'value' })).rejects.toThrow(
        'Tool execution failed'
      )

      // Wait for async check
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Skipping failure snapshot: miniProgram not connected'
      )
      expect(snapshotTools.snapshotPage).not.toHaveBeenCalled()
    })

    it('should skip snapshot when outputManager not available', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Tool execution failed')
      const mockHandler = jest.fn().mockRejectedValue(testError)
      const sessionWithoutOM = { ...mockSession, outputManager: undefined }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(wrapped(sessionWithoutOM, { testArg: 'value' })).rejects.toThrow(
        'Tool execution failed'
      )

      // Wait for async check
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Skipping failure snapshot: outputManager not available'
      )
      expect(snapshotTools.snapshotPage).not.toHaveBeenCalled()
    })

    it('should handle snapshot capture errors gracefully', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Tool execution failed')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Mock snapshotPage to fail
      ;(snapshotTools.snapshotPage as jest.Mock).mockRejectedValue(
        new Error('Snapshot capture failed')
      )

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(wrapped(mockSession, { testArg: 'value' })).rejects.toThrow(
        'Tool execution failed'
      )

      // Wait for async snapshot capture
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to capture failure snapshot',
        expect.objectContaining({
          error: expect.any(String),
        })
      )

      // Original error should still be thrown
      expect(mockLogger.error).toHaveBeenCalledWith('Tool call failed', {
        phase: 'ERROR',
        duration: expect.any(Number),
        error: 'Tool execution failed',
        stackTrace: expect.any(String),
      })
    })

    it('should include sanitized args and error details in error-context.json', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Tool execution failed')
      testError.stack = 'Error: Tool execution failed\n    at test.js:10:5'
      const mockHandler = jest.fn().mockRejectedValue(testError)

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(
        wrapped(mockSession, {
          username: 'john',
          password: 'secret',
          apiKey: 'key123',
          normalData: 'visible',
        })
      ).rejects.toThrow('Tool execution failed')

      // Wait for async snapshot capture
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Verify error context was written
      expect(mockSession.outputManager?.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('error-context.json'),
        expect.any(Buffer)
      )

      // Get the written buffer
      const writeCall = (mockSession.outputManager?.writeFile as jest.Mock).mock.calls.find(
        (call) => call[0].includes('error-context.json')
      )
      expect(writeCall).toBeDefined()

      const errorContext = JSON.parse(writeCall[1].toString())
      expect(errorContext).toMatchObject({
        toolName: 'test_tool',
        timestamp: expect.any(String),
        error: {
          message: 'Tool execution failed',
          stack: expect.stringContaining('Error: Tool execution failed'),
        },
        args: {
          username: 'john',
          password: '[REDACTED]', // Sensitive data redacted
          apiKey: '[REDACTED]', // Sensitive data redacted
          normalData: 'visible',
        },
        duration: expect.any(Number),
      })
    })

    it('should create unique failure directory names based on timestamp', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Test error')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      // First failure
      await expect(wrapped(mockSession, {})).rejects.toThrow()
      await new Promise((resolve) => setTimeout(resolve, 10))

      const firstCall = (mockLogger.info as jest.Mock).mock.calls.find(
        (call) => call[0] === 'Capturing failure snapshot'
      )
      const firstPath = firstCall?.[1]?.path

      jest.clearAllMocks()

      // Wait for timestamp to change (1 second resolution in ISO format)
      await new Promise((resolve) => setTimeout(resolve, 1100))
      await expect(wrapped(mockSession, {})).rejects.toThrow()
      await new Promise((resolve) => setTimeout(resolve, 10))

      const secondCall = (mockLogger.info as jest.Mock).mock.calls.find(
        (call) => call[0] === 'Capturing failure snapshot'
      )
      const secondPath = secondCall?.[1]?.path

      // Paths should be different due to timestamp
      expect(firstPath).toBeDefined()
      expect(secondPath).toBeDefined()
      expect(firstPath).not.toEqual(secondPath)
    })
  })

  describe('Deep sanitization (Issue #3)', () => {
    it('should sanitize nested objects with sensitive keys', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const mockHandler = jest.fn().mockResolvedValue({ success: true })

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await wrapped(mockSession, {
        user: {
          name: 'john',
          credentials: {
            password: 'secret',
            token: 'abc123',
          },
        },
        config: {
          apiKey: 'key-456',
          publicValue: 'visible',
        },
      })

      // Note: 'credentials' key itself is sensitive, so entire value is redacted
      // This is correct security behavior - don't peek inside sensitive keys
      expect(mockLogger.info).toHaveBeenCalledWith('Tool call started', {
        phase: 'START',
        args: {
          user: {
            name: 'john',
            credentials: '[REDACTED]', // Entire object redacted
          },
          config: {
            apiKey: '[REDACTED]',
            publicValue: 'visible',
          },
        },
      })
    })

    it('should sanitize arrays containing sensitive data', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const mockHandler = jest.fn().mockResolvedValue({ success: true })

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await wrapped(mockSession, {
        items: [
          { id: 1, apiKey: 'key1' },
          { id: 2, password: 'pass2' },
        ],
      })

      expect(mockLogger.info).toHaveBeenCalledWith('Tool call started', {
        phase: 'START',
        args: {
          items: [
            { id: 1, apiKey: '[REDACTED]' },
            { id: 2, password: '[REDACTED]' },
          ],
        },
      })
    })

    it('should handle circular references in sanitization', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const mockHandler = jest.fn().mockResolvedValue({ success: true })

      const circularObj: any = { name: 'test' }
      circularObj.self = circularObj

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await wrapped(mockSession, { data: circularObj })

      // Should not throw, should handle gracefully
      expect(mockLogger.info).toHaveBeenCalledWith('Tool call started', {
        phase: 'START',
        args: expect.any(Object),
      })
    })
  })

  describe('Security fixes (P1/P2)', () => {
    it('should sanitize toolName to prevent path traversal (P1)', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Test error')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      const wrapped = toolLogger.wrap('../../../etc/passwd', mockHandler)

      await expect(wrapped(mockSession, {})).rejects.toThrow()
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Verify toolName is sanitized (special chars replaced with _)
      // '../../../etc/passwd' has 9 special chars: . . . / . . / . . / => _________
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Capturing failure snapshot',
        expect.objectContaining({
          path: expect.stringMatching(/failures\/_________etc_passwd-/),
        })
      )
    })

    it('should preserve millisecond precision in timestamps (P1)', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Test error')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      // First failure
      await expect(wrapped(mockSession, {})).rejects.toThrow()
      await new Promise((resolve) => setTimeout(resolve, 10))

      const firstCall = (mockLogger.info as jest.Mock).mock.calls.find(
        (call) => call[0] === 'Capturing failure snapshot'
      )
      const firstPath = firstCall?.[1]?.path

      jest.clearAllMocks()

      // Second failure (should have different timestamp even if < 1 second apart)
      await new Promise((resolve) => setTimeout(resolve, 50)) // 50ms apart
      await expect(wrapped(mockSession, {})).rejects.toThrow()
      await new Promise((resolve) => setTimeout(resolve, 10))

      const secondCall = (mockLogger.info as jest.Mock).mock.calls.find(
        (call) => call[0] === 'Capturing failure snapshot'
      )
      const secondPath = secondCall?.[1]?.path

      // Verify both paths exist and are different (millisecond precision)
      expect(firstPath).toBeDefined()
      expect(secondPath).toBeDefined()
      expect(firstPath).not.toEqual(secondPath)

      // Verify format contains milliseconds (e.g., test_tool-2025-10-03_06-04-47-123Z)
      expect(firstPath).toMatch(/\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-\d{3}Z/)
    })

    it('should prevent recursive snapshot triggers (P2)', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)

      // Mock snapshotPage to fail and trigger recursive snapshot
      const snapshotError = new Error('Snapshot failed')
      ;(snapshotTools.snapshotPage as jest.Mock).mockRejectedValue(snapshotError)

      const testError = new Error('Original tool error')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(wrapped(mockSession, {})).rejects.toThrow('Original tool error')
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verify snapshot was attempted only once (not recursively)
      expect(snapshotTools.snapshotPage).toHaveBeenCalledTimes(1)

      // Verify warning was logged about snapshot failure
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to capture failure snapshot',
        expect.objectContaining({
          error: expect.any(String),
        })
      )
    })

    it('should sanitize stack traces to remove sensitive paths (P2)', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Test error')
      testError.stack = `Error: Test error
    at Object.<anonymous> (/Users/johndoe/projects/secret-app/src/core/tool-logger.ts:100:15)
    at Module._compile (/home/alice/.nvm/versions/node/v18.0.0/lib/internal/modules/cjs/loader.js:1120:14)
    at Object.loadConfig (C:\\Users\\bob\\AppData\\Local\\app\\config.js:50:10)
    at processData (/opt/myapp/src/processor.js:25:5)
    at checkCache (/var/cache/data/store.js:10:3)`

      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Mock snapshotPage to succeed
      ;(snapshotTools.snapshotPage as jest.Mock).mockResolvedValue({
        success: true,
        snapshotPath: '/tmp/test/snapshot.json',
        screenshotPath: '/tmp/test/snapshot.png',
      })

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(wrapped(mockSession, {})).rejects.toThrow()
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Get the written error context
      const writeFileCalls = (mockSession.outputManager?.writeFile as jest.Mock).mock.calls
      const writeCall = writeFileCalls.find((call) => call[0].includes('error-context.json'))

      // Debug: log all write calls if not found
      if (!writeCall) {
        console.log('All writeFile calls:', writeFileCalls)
      }

      expect(writeCall).toBeDefined()

      const errorContext = JSON.parse(writeCall[1].toString())

      // Verify stack trace is sanitized
      expect(errorContext.error.stack).toBeDefined()
      expect(errorContext.error.stack).not.toContain('/Users/johndoe')
      expect(errorContext.error.stack).not.toContain('/home/alice')
      expect(errorContext.error.stack).not.toContain('C:\\Users\\bob')
      expect(errorContext.error.stack).not.toContain('/opt/myapp')
      expect(errorContext.error.stack).not.toContain('/var/cache')

      // Verify placeholders are used
      expect(errorContext.error.stack).toContain('/Users/<user>/')
      expect(errorContext.error.stack).toContain('/home/<user>/')
      expect(errorContext.error.stack).toContain('C:\\Users\\<user>\\')
      expect(errorContext.error.stack).toContain('/opt/<app>/')
      expect(errorContext.error.stack).toContain('/var/<app>/')
    })

    it('should skip snapshot when already capturing (recursive prevention)', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Test error')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Simulate capturing flag already set (via private field access in test)
      ;(toolLogger as any).capturing = true

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      await expect(wrapped(mockSession, {})).rejects.toThrow()
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Verify debug log about skipping
      expect(mockLogger.debug).toHaveBeenCalledWith('Skipping failure snapshot: already capturing')

      // Verify snapshotPage was NOT called
      expect(snapshotTools.snapshotPage).not.toHaveBeenCalled()
    })
  })

  describe('F3-S1: Error message sanitization', () => {
    it('should sanitize file paths in error messages', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const testError = new Error(
        'Failed to load /Users/johndoe/secrets/api-key.txt: File not found'
      )
      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await expect(wrapped(mockSession, {})).rejects.toThrow()

      expect(mockSession.reportData.toolCalls).toHaveLength(1)
      const record = mockSession.reportData.toolCalls[0]

      // Error message should be sanitized
      expect(record.error?.message).not.toContain('/Users/johndoe')
      expect(record.error?.message).toContain('/Users/<user>/')
      expect(record.error?.message).toContain('secrets/api-key.txt')
    })

    it('should sanitize API keys in error messages', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const testError = new Error(
        'API request failed with key: abc123def456ghi789jkl012mno345pqr678'
      )
      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await expect(wrapped(mockSession, {})).rejects.toThrow()

      expect(mockSession.reportData.toolCalls).toHaveLength(1)
      const record = mockSession.reportData.toolCalls[0]

      // API key should be redacted
      expect(record.error?.message).not.toContain('abc123def456ghi789jkl012mno345pqr678')
      expect(record.error?.message).toContain('<REDACTED>')
    })

    it('should sanitize stack trace locations in error messages', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const testError = new Error('Error at /home/alice/app/src/index.ts:100:20')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await expect(wrapped(mockSession, {})).rejects.toThrow()

      expect(mockSession.reportData.toolCalls).toHaveLength(1)
      const record = mockSession.reportData.toolCalls[0]

      // Stack trace location should be sanitized
      expect(record.error?.message).not.toContain('/home/alice')
      expect(record.error?.message).not.toContain(':100:20')
      expect(record.error?.message).toContain('at <path>:<line>:<col>')
    })

    it('should handle Windows paths in error messages', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const testError = new Error('Cannot access C:\\Users\\Bob\\Documents\\secret.txt')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await expect(wrapped(mockSession, {})).rejects.toThrow()

      expect(mockSession.reportData.toolCalls).toHaveLength(1)
      const record = mockSession.reportData.toolCalls[0]

      // Windows path should be sanitized
      expect(record.error?.message).not.toContain('C:\\Users\\Bob')
      expect(record.error?.message).toContain('C:\\Users\\<user>\\')
    })

    it('should handle mixed sensitive information in error messages', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const testError = new Error(
        'Authentication failed for user at /opt/myapp/config.js with token: sk_test_FAKE1234567890abcdefghijklmnopqrstuvwxyz'
      )
      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await expect(wrapped(mockSession, {})).rejects.toThrow()

      expect(mockSession.reportData.toolCalls).toHaveLength(1)
      const record = mockSession.reportData.toolCalls[0]

      // Both path and token should be sanitized
      expect(record.error?.message).not.toContain('/opt/myapp')
      expect(record.error?.message).not.toContain(
        'sk_test_FAKE1234567890abcdefghijklmnopqrstuvwxyz'
      )
      expect(record.error?.message).toContain('/opt/<app>/')
      expect(record.error?.message).toContain('<REDACTED>')
    })
  })

  describe('F3: Tool call recording', () => {
    it('should record successful tool calls', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const mockHandler = jest.fn().mockResolvedValue({ data: 'success' })

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await wrapped(mockSession, { arg1: 'value1' })

      expect(mockSession.reportData.toolCalls).toHaveLength(1)
      expect(mockSession.reportData.toolCalls[0]).toMatchObject({
        toolName: 'test_tool',
        success: true,
        duration: expect.any(Number),
        timestamp: expect.any(Date),
      })
      expect(mockSession.reportData.toolCalls[0].duration).toBeGreaterThanOrEqual(0)
    })

    it('should record failed tool calls with error details', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const testError = new Error('Test failure')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await expect(wrapped(mockSession, {})).rejects.toThrow()

      expect(mockSession.reportData.toolCalls).toHaveLength(1)
      expect(mockSession.reportData.toolCalls[0]).toMatchObject({
        toolName: 'test_tool',
        success: false,
        duration: expect.any(Number),
        timestamp: expect.any(Date),
        error: {
          message: 'Test failure',
          snapshotPath: undefined, // No snapshot if not enabled
        },
      })
    })

    it('should include snapshot path in failure record when F2 is enabled', async () => {
      const config: LoggerConfig = {
        enableFailureSnapshot: true,
      }
      const toolLogger = new ToolLogger(mockLogger, config)
      const testError = new Error('Test error with snapshot')
      const mockHandler = jest.fn().mockRejectedValue(testError)

      // Mock snapshotPage to succeed
      ;(snapshotTools.snapshotPage as jest.Mock).mockResolvedValue({
        success: true,
        snapshotPath: '/tmp/test/snapshot.json',
      })

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await expect(wrapped(mockSession, {})).rejects.toThrow()
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(mockSession.reportData.toolCalls).toHaveLength(1)
      expect(mockSession.reportData.toolCalls[0].error?.snapshotPath).toMatch(
        /failures\/test_tool-/
      )
    })

    it('should not record when reportData is not initialized', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const mockHandler = jest.fn().mockResolvedValue({ data: 'success' })

      // Reporting NOT enabled
      mockSession.reportData = undefined

      const wrapped = toolLogger.wrap('test_tool', mockHandler)
      await wrapped(mockSession, {})

      // Should not throw, should just skip recording
      expect(mockSession.reportData).toBeUndefined()
    })

    it('should enforce memory limit (FIFO batch eviction)', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const mockHandler = jest.fn().mockResolvedValue({ data: 'success' })

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped = toolLogger.wrap('test_tool', mockHandler)

      // F3-P2: Batch eviction triggers at 1.5x limit (1500)
      // Simulate 1600 calls to trigger batch eviction
      for (let i = 0; i < 1600; i++) {
        await wrapped(mockSession, { iteration: i })
      }

      // After hitting 1500, should batch-remove 500 (oldest), then add 100 more
      // Final count: 1500 - 500 + 100 = 1100
      expect(mockSession.reportData.toolCalls).toHaveLength(1100)

      // First 500 should be evicted (iteration 0-499)
      // First remaining record should be iteration 500
      expect(mockSession.reportData.toolCalls[0].result).toMatchObject({
        data: 'success',
      })

      // Last record should be iteration 1599
      const lastRecord = mockSession.reportData.toolCalls[1099]
      expect(lastRecord.result).toMatchObject({
        data: 'success',
      })

      // Verify debug log was called for batch eviction
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Tool call records evicted (memory limit)',
        expect.objectContaining({
          removedCount: 500,
          currentCount: 1000, // Immediately after eviction (before continuing)
          maxCount: 1000,
        })
      )
    })

    it('should record multiple tool calls in sequence', async () => {
      const toolLogger = new ToolLogger(mockLogger)
      const handler1 = jest.fn().mockResolvedValue({ result: 1 })
      const handler2 = jest.fn().mockResolvedValue({ result: 2 })
      const handler3 = jest.fn().mockRejectedValue(new Error('Fail'))

      // Enable reporting
      mockSession.reportData = {
        toolCalls: [],
        startTime: new Date(),
      }

      const wrapped1 = toolLogger.wrap('tool_1', handler1)
      const wrapped2 = toolLogger.wrap('tool_2', handler2)
      const wrapped3 = toolLogger.wrap('tool_3', handler3)

      await wrapped1(mockSession, {})
      await wrapped2(mockSession, {})
      await expect(wrapped3(mockSession, {})).rejects.toThrow()

      expect(mockSession.reportData.toolCalls).toHaveLength(3)
      expect(mockSession.reportData.toolCalls[0].toolName).toBe('tool_1')
      expect(mockSession.reportData.toolCalls[0].success).toBe(true)
      expect(mockSession.reportData.toolCalls[1].toolName).toBe('tool_2')
      expect(mockSession.reportData.toolCalls[1].success).toBe(true)
      expect(mockSession.reportData.toolCalls[2].toolName).toBe('tool_3')
      expect(mockSession.reportData.toolCalls[2].success).toBe(false)
    })
  })
})
