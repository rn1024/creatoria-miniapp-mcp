import type { ToolSchemaRegistry } from '../../schema-types.js'
import { automatorCloseDefinition, automatorCloseSchema } from './close.js'
import { automatorConnectDefinition, automatorConnectSchema } from './connect.js'
import { automatorDisconnectDefinition, automatorDisconnectSchema } from './disconnect.js'
import { automatorLaunchDefinition, automatorLaunchSchema } from './launch.js'

// Re-export individual schemas for direct use
export {
  automatorLaunchSchema,
  automatorConnectSchema,
  automatorDisconnectSchema,
  automatorCloseSchema,
}

export const automatorSchemaRegistry: ToolSchemaRegistry = {
  [automatorLaunchDefinition.name]: automatorLaunchDefinition,
  [automatorConnectDefinition.name]: automatorConnectDefinition,
  [automatorDisconnectDefinition.name]: automatorDisconnectDefinition,
  [automatorCloseDefinition.name]: automatorCloseDefinition,
}

export const automatorSchemas = Object.values(automatorSchemaRegistry)
