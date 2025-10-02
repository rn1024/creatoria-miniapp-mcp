/**
 * MCP Server implementation for WeChat Mini Program automation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import type { ServerConfig } from './types.js'
import { SessionStore } from './core/session.js'
import { registerTools } from './tools/index.js'
import { mergeServerConfig } from './config/defaults.js'

export async function startServer(config: Partial<ServerConfig> = {}) {
  // Merge config with defaults to ensure all fields are present
  const fullConfig = mergeServerConfig(config)
  const { capabilities, outputDir, sessionTimeout } = fullConfig

  // Generate unique session ID for this server instance
  // Each stdio transport connection gets a unique session
  const sessionId = `session-${process.pid}-${Date.now()}`

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
    sessionId, // Pass the unique session ID
    getSession: (sid) => {
      const session = sessionStore.getOrCreate(sid)
      sessionStore.updateActivity(sid)
      return session
    },
    deleteSession: (sid) => sessionStore.delete(sid),
  })

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools }
  })

  // Cleanup on shutdown
  process.on('SIGINT', async () => {
    console.error('\nShutting down MCP server...')
    try {
      await sessionStore.dispose()
      console.error('Cleanup completed')
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.error('\nShutting down MCP server...')
    try {
      await sessionStore.dispose()
      console.error('Cleanup completed')
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
    process.exit(0)
  })

  // Start server with stdio transport
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('WeChat Mini Program MCP Server running on stdio')
  console.error(`Capabilities: ${capabilities.join(', ')}`)
  console.error(`Tools registered: ${tools.length}`)
}
