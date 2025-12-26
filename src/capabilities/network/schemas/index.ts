/**
 * Network schemas exports - 6 network mock tool schemas
 */

import { z } from 'zod'

export const mockWxMethodSchema = z
  .object({
    method: z.string().min(1).describe('WeChat API method name (e.g., "request", "getStorage")'),
    result: z.any().describe('Mock result to return'),
    type: z.enum(['success', 'fail']).optional().describe('Whether to mock as success or failure (default: success)'),
  })
  .describe('Mock a WeChat API method (wx.*) for testing')

export const restoreWxMethodSchema = z
  .object({
    method: z.string().min(1).describe('WeChat API method name to restore'),
  })
  .describe('Restore a previously mocked WeChat API method')

export const mockRequestSchema = z
  .object({
    data: z.any().optional().describe('Response data to return (default: {})'),
    statusCode: z.number().int().optional().describe('HTTP status code (default: 200)'),
    header: z.record(z.string()).optional().describe('Response headers (default: {})'),
    type: z.enum(['success', 'fail']).optional().describe('Whether to mock as success or failure (default: success)'),
  })
  .describe('Mock wx.request to return specific data (convenience wrapper)')

export const mockRequestFailureSchema = z
  .object({
    errMsg: z.string().optional().describe('Error message (default: "request:fail")'),
    errno: z.number().int().optional().describe('Error code (default: -1)'),
  })
  .describe('Mock wx.request to fail with specific error')

export const restoreRequestSchema = z.object({}).describe('Restore wx.request to original behavior')

export const restoreAllMocksSchema = z.object({}).describe('Restore all mocked WeChat API methods at once')
