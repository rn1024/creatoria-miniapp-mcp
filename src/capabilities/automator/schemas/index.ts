import type { ToolSchemaRegistry } from '../../schema-types.js'
import { automatorCloseDefinition } from './close.js'
import { automatorConnectDefinition } from './connect.js'
import { automatorDisconnectDefinition } from './disconnect.js'
import { automatorLaunchDefinition } from './launch.js'

export const automatorSchemaRegistry: ToolSchemaRegistry = {
  [automatorLaunchDefinition.name]: automatorLaunchDefinition,
  [automatorConnectDefinition.name]: automatorConnectDefinition,
  [automatorDisconnectDefinition.name]: automatorDisconnectDefinition,
  [automatorCloseDefinition.name]: automatorCloseDefinition,
}

export const automatorSchemas = Object.values(automatorSchemaRegistry)
