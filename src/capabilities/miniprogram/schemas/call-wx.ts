/**
 * Call WX schema - Call WeChat API methods
 */

import { z } from 'zod'

export const callWxSchema = z
  .object({
    method: z.string().min(1).describe('WeChat API method name (e.g., "showToast", "request")'),
    args: z.array(z.any()).optional().describe('Arguments to pass to the wx method'),
  })
  .describe('Call a WeChat API method (wx.*) in the mini program')
