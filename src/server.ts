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

export async function startServer(config: ServerConfig = {}) {
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

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'miniprogram_launch',
          description: 'Launch WeChat Mini Program with automator',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Path to mini program project',
              },
              cliPath: {
                type: 'string',
                description: 'Path to WeChat DevTools CLI',
              },
            },
            required: ['projectPath'],
          },
        },
      ],
    }
  })

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    if (name === 'miniprogram_launch') {
      // TODO: Implement launch logic
      return {
        content: [
          {
            type: 'text',
            text: `Launch tool called with args: ${JSON.stringify(args)}`,
          },
        ],
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  })

  // Start server with stdio transport
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('WeChat Mini Program MCP Server running on stdio')
}
