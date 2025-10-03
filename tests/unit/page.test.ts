/**
 * Unit tests for Page tools
 */

import * as pageTools from '../../src/tools/page'
import type { SessionState } from '../../src/types'

describe('Page Tools', () => {
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
        child: jest.fn().mockReturnThis(),
      },
    }

    jest.clearAllMocks()
  })

  describe('query', () => {
    it('should query element successfully', async () => {
      const mockElement = { tagName: 'view' }
      const mockPage = {
        $: jest.fn().mockResolvedValue(mockElement),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.query(mockSession, {
        selector: '.test-element',
      })

      expect(result.success).toBe(true)
      expect(result.exists).toBe(true)
      expect(result.refId).toBeDefined()
      expect(mockPage.$).toHaveBeenCalledWith('.test-element')
      expect(mockSession.elements.size).toBe(1)
    })

    it('should return not found if element does not exist', async () => {
      const mockPage = {
        $: jest.fn().mockResolvedValue(null),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.query(mockSession, {
        selector: '.non-existent',
      })

      expect(result.success).toBe(true)
      expect(result.exists).toBe(false)
      expect(result.refId).toBeUndefined()
    })

    it('should not save element if save is false', async () => {
      const mockElement = { tagName: 'view' }
      const mockPage = {
        $: jest.fn().mockResolvedValue(mockElement),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.query(mockSession, {
        selector: '.test-element',
        save: false,
      })

      expect(result.success).toBe(true)
      expect(result.exists).toBe(true)
      expect(result.refId).toBeUndefined()
      expect(mockSession.elements.size).toBe(0)
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        pageTools.query(mockSession, {
          selector: '.test',
        })
      ).rejects.toThrow('MiniProgram not connected')
    })

    it('should log query attempts', async () => {
      const mockElement = { tagName: 'view' }
      const mockPage = {
        $: jest.fn().mockResolvedValue(mockElement),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      await pageTools.query(mockSession, {
        selector: '.test-element',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith('Querying element', expect.any(Object))
    })
  })

  describe('queryAll', () => {
    it('should query all elements successfully', async () => {
      const mockElements = [{ tagName: 'view' }, { tagName: 'view' }, { tagName: 'view' }]
      const mockPage = {
        $$: jest.fn().mockResolvedValue(mockElements),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.queryAll(mockSession, {
        selector: '.test-elements',
      })

      expect(result.success).toBe(true)
      expect(result.count).toBe(3)
      expect(result.refIds).toHaveLength(3)
      expect(mockPage.$$).toHaveBeenCalledWith('.test-elements')
      expect(mockSession.elements.size).toBe(3)
    })

    it('should return empty array if no elements found', async () => {
      const mockPage = {
        $$: jest.fn().mockResolvedValue([]),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.queryAll(mockSession, {
        selector: '.non-existent',
      })

      expect(result.success).toBe(true)
      expect(result.count).toBe(0)
      expect(result.refIds).toBeUndefined()
    })

    it('should not save elements if save is false', async () => {
      const mockElements = [{ tagName: 'view' }, { tagName: 'view' }]
      const mockPage = {
        $$: jest.fn().mockResolvedValue(mockElements),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.queryAll(mockSession, {
        selector: '.test-elements',
        save: false,
      })

      expect(result.success).toBe(true)
      expect(result.count).toBe(2)
      expect(result.refIds).toBeUndefined()
      expect(mockSession.elements.size).toBe(0)
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        pageTools.queryAll(mockSession, {
          selector: '.test',
        })
      ).rejects.toThrow('MiniProgram not connected')
    })
  })

  describe('waitFor', () => {
    it('should wait for timeout (number)', async () => {
      const mockPage = {
        waitFor: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.waitFor(mockSession, {
        condition: 500,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('500ms')
      expect(mockPage.waitFor).toHaveBeenCalledWith(500)
    })

    it('should wait for selector (string)', async () => {
      const mockPage = {
        waitFor: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.waitFor(mockSession, {
        condition: '.loading-complete',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Element appeared')
      expect(mockPage.waitFor).toHaveBeenCalledWith('.loading-complete')
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        pageTools.waitFor(mockSession, {
          condition: 100,
        })
      ).rejects.toThrow('MiniProgram not connected')
    })

    it('should log wait attempts', async () => {
      const mockPage = {
        waitFor: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      await pageTools.waitFor(mockSession, {
        condition: 100,
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Waiting for condition',
        expect.any(Object)
      )
    })
  })

  describe('getData', () => {
    it('should get all page data', async () => {
      const mockData = { name: 'test', value: 123 }
      const mockPage = {
        data: jest.fn().mockResolvedValue(mockData),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.getData(mockSession)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(mockPage.data).toHaveBeenCalledWith(undefined)
    })

    it('should get data at specific path', async () => {
      const mockData = 'test-value'
      const mockPage = {
        data: jest.fn().mockResolvedValue(mockData),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.getData(mockSession, {
        path: 'user.name',
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('test-value')
      expect(mockPage.data).toHaveBeenCalledWith('user.name')
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(pageTools.getData(mockSession)).rejects.toThrow('MiniProgram not connected')
    })
  })

  describe('setData', () => {
    it('should set page data successfully', async () => {
      const mockPage = {
        setData: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const dataToSet = { name: 'new-value', count: 42 }
      const result = await pageTools.setData(mockSession, {
        data: dataToSet,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('2 keys')
      expect(mockPage.setData).toHaveBeenCalledWith(dataToSet)
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        pageTools.setData(mockSession, {
          data: { test: 'value' },
        })
      ).rejects.toThrow('MiniProgram not connected')
    })

    it('should log setData attempts', async () => {
      const mockPage = {
        setData: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      await pageTools.setData(mockSession, {
        data: { name: 'test' },
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith('Setting page data', expect.any(Object))
    })
  })

  describe('callMethod', () => {
    it('should call page method successfully', async () => {
      const mockResult = { success: true, data: 'result' }
      const mockPage = {
        callMethod: jest.fn().mockResolvedValue(mockResult),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.callMethod(mockSession, {
        method: 'testMethod',
        args: ['arg1', 42],
      })

      expect(result.success).toBe(true)
      expect(result.result).toEqual(mockResult)
      expect(mockPage.callMethod).toHaveBeenCalledWith('testMethod', 'arg1', 42)
    })

    it('should call method without arguments', async () => {
      const mockPage = {
        callMethod: jest.fn().mockResolvedValue('result'),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.callMethod(mockSession, {
        method: 'refresh',
      })

      expect(result.success).toBe(true)
      expect(mockPage.callMethod).toHaveBeenCalledWith('refresh')
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(
        pageTools.callMethod(mockSession, {
          method: 'test',
        })
      ).rejects.toThrow('MiniProgram not connected')
    })
  })

  describe('getSize', () => {
    it('should get page size successfully', async () => {
      const mockSize = { width: 375, height: 667, scrollHeight: 1200 }
      const mockPage = {
        size: jest.fn().mockResolvedValue(mockSize),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.getSize(mockSession)

      expect(result.success).toBe(true)
      expect(result.size).toEqual(mockSize)
      expect(mockPage.size).toHaveBeenCalled()
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(pageTools.getSize(mockSession)).rejects.toThrow('MiniProgram not connected')
    })
  })

  describe('getScrollTop', () => {
    it('should get page scrollTop successfully', async () => {
      const mockPage = {
        scrollTop: jest.fn().mockResolvedValue(250),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      const result = await pageTools.getScrollTop(mockSession)

      expect(result.success).toBe(true)
      expect(result.scrollTop).toBe(250)
      expect(mockPage.scrollTop).toHaveBeenCalled()
    })

    it('should throw error if miniprogram not connected', async () => {
      mockSession.miniProgram = undefined

      await expect(pageTools.getScrollTop(mockSession)).rejects.toThrow('MiniProgram not connected')
    })

    it('should log getScrollTop attempts', async () => {
      const mockPage = {
        scrollTop: jest.fn().mockResolvedValue(100),
      }
      mockSession.miniProgram = {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      }

      await pageTools.getScrollTop(mockSession)

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting page scrollTop',
        expect.any(Object)
      )
    })
  })
})
