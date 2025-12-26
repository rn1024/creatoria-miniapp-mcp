/**
 * Page schemas exports
 */

import { z } from 'zod'

export const querySchema = z
  .object({
    selector: z.string().min(1).describe('CSS selector to query'),
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
    save: z.boolean().optional().describe('Whether to save element reference (default: true)'),
  })
  .describe('Query a single element on the page')

export const queryAllSchema = z
  .object({
    selector: z.string().min(1).describe('CSS selector to query'),
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
    save: z.boolean().optional().describe('Whether to save element references (default: true)'),
  })
  .describe('Query all matching elements on the page')

export const waitForSchema = z
  .object({
    condition: z.union([z.string(), z.number()]).describe('Selector (string) or timeout in ms (number)'),
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
    timeout: z.number().int().positive().optional().describe('Maximum wait time in ms (optional)'),
  })
  .describe('Wait for a condition to be met (selector or timeout)')

export const getDataSchema = z
  .object({
    path: z.string().optional().describe('Data path (optional, returns all data if not specified)'),
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
  })
  .describe('Get page data (optionally at a specific path)')

export const setDataSchema = z
  .object({
    data: z.record(z.any()).describe('Data object to set'),
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
  })
  .describe('Set page data')

export const callMethodSchema = z
  .object({
    method: z.string().min(1).describe('Method name to call'),
    args: z.array(z.any()).optional().describe('Arguments to pass to the method'),
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
  })
  .describe('Call a method on the page')

export const getSizeSchema = z
  .object({
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
  })
  .describe('Get page size (width, height, scrollHeight)')

export const getScrollTopSchema = z
  .object({
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
  })
  .describe('Get page scroll position')
