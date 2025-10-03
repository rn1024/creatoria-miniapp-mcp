/**
 * Unit tests for examples/scripts/helpers.ts
 */

import {
  extractText,
  callTool,
  validateSelector,
  callToolWithValidation,
  assertSuccess,
  sleep,
  type ToolResult,
  type Server,
} from '../../examples/scripts/helpers.js'

describe('helpers', () => {
  describe('extractText', () => {
    it('should extract text from single text content item', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'text',
            text: 'Hello World',
          },
        ],
      }

      expect(extractText(result)).toBe('Hello World')
    })

    it('should extract and join multiple text items', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'text',
            text: 'Line 1',
          },
          {
            type: 'text',
            text: 'Line 2',
          },
          {
            type: 'text',
            text: 'Line 3',
          },
        ],
      }

      expect(extractText(result)).toBe('Line 1\nLine 2\nLine 3')
    })

    it('should filter out non-text items', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'image',
            data: 'base64...',
          },
          {
            type: 'text',
            text: 'Text content',
          },
          {
            type: 'resource',
            uri: 'file://...',
          },
        ],
      }

      expect(extractText(result)).toBe('Text content')
    })

    it('should handle missing text field', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'text',
          },
          {
            type: 'text',
            text: undefined,
          },
        ],
      }

      expect(extractText(result)).toBe('\n')
    })

    it('should handle empty content array', () => {
      const result: ToolResult = {
        content: [],
      }

      expect(extractText(result)).toBe('')
    })
  })

  describe('callTool', () => {
    it('should call tool and return result', async () => {
      const mockCallTool = jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'Success',
          },
        ],
      })

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const result = await callTool(mockServer, 'test_tool', { arg: 'value' })

      expect(mockCallTool).toHaveBeenCalledWith({
        params: {
          name: 'test_tool',
          arguments: { arg: 'value' },
        },
        meta: {
          progressToken: undefined,
        },
      })

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Success',
          },
        ],
      })

      expect(result.isError).toBeUndefined()
    })

    it('should handle tool call errors and preserve stack trace', async () => {
      const mockError = new Error('Tool execution failed')
      mockError.stack = 'Error: Tool execution failed\n  at someFunction (file.ts:10:5)'

      const mockCallTool = jest.fn().mockRejectedValue(mockError)

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const result = await callTool(mockServer, 'failing_tool', {})

      expect(result.isError).toBe(true)
      expect(result.content).toHaveLength(1)
      expect(result.content[0].type).toBe('text')
      expect(result.content[0].text).toContain('Tool execution failed')
      expect(result.content[0].text).toContain('Stack trace:')
      expect(result.content[0].text).toContain('at someFunction')
    })

    it('should handle non-Error exceptions', async () => {
      const mockCallTool = jest.fn().mockRejectedValue('String error')

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const result = await callTool(mockServer, 'failing_tool', {})

      expect(result.isError).toBe(true)
      expect(result.content[0].text).toBe('String error')
    })
  })

  describe('validateSelector', () => {
    it('should return true for valid selector', async () => {
      const mockCallTool = jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'Element found: <view class="button">',
          },
        ],
      })

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const isValid = await validateSelector(mockServer, '.button')

      expect(isValid).toBe(true)
      expect(mockCallTool).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            name: 'page_query',
            arguments: { selector: '.button' },
          },
        })
      )
    })

    it('should return false when selector not found', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockCallTool = jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'Element not found',
          },
        ],
      })

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const isValid = await validateSelector(mockServer, '.missing', 'test context')

      expect(isValid).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Selector not found (test context): ".missing"')
      )

      consoleErrorSpy.mockRestore()
    })

    it('should return false when query returns error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockCallTool = jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'Query failed: invalid selector',
          },
        ],
        isError: true,
      })

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const isValid = await validateSelector(mockServer, 'invalid>>selector')

      expect(isValid).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Selector validation failed')
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Query failed: invalid selector')
      )

      consoleErrorSpy.mockRestore()
    })

    it('should handle empty result text', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockCallTool = jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: '',
          },
        ],
      })

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const isValid = await validateSelector(mockServer, '.empty')

      expect(isValid).toBe(false)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('callToolWithValidation', () => {
    it('should call tool directly when using refId', async () => {
      const mockCallTool = jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'Success with refId',
          },
        ],
      })

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const result = await callToolWithValidation(mockServer, 'element_tap', {
        refId: 'elem-123',
      })

      expect(result.content[0].text).toBe('Success with refId')
      expect(mockCallTool).toHaveBeenCalledTimes(1)
      expect(mockCallTool).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            name: 'element_tap',
            arguments: { refId: 'elem-123' },
          },
        })
      )
    })

    it('should validate selector before calling tool', async () => {
      const mockCallTool = jest
        .fn()
        // First call: page_query for validation
        .mockResolvedValueOnce({
          content: [
            {
              type: 'text',
              text: 'Element found',
            },
          ],
        })
        // Second call: actual tool
        .mockResolvedValueOnce({
          content: [
            {
              type: 'text',
              text: 'Tool executed successfully',
            },
          ],
        })

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const result = await callToolWithValidation(
        mockServer,
        'element_tap',
        { selector: '.button' },
        'tap button'
      )

      expect(result.content[0].text).toBe('Tool executed successfully')
      expect(mockCallTool).toHaveBeenCalledTimes(2)
    })

    it('should return error if selector validation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockCallTool = jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'not found',
          },
        ],
      })

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const result = await callToolWithValidation(
        mockServer,
        'element_tap',
        { selector: '.missing' },
        'tap missing'
      )

      expect(result.isError).toBe(true)
      expect(result.content[0].text).toContain('Selector validation failed')
      expect(result.content[0].text).toContain('.missing')
      expect(result.content[0].text).toContain('tap missing')

      // Should only call page_query (validation), not the actual tool
      expect(mockCallTool).toHaveBeenCalledTimes(1)

      consoleErrorSpy.mockRestore()
    })

    it('should handle non-string selector argument', async () => {
      const mockCallTool = jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'Success',
          },
        ],
      })

      const mockServer = {
        callTool: mockCallTool,
      } as any

      const result = await callToolWithValidation(mockServer, 'some_tool', {
        selector: 123, // Non-string selector
      })

      // Should not validate, just call tool directly
      expect(mockCallTool).toHaveBeenCalledTimes(1)
      expect(result.content[0].text).toBe('Success')
    })
  })

  describe('assertSuccess', () => {
    it('should not throw for successful result', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'text',
            text: 'Success',
          },
        ],
      }

      expect(() => assertSuccess(result)).not.toThrow()
    })

    it('should throw for error result', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'text',
            text: 'Something went wrong',
          },
        ],
        isError: true,
      }

      expect(() => assertSuccess(result)).toThrow('Tool call failed')
      expect(() => assertSuccess(result)).toThrow('Something went wrong')
    })

    it('should include context in error message', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'text',
            text: 'Error details',
          },
        ],
        isError: true,
      }

      expect(() => assertSuccess(result, 'test operation')).toThrow(
        'Tool call failed (test operation)'
      )
      expect(() => assertSuccess(result, 'test operation')).toThrow('Error details')
    })

    it('should preserve stack trace when Error.captureStackTrace is available', () => {
      const result: ToolResult = {
        content: [
          {
            type: 'text',
            text: 'Error',
          },
        ],
        isError: true,
      }

      try {
        assertSuccess(result)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).stack).toBeDefined()
        // Stack should not include assertSuccess itself
        expect((error as Error).stack).not.toContain('at assertSuccess')
      }
    })
  })

  describe('sleep', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should sleep for specified duration', async () => {
      let resolved = false
      const promise = sleep(1000).then(() => {
        resolved = true
      })

      // Should not have resolved yet
      expect(resolved).toBe(false)

      // Fast-forward time but not enough
      jest.advanceTimersByTime(999)
      await Promise.resolve() // Allow microtasks to run

      expect(resolved).toBe(false)

      // Fast-forward to completion
      jest.advanceTimersByTime(1)
      await promise

      expect(resolved).toBe(true)
    })

    it('should resolve after timeout', async () => {
      const promise = sleep(500)

      jest.advanceTimersByTime(500)
      await promise

      // Should complete without error
      expect(true).toBe(true)
    })

    it('should handle zero duration', async () => {
      const promise = sleep(0)

      jest.advanceTimersByTime(0)
      await promise

      expect(true).toBe(true)
    })
  })
})
