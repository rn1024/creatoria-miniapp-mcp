/**
 * Unit tests for ElementRef resolver
 */

import {
  generateRefId,
  resolvePage,
  resolveElement,
  validateElementRef,
} from '../../src/core/element-ref'
import type { SessionState, ElementRefInput } from '../../src/types'

describe('ElementRef', () => {
  describe('generateRefId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateRefId()
      const id2 = generateRefId()
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('validateElementRef', () => {
    it('should accept valid refId', () => {
      expect(() => validateElementRef({ refId: 'abc123' })).not.toThrow()
    })

    it('should accept valid selector', () => {
      expect(() => validateElementRef({ selector: '.button' })).not.toThrow()
    })

    it('should accept valid xpath', () => {
      expect(() => validateElementRef({ xpath: '//view[@class="container"]' })).not.toThrow()
    })

    it('should accept selector with index', () => {
      expect(() =>
        validateElementRef({ selector: '.item', index: 0 })
      ).not.toThrow()
    })

    it('should accept selector with pagePath', () => {
      expect(() =>
        validateElementRef({ selector: '.button', pagePath: '/pages/index/index' })
      ).not.toThrow()
    })

    it('should accept selector with save flag', () => {
      expect(() =>
        validateElementRef({ selector: '.button', save: true })
      ).not.toThrow()
    })

    it('should reject empty object', () => {
      expect(() => validateElementRef({})).toThrow(
        'ElementRef must provide one of: refId, selector, or xpath'
      )
    })

    it('should reject invalid index type', () => {
      expect(() =>
        validateElementRef({ selector: '.item', index: '0' as any })
      ).toThrow('ElementRef.index must be a number')
    })

    it('should reject invalid pagePath type', () => {
      expect(() =>
        validateElementRef({ selector: '.item', pagePath: 123 as any })
      ).toThrow('ElementRef.pagePath must be a string')
    })

    it('should reject invalid save type', () => {
      expect(() =>
        validateElementRef({ selector: '.item', save: 'yes' as any })
      ).toThrow('ElementRef.save must be a boolean')
    })
  })

  describe('resolvePage', () => {
    it('should throw if miniProgram not connected', async () => {
      const state: SessionState = {
        sessionId: 'test',
        pages: [],
        elements: new Map(),
        outputDir: '/tmp',
        createdAt: new Date(),
        lastActivity: new Date(),
      }

      await expect(resolvePage(state)).rejects.toThrow(
        'MiniProgram not launched or connected'
      )
    })

    it('should return current page when no pagePath specified', async () => {
      const mockPage = { path: 'pages/index/index', query: {} }
      const state: SessionState = {
        sessionId: 'test',
        miniProgram: {
          currentPage: jest.fn().mockResolvedValue(mockPage),
        },
        pages: [],
        elements: new Map(),
        outputDir: '/tmp',
        createdAt: new Date(),
        lastActivity: new Date(),
      }

      const page = await resolvePage(state)
      expect(page).toBe(mockPage)
      expect(state.miniProgram.currentPage).toHaveBeenCalled()
    })

    it('should throw if current page not found', async () => {
      const state: SessionState = {
        sessionId: 'test',
        miniProgram: {
          currentPage: jest.fn().mockResolvedValue(null),
        },
        pages: [],
        elements: new Map(),
        outputDir: '/tmp',
        createdAt: new Date(),
        lastActivity: new Date(),
      }

      await expect(resolvePage(state)).rejects.toThrow(
        'No current page found'
      )
    })

    it('should find page by path in pageStack', async () => {
      const page1 = { path: 'pages/index/index', query: {} }
      const page2 = { path: 'pages/detail/detail', query: {} }
      const state: SessionState = {
        sessionId: 'test',
        miniProgram: {
          pageStack: jest.fn().mockResolvedValue([page1, page2]),
        },
        pages: [],
        elements: new Map(),
        outputDir: '/tmp',
        createdAt: new Date(),
        lastActivity: new Date(),
      }

      const page = await resolvePage(state, 'pages/detail/detail')
      expect(page).toBe(page2)
    })

    it('should find page with leading slash', async () => {
      const page1 = { path: 'pages/index/index', query: {} }
      const state: SessionState = {
        sessionId: 'test',
        miniProgram: {
          pageStack: jest.fn().mockResolvedValue([page1]),
        },
        pages: [],
        elements: new Map(),
        outputDir: '/tmp',
        createdAt: new Date(),
        lastActivity: new Date(),
      }

      const page = await resolvePage(state, '/pages/index/index')
      expect(page).toBe(page1)
    })

    it('should throw if page not in stack', async () => {
      const page1 = { path: 'pages/index/index', query: {} }
      const state: SessionState = {
        sessionId: 'test',
        miniProgram: {
          pageStack: jest.fn().mockResolvedValue([page1]),
        },
        pages: [],
        elements: new Map(),
        outputDir: '/tmp',
        createdAt: new Date(),
        lastActivity: new Date(),
      }

      await expect(resolvePage(state, 'pages/notfound/notfound')).rejects.toThrow(
        'Page not found in stack'
      )
    })

    it('should throw if pageStack is empty', async () => {
      const state: SessionState = {
        sessionId: 'test',
        miniProgram: {
          pageStack: jest.fn().mockResolvedValue([]),
        },
        pages: [],
        elements: new Map(),
        outputDir: '/tmp',
        createdAt: new Date(),
        lastActivity: new Date(),
      }

      await expect(resolvePage(state, 'pages/index/index')).rejects.toThrow(
        'Page stack is empty'
      )
    })
  })

  describe('resolveElement', () => {
    const mockPage = {
      path: 'pages/index/index',
      query: {},
      $: jest.fn(),
      $$: jest.fn(),
    }

    const createMockState = (): SessionState => ({
      sessionId: 'test',
      miniProgram: {
        currentPage: jest.fn().mockResolvedValue(mockPage),
      },
      pages: [],
      elements: new Map(),
      outputDir: '/tmp',
      createdAt: new Date(),
      lastActivity: new Date(),
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should resolve element by refId', async () => {
      const mockElement = { id: 'element-1' }
      const state = createMockState()
      state.elements.set('ref123', mockElement)

      const result = await resolveElement(state, { refId: 'ref123' })

      expect(result.element).toBe(mockElement)
      expect(result.page).toBe(mockPage)
      expect(result.refId).toBeUndefined()
    })

    it('should throw if refId not found in cache', async () => {
      const state = createMockState()

      await expect(resolveElement(state, { refId: 'invalid' })).rejects.toThrow(
        'Invalid refId: invalid'
      )
    })

    it('should resolve element by selector', async () => {
      const mockElement = { id: 'element-1' }
      mockPage.$.mockResolvedValue(mockElement)
      const state = createMockState()

      const result = await resolveElement(state, { selector: '.button' })

      expect(result.element).toBe(mockElement)
      expect(mockPage.$).toHaveBeenCalledWith('.button')
    })

    it('should throw if selector returns no element', async () => {
      mockPage.$.mockResolvedValue(null)
      const state = createMockState()

      await expect(resolveElement(state, { selector: '.notfound' })).rejects.toThrow(
        'Element not found with selector: .notfound'
      )
    })

    it('should resolve element by selector with index', async () => {
      const mockElements = [{ id: 'e1' }, { id: 'e2' }, { id: 'e3' }]
      mockPage.$$.mockResolvedValue(mockElements)
      const state = createMockState()

      const result = await resolveElement(state, {
        selector: '.item',
        index: 1,
      })

      expect(result.element).toBe(mockElements[1])
      expect(mockPage.$$).toHaveBeenCalledWith('.item')
    })

    it('should throw if index out of range', async () => {
      const mockElements = [{ id: 'e1' }, { id: 'e2' }]
      mockPage.$$.mockResolvedValue(mockElements)
      const state = createMockState()

      await expect(
        resolveElement(state, { selector: '.item', index: 5 })
      ).rejects.toThrow('Index 5 out of range. Found 2 elements')
    })

    it('should throw if $$ returns empty array', async () => {
      mockPage.$$.mockResolvedValue([])
      const state = createMockState()

      await expect(
        resolveElement(state, { selector: '.item', index: 0 })
      ).rejects.toThrow('No elements found with selector: .item')
    })

    it('should cache element when save=true', async () => {
      const mockElement = { id: 'element-1' }
      mockPage.$.mockResolvedValue(mockElement)
      const state = createMockState()

      const result = await resolveElement(state, {
        selector: '.button',
        save: true,
      })

      expect(result.refId).toBeTruthy()
      expect(state.elements.get(result.refId!)).toBe(mockElement)
    })

    it('should not cache element when save=false', async () => {
      const mockElement = { id: 'element-1' }
      mockPage.$.mockResolvedValue(mockElement)
      const state = createMockState()

      const result = await resolveElement(state, {
        selector: '.button',
        save: false,
      })

      expect(result.refId).toBeUndefined()
      expect(state.elements.size).toBe(0)
    })

    it('should throw if no location strategy provided', async () => {
      const state = createMockState()

      await expect(resolveElement(state, {} as any)).rejects.toThrow(
        'Invalid ElementRef: must provide one of: refId, selector, or xpath'
      )
    })

    it('should throw if xpath not supported', async () => {
      const state = createMockState()

      await expect(
        resolveElement(state, { xpath: '//view[@class="container"]' })
      ).rejects.toThrow('XPath is not supported')
    })

    it('should resolve element by xpath if supported', async () => {
      const mockElement = { id: 'element-1' }
      const mockPageWithXpath = {
        ...mockPage,
        xpath: jest.fn().mockResolvedValue(mockElement),
      }
      const state = createMockState()
      state.miniProgram.currentPage = jest.fn().mockResolvedValue(mockPageWithXpath)

      const result = await resolveElement(state, {
        xpath: '//view[@class="container"]',
      })

      expect(result.element).toBe(mockElement)
      expect(mockPageWithXpath.xpath).toHaveBeenCalledWith('//view[@class="container"]')
    })

    it('should resolve element by xpath with index if supported', async () => {
      const mockElements = [{ id: 'e1' }, { id: 'e2' }]
      const mockPageWithXpath = {
        ...mockPage,
        xpath: jest.fn(), // Add xpath function to pass the support check
        getElementsByXpath: jest.fn().mockResolvedValue(mockElements),
      }
      const state = createMockState()
      state.miniProgram.currentPage = jest.fn().mockResolvedValue(mockPageWithXpath)

      const result = await resolveElement(state, {
        xpath: '//view',
        index: 1,
      })

      expect(result.element).toBe(mockElements[1])
    })

    it('should throw if xpath returns no element', async () => {
      const mockPageWithXpath = {
        ...mockPage,
        xpath: jest.fn().mockResolvedValue(null),
      }
      const state = createMockState()
      state.miniProgram.currentPage = jest.fn().mockResolvedValue(mockPageWithXpath)

      await expect(
        resolveElement(state, { xpath: '//view[@class="notfound"]' })
      ).rejects.toThrow('Element not found with XPath')
    })
  })
})
