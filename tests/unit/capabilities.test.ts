/**
 * Unit tests for Capabilities system
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { registerTools, SUPPORTED_CAPABILITIES } from '../../src/tools/index'
import type { SessionState } from '../../src/types'

describe('Capabilities System', () => {
  let mockServer: Server
  let mockSession: SessionState

  beforeEach(() => {
    mockSession = {
      sessionId: 'test-session',
      pages: [],
      elements: new Map(),
      outputDir: '/tmp/test-output',
      createdAt: new Date(),
      lastActivity: new Date(),
    }

    // Create mock server with minimal implementation
    mockServer = {
      setRequestHandler: jest.fn(),
    } as any

    jest.clearAllMocks()

    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('SUPPORTED_CAPABILITIES', () => {
    it('should have all capability names', () => {
      expect(SUPPORTED_CAPABILITIES).toEqual([
        'core',
        'automator',
        'miniprogram',
        'page',
        'element',
        'assert',
        'snapshot',
        'record',
        'network',
      ])
    })
  })

  describe('registerTools with capabilities', () => {
    it('should register all tools with core capability', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['core'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(65) // All 65 tools
      expect(mockServer.setRequestHandler).toHaveBeenCalled()
    })

    it('should default to core capability if none specified', () => {
      const tools = registerTools(mockServer, {
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(65) // All 65 tools
    })

    it('should register only automator tools', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['automator'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(4)
      expect(tools.every((t) => t.name.startsWith('miniprogram_'))).toBe(true)
      expect(tools.map((t) => t.name)).toEqual([
        'miniprogram_launch',
        'miniprogram_connect',
        'miniprogram_disconnect',
        'miniprogram_close',
      ])
    })

    it('should register only miniprogram tools', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['miniprogram'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(6)
      expect(tools.map((t) => t.name)).toEqual([
        'miniprogram_navigate',
        'miniprogram_call_wx',
        'miniprogram_evaluate',
        'miniprogram_screenshot',
        'miniprogram_get_page_stack',
        'miniprogram_get_system_info',
      ])
    })

    it('should register only page tools', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['page'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(8)
      expect(tools.every((t) => t.name.startsWith('page_'))).toBe(true)
    })

    it('should register only element tools', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['element'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(23)
      expect(tools.every((t) => t.name.startsWith('element_'))).toBe(true)
    })

    it('should register only assert tools', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['assert'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(9)
      expect(tools.every((t) => t.name.startsWith('assert_'))).toBe(true)
    })

    it('should register only snapshot tools', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['snapshot'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(3)
      expect(tools.every((t) => t.name.startsWith('snapshot_'))).toBe(true)
    })

    it('should register only record tools', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['record'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(6)
      expect(tools.every((t) => t.name.startsWith('record_'))).toBe(true)
    })

    it('should register only network tools', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['network'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(6)
      expect(tools.every((t) => t.name.startsWith('network_'))).toBe(true)
    })

    it('should register multiple capabilities', () => {
      const tools = registerTools(mockServer, {
        capabilities: ['automator', 'page', 'network'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      // 4 automator + 8 page + 6 network = 18 tools
      expect(tools).toHaveLength(18)

      // Check that we have tools from each capability
      const automatorTools = tools.filter((t) =>
        [
          'miniprogram_launch',
          'miniprogram_connect',
          'miniprogram_disconnect',
          'miniprogram_close',
        ].includes(t.name)
      )
      const pageTools = tools.filter((t) => t.name.startsWith('page_'))
      const networkTools = tools.filter((t) => t.name.startsWith('network_'))

      expect(automatorTools).toHaveLength(4)
      expect(pageTools).toHaveLength(8)
      expect(networkTools).toHaveLength(6)
    })

    it('should not register duplicates with core and specific capabilities', () => {
      // If 'core' is specified, it should include all tools regardless of other capabilities
      const tools = registerTools(mockServer, {
        capabilities: ['core', 'automator', 'page'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(65) // All tools, no duplicates
    })

    it('should handle empty capabilities array', () => {
      const tools = registerTools(mockServer, {
        capabilities: [],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(tools).toHaveLength(0) // No tools registered
    })

    it('should log capabilities being registered', () => {
      const consoleError = jest.spyOn(console, 'error')

      registerTools(mockServer, {
        capabilities: ['automator', 'network'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      // Check that logging mentions the capabilities
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('capabilities: automator, network')
      )
    })

    it('should log tool counts by category', () => {
      const consoleError = jest.spyOn(console, 'error')

      registerTools(mockServer, {
        capabilities: ['automator', 'page'],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Automator: 4'))
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Page: 8'))
    })

    it('should handle all capabilities except core', () => {
      const tools = registerTools(mockServer, {
        capabilities: [
          'automator',
          'miniprogram',
          'page',
          'element',
          'assert',
          'snapshot',
          'record',
          'network',
        ],
        sessionId: 'test',
        getSession: () => mockSession,
      })

      // 4 + 6 + 8 + 23 + 9 + 3 + 6 + 6 = 65 tools
      expect(tools).toHaveLength(65)
    })
  })
})
