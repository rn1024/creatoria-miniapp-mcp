/**
 * Unit tests for Network Mock tools
 */

import * as networkTools from '../../src/tools/network'
import type { SessionState } from '../../src/types'

describe('Network Mock Tools', () => {
  let mockSession: SessionState

  beforeEach(() => {
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

    jest.clearAllMocks()
  })

  describe('mockWxMethod', () => {
    it('should mock wx method successfully', async () => {
      const mockMiniProgram = {
        mockWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.mockWxMethod(mockSession, {
        method: 'getStorage',
        result: { data: 'test-value' },
        type: 'success',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('getStorage')
      expect(mockMiniProgram.mockWxMethod).toHaveBeenCalledWith(
        'getStorage',
        { data: 'test-value' },
        { type: 'success' }
      )
      expect(mockSession.logger?.info).toHaveBeenCalledWith('Mocking wx method', {
        method: 'getStorage',
        type: 'success',
      })
    })

    it('should default to success type', async () => {
      const mockMiniProgram = {
        mockWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      await networkTools.mockWxMethod(mockSession, {
        method: 'showToast',
        result: { title: 'Test' },
      })

      expect(mockMiniProgram.mockWxMethod).toHaveBeenCalledWith(
        'showToast',
        { title: 'Test' },
        { type: 'success' }
      )
    })

    it('should mock fail type', async () => {
      const mockMiniProgram = {
        mockWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.mockWxMethod(mockSession, {
        method: 'getLocation',
        result: { errMsg: 'getLocation:fail' },
        type: 'fail',
      })

      expect(result.success).toBe(true)
      expect(mockMiniProgram.mockWxMethod).toHaveBeenCalledWith(
        'getLocation',
        { errMsg: 'getLocation:fail' },
        { type: 'fail' }
      )
    })

    it('should throw if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        networkTools.mockWxMethod(mockSession, {
          method: 'request',
          result: {},
        })
      ).rejects.toThrow('MiniProgram not connected')
    })

    it('should log errors', async () => {
      const mockMiniProgram = {
        mockWxMethod: jest.fn().mockImplementation(() => {
          throw new Error('Mock failed')
        }),
      }
      mockSession.miniProgram = mockMiniProgram

      await expect(
        networkTools.mockWxMethod(mockSession, {
          method: 'request',
          result: {},
        })
      ).rejects.toThrow('Failed to mock wx.request')

      expect(mockSession.logger?.error).toHaveBeenCalledWith(
        'Mock wx method failed',
        expect.any(Object)
      )
    })
  })

  describe('restoreWxMethod', () => {
    it('should restore wx method successfully', async () => {
      const mockMiniProgram = {
        restoreWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.restoreWxMethod(mockSession, {
        method: 'request',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('request')
      expect(mockMiniProgram.restoreWxMethod).toHaveBeenCalledWith('request')
      expect(mockSession.logger?.info).toHaveBeenCalledWith('Restoring wx method', {
        method: 'request',
      })
    })

    it('should throw if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        networkTools.restoreWxMethod(mockSession, {
          method: 'request',
        })
      ).rejects.toThrow('MiniProgram not connected')
    })

    it('should log errors', async () => {
      const mockMiniProgram = {
        restoreWxMethod: jest.fn().mockImplementation(() => {
          throw new Error('Restore failed')
        }),
      }
      mockSession.miniProgram = mockMiniProgram

      await expect(
        networkTools.restoreWxMethod(mockSession, {
          method: 'request',
        })
      ).rejects.toThrow('Failed to restore wx.request')

      expect(mockSession.logger?.error).toHaveBeenCalled()
    })
  })

  describe('mockRequest', () => {
    it('should mock request with default values', async () => {
      const mockMiniProgram = {
        mockWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.mockRequest(mockSession, {})

      expect(result.success).toBe(true)
      expect(mockMiniProgram.mockWxMethod).toHaveBeenCalledWith(
        'request',
        {
          data: {},
          statusCode: 200,
          header: {},
        },
        { type: 'success' }
      )
    })

    it('should mock request with custom data', async () => {
      const mockMiniProgram = {
        mockWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.mockRequest(mockSession, {
        data: { userId: 123 },
        statusCode: 201,
        header: { 'Content-Type': 'application/json' },
        type: 'success',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('201')
      expect(mockMiniProgram.mockWxMethod).toHaveBeenCalledWith(
        'request',
        {
          data: { userId: 123 },
          statusCode: 201,
          header: { 'Content-Type': 'application/json' },
        },
        { type: 'success' }
      )
    })

    it('should mock request as fail', async () => {
      const mockMiniProgram = {
        mockWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.mockRequest(mockSession, {
        type: 'fail',
        statusCode: 404,
      })

      expect(result.success).toBe(true)
      expect(mockMiniProgram.mockWxMethod).toHaveBeenCalledWith(
        'request',
        expect.any(Object),
        { type: 'fail' }
      )
    })

    it('should throw if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(networkTools.mockRequest(mockSession, {})).rejects.toThrow(
        'MiniProgram not connected'
      )
    })
  })

  describe('mockRequestFailure', () => {
    it('should mock request failure with default values', async () => {
      const mockMiniProgram = {
        mockWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.mockRequestFailure(mockSession, {})

      expect(result.success).toBe(true)
      expect(result.message).toContain('request:fail')
      expect(mockMiniProgram.mockWxMethod).toHaveBeenCalledWith(
        'request',
        {
          errMsg: 'request:fail',
          errno: -1,
        },
        { type: 'fail' }
      )
    })

    it('should mock request failure with custom error', async () => {
      const mockMiniProgram = {
        mockWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.mockRequestFailure(mockSession, {
        errMsg: 'request:fail timeout',
        errno: -2,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('timeout')
      expect(mockMiniProgram.mockWxMethod).toHaveBeenCalledWith(
        'request',
        {
          errMsg: 'request:fail timeout',
          errno: -2,
        },
        { type: 'fail' }
      )
    })

    it('should throw if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(networkTools.mockRequestFailure(mockSession, {})).rejects.toThrow(
        'MiniProgram not connected'
      )
    })
  })

  describe('restoreRequest', () => {
    it('should restore request successfully', async () => {
      const mockMiniProgram = {
        restoreWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.restoreRequest(mockSession)

      expect(result.success).toBe(true)
      expect(result.message).toContain('wx.request')
      expect(mockMiniProgram.restoreWxMethod).toHaveBeenCalledWith('request')
    })

    it('should throw if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(networkTools.restoreRequest(mockSession)).rejects.toThrow(
        'MiniProgram not connected'
      )
    })
  })

  describe('restoreAllMocks', () => {
    it('should restore all common mocked methods', async () => {
      const mockMiniProgram = {
        restoreWxMethod: jest.fn(),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.restoreAllMocks(mockSession)

      expect(result.success).toBe(true)
      expect(mockMiniProgram.restoreWxMethod).toHaveBeenCalledTimes(15) // 15 common methods
      expect(mockMiniProgram.restoreWxMethod).toHaveBeenCalledWith('request')
      expect(mockMiniProgram.restoreWxMethod).toHaveBeenCalledWith('getStorage')
      expect(mockMiniProgram.restoreWxMethod).toHaveBeenCalledWith('showToast')
    })

    it('should continue on errors for unmocked methods', async () => {
      const mockMiniProgram = {
        restoreWxMethod: jest.fn().mockImplementation((method: string) => {
          if (method === 'request') {
            // Successfully restore request
            return
          }
          throw new Error('Method was not mocked')
        }),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.restoreAllMocks(mockSession)

      expect(result.success).toBe(true)
      expect(result.message).toContain('restored 1') // Only request succeeded
    })

    it('should count successful restorations', async () => {
      let callCount = 0
      const mockMiniProgram = {
        restoreWxMethod: jest.fn().mockImplementation(() => {
          callCount++
          if (callCount <= 5) {
            // First 5 succeed
            return
          }
          throw new Error('Method was not mocked')
        }),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await networkTools.restoreAllMocks(mockSession)

      expect(result.success).toBe(true)
      expect(result.message).toContain('5')
    })

    it('should throw if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(networkTools.restoreAllMocks(mockSession)).rejects.toThrow(
        'MiniProgram not connected'
      )
    })
  })
})
