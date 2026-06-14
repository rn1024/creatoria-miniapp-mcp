import { z } from 'zod'

export const logStartSchema = z
  .object({
    maxEntries: z
      .number()
      .int()
      .min(10)
      .max(10000)
      .optional()
      .describe('Maximum log entries to buffer (default: 1000, max: 10000)'),
  })
  .describe('Start collecting console and error logs from the mini program')

export const logReadSchema = z
  .object({
    level: z
      .enum(['all', 'error', 'warn', 'log', 'info'])
      .optional()
      .describe('Filter by log level (default: "all")'),
    count: z
      .number()
      .int()
      .min(1)
      .max(500)
      .optional()
      .describe('Number of recent entries to return (default: 50)'),
    after: z
      .string()
      .optional()
      .describe('ISO timestamp - only return entries after this time'),
  })
  .describe('Read buffered log entries from the mini program')

export const logStopSchema = z
  .object({})
  .describe('Stop collecting logs and clear the buffer')

export const logClearSchema = z
  .object({})
  .describe('Clear the log buffer but keep listening for new entries')
