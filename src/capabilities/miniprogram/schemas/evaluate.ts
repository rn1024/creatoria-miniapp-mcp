/**
 * Evaluate schema - Evaluate JavaScript code in the mini program context
 */

import { z } from 'zod'

export const evaluateSchema = z
  .object({
    expression: z.string().min(1).describe('JavaScript expression or function to evaluate'),
    args: z.array(z.any()).optional().describe('Arguments to pass to the expression'),
  })
  .describe('Evaluate JavaScript code in the mini program context')
