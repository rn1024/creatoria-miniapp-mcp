/**
 * Element Capability Module
 *
 * Provides tools for element-level interactions including:
 * - Basic interactions (tap, longpress, input)
 * - Properties and attributes
 * - Events and gestures
 * - ScrollView operations
 * - Specialized component operations (Swiper, MovableView, Slider)
 * - Custom element operations
 */

import type { CapabilityModule, ToolDefinition } from '../registry.js'
import {
  tapSchema,
  longpressSchema,
  inputSchema,
  getTextSchema,
  getAttributeSchema,
  getPropertySchema,
  getValueSchema,
  getSizeSchema,
  getOffsetSchema,
  triggerSchema,
  getStyleSchema,
  touchstartSchema,
  touchmoveSchema,
  touchendSchema,
  scrollToSchema,
  scrollWidthSchema,
  scrollHeightSchema,
  swipeToSchema,
  moveToSchema,
  slideToSchema,
  callContextMethodSchema,
  setDataSchema,
  callMethodSchema,
} from './schemas/index.js'
import {
  tap,
  longpress,
  input,
  getText,
  getAttribute,
  getProperty,
  getValue,
  getSize,
  getOffset,
  trigger,
  getStyle,
  touchstart,
  touchmove,
  touchend,
  scrollTo,
  scrollWidth,
  scrollHeight,
  swipeTo,
  moveTo,
  slideTo,
  callContextMethod,
  setData,
  callMethod,
} from './handlers/index.js'

// Re-export schemas for external use
export * from './schemas/index.js'

// Re-export handlers for external use
export * from './handlers/index.js'

/**
 * Element tool definitions - 23 tools
 */
const tools: ToolDefinition[] = [
  // Basic Interactions
  {
    name: 'element_tap',
    description: 'Tap (click) an element',
    capability: 'element',
    inputSchema: tapSchema,
    handler: tap,
  },
  {
    name: 'element_longpress',
    description: 'Long press an element',
    capability: 'element',
    inputSchema: longpressSchema,
    handler: longpress,
  },
  {
    name: 'element_input',
    description: 'Input text into an element (input/textarea only)',
    capability: 'element',
    inputSchema: inputSchema,
    handler: input,
  },
  // Properties and Attributes
  {
    name: 'element_get_text',
    description: 'Get element text content',
    capability: 'element',
    inputSchema: getTextSchema,
    handler: getText,
  },
  {
    name: 'element_get_attribute',
    description: 'Get element attribute (特性)',
    capability: 'element',
    inputSchema: getAttributeSchema,
    handler: getAttribute,
  },
  {
    name: 'element_get_property',
    description: 'Get element property (属性)',
    capability: 'element',
    inputSchema: getPropertySchema,
    handler: getProperty,
  },
  {
    name: 'element_get_value',
    description: 'Get element value',
    capability: 'element',
    inputSchema: getValueSchema,
    handler: getValue,
  },
  {
    name: 'element_get_size',
    description: 'Get element size (width, height)',
    capability: 'element',
    inputSchema: getSizeSchema,
    handler: getSize,
  },
  {
    name: 'element_get_offset',
    description: 'Get element offset (position)',
    capability: 'element',
    inputSchema: getOffsetSchema,
    handler: getOffset,
  },
  {
    name: 'element_get_style',
    description: 'Get element style value',
    capability: 'element',
    inputSchema: getStyleSchema,
    handler: getStyle,
  },
  // Events
  {
    name: 'element_trigger',
    description: 'Trigger an event on the element',
    capability: 'element',
    inputSchema: triggerSchema,
    handler: trigger,
  },
  {
    name: 'element_touchstart',
    description: 'Touch start on element',
    capability: 'element',
    inputSchema: touchstartSchema,
    handler: touchstart,
  },
  {
    name: 'element_touchmove',
    description: 'Touch move on element',
    capability: 'element',
    inputSchema: touchmoveSchema,
    handler: touchmove,
  },
  {
    name: 'element_touchend',
    description: 'Touch end on element',
    capability: 'element',
    inputSchema: touchendSchema,
    handler: touchend,
  },
  // ScrollView Operations
  {
    name: 'element_scroll_to',
    description: 'Scroll to position (ScrollView only)',
    capability: 'element',
    inputSchema: scrollToSchema,
    handler: scrollTo,
  },
  {
    name: 'element_scroll_width',
    description: 'Get scroll width (ScrollView only)',
    capability: 'element',
    inputSchema: scrollWidthSchema,
    handler: scrollWidth,
  },
  {
    name: 'element_scroll_height',
    description: 'Get scroll height (ScrollView only)',
    capability: 'element',
    inputSchema: scrollHeightSchema,
    handler: scrollHeight,
  },
  // Specialized Component Operations
  {
    name: 'element_swipe_to',
    description: 'Swipe to index (Swiper only)',
    capability: 'element',
    inputSchema: swipeToSchema,
    handler: swipeTo,
  },
  {
    name: 'element_move_to',
    description: 'Move to position (MovableView only)',
    capability: 'element',
    inputSchema: moveToSchema,
    handler: moveTo,
  },
  {
    name: 'element_slide_to',
    description: 'Slide to value (Slider only)',
    capability: 'element',
    inputSchema: slideToSchema,
    handler: slideTo,
  },
  {
    name: 'element_call_context_method',
    description: 'Call context method (ContextElement only)',
    capability: 'element',
    inputSchema: callContextMethodSchema,
    handler: callContextMethod,
  },
  // Custom Element Operations
  {
    name: 'element_set_data',
    description: 'Set data on custom element (CustomElement only)',
    capability: 'element',
    inputSchema: setDataSchema,
    handler: setData,
  },
  {
    name: 'element_call_method',
    description: 'Call method on custom element (CustomElement only)',
    capability: 'element',
    inputSchema: callMethodSchema,
    handler: callMethod,
  },
]

/**
 * Element capability module
 */
export const capability: CapabilityModule = {
  name: 'element',
  description: 'Element-level interactions and properties (23 tools)',
  tools,
}

export default capability
