/**
 * Unit tests for Element tools
 */

import * as elementTools from '../../src/tools/element'
import type { SessionState } from '../../src/types'

describe('Element Tools', () => {
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

  describe('tap', () => {
    it('should tap element successfully', async () => {
      const mockElement = {
        tap: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.tap(mockSession, {
        refId: 'test-ref-1',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Element tapped')
      expect(mockElement.tap).toHaveBeenCalled()
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.tap(mockSession, {
          refId: 'non-existent',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log tap attempts', async () => {
      const mockElement = {
        tap: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.tap(mockSession, {
        refId: 'test-ref-1',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Tapping element',
        expect.any(Object)
      )
    })
  })

  describe('longpress', () => {
    it('should longpress element successfully', async () => {
      const mockElement = {
        longpress: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.longpress(mockSession, {
        refId: 'test-ref-1',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Element long pressed')
      expect(mockElement.longpress).toHaveBeenCalled()
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.longpress(mockSession, {
          refId: 'non-existent',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log longpress attempts', async () => {
      const mockElement = {
        longpress: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.longpress(mockSession, {
        refId: 'test-ref-1',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Long pressing element',
        expect.any(Object)
      )
    })
  })

  describe('input', () => {
    it('should input text successfully', async () => {
      const mockElement = {
        input: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.input(mockSession, {
        refId: 'test-ref-1',
        value: 'test input',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Text input to element')
      expect(mockElement.input).toHaveBeenCalledWith('test input')
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.input(mockSession, {
          refId: 'non-existent',
          value: 'test',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log input attempts', async () => {
      const mockElement = {
        input: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.input(mockSession, {
        refId: 'test-ref-1',
        value: 'test',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Inputting text',
        expect.any(Object)
      )
    })
  })

  describe('getText', () => {
    it('should get element text successfully', async () => {
      const mockElement = {
        text: jest.fn().mockResolvedValue('Hello World'),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.getText(mockSession, {
        refId: 'test-ref-1',
      })

      expect(result.success).toBe(true)
      expect(result.text).toBe('Hello World')
      expect(mockElement.text).toHaveBeenCalled()
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.getText(mockSession, {
          refId: 'non-existent',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log getText attempts', async () => {
      const mockElement = {
        text: jest.fn().mockResolvedValue('test'),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.getText(mockSession, {
        refId: 'test-ref-1',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting element text',
        expect.any(Object)
      )
    })
  })

  describe('getAttribute', () => {
    it('should get element attribute successfully', async () => {
      const mockElement = {
        attribute: jest.fn().mockResolvedValue('test-value'),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.getAttribute(mockSession, {
        refId: 'test-ref-1',
        name: 'data-id',
      })

      expect(result.success).toBe(true)
      expect(result.value).toBe('test-value')
      expect(mockElement.attribute).toHaveBeenCalledWith('data-id')
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.getAttribute(mockSession, {
          refId: 'non-existent',
          name: 'data-id',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log getAttribute attempts', async () => {
      const mockElement = {
        attribute: jest.fn().mockResolvedValue('value'),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.getAttribute(mockSession, {
        refId: 'test-ref-1',
        name: 'data-test',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting element attribute',
        expect.any(Object)
      )
    })
  })

  describe('getProperty', () => {
    it('should get element property successfully', async () => {
      const mockElement = {
        property: jest.fn().mockResolvedValue({ foo: 'bar' }),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.getProperty(mockSession, {
        refId: 'test-ref-1',
        name: 'dataset',
      })

      expect(result.success).toBe(true)
      expect(result.value).toEqual({ foo: 'bar' })
      expect(mockElement.property).toHaveBeenCalledWith('dataset')
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.getProperty(mockSession, {
          refId: 'non-existent',
          name: 'dataset',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log getProperty attempts', async () => {
      const mockElement = {
        property: jest.fn().mockResolvedValue('value'),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.getProperty(mockSession, {
        refId: 'test-ref-1',
        name: 'className',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting element property',
        expect.any(Object)
      )
    })
  })

  describe('getValue', () => {
    it('should get element value successfully', async () => {
      const mockElement = {
        value: jest.fn().mockResolvedValue('input-value'),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.getValue(mockSession, {
        refId: 'test-ref-1',
      })

      expect(result.success).toBe(true)
      expect(result.value).toBe('input-value')
      expect(mockElement.value).toHaveBeenCalled()
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.getValue(mockSession, {
          refId: 'non-existent',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log getValue attempts', async () => {
      const mockElement = {
        value: jest.fn().mockResolvedValue('test'),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.getValue(mockSession, {
        refId: 'test-ref-1',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting element value',
        expect.any(Object)
      )
    })
  })

  describe('getSize', () => {
    it('should get element size successfully', async () => {
      const mockSize = { width: 100, height: 50 }
      const mockElement = {
        size: jest.fn().mockResolvedValue(mockSize),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.getSize(mockSession, {
        refId: 'test-ref-1',
      })

      expect(result.success).toBe(true)
      expect(result.size).toEqual(mockSize)
      expect(mockElement.size).toHaveBeenCalled()
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.getSize(mockSession, {
          refId: 'non-existent',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log getSize attempts', async () => {
      const mockElement = {
        size: jest.fn().mockResolvedValue({ width: 100, height: 50 }),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.getSize(mockSession, {
        refId: 'test-ref-1',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting element size',
        expect.any(Object)
      )
    })
  })

  describe('getOffset', () => {
    it('should get element offset successfully', async () => {
      const mockOffset = { left: 20, top: 30 }
      const mockElement = {
        offset: jest.fn().mockResolvedValue(mockOffset),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.getOffset(mockSession, {
        refId: 'test-ref-1',
      })

      expect(result.success).toBe(true)
      expect(result.offset).toEqual(mockOffset)
      expect(mockElement.offset).toHaveBeenCalled()
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.getOffset(mockSession, {
          refId: 'non-existent',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log getOffset attempts', async () => {
      const mockElement = {
        offset: jest.fn().mockResolvedValue({ left: 0, top: 0 }),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.getOffset(mockSession, {
        refId: 'test-ref-1',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting element offset',
        expect.any(Object)
      )
    })
  })

  describe('trigger', () => {
    it('should trigger event successfully', async () => {
      const mockElement = {
        trigger: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.trigger(mockSession, {
        refId: 'test-ref-1',
        type: 'customEvent',
        detail: { foo: 'bar' },
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Event "customEvent" triggered')
      expect(mockElement.trigger).toHaveBeenCalledWith('customEvent', { foo: 'bar' })
    })

    it('should trigger event without detail', async () => {
      const mockElement = {
        trigger: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.trigger(mockSession, {
        refId: 'test-ref-1',
        type: 'tap',
      })

      expect(result.success).toBe(true)
      expect(mockElement.trigger).toHaveBeenCalledWith('tap', undefined)
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.trigger(mockSession, {
          refId: 'non-existent',
          type: 'tap',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log trigger attempts', async () => {
      const mockElement = {
        trigger: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.trigger(mockSession, {
        refId: 'test-ref-1',
        type: 'change',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Triggering event',
        expect.any(Object)
      )
    })
  })

  describe('getStyle', () => {
    it('should get element style successfully', async () => {
      const mockElement = {
        style: jest.fn().mockResolvedValue('red'),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.getStyle(mockSession, {
        refId: 'test-ref-1',
        name: 'color',
      })

      expect(result.success).toBe(true)
      expect(result.value).toBe('red')
      expect(mockElement.style).toHaveBeenCalledWith('color')
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.getStyle(mockSession, {
          refId: 'non-existent',
          name: 'color',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log getStyle attempts', async () => {
      const mockElement = {
        style: jest.fn().mockResolvedValue('blue'),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.getStyle(mockSession, {
        refId: 'test-ref-1',
        name: 'backgroundColor',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting element style',
        expect.any(Object)
      )
    })
  })

  describe('getElement helper', () => {
    it('should throw descriptive error when element not found', async () => {
      await expect(
        elementTools.tap(mockSession, {
          refId: 'missing-ref',
        })
      ).rejects.toThrow('Element not found with refId: missing-ref. Use page_query to get element reference first.')
    })
  })
})
