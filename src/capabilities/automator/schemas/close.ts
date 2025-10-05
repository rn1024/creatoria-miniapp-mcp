import { z } from 'zod'
import type { ToolSchemaDefinition } from '../../schema-types.js'

export const automatorCloseSchema = z
  .object({})
  .describe('Close current mini program session and cleanup all resources')

export const automatorCloseDefinition: ToolSchemaDefinition = {
  name: 'miniprogram_close',
  capability: 'automator',
  description: 'Close current mini program session and cleanup all resources',
  input: automatorCloseSchema,
}
