/**
 * Page Capability Module
 *
 * Provides tools for page-level operations including element queries,
 * data access, method calls, and page dimension information.
 */

import type { CapabilityModule, ToolDefinition } from '../registry.js'
import {
  querySchema,
  queryAllSchema,
  waitForSchema,
  getDataSchema,
  setDataSchema,
  callMethodSchema,
  getSizeSchema,
  getScrollTopSchema,
} from './schemas/index.js'
import {
  query,
  queryAll,
  waitFor,
  getData,
  setData,
  callMethod,
  getSize,
  getScrollTop,
} from './handlers/index.js'

// Re-export schemas for external use
export * from './schemas/index.js'

// Re-export handlers for external use
export * from './handlers/index.js'

/**
 * Page tool definitions
 */
const tools: ToolDefinition[] = [
  {
    name: 'page_query',
    description: 'Query a single element on the page',
    capability: 'page',
    inputSchema: querySchema,
    handler: query,
  },
  {
    name: 'page_query_all',
    description: 'Query all matching elements on the page',
    capability: 'page',
    inputSchema: queryAllSchema,
    handler: queryAll,
  },
  {
    name: 'page_wait_for',
    description: 'Wait for a condition to be met (selector or timeout)',
    capability: 'page',
    inputSchema: waitForSchema,
    handler: waitFor,
  },
  {
    name: 'page_get_data',
    description: 'Get page data (optionally at a specific path)',
    capability: 'page',
    inputSchema: getDataSchema,
    handler: getData,
  },
  {
    name: 'page_set_data',
    description: 'Set page data',
    capability: 'page',
    inputSchema: setDataSchema,
    handler: setData,
  },
  {
    name: 'page_call_method',
    description: 'Call a method on the page',
    capability: 'page',
    inputSchema: callMethodSchema,
    handler: callMethod,
  },
  {
    name: 'page_get_size',
    description: 'Get page size (width, height, scrollHeight)',
    capability: 'page',
    inputSchema: getSizeSchema,
    handler: getSize,
  },
  {
    name: 'page_get_scroll_top',
    description: 'Get page scroll position',
    capability: 'page',
    inputSchema: getScrollTopSchema,
    handler: getScrollTop,
  },
]

/**
 * Page capability module
 */
export const capability: CapabilityModule = {
  name: 'page',
  description: 'Page-level operations and data access (8 tools)',
  tools,
}

export default capability
