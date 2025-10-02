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

      expect(mockSession.logger?.info).toHaveBeenCalledWith('Tapping element', expect.any(Object))
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

      expect(mockSession.logger?.info).toHaveBeenCalledWith('Inputting text', expect.any(Object))
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

      expect(mockSession.logger?.info).toHaveBeenCalledWith('Triggering event', expect.any(Object))
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
      ).rejects.toThrow(
        'Element not found with refId: missing-ref. Use page_query to get element reference first.'
      )
    })
  })

  describe('touchstart', () => {
    it('should handle touchstart successfully', async () => {
      const mockElement = {
        touchstart: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const touches = [{ identifier: 0, pageX: 10, pageY: 20 }]
      const changedTouches = [{ identifier: 0, pageX: 10, pageY: 20 }]

      const result = await elementTools.touchstart(mockSession, {
        refId: 'test-ref-1',
        touches,
        changedTouches,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Touch start')
      expect(mockElement.touchstart).toHaveBeenCalledWith({ touches, changedTouches })
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.touchstart(mockSession, {
          refId: 'non-existent',
          touches: [],
          changedTouches: [],
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log touchstart attempts', async () => {
      const mockElement = {
        touchstart: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.touchstart(mockSession, {
        refId: 'test-ref-1',
        touches: [],
        changedTouches: [],
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Touch start on element',
        expect.any(Object)
      )
    })
  })

  describe('touchmove', () => {
    it('should handle touchmove successfully', async () => {
      const mockElement = {
        touchmove: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const touches = [{ identifier: 0, pageX: 15, pageY: 25 }]
      const changedTouches = [{ identifier: 0, pageX: 15, pageY: 25 }]

      const result = await elementTools.touchmove(mockSession, {
        refId: 'test-ref-1',
        touches,
        changedTouches,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Touch move')
      expect(mockElement.touchmove).toHaveBeenCalledWith({ touches, changedTouches })
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.touchmove(mockSession, {
          refId: 'non-existent',
          touches: [],
          changedTouches: [],
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log touchmove attempts', async () => {
      const mockElement = {
        touchmove: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.touchmove(mockSession, {
        refId: 'test-ref-1',
        touches: [],
        changedTouches: [],
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Touch move on element',
        expect.any(Object)
      )
    })
  })

  describe('touchend', () => {
    it('should handle touchend successfully', async () => {
      const mockElement = {
        touchend: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const touches: any[] = []
      const changedTouches = [{ identifier: 0, pageX: 20, pageY: 30 }]

      const result = await elementTools.touchend(mockSession, {
        refId: 'test-ref-1',
        touches,
        changedTouches,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Touch end')
      expect(mockElement.touchend).toHaveBeenCalledWith({ touches, changedTouches })
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.touchend(mockSession, {
          refId: 'non-existent',
          touches: [],
          changedTouches: [],
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log touchend attempts', async () => {
      const mockElement = {
        touchend: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.touchend(mockSession, {
        refId: 'test-ref-1',
        touches: [],
        changedTouches: [],
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Touch end on element',
        expect.any(Object)
      )
    })
  })

  describe('scrollTo', () => {
    it('should scroll to position successfully', async () => {
      const mockElement = {
        scrollTo: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.scrollTo(mockSession, {
        refId: 'test-ref-1',
        x: 100,
        y: 200,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Scrolled to (100, 200)')
      expect(mockElement.scrollTo).toHaveBeenCalledWith(100, 200)
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.scrollTo(mockSession, {
          refId: 'non-existent',
          x: 0,
          y: 0,
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log scrollTo attempts', async () => {
      const mockElement = {
        scrollTo: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.scrollTo(mockSession, {
        refId: 'test-ref-1',
        x: 50,
        y: 100,
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Scrolling element to position',
        expect.any(Object)
      )
    })
  })

  describe('scrollWidth', () => {
    it('should get scroll width successfully', async () => {
      const mockElement = {
        scrollWidth: jest.fn().mockResolvedValue(500),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.scrollWidth(mockSession, {
        refId: 'test-ref-1',
      })

      expect(result.success).toBe(true)
      expect(result.width).toBe(500)
      expect(mockElement.scrollWidth).toHaveBeenCalled()
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.scrollWidth(mockSession, {
          refId: 'non-existent',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log scrollWidth attempts', async () => {
      const mockElement = {
        scrollWidth: jest.fn().mockResolvedValue(500),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.scrollWidth(mockSession, {
        refId: 'test-ref-1',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting scroll width',
        expect.any(Object)
      )
    })
  })

  describe('scrollHeight', () => {
    it('should get scroll height successfully', async () => {
      const mockElement = {
        scrollHeight: jest.fn().mockResolvedValue(800),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.scrollHeight(mockSession, {
        refId: 'test-ref-1',
      })

      expect(result.success).toBe(true)
      expect(result.height).toBe(800)
      expect(mockElement.scrollHeight).toHaveBeenCalled()
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.scrollHeight(mockSession, {
          refId: 'non-existent',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log scrollHeight attempts', async () => {
      const mockElement = {
        scrollHeight: jest.fn().mockResolvedValue(800),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.scrollHeight(mockSession, {
        refId: 'test-ref-1',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Getting scroll height',
        expect.any(Object)
      )
    })
  })

  describe('swipeTo', () => {
    it('should swipe to index successfully', async () => {
      const mockElement = {
        swipeTo: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.swipeTo(mockSession, {
        refId: 'test-ref-1',
        index: 2,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Swiped to index 2')
      expect(mockElement.swipeTo).toHaveBeenCalledWith(2)
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.swipeTo(mockSession, {
          refId: 'non-existent',
          index: 0,
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log swipeTo attempts', async () => {
      const mockElement = {
        swipeTo: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.swipeTo(mockSession, {
        refId: 'test-ref-1',
        index: 1,
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith('Swiping to index', expect.any(Object))
    })
  })

  describe('moveTo', () => {
    it('should move to position successfully', async () => {
      const mockElement = {
        moveTo: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.moveTo(mockSession, {
        refId: 'test-ref-1',
        x: 50,
        y: 75,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Moved to (50, 75)')
      expect(mockElement.moveTo).toHaveBeenCalledWith(50, 75)
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.moveTo(mockSession, {
          refId: 'non-existent',
          x: 0,
          y: 0,
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log moveTo attempts', async () => {
      const mockElement = {
        moveTo: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.moveTo(mockSession, {
        refId: 'test-ref-1',
        x: 25,
        y: 30,
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Moving element to position',
        expect.any(Object)
      )
    })
  })

  describe('slideTo', () => {
    it('should slide to value successfully', async () => {
      const mockElement = {
        slideTo: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.slideTo(mockSession, {
        refId: 'test-ref-1',
        value: 75,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Slid to value 75')
      expect(mockElement.slideTo).toHaveBeenCalledWith(75)
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.slideTo(mockSession, {
          refId: 'non-existent',
          value: 0,
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log slideTo attempts', async () => {
      const mockElement = {
        slideTo: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.slideTo(mockSession, {
        refId: 'test-ref-1',
        value: 50,
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith('Sliding to value', expect.any(Object))
    })
  })

  describe('callContextMethod', () => {
    it('should call context method successfully', async () => {
      const mockElement = {
        callContextMethod: jest.fn().mockResolvedValue({ result: 'success' }),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.callContextMethod(mockSession, {
        refId: 'test-ref-1',
        method: 'drawImage',
        args: ['image.png', 0, 0],
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Context method "drawImage" called successfully')
      expect(result.result).toEqual({ result: 'success' })
      expect(mockElement.callContextMethod).toHaveBeenCalledWith('drawImage', 'image.png', 0, 0)
    })

    it('should call context method without args', async () => {
      const mockElement = {
        callContextMethod: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.callContextMethod(mockSession, {
        refId: 'test-ref-1',
        method: 'save',
      })

      expect(result.success).toBe(true)
      expect(mockElement.callContextMethod).toHaveBeenCalledWith('save')
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.callContextMethod(mockSession, {
          refId: 'non-existent',
          method: 'save',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log callContextMethod attempts', async () => {
      const mockElement = {
        callContextMethod: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.callContextMethod(mockSession, {
        refId: 'test-ref-1',
        method: 'restore',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Calling context method',
        expect.any(Object)
      )
    })
  })

  describe('setData', () => {
    it('should set element data successfully', async () => {
      const mockElement = {
        setData: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const data = { count: 5, name: 'test' }
      const result = await elementTools.setData(mockSession, {
        refId: 'test-ref-1',
        data,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Element data updated with 2 keys')
      expect(mockElement.setData).toHaveBeenCalledWith(data)
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.setData(mockSession, {
          refId: 'non-existent',
          data: {},
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log setData attempts', async () => {
      const mockElement = {
        setData: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.setData(mockSession, {
        refId: 'test-ref-1',
        data: { foo: 'bar' },
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Setting element data',
        expect.any(Object)
      )
    })
  })

  describe('callMethod', () => {
    it('should call element method successfully', async () => {
      const mockElement = {
        callMethod: jest.fn().mockResolvedValue({ data: 'result' }),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.callMethod(mockSession, {
        refId: 'test-ref-1',
        method: 'getData',
        args: ['key1', 'key2'],
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Element method "getData" called successfully')
      expect(result.result).toEqual({ data: 'result' })
      expect(mockElement.callMethod).toHaveBeenCalledWith('getData', 'key1', 'key2')
    })

    it('should call element method without args', async () => {
      const mockElement = {
        callMethod: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      const result = await elementTools.callMethod(mockSession, {
        refId: 'test-ref-1',
        method: 'refresh',
      })

      expect(result.success).toBe(true)
      expect(mockElement.callMethod).toHaveBeenCalledWith('refresh')
    })

    it('should throw error if element not found', async () => {
      await expect(
        elementTools.callMethod(mockSession, {
          refId: 'non-existent',
          method: 'getData',
        })
      ).rejects.toThrow('Element not found with refId')
    })

    it('should log callMethod attempts', async () => {
      const mockElement = {
        callMethod: jest.fn().mockResolvedValue(undefined),
      }
      mockSession.elements.set('test-ref-1', mockElement)

      await elementTools.callMethod(mockSession, {
        refId: 'test-ref-1',
        method: 'reset',
      })

      expect(mockSession.logger?.info).toHaveBeenCalledWith(
        'Calling element method',
        expect.any(Object)
      )
    })
  })
})
