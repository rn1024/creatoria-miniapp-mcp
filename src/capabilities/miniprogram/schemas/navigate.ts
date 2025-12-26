/**
 * Navigate schema - Navigation methods for the mini program
 */

import { z } from 'zod'

export const navigateSchema = z
  .object({
    method: z
      .enum(['navigateTo', 'redirectTo', 'reLaunch', 'switchTab', 'navigateBack'])
      .describe('Navigation method to use'),
    url: z
      .string()
      .optional()
      .describe('Target page URL (required for navigateTo, redirectTo, reLaunch, switchTab)'),
    delta: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Number of pages to go back (for navigateBack, default: 1)'),
  })
  .describe('Navigate to a page using various navigation methods')
