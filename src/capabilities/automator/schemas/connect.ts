import { z } from 'zod'
import type { ToolSchemaDefinition } from '../../schema-types.js'

export const automatorConnectSchema = z
  .object({
    port: z
      .number()
      .int()
      .min(1)
      .max(65535)
      .optional()
      .describe('Automation port for an existing DevTools instance'),
  })
  .describe('Connect to an already running WeChat DevTools instance')

export const automatorConnectDefinition: ToolSchemaDefinition = {
  name: 'miniprogram_connect',
  capability: 'automator',
  description: 'Connect to an already running WeChat DevTools instance',
  input: automatorConnectSchema,
}
