/**
 * Unit tests for Automator tools
 */

import * as automatorTools from '../../src/tools/automator'
import type { SessionState } from '../../src/types'
import automator from 'miniprogram-automator'

// Mock miniprogram-automator
jest.mock('miniprogram-automator', () => ({
  launch: jest.fn(),
  connect: jest.fn(),
}))

describe('Automator Tools', () => {
  let mockSession: SessionState

  beforeEach(() => {
    // Create a fresh mock session for each test
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
      },
    }

    // Reset all mocks
    jest.clearAllMocks()
  })

  describe('launch', () => {
    it('should launch miniprogram successfully', async () => {
      const mockMiniProgram = {
        disconnect: jest.fn(),
      }

      ;(automator.launch as jest.Mock).mockResolvedValue(mockMiniProgram)

      const result = await automatorTools.launch(mockSession, {
        projectPath: '/path/to/project',
        cliPath: '/path/to/cli',
        port: 9420,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('launched successfully')
      expect(result.port).toBe(9420)
      expect(mockSession.miniProgram).toBe(mockMiniProgram)
      expect(mockSession.config?.projectPath).toBe('/path/to/project')
      expect(mockSession.config?.port).toBe(9420)
      expect(automator.launch).toHaveBeenCalledWith({
        projectPath: '/path/to/project',
        cliPath: '/path/to/cli',
        port: 9420,
      })
    })

    it('should use default values for optional parameters', async () => {
      const mockMiniProgram = {
        disconnect: jest.fn(),
      }

      ;(automator.launch as jest.Mock).mockResolvedValue(mockMiniProgram)

      const result = await automatorTools.launch(mockSession, {
        projectPath: '/path/to/project',
      })

      expect(result.success).toBe(true)
      expect(automator.launch).toHaveBeenCalledWith({
        projectPath: '/path/to/project',
        cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
        port: 9420,
      })
    })

    it('should disconnect existing connection before launching', async () => {
      const oldMiniProgram = {
        disconnect: jest.fn().mockResolvedValue(undefined),
      }
      const newMiniProgram = {
        disconnect: jest.fn(),
      }

      mockSession.miniProgram = oldMiniProgram
      ;(automator.launch as jest.Mock).mockResolvedValue(newMiniProgram)

      const result = await automatorTools.launch(mockSession, {
        projectPath: '/path/to/project',
      })

      expect(result.success).toBe(true)
      expect(oldMiniProgram.disconnect).toHaveBeenCalled()
      expect(mockSession.miniProgram).toBe(newMiniProgram)
    })

    it('should throw error if launch fails', async () => {
      ;(automator.launch as jest.Mock).mockRejectedValue(new Error('Launch failed'))

      await expect(
        automatorTools.launch(mockSession, {
          projectPath: '/path/to/project',
        })
      ).rejects.toThrow('Failed to launch miniprogram: Launch failed')
    })

    it('should log launch attempt', async () => {
      const mockMiniProgram = { disconnect: jest.fn() }
      ;(automator.launch as jest.Mock).mockResolvedValue(mockMiniProgram)

      await automatorTools.launch(mockSession, {
        projectPath: '/path/to/project',
        port: 9420,
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Launching miniprogram',
        expect.any(Object)
      )
      expect(mockSession.logger?.info).toHaveBeenCalledWith('MiniProgram launched successfully', {
        port: 9420,
      })
    })
  })

  describe('connect', () => {
    it('should connect to existing DevTools instance', async () => {
      const mockMiniProgram = {
        disconnect: jest.fn(),
      }

      ;(automator.connect as jest.Mock).mockResolvedValue(mockMiniProgram)

      const result = await automatorTools.connect(mockSession, { port: 9420 })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Connected to DevTools')
      expect(result.port).toBe(9420)
      expect(mockSession.miniProgram).toBe(mockMiniProgram)
      expect(mockSession.config?.port).toBe(9420)
      expect(automator.connect).toHaveBeenCalledWith({
        wsEndpoint: 'ws://localhost:9420',
      })
    })

    it('should connect without port parameter', async () => {
      const mockMiniProgram = { disconnect: jest.fn() }
      ;(automator.connect as jest.Mock).mockResolvedValue(mockMiniProgram)

      const result = await automatorTools.connect(mockSession)

      expect(result.success).toBe(true)
      expect(result.port).toBeUndefined()
      expect(automator.connect).toHaveBeenCalledWith({
        wsEndpoint: undefined,
      })
    })

    it('should disconnect existing connection before connecting', async () => {
      const oldMiniProgram = {
        disconnect: jest.fn().mockResolvedValue(undefined),
      }
      const newMiniProgram = {
        disconnect: jest.fn(),
      }

      mockSession.miniProgram = oldMiniProgram
      ;(automator.connect as jest.Mock).mockResolvedValue(newMiniProgram)

      const result = await automatorTools.connect(mockSession, { port: 9420 })

      expect(result.success).toBe(true)
      expect(oldMiniProgram.disconnect).toHaveBeenCalled()
      expect(mockSession.miniProgram).toBe(newMiniProgram)
    })

    it('should throw error if connect fails', async () => {
      ;(automator.connect as jest.Mock).mockRejectedValue(new Error('Connection refused'))

      await expect(automatorTools.connect(mockSession, { port: 9420 })).rejects.toThrow(
        'Failed to connect to DevTools: Connection refused'
      )
    })

    it('should log connect attempt', async () => {
      const mockMiniProgram = { disconnect: jest.fn() }
      ;(automator.connect as jest.Mock).mockResolvedValue(mockMiniProgram)

      await automatorTools.connect(mockSession, { port: 9420 })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Connecting to existing DevTools instance',
        { port: 9420 }
      )
      expect(mockSession.logger?.info).toHaveBeenCalledWith('Connected to DevTools successfully', {
        port: 9420,
      })
    })
  })

  describe('disconnect', () => {
    it('should disconnect from miniprogram', async () => {
      const mockMiniProgram = {
        disconnect: jest.fn().mockResolvedValue(undefined),
      }

      mockSession.miniProgram = mockMiniProgram
      mockSession.elements.set('elem-1', {})
      mockSession.pages = [{ path: '/pages/index' }]

      const result = await automatorTools.disconnect(mockSession)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Disconnected from miniprogram successfully')
      expect(mockMiniProgram.disconnect).toHaveBeenCalled()
      expect(mockSession.miniProgram).toBeUndefined()
      expect(mockSession.elements.size).toBe(0)
      expect(mockSession.pages).toEqual([])
    })

    it('should handle disconnect when not connected', async () => {
      mockSession.miniProgram = undefined

      const result = await automatorTools.disconnect(mockSession)

      expect(result.success).toBe(true)
      expect(result.message).toBe('No active connection')
      expect(mockSession.logger?.warn).toHaveBeenCalledWith(
        'No active miniProgram connection to disconnect'
      )
    })

    it('should cleanup state even if disconnect fails', async () => {
      const mockMiniProgram = {
        disconnect: jest.fn().mockRejectedValue(new Error('Disconnect failed')),
      }

      mockSession.miniProgram = mockMiniProgram
      mockSession.elements.set('elem-1', {})
      mockSession.pages = [{ path: '/pages/index' }]

      await expect(automatorTools.disconnect(mockSession)).rejects.toThrow(
        'Error disconnecting from miniprogram: Disconnect failed'
      )

      // State should still be cleaned up
      expect(mockSession.miniProgram).toBeUndefined()
      expect(mockSession.elements.size).toBe(0)
      expect(mockSession.pages).toEqual([])
    })

    it('should log disconnect attempt', async () => {
      const mockMiniProgram = {
        disconnect: jest.fn().mockResolvedValue(undefined),
      }

      mockSession.miniProgram = mockMiniProgram

      await automatorTools.disconnect(mockSession)

      expect(mockSession.logger?.info).toHaveBeenCalledWith('Disconnecting from miniprogram')
      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Disconnected from miniprogram successfully'
      )
    })
  })

  describe('close', () => {
    it('should close miniprogram session completely', async () => {
      const mockMiniProgram = {
        disconnect: jest.fn().mockResolvedValue(undefined),
      }
      const mockIdeProcess = {
        kill: jest.fn(),
      }

      mockSession.miniProgram = mockMiniProgram
      mockSession.ideProcess = mockIdeProcess
      mockSession.elements.set('elem-1', {})
      mockSession.pages = [{ path: '/pages/index' }]

      const result = await automatorTools.close(mockSession)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Miniprogram session closed successfully')
      expect(mockMiniProgram.disconnect).toHaveBeenCalled()
      expect(mockIdeProcess.kill).toHaveBeenCalled()
      expect(mockSession.miniProgram).toBeUndefined()
      expect(mockSession.ideProcess).toBeUndefined()
    })

    it('should handle close when not connected', async () => {
      mockSession.miniProgram = undefined
      mockSession.ideProcess = undefined

      const result = await automatorTools.close(mockSession)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Miniprogram session closed successfully')
    })

    it('should cleanup state even if close fails', async () => {
      const mockMiniProgram = {
        disconnect: jest.fn().mockRejectedValue(new Error('Close failed')),
      }
      const mockIdeProcess = {
        kill: jest.fn(),
      }

      mockSession.miniProgram = mockMiniProgram
      mockSession.ideProcess = mockIdeProcess

      await expect(automatorTools.close(mockSession)).rejects.toThrow(
        'Error closing miniprogram session'
      )

      // State should still be cleaned up
      expect(mockSession.miniProgram).toBeUndefined()
      expect(mockSession.ideProcess).toBeUndefined()
    })

    it('should log close attempt', async () => {
      const mockMiniProgram = {
        disconnect: jest.fn().mockResolvedValue(undefined),
      }

      mockSession.miniProgram = mockMiniProgram

      await automatorTools.close(mockSession)

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Closing miniprogram session',
        expect.any(Object)
      )
      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Miniprogram session closed successfully'
      )
    })

    it('should not fail if IDE process has no kill method', async () => {
      mockSession.ideProcess = {} // No kill method

      const result = await automatorTools.close(mockSession)

      expect(result.success).toBe(true)
    })
  })
})
