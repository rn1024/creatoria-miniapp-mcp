/**
 * MCP Server implementation for WeChat Mini Program automation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import type { ServerConfig } from './types.js'
import { sessionStore } from './core/session.js'
import { registerTools } from './tools/index.js'
import * as automatorTools from './tools/automator.js'
import * as miniprogramTools from './tools/miniprogram.js'

export async function startServer(config: ServerConfig = {}) {
  const { capabilities = ['core'] } = config

  const server = new Server(
    {
      name: 'creatoria-miniapp-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  // Register tools based on capabilities
  const tools = registerTools(server, { capabilities })

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools }
  })

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    // Get or create session (using default for now, will be enhanced in future)
    const sessionId = 'default'
    const session = sessionStore.getOrCreate(sessionId)
    sessionStore.updateActivity(sessionId)

    try {
      // Route to appropriate tool handler
      switch (name) {
        case 'miniprogram_launch': {
          const result = await automatorTools.launch(session, args as any)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        case 'miniprogram_connect': {
          const result = await automatorTools.connect(session, args as any)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        case 'miniprogram_disconnect': {
          const result = await automatorTools.disconnect(session)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        case 'miniprogram_close': {
          const result = await automatorTools.close(session)
          sessionStore.delete(sessionId)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        case 'miniprogram_navigate': {
          const result = await miniprogramTools.navigate(session, args as any)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        case 'miniprogram_call_wx': {
          const result = await miniprogramTools.callWx(session, args as any)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        case 'miniprogram_evaluate': {
          const result = await miniprogramTools.evaluate(session, args as any)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        case 'miniprogram_screenshot': {
          const result = await miniprogramTools.screenshot(session, args as any)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        case 'miniprogram_get_page_stack': {
          const result = await miniprogramTools.getPageStack(session)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        case 'miniprogram_get_system_info': {
          const result = await miniprogramTools.getSystemInfo(session)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        }

        default:
          throw new Error(`Unknown tool: ${name}`)
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

  // Cleanup on shutdown
  process.on('SIGINT', () => {
    console.error('\nShutting down MCP server...')
    sessionStore.dispose()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.error('\nShutting down MCP server...')
    sessionStore.dispose()
    process.exit(0)
  })

  // Start server with stdio transport
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('WeChat Mini Program MCP Server running on stdio')
  console.error(`Capabilities: ${capabilities.join(', ')}`)
  console.error(`Tools registered: ${tools.length}`)
}
