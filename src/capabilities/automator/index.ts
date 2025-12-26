/**
 * Automator Capability Module
 *
 * Provides tools for launching, connecting, disconnecting, and closing
 * WeChat Mini Program DevTools sessions.
 */

import type { CapabilityModule, ToolDefinition } from '../registry.js'
import {
  automatorLaunchSchema,
  automatorConnectSchema,
  automatorDisconnectSchema,
  automatorCloseSchema,
} from './schemas/index.js'
import { launch, connect, disconnect, close } from './handlers/index.js'

// Re-export schemas for external use
export { automatorSchemaRegistry, automatorSchemas } from './schemas/index.js'

// Re-export handlers for external use
export * from './handlers/index.js'

/**
 * Automator tool definitions
 */
const tools: ToolDefinition[] = [
  {
    name: 'miniprogram_launch',
    description: 'Launch WeChat Mini Program with automator',
    capability: 'automator',
    inputSchema: automatorLaunchSchema,
    handler: launch,
  },
  {
    name: 'miniprogram_connect',
    description: 'Connect to an already running WeChat DevTools instance',
    capability: 'automator',
    inputSchema: automatorConnectSchema,
    handler: connect,
  },
  {
    name: 'miniprogram_disconnect',
    description: 'Disconnect from miniprogram but keep IDE running',
    capability: 'automator',
    inputSchema: automatorDisconnectSchema,
    handler: disconnect,
  },
  {
    name: 'miniprogram_close',
    description: 'Close current mini program session and cleanup all resources',
    capability: 'automator',
    inputSchema: automatorCloseSchema,
    handler: close,
  },
]

/**
 * Automator capability module
 */
export const capability: CapabilityModule = {
  name: 'automator',
  description: 'Connection and lifecycle management (4 tools)',
  tools,
}

export default capability
