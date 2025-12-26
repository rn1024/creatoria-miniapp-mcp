/**
 * Capabilities Module - New Architecture Entry Point
 *
 * Each capability (automator, miniprogram, page, element, etc.) is a self-contained module:
 * - schemas/: Zod schema definitions for tool inputs
 * - handlers/: Handler implementations
 * - index.ts: CapabilityModule export with tools array
 *
 * The ToolRegistry provides centralized tool management and the loader
 * dynamically loads and registers capabilities with the MCP server.
 */

// ============================================================================
// Registry and Loader
// ============================================================================

export { ToolRegistry, globalRegistry } from './registry.js'
export type { ToolHandler, ToolDefinition, CapabilityModule } from './registry.js'
export {
  loadCapability,
  loadCapabilities,
  registerCapabilitiesWithServer,
  setupCapabilities,
  SUPPORTED_CAPABILITIES,
} from './loader.js'
export type { LoaderOptions, CapabilityName } from './loader.js'

// ============================================================================
// Capability Modules
// ============================================================================

export { capability as automatorCapability } from './automator/index.js'
export { capability as miniprogramCapability } from './miniprogram/index.js'
export { capability as pageCapability } from './page/index.js'
export { capability as elementCapability } from './element/index.js'
export { capability as assertCapability } from './assert/index.js'
export { capability as snapshotCapability } from './snapshot/index.js'
export { capability as recordCapability } from './record/index.js'
export { capability as networkCapability } from './network/index.js'

// ============================================================================
// Schema Registry
// ============================================================================

export type { ToolSchemaDefinition, ToolSchemaRegistry, ToolSchemaLookupResult } from './schema-types.js'
export { getToolSchema, listToolSchemas } from './schema-registry.js'

// ============================================================================
// Capability Namespaces (for accessing individual capability exports)
// ============================================================================

export * as automator from './automator/index.js'
export * as miniprogram from './miniprogram/index.js'
export * as page from './page/index.js'
export * as element from './element/index.js'
export * as assert from './assert/index.js'
export * as snapshot from './snapshot/index.js'
export * as record from './record/index.js'
export * as network from './network/index.js'
