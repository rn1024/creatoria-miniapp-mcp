/**
 * Screenshot schema - Take a screenshot of the mini program
 */

import { z } from 'zod'

export const screenshotSchema = z
  .object({
    filename: z
      .string()
      .optional()
      .describe(
        'Optional filename to save screenshot to file. If not provided and returnBase64=true, returns base64 string directly.'
      ),
    fullPage: z
      .boolean()
      .optional()
      .describe(
        'Whether to capture the full page including scroll area (default: false). Note: fullPage screenshots use longer timeout (30s vs 10s).'
      ),
    returnBase64: z
      .boolean()
      .optional()
      .describe(
        'Return screenshot as base64 string. If true and no filename provided, returns base64 directly without saving file. (default: false)'
      ),
  })
  .describe('Take a screenshot of the mini program')
