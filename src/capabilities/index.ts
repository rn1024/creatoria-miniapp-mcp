/**
 * Capability registry facade exposing legacy tool metadata while new structure is introduced.
 */

export type { ToolHandler, ToolCategory } from '../tools/index.js'
export {
  AUTOMATOR_TOOLS,
  AUTOMATOR_TOOL_HANDLERS,
  MINIPROGRAM_TOOLS,
  MINIPROGRAM_TOOL_HANDLERS,
  PAGE_TOOLS,
  PAGE_TOOL_HANDLERS,
  ELEMENT_TOOLS,
  ELEMENT_TOOL_HANDLERS,
  ASSERT_TOOLS,
  ASSERT_TOOL_HANDLERS,
  SNAPSHOT_TOOLS,
  SNAPSHOT_TOOL_HANDLERS,
  RECORD_TOOLS,
  RECORD_TOOL_HANDLERS,
  NETWORK_TOOLS,
  NETWORK_TOOL_HANDLERS,
  CORE_TOOLS,
  CORE_TOOL_HANDLERS,
  TOOL_CATEGORIES,
  SUPPORTED_CAPABILITIES,
  validateToolRegistration,
  getToolStats,
  getToolByName,
  getToolsByCategory,
  registerTools,
} from '../tools/index.js'

export * as automator from './automator/index.js'
export * as miniprogram from './miniprogram/index.js'
export * as page from './page/index.js'
export * as element from './element/index.js'
export * as assert from './assert/index.js'
export * as snapshot from './snapshot/index.js'
export * as record from './record/index.js'
export * as network from './network/index.js'
export { getToolSchema, listToolSchemas } from './schema-registry.js'
