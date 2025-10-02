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
  {
    name: 'miniprogram_navigate',
    description: 'Navigate to a page using various navigation methods (navigateTo, redirectTo, reLaunch, switchTab, navigateBack)',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab', 'navigateBack'],
          description: 'Navigation method to use',
        },
        url: {
          type: 'string',
          description: 'Target page URL (required for navigateTo, redirectTo, reLaunch, switchTab)',
        },
        delta: {
          type: 'number',
          description: 'Number of pages to go back (for navigateBack, default: 1)',
        },
      },
      required: ['method'],
    },
  },
  {
    name: 'miniprogram_call_wx',
    description: 'Call a WeChat API method (wx.*) in the mini program',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'WeChat API method name (e.g., "showToast", "request")',
        },
        args: {
          type: 'array',
          description: 'Arguments to pass to the wx method',
          items: {},
        },
      },
      required: ['method'],
    },
  },
  {
    name: 'miniprogram_evaluate',
    description: 'Evaluate JavaScript code in the mini program context',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'JavaScript expression or function to evaluate',
        },
        args: {
          type: 'array',
          description: 'Arguments to pass to the expression',
          items: {},
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'miniprogram_screenshot',
    description: 'Take a screenshot of the mini program',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Custom filename for the screenshot (optional, auto-generated if not provided)',
        },
        fullPage: {
          type: 'boolean',
          description: 'Whether to capture the full page (default: false)',
        },
      },
    },
  },
  {
    name: 'miniprogram_get_page_stack',
    description: 'Get the current page stack',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'miniprogram_get_system_info',
    description: 'Get system information',
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
