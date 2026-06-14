/**
 * Logging Capability Module
 *
 * Provides tools for collecting and reading console/error logs
 * from the WeChat Mini Program runtime via miniprogram-automator events.
 */

import type { CapabilityModule, ToolDefinition } from '../registry.js'
import {
  logStartSchema,
  logReadSchema,
  logStopSchema,
  logClearSchema,
} from './schemas/index.js'
import { logStart, logRead, logStop, logClear } from './handlers/index.js'

// Re-export schemas and handlers for external use
export * from './schemas/index.js'
export * from './handlers/index.js'

/**
 * Logging tool definitions
 */
const tools: ToolDefinition[] = [
  {
    name: 'log_start',
    description: 'Start collecting console and error logs from the mini program',
    capability: 'logging',
    inputSchema: logStartSchema,
    handler: logStart,
  },
  {
    name: 'log_read',
    description: 'Read buffered log entries from the mini program',
    capability: 'logging',
    inputSchema: logReadSchema,
    handler: logRead,
  },
  {
    name: 'log_stop',
    description: 'Stop collecting logs and clear the buffer',
    capability: 'logging',
    inputSchema: logStopSchema,
    handler: logStop,
  },
  {
    name: 'log_clear',
    description: 'Clear the log buffer but keep listening for new entries',
    capability: 'logging',
    inputSchema: logClearSchema,
    handler: logClear,
  },
]

/**
 * Logging capability module
 */
export const capability: CapabilityModule = {
  name: 'logging',
  description: 'Console and error log collection (4 tools)',
  tools,
}

export default capability
