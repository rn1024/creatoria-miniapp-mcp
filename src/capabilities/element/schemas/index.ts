/**
 * Element schemas exports - 23 element tool schemas
 */

import { z } from 'zod'

// Common refId schema
const refIdSchema = z.string().min(1).describe('Element reference ID from page_query')

// Touch point schema
const touchPointSchema = z.object({
  x: z.number().describe('X coordinate'),
  y: z.number().describe('Y coordinate'),
})

// ============================================================================
// Basic Interactions
// ============================================================================

export const tapSchema = z
  .object({
    refId: refIdSchema,
  })
  .describe('Tap (click) an element')

export const longpressSchema = z
  .object({
    refId: refIdSchema,
  })
  .describe('Long press an element')

export const inputSchema = z
  .object({
    refId: refIdSchema,
    value: z.string().describe('Text value to input'),
  })
  .describe('Input text into an element (input/textarea only)')

// ============================================================================
// Properties and Attributes
// ============================================================================

export const getTextSchema = z
  .object({
    refId: refIdSchema,
  })
  .describe('Get element text content')

export const getAttributeSchema = z
  .object({
    refId: refIdSchema,
    name: z.string().min(1).describe('Attribute name to retrieve'),
  })
  .describe('Get element attribute (特性)')

export const getPropertySchema = z
  .object({
    refId: refIdSchema,
    name: z.string().min(1).describe('Property name to retrieve'),
  })
  .describe('Get element property (属性)')

export const getValueSchema = z
  .object({
    refId: refIdSchema,
  })
  .describe('Get element value')

export const getSizeSchema = z
  .object({
    refId: refIdSchema,
  })
  .describe('Get element size (width, height)')

export const getOffsetSchema = z
  .object({
    refId: refIdSchema,
  })
  .describe('Get element offset (position)')

export const getStyleSchema = z
  .object({
    refId: refIdSchema,
    name: z.string().min(1).describe('Style property name to retrieve'),
  })
  .describe('Get element style value')

// ============================================================================
// Events
// ============================================================================

export const triggerSchema = z
  .object({
    refId: refIdSchema,
    type: z.string().min(1).describe('Event type to trigger'),
    detail: z.record(z.any()).optional().describe('Event detail data (optional)'),
  })
  .describe('Trigger an event on the element')

export const touchstartSchema = z
  .object({
    refId: refIdSchema,
    touches: z.array(touchPointSchema).describe('Touch points currently on screen'),
    changedTouches: z.array(touchPointSchema).describe('Changed touch points'),
  })
  .describe('Touch start on element')

export const touchmoveSchema = z
  .object({
    refId: refIdSchema,
    touches: z.array(touchPointSchema).describe('Touch points currently on screen'),
    changedTouches: z.array(touchPointSchema).describe('Changed touch points'),
  })
  .describe('Touch move on element')

export const touchendSchema = z
  .object({
    refId: refIdSchema,
    touches: z.array(touchPointSchema).describe('Touch points currently on screen'),
    changedTouches: z.array(touchPointSchema).describe('Changed touch points'),
  })
  .describe('Touch end on element')

// ============================================================================
// ScrollView Operations
// ============================================================================

export const scrollToSchema = z
  .object({
    refId: refIdSchema,
    x: z.number().describe('X coordinate'),
    y: z.number().describe('Y coordinate'),
  })
  .describe('Scroll to position (ScrollView only)')

export const scrollWidthSchema = z
  .object({
    refId: refIdSchema,
  })
  .describe('Get scroll width (ScrollView only)')

export const scrollHeightSchema = z
  .object({
    refId: refIdSchema,
  })
  .describe('Get scroll height (ScrollView only)')

// ============================================================================
// Specialized Component Operations
// ============================================================================

export const swipeToSchema = z
  .object({
    refId: refIdSchema,
    index: z.number().int().min(0).describe('Target swiper index'),
  })
  .describe('Swipe to index (Swiper only)')

export const moveToSchema = z
  .object({
    refId: refIdSchema,
    x: z.number().describe('X coordinate'),
    y: z.number().describe('Y coordinate'),
  })
  .describe('Move to position (MovableView only)')

export const slideToSchema = z
  .object({
    refId: refIdSchema,
    value: z.number().describe('Target slider value'),
  })
  .describe('Slide to value (Slider only)')

export const callContextMethodSchema = z
  .object({
    refId: refIdSchema,
    method: z.string().min(1).describe('Context method name'),
    args: z.array(z.any()).optional().describe('Arguments to pass to the method'),
  })
  .describe('Call context method (ContextElement only)')

// ============================================================================
// Custom Element Operations
// ============================================================================

export const setDataSchema = z
  .object({
    refId: refIdSchema,
    data: z.record(z.any()).describe('Data object to set'),
  })
  .describe('Set data on custom element (CustomElement only)')

export const callMethodSchema = z
  .object({
    refId: refIdSchema,
    method: z.string().min(1).describe('Method name'),
    args: z.array(z.any()).optional().describe('Arguments to pass to the method'),
  })
  .describe('Call method on custom element (CustomElement only)')
