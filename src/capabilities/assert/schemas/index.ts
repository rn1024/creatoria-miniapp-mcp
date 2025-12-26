/**
 * Assert schemas exports - 9 assertion tool schemas
 */

import { z } from 'zod'

const refIdSchema = z.string().min(1).describe('Element reference ID from page_query')

export const assertExistsSchema = z
  .object({
    selector: z.string().min(1).describe('CSS selector for the element'),
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
  })
  .describe('Assert that an element exists on the page')

export const assertNotExistsSchema = z
  .object({
    selector: z.string().min(1).describe('CSS selector for the element'),
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
  })
  .describe('Assert that an element does not exist on the page')

export const assertTextSchema = z
  .object({
    refId: refIdSchema,
    expected: z.string().describe('Expected text value'),
  })
  .describe('Assert element text equals expected value')

export const assertTextContainsSchema = z
  .object({
    refId: refIdSchema,
    expected: z.string().describe('Expected substring'),
  })
  .describe('Assert element text contains expected substring')

export const assertValueSchema = z
  .object({
    refId: refIdSchema,
    expected: z.string().describe('Expected value'),
  })
  .describe('Assert element value equals expected value')

export const assertAttributeSchema = z
  .object({
    refId: refIdSchema,
    name: z.string().min(1).describe('Attribute name'),
    expected: z.string().describe('Expected attribute value'),
  })
  .describe('Assert element attribute equals expected value')

export const assertPropertySchema = z
  .object({
    refId: refIdSchema,
    name: z.string().min(1).describe('Property name'),
    expected: z.any().describe('Expected property value (any type)'),
  })
  .describe('Assert element property equals expected value')

export const assertDataSchema = z
  .object({
    path: z.string().optional().describe('Data path (optional, for nested data)'),
    expected: z.any().describe('Expected data value (any type)'),
    pagePath: z.string().optional().describe('Page path (optional, defaults to current page)'),
  })
  .describe('Assert page data equals expected value')

export const assertVisibleSchema = z
  .object({
    refId: refIdSchema,
  })
  .describe('Assert element is visible (has non-zero size)')
