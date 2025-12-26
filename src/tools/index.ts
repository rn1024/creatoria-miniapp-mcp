/**
 * Tool registration for MCP server
 * Registers all automation tools with the MCP server
 *
 * Tool Categories:
 * - Automator (4 tools): Connection and lifecycle management
 * - MiniProgram (6 tools): Mini program-level operations
 * - Page (8 tools): Page-level operations and data access
 * - Element (23 tools): Element-level interactions, properties, and subclass operations
 * - Assert (9 tools): Testing and verification utilities
 * - Snapshot (3 tools): State capture and diagnostic utilities
 * - Record (6 tools): Action recording and replay utilities
 * - Network (6 tools): Network mock and testing utilities
 *
 * Total: 65 tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { Tool, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import type { SessionState } from '../types.js'
import { ToolLogger } from '../runtime/logging/tool-logger.js'
import * as automatorTools from './automator.js'
import * as miniprogramTools from './miniprogram.js'
import * as pageTools from './page.js'
import * as elementTools from './element.js'
import * as assertTools from './assert.js'
import * as snapshotTools from './snapshot.js'
import * as recordTools from './record.js'
import * as networkTools from './network.js'

// Tool handler type
export type ToolHandler = (session: SessionState, args: any) => Promise<any>

/**
 * Tool category metadata
 */
export interface ToolCategory {
  name: string
  description: string
  tools: Tool[]
  handlers: Record<string, ToolHandler>
}

// ============================================================================
// AUTOMATOR TOOLS (Connection & Lifecycle)
// ============================================================================

export const AUTOMATOR_TOOLS: Tool[] = [
  {
    name: 'miniprogram_launch',
    description: 'Launch WeChat Mini Program with automator',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to mini program project directory',
        },
        cliPath: {
          type: 'string',
          description: 'Path to WeChat DevTools CLI (optional, auto-detected on macOS)',
        },
        port: {
          type: 'number',
          description: 'Automation port (default: 9420)',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'miniprogram_connect',
    description: 'Connect to an already running WeChat DevTools instance',
    inputSchema: {
      type: 'object',
      properties: {
        port: {
          type: 'number',
          description: 'Automation port (default: 9420)',
        },
      },
    },
  },
  {
    name: 'miniprogram_disconnect',
    description: 'Disconnect from miniprogram but keep IDE running',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'miniprogram_close',
    description: 'Close current mini program session and cleanup all resources',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

export const AUTOMATOR_TOOL_HANDLERS: Record<string, ToolHandler> = {
  miniprogram_launch: automatorTools.launch,
  miniprogram_connect: automatorTools.connect,
  miniprogram_disconnect: automatorTools.disconnect,
  miniprogram_close: automatorTools.close,
}

// ============================================================================
// MINIPROGRAM TOOLS (MiniProgram-level Operations)
// ============================================================================

export const MINIPROGRAM_TOOLS: Tool[] = [
  {
    name: 'miniprogram_navigate',
    description:
      'Navigate to a page using various navigation methods (navigateTo, redirectTo, reLaunch, switchTab, navigateBack)',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          enum: ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab', 'navigateBack'],
          description: 'Navigation method to use',
        },
        url: {
          type: 'string',
          description: 'Target page URL (required for navigateTo, redirectTo, reLaunch, switchTab)',
        },
        delta: {
          type: 'number',
          description: 'Number of pages to go back (for navigateBack, default: 1)',
        },
      },
      required: ['method'],
    },
  },
  {
    name: 'miniprogram_call_wx',
    description: 'Call a WeChat API method (wx.*) in the mini program',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'WeChat API method name (e.g., "showToast", "request")',
        },
        args: {
          type: 'array',
          description: 'Arguments to pass to the wx method',
          items: {},
        },
      },
      required: ['method'],
    },
  },
  {
    name: 'miniprogram_evaluate',
    description: 'Evaluate JavaScript code in the mini program context',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'JavaScript expression or function to evaluate',
        },
        args: {
          type: 'array',
          description: 'Arguments to pass to the expression',
          items: {},
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'miniprogram_screenshot',
    description:
      'Take a screenshot of the mini program. Use returnBase64=true for quick base64 response, or provide filename to save to file.',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description:
            'Optional filename to save screenshot to file. If not provided and returnBase64=true, returns base64 string directly.',
        },
        fullPage: {
          type: 'boolean',
          description: 'Whether to capture the full page including scroll area (default: false). Note: fullPage screenshots use longer timeout (30s vs 10s).',
        },
        returnBase64: {
          type: 'boolean',
          description: 'Return screenshot as base64 string. If true and no filename provided, returns base64 directly without saving file. (default: false)',
        },
      },
    },
  },
  {
    name: 'miniprogram_get_page_stack',
    description: 'Get the current page stack',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'miniprogram_get_system_info',
    description: 'Get system information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

export const MINIPROGRAM_TOOL_HANDLERS: Record<string, ToolHandler> = {
  miniprogram_navigate: miniprogramTools.navigate,
  miniprogram_call_wx: miniprogramTools.callWx,
  miniprogram_evaluate: miniprogramTools.evaluate,
  miniprogram_screenshot: miniprogramTools.screenshot,
  miniprogram_get_page_stack: miniprogramTools.getPageStack,
  miniprogram_get_system_info: miniprogramTools.getSystemInfo,
}

// ============================================================================
// PAGE TOOLS (Page-level Operations)
// ============================================================================

export const PAGE_TOOLS: Tool[] = [
  {
    name: 'page_query',
    description: 'Query a single element on the page',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector to query',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
        save: {
          type: 'boolean',
          description: 'Whether to save element reference (default: true)',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'page_query_all',
    description: 'Query all matching elements on the page',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector to query',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
        save: {
          type: 'boolean',
          description: 'Whether to save element references (default: true)',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'page_wait_for',
    description: 'Wait for a condition to be met (selector or timeout)',
    inputSchema: {
      type: 'object',
      properties: {
        condition: {
          description: 'Selector (string) or timeout in ms (number)',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
        timeout: {
          type: 'number',
          description: 'Maximum wait time in ms (optional)',
        },
      },
      required: ['condition'],
    },
  },
  {
    name: 'page_get_data',
    description: 'Get page data (optionally at a specific path)',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Data path (optional, returns all data if not specified)',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
    },
  },
  {
    name: 'page_set_data',
    description: 'Set page data',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Data object to set',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
      required: ['data'],
    },
  },
  {
    name: 'page_call_method',
    description: 'Call a method on the page',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'Method name to call',
        },
        args: {
          type: 'array',
          description: 'Arguments to pass to the method',
          items: {},
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
      required: ['method'],
    },
  },
  {
    name: 'page_get_size',
    description: 'Get page size (width, height, scrollHeight)',
    inputSchema: {
      type: 'object',
      properties: {
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
    },
  },
  {
    name: 'page_get_scroll_top',
    description: 'Get page scroll position',
    inputSchema: {
      type: 'object',
      properties: {
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
    },
  },
]

export const PAGE_TOOL_HANDLERS: Record<string, ToolHandler> = {
  page_query: pageTools.query,
  page_query_all: pageTools.queryAll,
  page_wait_for: pageTools.waitFor,
  page_get_data: pageTools.getData,
  page_set_data: pageTools.setData,
  page_call_method: pageTools.callMethod,
  page_get_size: pageTools.getSize,
  page_get_scroll_top: pageTools.getScrollTop,
}

// ============================================================================
// ELEMENT TOOLS (Element-level Interactions)
// ============================================================================

export const ELEMENT_TOOLS: Tool[] = [
  {
    name: 'element_tap',
    description: 'Tap (click) an element',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
      },
      required: ['refId'],
    },
  },
  {
    name: 'element_longpress',
    description: 'Long press an element',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
      },
      required: ['refId'],
    },
  },
  {
    name: 'element_input',
    description: 'Input text into an element (input/textarea only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        value: {
          type: 'string',
          description: 'Text value to input',
        },
      },
      required: ['refId', 'value'],
    },
  },
  {
    name: 'element_get_text',
    description: 'Get element text content',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
      },
      required: ['refId'],
    },
  },
  {
    name: 'element_get_attribute',
    description: 'Get element attribute (特性)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        name: {
          type: 'string',
          description: 'Attribute name to retrieve',
        },
      },
      required: ['refId', 'name'],
    },
  },
  {
    name: 'element_get_property',
    description: 'Get element property (属性)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        name: {
          type: 'string',
          description: 'Property name to retrieve',
        },
      },
      required: ['refId', 'name'],
    },
  },
  {
    name: 'element_get_value',
    description: 'Get element value',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
      },
      required: ['refId'],
    },
  },
  {
    name: 'element_get_size',
    description: 'Get element size (width, height)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
      },
      required: ['refId'],
    },
  },
  {
    name: 'element_get_offset',
    description: 'Get element offset (position)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
      },
      required: ['refId'],
    },
  },
  {
    name: 'element_trigger',
    description: 'Trigger an event on the element',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        type: {
          type: 'string',
          description: 'Event type to trigger',
        },
        detail: {
          type: 'object',
          description: 'Event detail data (optional)',
        },
      },
      required: ['refId', 'type'],
    },
  },
  {
    name: 'element_get_style',
    description: 'Get element style value',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        name: {
          type: 'string',
          description: 'Style property name to retrieve',
        },
      },
      required: ['refId', 'name'],
    },
  },
  {
    name: 'element_touchstart',
    description: 'Touch start on element',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        touches: {
          type: 'array',
          description: 'Touch points currently on screen',
        },
        changedTouches: {
          type: 'array',
          description: 'Changed touch points',
        },
      },
      required: ['refId', 'touches', 'changedTouches'],
    },
  },
  {
    name: 'element_touchmove',
    description: 'Touch move on element',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        touches: {
          type: 'array',
          description: 'Touch points currently on screen',
        },
        changedTouches: {
          type: 'array',
          description: 'Changed touch points',
        },
      },
      required: ['refId', 'touches', 'changedTouches'],
    },
  },
  {
    name: 'element_touchend',
    description: 'Touch end on element',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        touches: {
          type: 'array',
          description: 'Touch points currently on screen',
        },
        changedTouches: {
          type: 'array',
          description: 'Changed touch points',
        },
      },
      required: ['refId', 'touches', 'changedTouches'],
    },
  },
  {
    name: 'element_scroll_to',
    description: 'Scroll to position (ScrollView only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        x: {
          type: 'number',
          description: 'X coordinate',
        },
        y: {
          type: 'number',
          description: 'Y coordinate',
        },
      },
      required: ['refId', 'x', 'y'],
    },
  },
  {
    name: 'element_scroll_width',
    description: 'Get scroll width (ScrollView only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
      },
      required: ['refId'],
    },
  },
  {
    name: 'element_scroll_height',
    description: 'Get scroll height (ScrollView only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
      },
      required: ['refId'],
    },
  },
  {
    name: 'element_swipe_to',
    description: 'Swipe to index (Swiper only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        index: {
          type: 'number',
          description: 'Target swiper index',
        },
      },
      required: ['refId', 'index'],
    },
  },
  {
    name: 'element_move_to',
    description: 'Move to position (MovableView only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        x: {
          type: 'number',
          description: 'X coordinate',
        },
        y: {
          type: 'number',
          description: 'Y coordinate',
        },
      },
      required: ['refId', 'x', 'y'],
    },
  },
  {
    name: 'element_slide_to',
    description: 'Slide to value (Slider only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        value: {
          type: 'number',
          description: 'Target slider value',
        },
      },
      required: ['refId', 'value'],
    },
  },
  {
    name: 'element_call_context_method',
    description: 'Call context method (ContextElement only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        method: {
          type: 'string',
          description: 'Context method name',
        },
        args: {
          type: 'array',
          description: 'Arguments to pass to the method',
          items: {},
        },
      },
      required: ['refId', 'method'],
    },
  },
  {
    name: 'element_set_data',
    description: 'Set data on custom element (CustomElement only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        data: {
          type: 'object',
          description: 'Data object to set',
        },
      },
      required: ['refId', 'data'],
    },
  },
  {
    name: 'element_call_method',
    description: 'Call method on custom element (CustomElement only)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        method: {
          type: 'string',
          description: 'Method name',
        },
        args: {
          type: 'array',
          description: 'Arguments to pass to the method',
          items: {},
        },
      },
      required: ['refId', 'method'],
    },
  },
]

export const ELEMENT_TOOL_HANDLERS: Record<string, ToolHandler> = {
  element_tap: elementTools.tap,
  element_longpress: elementTools.longpress,
  element_input: elementTools.input,
  element_get_text: elementTools.getText,
  element_get_attribute: elementTools.getAttribute,
  element_get_property: elementTools.getProperty,
  element_get_value: elementTools.getValue,
  element_get_size: elementTools.getSize,
  element_get_offset: elementTools.getOffset,
  element_trigger: elementTools.trigger,
  element_get_style: elementTools.getStyle,
  element_touchstart: elementTools.touchstart,
  element_touchmove: elementTools.touchmove,
  element_touchend: elementTools.touchend,
  element_scroll_to: elementTools.scrollTo,
  element_scroll_width: elementTools.scrollWidth,
  element_scroll_height: elementTools.scrollHeight,
  element_swipe_to: elementTools.swipeTo,
  element_move_to: elementTools.moveTo,
  element_slide_to: elementTools.slideTo,
  element_call_context_method: elementTools.callContextMethod,
  element_set_data: elementTools.setData,
  element_call_method: elementTools.callMethod,
}

// ============================================================================
// ASSERT TOOLS (Testing & Verification)
// ============================================================================

export const ASSERT_TOOLS: Tool[] = [
  {
    name: 'assert_exists',
    description: 'Assert that an element exists on the page',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector for the element',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'assert_not_exists',
    description: 'Assert that an element does not exist on the page',
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector for the element',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'assert_text',
    description: 'Assert element text equals expected value',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        expected: {
          type: 'string',
          description: 'Expected text value',
        },
      },
      required: ['refId', 'expected'],
    },
  },
  {
    name: 'assert_text_contains',
    description: 'Assert element text contains expected substring',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        expected: {
          type: 'string',
          description: 'Expected substring',
        },
      },
      required: ['refId', 'expected'],
    },
  },
  {
    name: 'assert_value',
    description: 'Assert element value equals expected value',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        expected: {
          type: 'string',
          description: 'Expected value',
        },
      },
      required: ['refId', 'expected'],
    },
  },
  {
    name: 'assert_attribute',
    description: 'Assert element attribute equals expected value',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        name: {
          type: 'string',
          description: 'Attribute name',
        },
        expected: {
          type: 'string',
          description: 'Expected attribute value',
        },
      },
      required: ['refId', 'name', 'expected'],
    },
  },
  {
    name: 'assert_property',
    description: 'Assert element property equals expected value',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        name: {
          type: 'string',
          description: 'Property name',
        },
        expected: {
          description: 'Expected property value (any type)',
        },
      },
      required: ['refId', 'name', 'expected'],
    },
  },
  {
    name: 'assert_data',
    description: 'Assert page data equals expected value',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Data path (optional, for nested data)',
        },
        expected: {
          description: 'Expected data value (any type)',
        },
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
      },
      required: ['expected'],
    },
  },
  {
    name: 'assert_visible',
    description: 'Assert element is visible (has non-zero size)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
      },
      required: ['refId'],
    },
  },
]

export const ASSERT_TOOL_HANDLERS: Record<string, ToolHandler> = {
  assert_exists: assertTools.assertExists,
  assert_not_exists: assertTools.assertNotExists,
  assert_text: assertTools.assertText,
  assert_text_contains: assertTools.assertTextContains,
  assert_value: assertTools.assertValue,
  assert_attribute: assertTools.assertAttribute,
  assert_property: assertTools.assertProperty,
  assert_data: assertTools.assertData,
  assert_visible: assertTools.assertVisible,
}

// ============================================================================
// SNAPSHOT TOOLS (State Capture & Diagnostics)
// ============================================================================

export const SNAPSHOT_TOOLS: Tool[] = [
  {
    name: 'snapshot_page',
    description: 'Capture complete page snapshot (data + screenshot)',
    inputSchema: {
      type: 'object',
      properties: {
        pagePath: {
          type: 'string',
          description: 'Page path (optional, defaults to current page)',
        },
        filename: {
          type: 'string',
          description: 'Output filename (optional, auto-generated if not provided)',
        },
        includeScreenshot: {
          type: 'boolean',
          description: 'Whether to include screenshot (default: true)',
        },
        fullPage: {
          type: 'boolean',
          description: 'Whether to capture full page or viewport only (default: false)',
        },
      },
    },
  },
  {
    name: 'snapshot_full',
    description: 'Capture complete application snapshot (system info + page stack + current page)',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Output filename (optional, auto-generated if not provided)',
        },
        includeScreenshot: {
          type: 'boolean',
          description: 'Whether to include screenshot (default: true)',
        },
        fullPage: {
          type: 'boolean',
          description: 'Whether to capture full page or viewport only (default: false)',
        },
      },
    },
  },
  {
    name: 'snapshot_element',
    description: 'Capture element snapshot (properties + optional screenshot)',
    inputSchema: {
      type: 'object',
      properties: {
        refId: {
          type: 'string',
          description: 'Element reference ID from page_query',
        },
        filename: {
          type: 'string',
          description: 'Output filename (optional, auto-generated if not provided)',
        },
        includeScreenshot: {
          type: 'boolean',
          description: 'Whether to include screenshot (default: false)',
        },
      },
      required: ['refId'],
    },
  },
]

export const SNAPSHOT_TOOL_HANDLERS: Record<string, ToolHandler> = {
  snapshot_page: snapshotTools.snapshotPage,
  snapshot_full: snapshotTools.snapshotFull,
  snapshot_element: snapshotTools.snapshotElement,
}

// ============================================================================
// RECORD TOOLS (Recording & Replay)
// ============================================================================

export const RECORD_TOOLS: Tool[] = [
  {
    name: 'record_start',
    description: 'Start recording user actions for later replay',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name for this recording sequence',
        },
        description: {
          type: 'string',
          description: 'Optional description of what this sequence does',
        },
      },
    },
  },
  {
    name: 'record_stop',
    description: 'Stop the current recording and save the sequence',
    inputSchema: {
      type: 'object',
      properties: {
        save: {
          type: 'boolean',
          description: 'Whether to save the sequence (default: true)',
        },
      },
    },
  },
  {
    name: 'record_list',
    description: 'List all saved action sequences',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'record_get',
    description: 'Get details of a specific sequence',
    inputSchema: {
      type: 'object',
      properties: {
        sequenceId: {
          type: 'string',
          description: 'ID of the sequence to retrieve',
        },
      },
      required: ['sequenceId'],
    },
  },
  {
    name: 'record_delete',
    description: 'Delete a saved sequence',
    inputSchema: {
      type: 'object',
      properties: {
        sequenceId: {
          type: 'string',
          description: 'ID of the sequence to delete',
        },
      },
      required: ['sequenceId'],
    },
  },
  {
    name: 'record_replay',
    description: 'Replay a recorded action sequence',
    inputSchema: {
      type: 'object',
      properties: {
        sequenceId: {
          type: 'string',
          description: 'ID of the sequence to replay',
        },
        continueOnError: {
          type: 'boolean',
          description: 'Whether to continue replaying if an action fails (default: false)',
        },
      },
      required: ['sequenceId'],
    },
  },
]

export const RECORD_TOOL_HANDLERS: Record<string, ToolHandler> = {
  record_start: recordTools.startRecording,
  record_stop: recordTools.stopRecording,
  record_list: recordTools.listSequences,
  record_get: recordTools.getSequence,
  record_delete: recordTools.deleteSequence,
  record_replay: recordTools.replaySequence,
}

// ============================================================================
// NETWORK TOOLS (Network Mock & Testing)
// ============================================================================

export const NETWORK_TOOLS: Tool[] = [
  {
    name: 'network_mock_wx_method',
    description: 'Mock a WeChat API method (wx.*) for testing',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'WeChat API method name (e.g., "request", "getStorage")',
        },
        result: {
          description: 'Mock result to return',
        },
        type: {
          type: 'string',
          enum: ['success', 'fail'],
          description: 'Whether to mock as success or failure (default: success)',
        },
      },
      required: ['method', 'result'],
    },
  },
  {
    name: 'network_restore_wx_method',
    description: 'Restore a previously mocked WeChat API method',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'WeChat API method name to restore',
        },
      },
      required: ['method'],
    },
  },
  {
    name: 'network_mock_request',
    description: 'Mock wx.request to return specific data (convenience wrapper)',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          description: 'Response data to return (default: {})',
        },
        statusCode: {
          type: 'number',
          description: 'HTTP status code (default: 200)',
        },
        header: {
          type: 'object',
          description: 'Response headers (default: {})',
        },
        type: {
          type: 'string',
          enum: ['success', 'fail'],
          description: 'Whether to mock as success or failure (default: success)',
        },
      },
    },
  },
  {
    name: 'network_mock_request_failure',
    description: 'Mock wx.request to fail with specific error',
    inputSchema: {
      type: 'object',
      properties: {
        errMsg: {
          type: 'string',
          description: 'Error message (default: "request:fail")',
        },
        errno: {
          type: 'number',
          description: 'Error code (default: -1)',
        },
      },
    },
  },
  {
    name: 'network_restore_request',
    description: 'Restore wx.request to original behavior',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'network_restore_all_mocks',
    description: 'Restore all mocked WeChat API methods at once',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

export const NETWORK_TOOL_HANDLERS: Record<string, ToolHandler> = {
  network_mock_wx_method: networkTools.mockWxMethod,
  network_restore_wx_method: networkTools.restoreWxMethod,
  network_mock_request: networkTools.mockRequest,
  network_mock_request_failure: networkTools.mockRequestFailure,
  network_restore_request: networkTools.restoreRequest,
  network_restore_all_mocks: networkTools.restoreAllMocks,
}

// ============================================================================
// TOOL CATEGORIES
// ============================================================================

export const TOOL_CATEGORIES: Record<string, ToolCategory> = {
  automator: {
    name: 'Automator',
    description: 'Connection and lifecycle management (4 tools)',
    tools: AUTOMATOR_TOOLS,
    handlers: AUTOMATOR_TOOL_HANDLERS,
  },
  miniprogram: {
    name: 'MiniProgram',
    description: 'Mini program-level operations (6 tools)',
    tools: MINIPROGRAM_TOOLS,
    handlers: MINIPROGRAM_TOOL_HANDLERS,
  },
  page: {
    name: 'Page',
    description: 'Page-level operations and data access (8 tools)',
    tools: PAGE_TOOLS,
    handlers: PAGE_TOOL_HANDLERS,
  },
  element: {
    name: 'Element',
    description: 'Element-level interactions and properties (23 tools)',
    tools: ELEMENT_TOOLS,
    handlers: ELEMENT_TOOL_HANDLERS,
  },
  assert: {
    name: 'Assert',
    description: 'Testing and verification utilities (9 tools)',
    tools: ASSERT_TOOLS,
    handlers: ASSERT_TOOL_HANDLERS,
  },
  snapshot: {
    name: 'Snapshot',
    description: 'State capture and diagnostic utilities (3 tools)',
    tools: SNAPSHOT_TOOLS,
    handlers: SNAPSHOT_TOOL_HANDLERS,
  },
  record: {
    name: 'Record',
    description: 'Action recording and replay utilities (6 tools)',
    tools: RECORD_TOOLS,
    handlers: RECORD_TOOL_HANDLERS,
  },
  network: {
    name: 'Network',
    description: 'Network mock and testing utilities (6 tools)',
    tools: NETWORK_TOOLS,
    handlers: NETWORK_TOOL_HANDLERS,
  },
}

// ============================================================================
// CORE TOOLS (All tools combined for backward compatibility)
// ============================================================================

export const CORE_TOOLS: Tool[] = [
  ...AUTOMATOR_TOOLS,
  ...MINIPROGRAM_TOOLS,
  ...PAGE_TOOLS,
  ...ELEMENT_TOOLS,
  ...ASSERT_TOOLS,
  ...SNAPSHOT_TOOLS,
  ...RECORD_TOOLS,
  ...NETWORK_TOOLS,
]

export const CORE_TOOL_HANDLERS: Record<string, ToolHandler> = {
  ...AUTOMATOR_TOOL_HANDLERS,
  ...MINIPROGRAM_TOOL_HANDLERS,
  ...PAGE_TOOL_HANDLERS,
  ...ELEMENT_TOOL_HANDLERS,
  ...ASSERT_TOOL_HANDLERS,
  ...SNAPSHOT_TOOL_HANDLERS,
  ...RECORD_TOOL_HANDLERS,
  ...NETWORK_TOOL_HANDLERS,
}

// ============================================================================
// TOOL VALIDATION AND UTILITIES
// ============================================================================

/**
 * Validate that all tool definitions have corresponding handlers
 */
export function validateToolRegistration(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const tool of CORE_TOOLS) {
    if (!CORE_TOOL_HANDLERS[tool.name]) {
      errors.push(`Missing handler for tool: ${tool.name}`)
    }
  }

  for (const handlerName in CORE_TOOL_HANDLERS) {
    const hasTool = CORE_TOOLS.some((t) => t.name === handlerName)
    if (!hasTool) {
      errors.push(`Handler without tool definition: ${handlerName}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get tool statistics
 */
export function getToolStats() {
  return {
    total: CORE_TOOLS.length,
    categories: {
      automator: AUTOMATOR_TOOLS.length,
      miniprogram: MINIPROGRAM_TOOLS.length,
      page: PAGE_TOOLS.length,
      element: ELEMENT_TOOLS.length,
      assert: ASSERT_TOOLS.length,
      snapshot: SNAPSHOT_TOOLS.length,
      record: RECORD_TOOLS.length,
      network: NETWORK_TOOLS.length,
    },
    handlers: Object.keys(CORE_TOOL_HANDLERS).length,
  }
}

/**
 * Get tool by name
 */
export function getToolByName(name: string): Tool | undefined {
  return CORE_TOOLS.find((t) => t.name === name)
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: keyof typeof TOOL_CATEGORIES): Tool[] {
  return TOOL_CATEGORIES[category]?.tools || []
}

// ============================================================================
// TOOL REGISTRATION
// ============================================================================

export interface ToolRegistrationOptions {
  capabilities?: string[]
  sessionId: string // Unique session ID for this server instance
  getSession: (sessionId: string) => SessionState
  deleteSession?: (sessionId: string) => Promise<void> // Async cleanup
}

/**
 * Supported capability names for tool registration
 */
export const SUPPORTED_CAPABILITIES = [
  'core', // All tools (default)
  'automator', // Connection and lifecycle
  'miniprogram', // MiniProgram-level operations
  'page', // Page-level operations
  'element', // Element interactions
  'assert', // Testing and verification
  'snapshot', // State capture
  'record', // Recording and replay
  'network', // Network mocking
] as const

export type Capability = (typeof SUPPORTED_CAPABILITIES)[number]

/**
 * Register tools based on enabled capabilities
 * This function actually registers the tool handlers with the MCP server
 */
export function registerTools(server: Server, options: ToolRegistrationOptions): Tool[] {
  const { capabilities = ['core'], sessionId, getSession, deleteSession } = options

  const tools: Tool[] = []
  const handlers: Record<string, ToolHandler> = {}

  // Validate tool registration
  const validation = validateToolRegistration()
  if (!validation.valid) {
    console.error('Tool registration validation failed:')
    validation.errors.forEach((err) => console.error(`  - ${err}`))
    throw new Error('Tool registration validation failed')
  }

  // Register tools based on capabilities
  // 'core' includes all tools
  if (capabilities.includes('core')) {
    tools.push(...CORE_TOOLS)
    Object.assign(handlers, CORE_TOOL_HANDLERS)
  } else {
    // Register individual capability groups
    if (capabilities.includes('automator')) {
      tools.push(...AUTOMATOR_TOOLS)
      Object.assign(handlers, AUTOMATOR_TOOL_HANDLERS)
    }
    if (capabilities.includes('miniprogram')) {
      tools.push(...MINIPROGRAM_TOOLS)
      Object.assign(handlers, MINIPROGRAM_TOOL_HANDLERS)
    }
    if (capabilities.includes('page')) {
      tools.push(...PAGE_TOOLS)
      Object.assign(handlers, PAGE_TOOL_HANDLERS)
    }
    if (capabilities.includes('element')) {
      tools.push(...ELEMENT_TOOLS)
      Object.assign(handlers, ELEMENT_TOOL_HANDLERS)
    }
    if (capabilities.includes('assert')) {
      tools.push(...ASSERT_TOOLS)
      Object.assign(handlers, ASSERT_TOOL_HANDLERS)
    }
    if (capabilities.includes('snapshot')) {
      tools.push(...SNAPSHOT_TOOLS)
      Object.assign(handlers, SNAPSHOT_TOOL_HANDLERS)
    }
    if (capabilities.includes('record')) {
      tools.push(...RECORD_TOOLS)
      Object.assign(handlers, RECORD_TOOL_HANDLERS)
    }
    if (capabilities.includes('network')) {
      tools.push(...NETWORK_TOOLS)
      Object.assign(handlers, NETWORK_TOOL_HANDLERS)
    }
  }

  // Log registration stats
  console.error(`Registering ${tools.length} tools (capabilities: ${capabilities.join(', ')}):`)

  // Count tools by category in registered set
  const registeredCounts = {
    automator: tools.filter(
      (t) =>
        t.name.startsWith('miniprogram_launch') ||
        t.name.startsWith('miniprogram_connect') ||
        t.name.startsWith('miniprogram_disconnect') ||
        t.name.startsWith('miniprogram_close')
    ).length,
    miniprogram: tools.filter(
      (t) =>
        t.name.startsWith('miniprogram_') &&
        !t.name.includes('launch') &&
        !t.name.includes('connect') &&
        !t.name.includes('disconnect') &&
        !t.name.includes('close')
    ).length,
    page: tools.filter((t) => t.name.startsWith('page_')).length,
    element: tools.filter((t) => t.name.startsWith('element_')).length,
    assert: tools.filter((t) => t.name.startsWith('assert_')).length,
    snapshot: tools.filter((t) => t.name.startsWith('snapshot_')).length,
    record: tools.filter((t) => t.name.startsWith('record_')).length,
    network: tools.filter((t) => t.name.startsWith('network_')).length,
  }

  if (registeredCounts.automator > 0) console.error(`  - Automator: ${registeredCounts.automator}`)
  if (registeredCounts.miniprogram > 0)
    console.error(`  - MiniProgram: ${registeredCounts.miniprogram}`)
  if (registeredCounts.page > 0) console.error(`  - Page: ${registeredCounts.page}`)
  if (registeredCounts.element > 0) console.error(`  - Element: ${registeredCounts.element}`)
  if (registeredCounts.assert > 0) console.error(`  - Assert: ${registeredCounts.assert}`)
  if (registeredCounts.snapshot > 0) console.error(`  - Snapshot: ${registeredCounts.snapshot}`)
  if (registeredCounts.record > 0) console.error(`  - Record: ${registeredCounts.record}`)
  if (registeredCounts.network > 0) console.error(`  - Network: ${registeredCounts.network}`)

  // Register CallToolRequest handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    // Get or create session using the unique session ID for this server instance
    // Each stdio transport connection has its own session
    const session = getSession(sessionId)

    try {
      // Route to appropriate tool handler
      const handler = handlers[name]
      if (!handler) {
        throw new Error(`Unknown tool: ${name}`)
      }

      // Wrap handler with automatic logging if logger is available
      let wrappedHandler = handler
      if (session.logger) {
        const toolLogger = new ToolLogger(session.logger, session.loggerConfig)
        wrappedHandler = toolLogger.wrap(name, handler)
      }

      // Execute handler (with logging if available)
      const result = await wrappedHandler(session, args as any)

      // Handle session deletion for close tool
      if (name === 'miniprogram_close' && deleteSession) {
        try {
          await deleteSession(sessionId)
          console.error(`Session ${sessionId} deleted after close`)
        } catch (error) {
          console.error(`Failed to delete session ${sessionId} after close:`, error)
          // Don't fail the close operation if cleanup fails
        }
      }

      // Return formatted response
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool ${name}: ${errorMessage}`,
          },
        ],
        isError: true,
      }
    }
  })

  return tools
}
