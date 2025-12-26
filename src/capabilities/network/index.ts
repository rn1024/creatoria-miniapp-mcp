/**
 * Network Capability Module
 *
 * Provides tools for network mock and testing including mocking WeChat API methods,
 * mocking requests, and restoring mocked methods.
 */

import type { CapabilityModule, ToolDefinition } from '../registry.js'
import {
  mockWxMethodSchema,
  restoreWxMethodSchema,
  mockRequestSchema,
  mockRequestFailureSchema,
  restoreRequestSchema,
  restoreAllMocksSchema,
} from './schemas/index.js'
import {
  mockWxMethod,
  restoreWxMethod,
  mockRequest,
  mockRequestFailure,
  restoreRequest,
  restoreAllMocks,
} from './handlers/index.js'

// Re-export schemas for external use
export * from './schemas/index.js'

// Re-export handlers for external use
export * from './handlers/index.js'

/**
 * Network tool definitions - 6 tools
 */
const tools: ToolDefinition[] = [
  {
    name: 'network_mock_wx_method',
    description: 'Mock a WeChat API method (wx.*) for testing',
    capability: 'network',
    inputSchema: mockWxMethodSchema,
    handler: mockWxMethod,
  },
  {
    name: 'network_restore_wx_method',
    description: 'Restore a previously mocked WeChat API method',
    capability: 'network',
    inputSchema: restoreWxMethodSchema,
    handler: restoreWxMethod,
  },
  {
    name: 'network_mock_request',
    description: 'Mock wx.request to return specific data (convenience wrapper)',
    capability: 'network',
    inputSchema: mockRequestSchema,
    handler: mockRequest,
  },
  {
    name: 'network_mock_request_failure',
    description: 'Mock wx.request to fail with specific error',
    capability: 'network',
    inputSchema: mockRequestFailureSchema,
    handler: mockRequestFailure,
  },
  {
    name: 'network_restore_request',
    description: 'Restore wx.request to original behavior',
    capability: 'network',
    inputSchema: restoreRequestSchema,
    handler: restoreRequest,
  },
  {
    name: 'network_restore_all_mocks',
    description: 'Restore all mocked WeChat API methods at once',
    capability: 'network',
    inputSchema: restoreAllMocksSchema,
    handler: restoreAllMocks,
  },
]

/**
 * Network capability module
 */
export const capability: CapabilityModule = {
  name: 'network',
  description: 'Network mock and testing utilities (6 tools)',
  tools,
}

export default capability
