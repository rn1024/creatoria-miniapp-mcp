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
        case 'miniprogram_launch':
          return {
            content: [
              {
                type: 'text',
                text: `Launch tool called with args: ${JSON.stringify(args)}\nSession: ${sessionId}\nTODO: Implement automator.launch()`,
              },
            ],
          }

        case 'miniprogram_connect':
          return {
            content: [
              {
                type: 'text',
                text: `Connect tool called with args: ${JSON.stringify(args)}\nSession: ${sessionId}\nTODO: Implement automator.connect()`,
              },
            ],
          }

        case 'miniprogram_close':
          sessionStore.delete(sessionId)
          return {
            content: [
              {
                type: 'text',
                text: `Session ${sessionId} closed and resources cleaned up`,
              },
            ],
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
