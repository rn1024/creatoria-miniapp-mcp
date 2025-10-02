/**
 * Unit tests for Assert tools
 */

import * as assertTools from '../../src/tools/assert'
import * as pageTools from '../../src/tools/page'
import * as elementTools from '../../src/tools/element'
import type { SessionState } from '../../src/types'

// Mock the page and element tools
jest.mock('../../src/tools/page')
jest.mock('../../src/tools/element')

describe('Assert Tools', () => {
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

  describe('assertExists', () => {
    it('should pass when element exists', async () => {
      (pageTools.query as jest.Mock).mockResolvedValue({
        exists: true,
        refId: 'test-ref',
        success: true,
        message: 'Element found',
      })

      const result = await assertTools.assertExists(mockSession, {
        selector: '.test-element',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Element exists')
      expect(pageTools.query).toHaveBeenCalledWith(mockSession, {
        selector: '.test-element',
        pagePath: undefined,
        save: false,
      })
    })

    it('should fail when element not found', async () => {
      (pageTools.query as jest.Mock).mockResolvedValue({
        exists: false,
        success: true,
        message: 'Element not found',
      })

      await expect(
        assertTools.assertExists(mockSession, {
          selector: '.missing-element',
        })
      ).rejects.toThrow('Assertion failed: Element not found')
    })

    it('should support pagePath parameter', async () => {
      (pageTools.query as jest.Mock).mockResolvedValue({
        exists: true,
        refId: 'test-ref',
        success: true,
        message: 'Element found',
      })

      const result = await assertTools.assertExists(mockSession, {
        selector: '.test-element',
        pagePath: 'pages/index/index',
      })

      expect(result.success).toBe(true)
      expect(pageTools.query).toHaveBeenCalledWith(mockSession, {
        selector: '.test-element',
        pagePath: 'pages/index/index',
        save: false,
      })
    })
  })

  describe('assertNotExists', () => {
    it('should pass when element does not exist', async () => {
      (pageTools.query as jest.Mock).mockResolvedValue({
        exists: false,
        success: true,
        message: 'Element not found',
      })

      const result = await assertTools.assertNotExists(mockSession, {
        selector: '.should-not-exist',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('does not exist')
    })

    it('should fail when element exists', async () => {
      (pageTools.query as jest.Mock).mockResolvedValue({
        exists: true,
        refId: 'test-ref',
        success: true,
        message: 'Element found',
      })

      await expect(
        assertTools.assertNotExists(mockSession, {
          selector: '.exists',
        })
      ).rejects.toThrow('Assertion failed: Element should not exist')
    })

    it('should pass when query throws error', async () => {
      (pageTools.query as jest.Mock).mockRejectedValue(
        new Error('Query failed: Element not found')
      )

      const result = await assertTools.assertNotExists(mockSession, {
        selector: '.should-not-exist',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('does not exist')
    })
  })

  describe('assertText', () => {
    it('should pass when text matches', async () => {
      (elementTools.getText as jest.Mock).mockResolvedValue({
        text: 'Hello World',
      })

      const result = await assertTools.assertText(mockSession, {
        refId: 'test-ref',
        expected: 'Hello World',
      })

      expect(result.success).toBe(true)
      expect(result.actual).toBe('Hello World')
      expect(elementTools.getText).toHaveBeenCalledWith(mockSession, {
        refId: 'test-ref',
      })
    })

    it('should fail when text does not match', async () => {
      (elementTools.getText as jest.Mock).mockResolvedValue({
        text: 'Actual Text',
      })

      await expect(
        assertTools.assertText(mockSession, {
          refId: 'test-ref',
          expected: 'Expected Text',
        })
      ).rejects.toThrow('Text mismatch')
    })
  })

  describe('assertTextContains', () => {
    it('should pass when text contains substring', async () => {
      (elementTools.getText as jest.Mock).mockResolvedValue({
        text: 'Hello World from Test',
      })

      const result = await assertTools.assertTextContains(mockSession, {
        refId: 'test-ref',
        expected: 'World',
      })

      expect(result.success).toBe(true)
      expect(result.actual).toBe('Hello World from Test')
    })

    it('should fail when text does not contain substring', async () => {
      (elementTools.getText as jest.Mock).mockResolvedValue({
        text: 'Hello World',
      })

      await expect(
        assertTools.assertTextContains(mockSession, {
          refId: 'test-ref',
          expected: 'Missing',
        })
      ).rejects.toThrow('does not contain expected substring')
    })
  })

  describe('assertValue', () => {
    it('should pass when value matches', async () => {
      (elementTools.getValue as jest.Mock).mockResolvedValue({
        value: 'test-value',
      })

      const result = await assertTools.assertValue(mockSession, {
        refId: 'test-ref',
        expected: 'test-value',
      })

      expect(result.success).toBe(true)
      expect(result.actual).toBe('test-value')
    })

    it('should fail when value does not match', async () => {
      (elementTools.getValue as jest.Mock).mockResolvedValue({
        value: 'actual-value',
      })

      await expect(
        assertTools.assertValue(mockSession, {
          refId: 'test-ref',
          expected: 'expected-value',
        })
      ).rejects.toThrow('Value mismatch')
    })
  })

  describe('assertAttribute', () => {
    it('should pass when attribute matches', async () => {
      (elementTools.getAttribute as jest.Mock).mockResolvedValue({
        value: 'test-id',
      })

      const result = await assertTools.assertAttribute(mockSession, {
        refId: 'test-ref',
        name: 'data-id',
        expected: 'test-id',
      })

      expect(result.success).toBe(true)
      expect(result.actual).toBe('test-id')
      expect(elementTools.getAttribute).toHaveBeenCalledWith(mockSession, {
        refId: 'test-ref',
        name: 'data-id',
      })
    })

    it('should fail when attribute does not match', async () => {
      (elementTools.getAttribute as jest.Mock).mockResolvedValue({
        value: 'actual-id',
      })

      await expect(
        assertTools.assertAttribute(mockSession, {
          refId: 'test-ref',
          name: 'data-id',
          expected: 'expected-id',
        })
      ).rejects.toThrow('Attribute "data-id" mismatch')
    })
  })

  describe('assertProperty', () => {
    it('should pass when property matches', async () => {
      (elementTools.getProperty as jest.Mock).mockResolvedValue({
        value: { foo: 'bar' },
      })

      const result = await assertTools.assertProperty(mockSession, {
        refId: 'test-ref',
        name: 'dataset',
        expected: { foo: 'bar' },
      })

      expect(result.success).toBe(true)
      expect(result.actual).toEqual({ foo: 'bar' })
    })

    it('should fail when property does not match', async () => {
      (elementTools.getProperty as jest.Mock).mockResolvedValue({
        value: { foo: 'bar' },
      })

      await expect(
        assertTools.assertProperty(mockSession, {
          refId: 'test-ref',
          name: 'dataset',
          expected: { foo: 'baz' },
        })
      ).rejects.toThrow('Property "dataset" mismatch')
    })
  })

  describe('assertData', () => {
    it('should pass when page data matches', async () => {
      (pageTools.getData as jest.Mock).mockResolvedValue({
        data: { count: 5 },
      })

      const result = await assertTools.assertData(mockSession, {
        expected: { count: 5 },
      })

      expect(result.success).toBe(true)
      expect(result.actual).toEqual({ count: 5 })
      expect(pageTools.getData).toHaveBeenCalledWith(mockSession, {
        path: undefined,
        pagePath: undefined,
      })
    })

    it('should pass when nested data matches', async () => {
      (pageTools.getData as jest.Mock).mockResolvedValue({
        data: 5,
      })

      const result = await assertTools.assertData(mockSession, {
        path: 'count',
        expected: 5,
      })

      expect(result.success).toBe(true)
      expect(result.actual).toBe(5)
      expect(pageTools.getData).toHaveBeenCalledWith(mockSession, {
        path: 'count',
        pagePath: undefined,
      })
    })

    it('should fail when data does not match', async () => {
      (pageTools.getData as jest.Mock).mockResolvedValue({
        data: { count: 5 },
      })

      await expect(
        assertTools.assertData(mockSession, {
          expected: { count: 10 },
        })
      ).rejects.toThrow('Page data mismatch')
    })
  })

  describe('assertVisible', () => {
    it('should pass when element is visible', async () => {
      (elementTools.getSize as jest.Mock).mockResolvedValue({
        size: { width: 100, height: 50 },
      })

      const result = await assertTools.assertVisible(mockSession, {
        refId: 'test-ref',
      })

      expect(result.success).toBe(true)
      expect(result.size).toEqual({ width: 100, height: 50 })
    })

    it('should fail when element has zero width', async () => {
      (elementTools.getSize as jest.Mock).mockResolvedValue({
        size: { width: 0, height: 50 },
      })

      await expect(
        assertTools.assertVisible(mockSession, {
          refId: 'test-ref',
        })
      ).rejects.toThrow('Element is not visible')
    })

    it('should fail when element has zero height', async () => {
      (elementTools.getSize as jest.Mock).mockResolvedValue({
        size: { width: 100, height: 0 },
      })

      await expect(
        assertTools.assertVisible(mockSession, {
          refId: 'test-ref',
        })
      ).rejects.toThrow('Element is not visible')
    })

    it('should fail when size is null', async () => {
      (elementTools.getSize as jest.Mock).mockResolvedValue({
        size: null,
      })

      await expect(
        assertTools.assertVisible(mockSession, {
          refId: 'test-ref',
        })
      ).rejects.toThrow('Element is not visible')
    })
  })
})
