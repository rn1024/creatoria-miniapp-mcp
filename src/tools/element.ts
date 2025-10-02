/**
 * Element tool implementations
 * Handles element-level operations: interactions, attributes, properties
 */

import type { SessionState } from '../types.js'

/**
 * Get element from session by refId
 */
function getElement(session: SessionState, refId: string): any {
  const element = session.elements.get(refId)
  if (!element) {
    throw new Error(`Element not found with refId: ${refId}. Use page_query to get element reference first.`)
  }
  return element
}

/**
 * Tap (click) an element
 */
export async function tap(
  session: SessionState,
  args: {
    refId: string
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Tapping element', { refId })

    const element = getElement(session, refId)
    await element.tap()

    logger?.info('Element tapped successfully', { refId })

    return {
      success: true,
      message: `Element tapped: ${refId}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Tap failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`Tap failed: ${errorMessage}`)
  }
}

/**
 * Long press an element
 */
export async function longpress(
  session: SessionState,
  args: {
    refId: string
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Long pressing element', { refId })

    const element = getElement(session, refId)
    await element.longpress()

    logger?.info('Element long pressed successfully', { refId })

    return {
      success: true,
      message: `Element long pressed: ${refId}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Longpress failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`Longpress failed: ${errorMessage}`)
  }
}

/**
 * Input text into an element (input/textarea only)
 */
export async function input(
  session: SessionState,
  args: {
    refId: string
    value: string
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, value } = args
  const logger = session.logger

  try {
    logger?.info('Inputting text', { refId, value })

    const element = getElement(session, refId)
    await element.input(value)

    logger?.info('Text input successfully', { refId, value })

    return {
      success: true,
      message: `Text input to element: ${refId}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Input failed', {
      error: errorMessage,
      refId,
      value,
    })

    throw new Error(`Input failed: ${errorMessage}`)
  }
}

/**
 * Get element text content
 */
export async function getText(
  session: SessionState,
  args: {
    refId: string
  }
): Promise<{
  success: boolean
  message: string
  text: string
}> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting element text', { refId })

    const element = getElement(session, refId)
    const text = await element.text()

    logger?.info('Element text retrieved', { refId, text })

    return {
      success: true,
      message: 'Element text retrieved',
      text,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetText failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`GetText failed: ${errorMessage}`)
  }
}

/**
 * Get element attribute (特性)
 */
export async function getAttribute(
  session: SessionState,
  args: {
    refId: string
    name: string
  }
): Promise<{
  success: boolean
  message: string
  value: string
}> {
  const { refId, name } = args
  const logger = session.logger

  try {
    logger?.info('Getting element attribute', { refId, name })

    const element = getElement(session, refId)
    const value = await element.attribute(name)

    logger?.info('Element attribute retrieved', { refId, name, value })

    return {
      success: true,
      message: `Attribute "${name}" retrieved`,
      value,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetAttribute failed', {
      error: errorMessage,
      refId,
      name,
    })

    throw new Error(`GetAttribute failed: ${errorMessage}`)
  }
}

/**
 * Get element property (属性)
 */
export async function getProperty(
  session: SessionState,
  args: {
    refId: string
    name: string
  }
): Promise<{
  success: boolean
  message: string
  value: any
}> {
  const { refId, name } = args
  const logger = session.logger

  try {
    logger?.info('Getting element property', { refId, name })

    const element = getElement(session, refId)
    const value = await element.property(name)

    logger?.info('Element property retrieved', { refId, name, value })

    return {
      success: true,
      message: `Property "${name}" retrieved`,
      value,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetProperty failed', {
      error: errorMessage,
      refId,
      name,
    })

    throw new Error(`GetProperty failed: ${errorMessage}`)
  }
}

/**
 * Get element value
 */
export async function getValue(
  session: SessionState,
  args: {
    refId: string
  }
): Promise<{
  success: boolean
  message: string
  value: string
}> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting element value', { refId })

    const element = getElement(session, refId)
    const value = await element.value()

    logger?.info('Element value retrieved', { refId, value })

    return {
      success: true,
      message: 'Element value retrieved',
      value,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetValue failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`GetValue failed: ${errorMessage}`)
  }
}

/**
 * Get element size
 */
export async function getSize(
  session: SessionState,
  args: {
    refId: string
  }
): Promise<{
  success: boolean
  message: string
  size: {
    width: number
    height: number
  }
}> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting element size', { refId })

    const element = getElement(session, refId)
    const size = await element.size()

    logger?.info('Element size retrieved', { refId, size })

    return {
      success: true,
      message: 'Element size retrieved',
      size: size as any,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetSize failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`GetSize failed: ${errorMessage}`)
  }
}

/**
 * Get element offset (position)
 */
export async function getOffset(
  session: SessionState,
  args: {
    refId: string
  }
): Promise<{
  success: boolean
  message: string
  offset: {
    left: number
    top: number
  }
}> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting element offset', { refId })

    const element = getElement(session, refId)
    const offset = await element.offset()

    logger?.info('Element offset retrieved', { refId, offset })

    return {
      success: true,
      message: 'Element offset retrieved',
      offset: offset as any,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetOffset failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`GetOffset failed: ${errorMessage}`)
  }
}

/**
 * Trigger an event on the element
 */
export async function trigger(
  session: SessionState,
  args: {
    refId: string
    type: string
    detail?: Record<string, any>
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, type, detail } = args
  const logger = session.logger

  try {
    logger?.info('Triggering event', { refId, type, detail })

    const element = getElement(session, refId)
    await element.trigger(type, detail)

    logger?.info('Event triggered successfully', { refId, type })

    return {
      success: true,
      message: `Event "${type}" triggered on element: ${refId}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Trigger failed', {
      error: errorMessage,
      refId,
      type,
    })

    throw new Error(`Trigger failed: ${errorMessage}`)
  }
}

/**
 * Get element style value
 */
export async function getStyle(
  session: SessionState,
  args: {
    refId: string
    name: string
  }
): Promise<{
  success: boolean
  message: string
  value: string
}> {
  const { refId, name } = args
  const logger = session.logger

  try {
    logger?.info('Getting element style', { refId, name })

    const element = getElement(session, refId)
    const value = await element.style(name)

    logger?.info('Element style retrieved', { refId, name, value })

    return {
      success: true,
      message: `Style "${name}" retrieved`,
      value,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetStyle failed', {
      error: errorMessage,
      refId,
      name,
    })

    throw new Error(`GetStyle failed: ${errorMessage}`)
  }
}

/**
 * Touch start on element
 */
export async function touchstart(
  session: SessionState,
  args: {
    refId: string
    touches: any[]
    changedTouches: any[]
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, touches, changedTouches } = args
  const logger = session.logger

  try {
    logger?.info('Touch start on element', { refId, touches, changedTouches })

    const element = getElement(session, refId)
    await element.touchstart({ touches, changedTouches })

    logger?.info('Touch start successful', { refId })

    return {
      success: true,
      message: `Touch start on element: ${refId}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Touchstart failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`Touchstart failed: ${errorMessage}`)
  }
}

/**
 * Touch move on element
 */
export async function touchmove(
  session: SessionState,
  args: {
    refId: string
    touches: any[]
    changedTouches: any[]
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, touches, changedTouches } = args
  const logger = session.logger

  try {
    logger?.info('Touch move on element', { refId, touches, changedTouches })

    const element = getElement(session, refId)
    await element.touchmove({ touches, changedTouches })

    logger?.info('Touch move successful', { refId })

    return {
      success: true,
      message: `Touch move on element: ${refId}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Touchmove failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`Touchmove failed: ${errorMessage}`)
  }
}

/**
 * Touch end on element
 */
export async function touchend(
  session: SessionState,
  args: {
    refId: string
    touches: any[]
    changedTouches: any[]
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, touches, changedTouches } = args
  const logger = session.logger

  try {
    logger?.info('Touch end on element', { refId, touches, changedTouches })

    const element = getElement(session, refId)
    await element.touchend({ touches, changedTouches })

    logger?.info('Touch end successful', { refId })

    return {
      success: true,
      message: `Touch end on element: ${refId}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Touchend failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`Touchend failed: ${errorMessage}`)
  }
}

/**
 * Scroll to position (ScrollView only)
 */
export async function scrollTo(
  session: SessionState,
  args: {
    refId: string
    x: number
    y: number
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, x, y } = args
  const logger = session.logger

  try {
    logger?.info('Scrolling element to position', { refId, x, y })

    const element = getElement(session, refId)
    await element.scrollTo(x, y)

    logger?.info('Scroll successful', { refId, x, y })

    return {
      success: true,
      message: `Scrolled to (${x}, ${y})`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('ScrollTo failed', {
      error: errorMessage,
      refId,
      x,
      y,
    })

    throw new Error(`ScrollTo failed: ${errorMessage}`)
  }
}

/**
 * Get scroll width (ScrollView only)
 */
export async function scrollWidth(
  session: SessionState,
  args: {
    refId: string
  }
): Promise<{
  success: boolean
  message: string
  width: number
}> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting scroll width', { refId })

    const element = getElement(session, refId)
    const width = await element.scrollWidth()

    logger?.info('Scroll width retrieved', { refId, width })

    return {
      success: true,
      message: 'Scroll width retrieved',
      width,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('ScrollWidth failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`ScrollWidth failed: ${errorMessage}`)
  }
}

/**
 * Get scroll height (ScrollView only)
 */
export async function scrollHeight(
  session: SessionState,
  args: {
    refId: string
  }
): Promise<{
  success: boolean
  message: string
  height: number
}> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting scroll height', { refId })

    const element = getElement(session, refId)
    const height = await element.scrollHeight()

    logger?.info('Scroll height retrieved', { refId, height })

    return {
      success: true,
      message: 'Scroll height retrieved',
      height,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('ScrollHeight failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`ScrollHeight failed: ${errorMessage}`)
  }
}

/**
 * Swipe to index (Swiper only)
 */
export async function swipeTo(
  session: SessionState,
  args: {
    refId: string
    index: number
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, index } = args
  const logger = session.logger

  try {
    logger?.info('Swiping to index', { refId, index })

    const element = getElement(session, refId)
    await element.swipeTo(index)

    logger?.info('Swipe successful', { refId, index })

    return {
      success: true,
      message: `Swiped to index ${index}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('SwipeTo failed', {
      error: errorMessage,
      refId,
      index,
    })

    throw new Error(`SwipeTo failed: ${errorMessage}`)
  }
}

/**
 * Move to position (MovableView only)
 */
export async function moveTo(
  session: SessionState,
  args: {
    refId: string
    x: number
    y: number
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, x, y } = args
  const logger = session.logger

  try {
    logger?.info('Moving element to position', { refId, x, y })

    const element = getElement(session, refId)
    await element.moveTo(x, y)

    logger?.info('Move successful', { refId, x, y })

    return {
      success: true,
      message: `Moved to (${x}, ${y})`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('MoveTo failed', {
      error: errorMessage,
      refId,
      x,
      y,
    })

    throw new Error(`MoveTo failed: ${errorMessage}`)
  }
}

/**
 * Slide to value (Slider only)
 */
export async function slideTo(
  session: SessionState,
  args: {
    refId: string
    value: number
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, value } = args
  const logger = session.logger

  try {
    logger?.info('Sliding to value', { refId, value })

    const element = getElement(session, refId)
    await element.slideTo(value)

    logger?.info('Slide successful', { refId, value })

    return {
      success: true,
      message: `Slid to value ${value}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('SlideTo failed', {
      error: errorMessage,
      refId,
      value,
    })

    throw new Error(`SlideTo failed: ${errorMessage}`)
  }
}

/**
 * Call context method (ContextElement only)
 */
export async function callContextMethod(
  session: SessionState,
  args: {
    refId: string
    method: string
    args?: any[]
  }
): Promise<{
  success: boolean
  message: string
  result?: any
}> {
  const { refId, method, args: methodArgs = [] } = args
  const logger = session.logger

  try {
    logger?.info('Calling context method', { refId, method, args: methodArgs })

    const element = getElement(session, refId)
    const result = await element.callContextMethod(method, ...methodArgs)

    logger?.info('Context method called successfully', { refId, method, result })

    return {
      success: true,
      message: `Context method "${method}" called successfully`,
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('CallContextMethod failed', {
      error: errorMessage,
      refId,
      method,
    })

    throw new Error(`CallContextMethod failed: ${errorMessage}`)
  }
}

/**
 * Set data on custom element (CustomElement only)
 */
export async function setData(
  session: SessionState,
  args: {
    refId: string
    data: Record<string, any>
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { refId, data } = args
  const logger = session.logger

  try {
    logger?.info('Setting element data', { refId, data })

    const element = getElement(session, refId)
    await element.setData(data)

    logger?.info('Element data set successfully', { refId, keys: Object.keys(data) })

    return {
      success: true,
      message: `Element data updated with ${Object.keys(data).length} keys`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('SetData failed', {
      error: errorMessage,
      refId,
      data,
    })

    throw new Error(`SetData failed: ${errorMessage}`)
  }
}

/**
 * Call method on custom element (CustomElement only)
 */
export async function callMethod(
  session: SessionState,
  args: {
    refId: string
    method: string
    args?: any[]
  }
): Promise<{
  success: boolean
  message: string
  result?: any
}> {
  const { refId, method, args: methodArgs = [] } = args
  const logger = session.logger

  try {
    logger?.info('Calling element method', { refId, method, args: methodArgs })

    const element = getElement(session, refId)
    const result = await element.callMethod(method, ...methodArgs)

    logger?.info('Element method called successfully', { refId, method, result })

    return {
      success: true,
      message: `Element method "${method}" called successfully`,
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('CallMethod failed', {
      error: errorMessage,
      refId,
      method,
    })

    throw new Error(`CallMethod failed: ${errorMessage}`)
  }
}
