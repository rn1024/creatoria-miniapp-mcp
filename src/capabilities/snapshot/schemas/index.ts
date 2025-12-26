/**
 * Snapshot schemas exports - 3 snapshot tool schemas
 */

import { z } from 'zod'

const refIdSchema = z.string().min(1).describe('Element reference ID from page_query')

export const snapshotPageSchema = z
  .object({
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
    filename: z.string().optional().describe('Output filename (optional, auto-generated if not provided)'),
    includeScreenshot: z.boolean().optional().describe('Whether to include screenshot (default: true)'),
    fullPage: z.boolean().optional().describe('Whether to capture full page or viewport only (default: false)'),
  })
  .describe('Capture complete page snapshot (data + screenshot)')

export const snapshotFullSchema = z
  .object({
    filename: z.string().optional().describe('Output filename (optional, auto-generated if not provided)'),
    includeScreenshot: z.boolean().optional().describe('Whether to include screenshot (default: true)'),
    fullPage: z.boolean().optional().describe('Whether to capture full page or viewport only (default: false)'),
  })
  .describe('Capture complete application snapshot (system info + page stack + current page)')

export const snapshotElementSchema = z
  .object({
    refId: refIdSchema,
    filename: z.string().optional().describe('Output filename (optional, auto-generated if not provided)'),
    includeScreenshot: z.boolean().optional().describe('Whether to include screenshot (default: false)'),
  })
  .describe('Capture element snapshot (properties + optional screenshot)')
