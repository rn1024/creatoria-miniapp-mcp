/**
 * Tool registration for MCP server
 * Registers all automation tools with the MCP server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { Tool, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import type { SessionState } from '../types.js'
import * as automatorTools from './automator.js'
import * as miniprogramTools from './miniprogram.js'
import * as pageTools from './page.js'

// Tool handler type
export type ToolHandler = (session: SessionState, args: any) => Promise<any>

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
  {
    name: 'page_query',
    description: 'Query a single element on the page',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector to query',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
        save: {
          type: 'boolean',
          description: 'Whether to save element reference (default: true)',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'page_query_all',
    description: 'Query all matching elements on the page',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector to query',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
        save: {
          type: 'boolean',
          description: 'Whether to save element references (default: true)',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'page_wait_for',
    description: 'Wait for a condition to be met (selector or timeout)',
    inputSchema: {
      type: 'object',
      properties: {
        condition: {
          description: 'Selector (string) or timeout in ms (number)',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
        timeout: {
          type: 'number',
          description: 'Maximum wait time in ms (optional)',
        },
      },
      required: ['condition'],
    },
  },
  {
    name: 'page_get_data',
    description: 'Get page data (optionally at a specific path)',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Data path (optional, returns all data if not specified)',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
    },
  },
  {
    name: 'page_set_data',
    description: 'Set page data',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Data object to set',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
      required: ['data'],
    },
  },
  {
    name: 'page_call_method',
    description: 'Call a method on the page',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'Method name to call',
        },
        args: {
          type: 'array',
          description: 'Arguments to pass to the method',
          items: {},
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
      required: ['method'],
    },
  },
  {
    name: 'page_get_size',
    description: 'Get page size (width, height, scrollHeight)',
    inputSchema: {
      type: 'object',
      properties: {
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
    },
  },
  {
    name: 'page_get_scroll_top',
    description: 'Get page scroll position',
    inputSchema: {
      type: 'object',
      properties: {
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
    },
  },
]

// Tool handlers mapping
export const CORE_TOOL_HANDLERS: Record<string, ToolHandler> = {
  miniprogram_launch: automatorTools.launch,
  miniprogram_connect: automatorTools.connect,
  miniprogram_disconnect: automatorTools.disconnect,
  miniprogram_close: automatorTools.close,
  miniprogram_navigate: miniprogramTools.navigate,
  miniprogram_call_wx: miniprogramTools.callWx,
  miniprogram_evaluate: miniprogramTools.evaluate,
  miniprogram_screenshot: miniprogramTools.screenshot,
  miniprogram_get_page_stack: miniprogramTools.getPageStack,
  miniprogram_get_system_info: miniprogramTools.getSystemInfo,
  page_query: pageTools.query,
  page_query_all: pageTools.queryAll,
  page_wait_for: pageTools.waitFor,
  page_get_data: pageTools.getData,
  page_set_data: pageTools.setData,
  page_call_method: pageTools.callMethod,
  page_get_size: pageTools.getSize,
  page_get_scroll_top: pageTools.getScrollTop,
}

export interface ToolRegistrationOptions {
  capabilities?: string[]
  getSession: (sessionId: string) => SessionState
  deleteSession?: (sessionId: string) => void
}

/**
 * Register tools based on enabled capabilities
 * This function actually registers the tool handlers with the MCP server
 */
export function registerTools(
  server: Server,
  options: ToolRegistrationOptions
): Tool[] {
  const { capabilities = ['core'], getSession, deleteSession } = options

  const tools: Tool[] = []
  const handlers: Record<string, ToolHandler> = {}

  // Core tools (always included)
  if (capabilities.includes('core')) {
    tools.push(...CORE_TOOLS)
    Object.assign(handlers, CORE_TOOL_HANDLERS)
  }

  // Future: Add more capability-based tools
  // if (capabilities.includes('assert')) {
  //   tools.push(...ASSERT_TOOLS)
  //   Object.assign(handlers, ASSERT_TOOL_HANDLERS)
  // }

  // Register CallToolRequest handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    // Get or create session (using default for now, will be enhanced in future)
    const sessionId = 'default'
    const session = getSession(sessionId)

    try {
      // Route to appropriate tool handler
      const handler = handlers[name]
      if (!handler) {
        throw new Error(`Unknown tool: ${name}`)
      }

      // Execute handler
      const result = await handler(session, args as any)

      // Handle session deletion for close tool
      if (name === 'miniprogram_close' && deleteSession) {
        deleteSession(sessionId)
      }

      // Return formatted response
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool ${name}: ${errorMessage}`,
          },
        ],
        isError: true,
      }
    }
  })

  return tools
}
