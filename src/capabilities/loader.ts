/**
 * Capability Loader for Dynamic Tool Registration
 *
 * Provides functions to load and register capabilities dynamically.
 * Each capability module exports a CapabilityModule that can be loaded.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, type Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SessionState } from '../types.js'
import { ToolRegistry, type CapabilityModule, type ToolHandler } from './registry.js'
import { ToolLogger } from '../runtime/logging/tool-logger.js'

/**
 * Options for loading and registering capabilities
 */
export interface LoaderOptions {
  /** List of capability names to load */
  capabilities: string[]
  /** Session ID for this server instance */
  sessionId: string
  /** Function to get or create a session */
  getSession: (sessionId: string) => SessionState
  /** Optional function to delete a session */
  deleteSession?: (sessionId: string) => Promise<void>
}

/**
 * Supported capability names
 */
export const SUPPORTED_CAPABILITIES = [
  'core', // All tools (default)
  'automator', // Connection and lifecycle
  'miniprogram', // MiniProgram-level operations
  'page', // Page-level operations
  'element', // Element interactions
  'assert', // Testing and verification
  'snapshot', // State capture
  'record', // Recording and replay
  'network', // Network mocking
] as const

export type CapabilityName = (typeof SUPPORTED_CAPABILITIES)[number]

/**
 * Load a single capability module by name
 */
export async function loadCapability(name: string): Promise<CapabilityModule | null> {
  try {
    // Dynamic import based on capability name
    const module = await import(`./${name}/index.js`)

    // Expect module to export a 'capability' object
    if (module.capability && typeof module.capability === 'object') {
      return module.capability as CapabilityModule
    }

    // Fallback: check for default export
    if (module.default && typeof module.default === 'object') {
      return module.default as CapabilityModule
    }

    console.error(`Capability ${name} does not export a valid capability module`)
    return null
  } catch (error) {
    // Capability not found or failed to load
    console.error(`Failed to load capability ${name}:`, error)
    return null
  }
}

/**
 * Load multiple capabilities and register them in the registry
 */
export async function loadCapabilities(
  registry: ToolRegistry,
  capabilityNames: string[]
): Promise<void> {
  // If 'core' is specified, load all capabilities
  const namesToLoad = capabilityNames.includes('core')
    ? SUPPORTED_CAPABILITIES.filter((c) => c !== 'core')
    : capabilityNames

  for (const name of namesToLoad) {
    const capability = await loadCapability(name)
    if (capability) {
      registry.registerCapability(capability)
    }
  }
}

/**
 * Register tools with MCP server using the new registry
 *
 * This is a drop-in replacement for the old registerTools function
 * from tools/index.ts, but uses the new capability-based architecture.
 */
export function registerCapabilitiesWithServer(
  server: Server,
  registry: ToolRegistry,
  options: LoaderOptions
): Tool[] {
  const { capabilities, sessionId, getSession, deleteSession } = options

  // Get tools and handlers for the specified capabilities
  const tools = registry.toMCPToolsForCapabilities(capabilities)
  const handlers = registry.getHandlersForCapabilities(capabilities)

  // Log registration stats
  const stats = registry.getStats()
  console.error(`Registering ${tools.length} tools (capabilities: ${capabilities.join(', ')}):`)
  for (const [cap, count] of Object.entries(stats.byCapability)) {
    if (capabilities.includes('core') || capabilities.includes(cap)) {
      console.error(`  - ${cap}: ${count}`)
    }
  }

  // Register CallToolRequest handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    // Get session using the unique session ID for this server instance
    const session = getSession(sessionId)

    try {
      // Get handler for this tool
      const handler = handlers.get(name)
      if (!handler) {
        throw new Error(`Unknown tool: ${name}`)
      }

      // Wrap handler with automatic logging if logger is available
      let wrappedHandler: ToolHandler = handler
      if (session.logger) {
        const toolLogger = new ToolLogger(session.logger, session.loggerConfig)
        wrappedHandler = toolLogger.wrap(name, handler)
      }

      // Execute handler
      const result = await wrappedHandler(session, args)

      // Handle session deletion for close tool
      if (name === 'miniprogram_close' && deleteSession) {
        try {
          await deleteSession(sessionId)
          console.error(`Session ${sessionId} deleted after close`)
        } catch (error) {
          console.error(`Failed to delete session ${sessionId} after close:`, error)
        }
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

/**
 * High-level function to set up capabilities for an MCP server
 *
 * Usage:
 * ```typescript
 * const tools = await setupCapabilities(server, {
 *   capabilities: ['core'],
 *   sessionId: 'session-123',
 *   getSession: (id) => sessionStore.getOrCreate(id),
 *   deleteSession: (id) => sessionStore.delete(id),
 * })
 * ```
 */
export async function setupCapabilities(
  server: Server,
  options: LoaderOptions
): Promise<{ registry: ToolRegistry; tools: Tool[] }> {
  const registry = new ToolRegistry()

  // Load all requested capabilities
  await loadCapabilities(registry, options.capabilities)

  // Validate registration
  const validation = registry.validate()
  if (!validation.valid) {
    console.error('Tool registration validation failed:')
    validation.errors.forEach((err) => console.error(`  - ${err}`))
    throw new Error('Tool registration validation failed')
  }

  // Register with server
  const tools = registerCapabilitiesWithServer(server, registry, options)

  return { registry, tools }
}
