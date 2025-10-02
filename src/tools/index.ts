/**
 * Tool registration for MCP server
 * Registers all automation tools with the MCP server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { Tool } from '@modelcontextprotocol/sdk/types.js'

// Tool categories based on capabilities
export const CORE_TOOLS: Tool[] = [
  {
    name: 'miniprogram_launch',
    description: 'Launch WeChat Mini Program with automator',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to mini program project directory',
        },
        cliPath: {
          type: 'string',
          description: 'Path to WeChat DevTools CLI (optional, auto-detected on macOS)',
        },
        port: {
          type: 'number',
          description: 'Automation port (default: 9420)',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'miniprogram_connect',
    description: 'Connect to an already running WeChat DevTools instance',
    inputSchema: {
      type: 'object',
      properties: {
        port: {
          type: 'number',
          description: 'Automation port (default: 9420)',
        },
      },
    },
  },
  {
    name: 'miniprogram_disconnect',
    description: 'Disconnect from miniprogram but keep IDE running',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'miniprogram_close',
    description: 'Close current mini program session and cleanup all resources',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

export interface ToolRegistrationOptions {
  capabilities?: string[]
}

/**
 * Register tools based on enabled capabilities
 */
export function registerTools(
  server: Server,
  options: ToolRegistrationOptions = {}
): Tool[] {
  const { capabilities = ['core'] } = options

  const tools: Tool[] = []

  // Core tools (always included)
  if (capabilities.includes('core')) {
    tools.push(...CORE_TOOLS)
  }

  // Future: Add more capability-based tools
  // if (capabilities.includes('assert')) { tools.push(...ASSERT_TOOLS) }
  // if (capabilities.includes('snapshot')) { tools.push(...SNAPSHOT_TOOLS) }
  // if (capabilities.includes('record')) { tools.push(...RECORD_TOOLS) }
  // if (capabilities.includes('network')) { tools.push(...NETWORK_TOOLS) }

  return tools
}
