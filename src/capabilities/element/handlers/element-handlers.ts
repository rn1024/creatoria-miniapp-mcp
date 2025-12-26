/**
 * Element handlers - Element-level operations
 * Handles interactions, attributes, properties, and component-specific methods
 */

import type { SessionState } from '../../../types.js'
import type { Element } from '../../../types/miniprogram-automator.js'

/**
 * Get element from session by refId
 */
function getElement(session: SessionState, refId: string): Element {
  const cached = session.elements.get(refId)
  if (!cached) {
    throw new Error(
      `Element not found with refId: ${refId}. Use page_query to get element reference first.`
    )
  }
  return cached.element
}

// ============================================================================
// Basic Interactions
// ============================================================================

export interface TapArgs {
  refId: string
}

export interface TapResult {
  success: boolean
  message: string
}

export async function tap(session: SessionState, args: TapArgs): Promise<TapResult> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Tapping element', { refId })
    const element = getElement(session, refId)
    await element.tap()
    logger?.info('Element tapped successfully', { refId })
    return { success: true, message: `Element tapped: ${refId}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Tap failed', { error: errorMessage, refId })
    throw new Error(`Tap failed: ${errorMessage}`)
  }
}

export interface LongpressArgs {
  refId: string
}

export interface LongpressResult {
  success: boolean
  message: string
}

export async function longpress(session: SessionState, args: LongpressArgs): Promise<LongpressResult> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Long pressing element', { refId })
    const element = getElement(session, refId)
    await element.longpress()
    logger?.info('Element long pressed successfully', { refId })
    return { success: true, message: `Element long pressed: ${refId}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Longpress failed', { error: errorMessage, refId })
    throw new Error(`Longpress failed: ${errorMessage}`)
  }
}

export interface InputArgs {
  refId: string
  value: string
}

export interface InputResult {
  success: boolean
  message: string
}

export async function input(session: SessionState, args: InputArgs): Promise<InputResult> {
  const { refId, value } = args
  const logger = session.logger

  try {
    logger?.info('Inputting text', { refId, value })
    const element = getElement(session, refId)
    await element.input(value)
    logger?.info('Text input successfully', { refId, value })
    return { success: true, message: `Text input to element: ${refId}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Input failed', { error: errorMessage, refId, value })
    throw new Error(`Input failed: ${errorMessage}`)
  }
}

// ============================================================================
// Text & Value Getters
// ============================================================================

export interface GetTextArgs {
  refId: string
}

export interface GetTextResult {
  success: boolean
  message: string
  text: string
}

export async function getText(session: SessionState, args: GetTextArgs): Promise<GetTextResult> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting element text', { refId })
    const element = getElement(session, refId)
    const text = await element.text()
    logger?.info('Element text retrieved', { refId, text })
    return { success: true, message: 'Element text retrieved', text }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetText failed', { error: errorMessage, refId })
    throw new Error(`GetText failed: ${errorMessage}`)
  }
}

export interface GetValueArgs {
  refId: string
}

export interface GetValueResult {
  success: boolean
  message: string
  value: string
}

export async function getValue(session: SessionState, args: GetValueArgs): Promise<GetValueResult> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting element value', { refId })
    const element = getElement(session, refId)
    const value = await element.value()
    logger?.info('Element value retrieved', { refId, value })
    return { success: true, message: 'Element value retrieved', value }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetValue failed', { error: errorMessage, refId })
    throw new Error(`GetValue failed: ${errorMessage}`)
  }
}

// ============================================================================
// Attribute & Property Getters
// ============================================================================

export interface GetAttributeArgs {
  refId: string
  name: string
}

export interface GetAttributeResult {
  success: boolean
  message: string
  value: string | null
}

export async function getAttribute(session: SessionState, args: GetAttributeArgs): Promise<GetAttributeResult> {
  const { refId, name } = args
  const logger = session.logger

  try {
    logger?.info('Getting element attribute', { refId, name })
    const element = getElement(session, refId)
    const value = await element.attribute(name)
    logger?.info('Element attribute retrieved', { refId, name, value })
    return { success: true, message: `Attribute "${name}" retrieved`, value }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetAttribute failed', { error: errorMessage, refId, name })
    throw new Error(`GetAttribute failed: ${errorMessage}`)
  }
}

export interface GetPropertyArgs {
  refId: string
  name: string
}

export interface GetPropertyResult {
  success: boolean
  message: string
  value: any
}

export async function getProperty(session: SessionState, args: GetPropertyArgs): Promise<GetPropertyResult> {
  const { refId, name } = args
  const logger = session.logger

  try {
    logger?.info('Getting element property', { refId, name })
    const element = getElement(session, refId)
    const value = await element.property(name)
    logger?.info('Element property retrieved', { refId, name, value })
    return { success: true, message: `Property "${name}" retrieved`, value }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetProperty failed', { error: errorMessage, refId, name })
    throw new Error(`GetProperty failed: ${errorMessage}`)
  }
}

export interface GetStyleArgs {
  refId: string
  name: string
}

export interface GetStyleResult {
  success: boolean
  message: string
  value: string
}

export async function getStyle(session: SessionState, args: GetStyleArgs): Promise<GetStyleResult> {
  const { refId, name } = args
  const logger = session.logger

  try {
    logger?.info('Getting element style', { refId, name })
    const element = getElement(session, refId)
    const value = await element.style(name)
    logger?.info('Element style retrieved', { refId, name, value })
    return { success: true, message: `Style "${name}" retrieved`, value }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetStyle failed', { error: errorMessage, refId, name })
    throw new Error(`GetStyle failed: ${errorMessage}`)
  }
}

// ============================================================================
// Size & Position
// ============================================================================

export interface GetSizeArgs {
  refId: string
}

export interface GetSizeResult {
  success: boolean
  message: string
  size: { width: number; height: number }
}

export async function getSize(session: SessionState, args: GetSizeArgs): Promise<GetSizeResult> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting element size', { refId })
    const element = getElement(session, refId)
    const size = await element.size()
    logger?.info('Element size retrieved', { refId, size })
    return { success: true, message: 'Element size retrieved', size: size as any }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetSize failed', { error: errorMessage, refId })
    throw new Error(`GetSize failed: ${errorMessage}`)
  }
}

export interface GetOffsetArgs {
  refId: string
}

export interface GetOffsetResult {
  success: boolean
  message: string
  offset: { left: number; top: number }
}

export async function getOffset(session: SessionState, args: GetOffsetArgs): Promise<GetOffsetResult> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting element offset', { refId })
    const element = getElement(session, refId)
    const offset = await element.offset()
    logger?.info('Element offset retrieved', { refId, offset })
    return { success: true, message: 'Element offset retrieved', offset: offset as any }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetOffset failed', { error: errorMessage, refId })
    throw new Error(`GetOffset failed: ${errorMessage}`)
  }
}

// ============================================================================
// Event Triggering
// ============================================================================

export interface TriggerArgs {
  refId: string
  type: string
  detail?: Record<string, any>
}

export interface TriggerResult {
  success: boolean
  message: string
}

export async function trigger(session: SessionState, args: TriggerArgs): Promise<TriggerResult> {
  const { refId, type, detail } = args
  const logger = session.logger

  try {
    logger?.info('Triggering event', { refId, type, detail })
    const element = getElement(session, refId)
    await element.trigger(type, detail)
    logger?.info('Event triggered successfully', { refId, type })
    return { success: true, message: `Event "${type}" triggered on element: ${refId}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Trigger failed', { error: errorMessage, refId, type })
    throw new Error(`Trigger failed: ${errorMessage}`)
  }
}

// ============================================================================
// Touch Events
// ============================================================================

export interface TouchArgs {
  refId: string
  touches: any[]
  changedTouches: any[]
}

export interface TouchResult {
  success: boolean
  message: string
}

export async function touchstart(session: SessionState, args: TouchArgs): Promise<TouchResult> {
  const { refId, touches, changedTouches } = args
  const logger = session.logger

  try {
    logger?.info('Touch start on element', { refId, touches, changedTouches })
    const element = getElement(session, refId)
    await element.touchstart({ touches, changedTouches })
    logger?.info('Touch start successful', { refId })
    return { success: true, message: `Touch start on element: ${refId}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Touchstart failed', { error: errorMessage, refId })
    throw new Error(`Touchstart failed: ${errorMessage}`)
  }
}

export async function touchmove(session: SessionState, args: TouchArgs): Promise<TouchResult> {
  const { refId, touches, changedTouches } = args
  const logger = session.logger

  try {
    logger?.info('Touch move on element', { refId, touches, changedTouches })
    const element = getElement(session, refId)
    await element.touchmove({ touches, changedTouches })
    logger?.info('Touch move successful', { refId })
    return { success: true, message: `Touch move on element: ${refId}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Touchmove failed', { error: errorMessage, refId })
    throw new Error(`Touchmove failed: ${errorMessage}`)
  }
}

export async function touchend(session: SessionState, args: TouchArgs): Promise<TouchResult> {
  const { refId, touches, changedTouches } = args
  const logger = session.logger

  try {
    logger?.info('Touch end on element', { refId, touches, changedTouches })
    const element = getElement(session, refId)
    await element.touchend({ touches, changedTouches })
    logger?.info('Touch end successful', { refId })
    return { success: true, message: `Touch end on element: ${refId}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Touchend failed', { error: errorMessage, refId })
    throw new Error(`Touchend failed: ${errorMessage}`)
  }
}

// ============================================================================
// ScrollView Operations
// ============================================================================

export interface ScrollToArgs {
  refId: string
  x: number
  y: number
}

export interface ScrollToResult {
  success: boolean
  message: string
}

export async function scrollTo(session: SessionState, args: ScrollToArgs): Promise<ScrollToResult> {
  const { refId, x, y } = args
  const logger = session.logger

  try {
    logger?.info('Scrolling element to position', { refId, x, y })
    const element = getElement(session, refId)
    await element.scrollTo(x, y)
    logger?.info('Scroll successful', { refId, x, y })
    return { success: true, message: `Scrolled to (${x}, ${y})` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('ScrollTo failed', { error: errorMessage, refId, x, y })
    throw new Error(`ScrollTo failed: ${errorMessage}`)
  }
}

export interface ScrollWidthArgs {
  refId: string
}

export interface ScrollWidthResult {
  success: boolean
  message: string
  width: number
}

export async function scrollWidth(session: SessionState, args: ScrollWidthArgs): Promise<ScrollWidthResult> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting scroll width', { refId })
    const element = getElement(session, refId)
    const width = await element.scrollWidth()
    logger?.info('Scroll width retrieved', { refId, width })
    return { success: true, message: 'Scroll width retrieved', width }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('ScrollWidth failed', { error: errorMessage, refId })
    throw new Error(`ScrollWidth failed: ${errorMessage}`)
  }
}

export interface ScrollHeightArgs {
  refId: string
}

export interface ScrollHeightResult {
  success: boolean
  message: string
  height: number
}

export async function scrollHeight(session: SessionState, args: ScrollHeightArgs): Promise<ScrollHeightResult> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Getting scroll height', { refId })
    const element = getElement(session, refId)
    const height = await element.scrollHeight()
    logger?.info('Scroll height retrieved', { refId, height })
    return { success: true, message: 'Scroll height retrieved', height }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('ScrollHeight failed', { error: errorMessage, refId })
    throw new Error(`ScrollHeight failed: ${errorMessage}`)
  }
}

// ============================================================================
// Swiper Operations
// ============================================================================

export interface SwipeToArgs {
  refId: string
  index: number
}

export interface SwipeToResult {
  success: boolean
  message: string
}

export async function swipeTo(session: SessionState, args: SwipeToArgs): Promise<SwipeToResult> {
  const { refId, index } = args
  const logger = session.logger

  try {
    logger?.info('Swiping to index', { refId, index })
    const element = getElement(session, refId)
    await element.swipeTo(index)
    logger?.info('Swipe successful', { refId, index })
    return { success: true, message: `Swiped to index ${index}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('SwipeTo failed', { error: errorMessage, refId, index })
    throw new Error(`SwipeTo failed: ${errorMessage}`)
  }
}

// ============================================================================
// MovableView Operations
// ============================================================================

export interface MoveToArgs {
  refId: string
  x: number
  y: number
}

export interface MoveToResult {
  success: boolean
  message: string
}

export async function moveTo(session: SessionState, args: MoveToArgs): Promise<MoveToResult> {
  const { refId, x, y } = args
  const logger = session.logger

  try {
    logger?.info('Moving element to position', { refId, x, y })
    const element = getElement(session, refId)
    await element.moveTo(x, y)
    logger?.info('Move successful', { refId, x, y })
    return { success: true, message: `Moved to (${x}, ${y})` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('MoveTo failed', { error: errorMessage, refId, x, y })
    throw new Error(`MoveTo failed: ${errorMessage}`)
  }
}

// ============================================================================
// Slider Operations
// ============================================================================

export interface SlideToArgs {
  refId: string
  value: number
}

export interface SlideToResult {
  success: boolean
  message: string
}

export async function slideTo(session: SessionState, args: SlideToArgs): Promise<SlideToResult> {
  const { refId, value } = args
  const logger = session.logger

  try {
    logger?.info('Sliding to value', { refId, value })
    const element = getElement(session, refId)
    await element.slideTo(value)
    logger?.info('Slide successful', { refId, value })
    return { success: true, message: `Slid to value ${value}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('SlideTo failed', { error: errorMessage, refId, value })
    throw new Error(`SlideTo failed: ${errorMessage}`)
  }
}

// ============================================================================
// Custom Element Operations
// ============================================================================

export interface CallContextMethodArgs {
  refId: string
  method: string
  args?: any[]
}

export interface CallContextMethodResult {
  success: boolean
  message: string
  result?: any
}

export async function callContextMethod(session: SessionState, args: CallContextMethodArgs): Promise<CallContextMethodResult> {
  const { refId, method, args: methodArgs = [] } = args
  const logger = session.logger

  try {
    logger?.info('Calling context method', { refId, method, args: methodArgs })
    const element = getElement(session, refId)
    const result = await element.callContextMethod(method, ...methodArgs)
    logger?.info('Context method called successfully', { refId, method, result })
    return { success: true, message: `Context method "${method}" called successfully`, result }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('CallContextMethod failed', { error: errorMessage, refId, method })
    throw new Error(`CallContextMethod failed: ${errorMessage}`)
  }
}

export interface SetDataArgs {
  refId: string
  data: Record<string, any>
}

export interface SetDataResult {
  success: boolean
  message: string
}

export async function setData(session: SessionState, args: SetDataArgs): Promise<SetDataResult> {
  const { refId, data } = args
  const logger = session.logger

  try {
    logger?.info('Setting element data', { refId, data })
    const element = getElement(session, refId)
    await element.setData(data)
    logger?.info('Element data set successfully', { refId, keys: Object.keys(data) })
    return { success: true, message: `Element data updated with ${Object.keys(data).length} keys` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('SetData failed', { error: errorMessage, refId, data })
    throw new Error(`SetData failed: ${errorMessage}`)
  }
}

export interface CallMethodArgs {
  refId: string
  method: string
  args?: any[]
}

export interface CallMethodResult {
  success: boolean
  message: string
  result?: any
}

export async function callMethod(session: SessionState, args: CallMethodArgs): Promise<CallMethodResult> {
  const { refId, method, args: methodArgs = [] } = args
  const logger = session.logger

  try {
    logger?.info('Calling element method', { refId, method, args: methodArgs })
    const element = getElement(session, refId)
    const result = await element.callMethod(method, ...methodArgs)
    logger?.info('Element method called successfully', { refId, method, result })
    return { success: true, message: `Element method "${method}" called successfully`, result }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('CallMethod failed', { error: errorMessage, refId, method })
    throw new Error(`CallMethod failed: ${errorMessage}`)
  }
}
