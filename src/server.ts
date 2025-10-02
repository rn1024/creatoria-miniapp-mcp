/**
 * MCP Server implementation for WeChat Mini Program automation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import type { ServerConfig } from './types.js'
import { SessionStore } from './core/session.js'
import { registerTools } from './tools/index.js'

export async function startServer(config: ServerConfig = {}) {
  const { capabilities = ['core'], outputDir, sessionTimeout } = config

  // Create session store with configuration
  const sessionStore = new SessionStore({
    outputDir,
    sessionTimeout,
  })

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
  // registerTools now actually registers the CallToolRequestSchema handler
  const tools = registerTools(server, {
    capabilities,
    getSession: (sessionId) => {
      const session = sessionStore.getOrCreate(sessionId)
      sessionStore.updateActivity(sessionId)
      return session
    },
    deleteSession: (sessionId) => sessionStore.delete(sessionId),
  })

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools }
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
