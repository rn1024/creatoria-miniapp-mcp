import { z } from 'zod'
import type { ToolSchemaDefinition } from '../../schema-types.js'

export const automatorDisconnectSchema = z
  .object({})
  .describe('Disconnect from miniprogram but keep IDE running')

export const automatorDisconnectDefinition: ToolSchemaDefinition = {
  name: 'miniprogram_disconnect',
  capability: 'automator',
  description: 'Disconnect from miniprogram but keep IDE running',
  input: automatorDisconnectSchema,
}
