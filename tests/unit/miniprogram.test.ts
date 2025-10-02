/**
 * Unit tests for MiniProgram tools
 */

import * as miniprogramTools from '../../src/tools/miniprogram'
import type { SessionState } from '../../src/types'

describe('MiniProgram Tools', () => {
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
      outputManager: {
        getOutputDir: jest.fn().mockReturnValue('/tmp/test-output'),
        generateFilename: jest.fn().mockReturnValue('screenshot-1.png'),
        writeFile: jest.fn().mockResolvedValue('/tmp/test-output/screenshot-1.png'),
        ensureOutputDir: jest.fn().mockResolvedValue(undefined),
      },
    }

    jest.clearAllMocks()
  })

  describe('navigate', () => {
    it('should navigate using navigateTo', async () => {
      const mockMiniProgram = {
        navigateTo: jest.fn().mockResolvedValue(undefined),
        currentPage: jest.fn().mockResolvedValue({ path: '/pages/target/index' }),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.navigate(mockSession, {
        method: 'navigateTo',
        url: '/pages/target/index',
      })

      expect(result.success).toBe(true)
      expect(result.currentPage).toBe('/pages/target/index')
      expect(mockMiniProgram.navigateTo).toHaveBeenCalledWith('/pages/target/index')
    })

    it('should navigate using redirectTo', async () => {
      const mockMiniProgram = {
        redirectTo: jest.fn().mockResolvedValue(undefined),
        currentPage: jest.fn().mockResolvedValue({ path: '/pages/new/index' }),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.navigate(mockSession, {
        method: 'redirectTo',
        url: '/pages/new/index',
      })

      expect(result.success).toBe(true)
      expect(mockMiniProgram.redirectTo).toHaveBeenCalledWith('/pages/new/index')
    })

    it('should navigate using reLaunch', async () => {
      const mockMiniProgram = {
        reLaunch: jest.fn().mockResolvedValue(undefined),
        currentPage: jest.fn().mockResolvedValue({ path: '/pages/home/index' }),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.navigate(mockSession, {
        method: 'reLaunch',
        url: '/pages/home/index',
      })

      expect(result.success).toBe(true)
      expect(mockMiniProgram.reLaunch).toHaveBeenCalledWith('/pages/home/index')
    })

    it('should navigate using switchTab', async () => {
      const mockMiniProgram = {
        switchTab: jest.fn().mockResolvedValue(undefined),
        currentPage: jest.fn().mockResolvedValue({ path: '/pages/tab/index' }),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.navigate(mockSession, {
        method: 'switchTab',
        url: '/pages/tab/index',
      })

      expect(result.success).toBe(true)
      expect(mockMiniProgram.switchTab).toHaveBeenCalledWith('/pages/tab/index')
    })

    it('should navigate using navigateBack', async () => {
      const mockMiniProgram = {
        navigateBack: jest.fn().mockResolvedValue(undefined),
        currentPage: jest.fn().mockResolvedValue({ path: '/pages/previous/index' }),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.navigate(mockSession, {
        method: 'navigateBack',
        delta: 2,
      })

      expect(result.success).toBe(true)
      expect(mockMiniProgram.navigateBack).toHaveBeenCalledWith(2)
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        miniprogramTools.navigate(mockSession, {
          method: 'navigateTo',
          url: '/pages/test',
        })
      ).rejects.toThrow('MiniProgram not connected')
    })

    it('should throw error if URL missing for navigateTo', async () => {
      mockSession.miniProgram = {
        navigateTo: jest.fn(),
        currentPage: jest.fn(),
      }

      await expect(
        miniprogramTools.navigate(mockSession, {
          method: 'navigateTo',
        } as any)
      ).rejects.toThrow('URL is required for navigateTo')
    })

    it('should log navigation attempts', async () => {
      const mockMiniProgram = {
        navigateTo: jest.fn().mockResolvedValue(undefined),
        currentPage: jest.fn().mockResolvedValue({ path: '/pages/test' }),
      }
      mockSession.miniProgram = mockMiniProgram

      await miniprogramTools.navigate(mockSession, {
        method: 'navigateTo',
        url: '/pages/test',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Navigating using navigateTo',
        expect.any(Object)
      )
    })
  })

  describe('callWx', () => {
    it('should call wx method successfully', async () => {
      const mockMiniProgram = {
        callWxMethod: jest.fn().mockResolvedValue({ success: true }),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.callWx(mockSession, {
        method: 'showToast',
        args: [{ title: 'Hello' }],
      })

      expect(result.success).toBe(true)
      expect(result.result).toEqual({ success: true })
      expect(mockMiniProgram.callWxMethod).toHaveBeenCalledWith('showToast', { title: 'Hello' })
    })

    it('should call wx method without arguments', async () => {
      const mockMiniProgram = {
        callWxMethod: jest.fn().mockResolvedValue({ data: 'test' }),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.callWx(mockSession, {
        method: 'getStorageInfo',
      })

      expect(result.success).toBe(true)
      expect(mockMiniProgram.callWxMethod).toHaveBeenCalledWith('getStorageInfo')
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        miniprogramTools.callWx(mockSession, {
          method: 'showToast',
        })
      ).rejects.toThrow('MiniProgram not connected')
    })

    it('should log wx method calls', async () => {
      const mockMiniProgram = {
        callWxMethod: jest.fn().mockResolvedValue({ success: true }),
      }
      mockSession.miniProgram = mockMiniProgram

      await miniprogramTools.callWx(mockSession, {
        method: 'request',
        args: [{ url: 'https://api.example.com' }],
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Calling wx.request',
        expect.any(Object)
      )
    })
  })

  describe('evaluate', () => {
    it('should evaluate expression successfully', async () => {
      const mockMiniProgram = {
        evaluate: jest.fn().mockResolvedValue(42),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.evaluate(mockSession, {
        expression: '1 + 1',
      })

      expect(result.success).toBe(true)
      expect(result.result).toBe(42)
      expect(mockMiniProgram.evaluate).toHaveBeenCalledWith('1 + 1')
    })

    it('should evaluate with arguments', async () => {
      const mockMiniProgram = {
        evaluate: jest.fn().mockResolvedValue('Hello World'),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.evaluate(mockSession, {
        expression: '(a, b) => a + b',
        args: ['Hello', ' World'],
      })

      expect(result.success).toBe(true)
      expect(mockMiniProgram.evaluate).toHaveBeenCalledWith(
        '(a, b) => a + b',
        'Hello',
        ' World'
      )
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        miniprogramTools.evaluate(mockSession, {
          expression: '1 + 1',
        })
      ).rejects.toThrow('MiniProgram not connected')
    })

    it('should log evaluation attempts', async () => {
      const mockMiniProgram = {
        evaluate: jest.fn().mockResolvedValue(100),
      }
      mockSession.miniProgram = mockMiniProgram

      await miniprogramTools.evaluate(mockSession, {
        expression: '() => 100',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Evaluating expression',
        expect.any(Object)
      )
    })
  })

  describe('screenshot', () => {
    it('should take screenshot successfully', async () => {
      const mockMiniProgram = {
        screenshot: jest.fn().mockResolvedValue(Buffer.from('image')),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.screenshot(mockSession, {
        filename: 'test.png',
      })

      expect(result.success).toBe(true)
      expect(result.path).toBe('/tmp/test-output/screenshot-1.png')
      expect(mockSession.outputManager?.ensureOutputDir).toHaveBeenCalled()
    })

    it('should take fullPage screenshot', async () => {
      const mockMiniProgram = {
        screenshot: jest.fn().mockResolvedValue(Buffer.from('image')),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.screenshot(mockSession, {
        fullPage: true,
      })

      expect(result.success).toBe(true)
      expect(mockMiniProgram.screenshot).toHaveBeenCalledWith({
        path: expect.any(String),
        fullPage: true,
      })
    })

    it('should auto-generate filename if not provided', async () => {
      const mockMiniProgram = {
        screenshot: jest.fn().mockResolvedValue(Buffer.from('image')),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.screenshot(mockSession)

      expect(result.success).toBe(true)
      expect(mockSession.outputManager?.generateFilename).toHaveBeenCalledWith(
        'screenshot',
        'png'
      )
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(miniprogramTools.screenshot(mockSession)).rejects.toThrow(
        'MiniProgram not connected'
      )
    })

    it('should throw error if outputManager not available', async () => {
      mockSession.miniProgram = { screenshot: jest.fn() }
      mockSession.outputManager = undefined

      await expect(miniprogramTools.screenshot(mockSession)).rejects.toThrow(
        'OutputManager not available'
      )
    })
  })

  describe('getPageStack', () => {
    it('should get page stack successfully', async () => {
      const mockPageStack = [
        { path: '/pages/index/index', query: {} },
        { path: '/pages/detail/detail', query: { id: '123' } },
      ]
      const mockMiniProgram = {
        pageStack: jest.fn().mockResolvedValue(mockPageStack),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.getPageStack(mockSession)

      expect(result.success).toBe(true)
      expect(result.pages).toHaveLength(2)
      expect(result.pages[0].path).toBe('/pages/index/index')
      expect(result.pages[1].query).toEqual({ id: '123' })
      expect(mockSession.pages).toEqual(mockPageStack)
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(miniprogramTools.getPageStack(mockSession)).rejects.toThrow(
        'MiniProgram not connected'
      )
    })
  })

  describe('getSystemInfo', () => {
    it('should get system info successfully', async () => {
      const mockSystemInfo = {
        platform: 'devtools',
        system: 'macOS',
        version: '1.0.0',
      }
      const mockMiniProgram = {
        systemInfo: jest.fn().mockResolvedValue(mockSystemInfo),
      }
      mockSession.miniProgram = mockMiniProgram

      const result = await miniprogramTools.getSystemInfo(mockSession)

      expect(result.success).toBe(true)
      expect(result.systemInfo).toEqual(mockSystemInfo)
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(miniprogramTools.getSystemInfo(mockSession)).rejects.toThrow(
        'MiniProgram not connected'
      )
    })
  })
})
