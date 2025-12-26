/**
 * Assert Capability Module
 *
 * Provides tools for testing and verification including element assertions,
 * text validation, attribute/property checks, and data assertions.
 */

import type { CapabilityModule, ToolDefinition } from '../registry.js'
import {
  assertExistsSchema,
  assertNotExistsSchema,
  assertTextSchema,
  assertTextContainsSchema,
  assertValueSchema,
  assertAttributeSchema,
  assertPropertySchema,
  assertDataSchema,
  assertVisibleSchema,
} from './schemas/index.js'
import {
  assertExists,
  assertNotExists,
  assertText,
  assertTextContains,
  assertValue,
  assertAttribute,
  assertProperty,
  assertData,
  assertVisible,
} from './handlers/index.js'

// Re-export schemas for external use
export * from './schemas/index.js'

// Re-export handlers for external use
export * from './handlers/index.js'

/**
 * Assert tool definitions - 9 tools
 */
const tools: ToolDefinition[] = [
  {
    name: 'assert_exists',
    description: 'Assert that an element exists on the page',
    capability: 'assert',
    inputSchema: assertExistsSchema,
    handler: assertExists,
  },
  {
    name: 'assert_not_exists',
    description: 'Assert that an element does not exist on the page',
    capability: 'assert',
    inputSchema: assertNotExistsSchema,
    handler: assertNotExists,
  },
  {
    name: 'assert_text',
    description: 'Assert element text equals expected value',
    capability: 'assert',
    inputSchema: assertTextSchema,
    handler: assertText,
  },
  {
    name: 'assert_text_contains',
    description: 'Assert element text contains expected substring',
    capability: 'assert',
    inputSchema: assertTextContainsSchema,
    handler: assertTextContains,
  },
  {
    name: 'assert_value',
    description: 'Assert element value equals expected value',
    capability: 'assert',
    inputSchema: assertValueSchema,
    handler: assertValue,
  },
  {
    name: 'assert_attribute',
    description: 'Assert element attribute equals expected value',
    capability: 'assert',
    inputSchema: assertAttributeSchema,
    handler: assertAttribute,
  },
  {
    name: 'assert_property',
    description: 'Assert element property equals expected value',
    capability: 'assert',
    inputSchema: assertPropertySchema,
    handler: assertProperty,
  },
  {
    name: 'assert_data',
    description: 'Assert page data equals expected value',
    capability: 'assert',
    inputSchema: assertDataSchema,
    handler: assertData,
  },
  {
    name: 'assert_visible',
    description: 'Assert element is visible (has non-zero size)',
    capability: 'assert',
    inputSchema: assertVisibleSchema,
    handler: assertVisible,
  },
]

/**
 * Assert capability module
 */
export const capability: CapabilityModule = {
  name: 'assert',
  description: 'Testing and verification utilities (9 tools)',
  tools,
}

export default capability
