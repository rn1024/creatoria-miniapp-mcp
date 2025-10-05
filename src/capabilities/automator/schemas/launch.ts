import { z } from 'zod'
import type { ToolSchemaDefinition } from '../../schema-types.js'

export const automatorLaunchSchema = z
  .object({
    projectPath: z
      .string()
      .min(1, 'projectPath is required and must be a non-empty string'),
    cliPath: z
      .string()
      .min(1, 'cliPath must be a non-empty string')
      .optional(),
    port: z
      .number()
      .int()
      .min(1)
      .max(65535)
      .optional()
      .describe('Automation port for WeChat DevTools'),
  })
  .describe('Launch WeChat Mini Program with automator')

export const automatorLaunchDefinition: ToolSchemaDefinition = {
  name: 'miniprogram_launch',
  capability: 'automator',
  description: 'Launch WeChat Mini Program with automator',
  input: automatorLaunchSchema,
}
