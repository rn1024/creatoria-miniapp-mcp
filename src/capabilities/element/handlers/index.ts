/**
 * Element handlers exports
 *
 * All 23 handlers are now independently implemented in this directory.
 */

export {
  // Basic interactions
  tap,
  longpress,
  input,
  // Text & value
  getText,
  getValue,
  // Attributes & properties
  getAttribute,
  getProperty,
  getStyle,
  // Size & position
  getSize,
  getOffset,
  // Events
  trigger,
  touchstart,
  touchmove,
  touchend,
  // ScrollView
  scrollTo,
  scrollWidth,
  scrollHeight,
  // Swiper
  swipeTo,
  // MovableView
  moveTo,
  // Slider
  slideTo,
  // Custom element
  callContextMethod,
  setData,
  callMethod,
  // Types
  type TapArgs,
  type TapResult,
  type LongpressArgs,
  type LongpressResult,
  type InputArgs,
  type InputResult,
  type GetTextArgs,
  type GetTextResult,
  type GetValueArgs,
  type GetValueResult,
  type GetAttributeArgs,
  type GetAttributeResult,
  type GetPropertyArgs,
  type GetPropertyResult,
  type GetStyleArgs,
  type GetStyleResult,
  type GetSizeArgs,
  type GetSizeResult,
  type GetOffsetArgs,
  type GetOffsetResult,
  type TriggerArgs,
  type TriggerResult,
  type TouchArgs,
  type TouchResult,
  type ScrollToArgs,
  type ScrollToResult,
  type ScrollWidthArgs,
  type ScrollWidthResult,
  type ScrollHeightArgs,
  type ScrollHeightResult,
  type SwipeToArgs,
  type SwipeToResult,
  type MoveToArgs,
  type MoveToResult,
  type SlideToArgs,
  type SlideToResult,
  type CallContextMethodArgs,
  type CallContextMethodResult,
  type SetDataArgs,
  type SetDataResult,
  type CallMethodArgs,
  type CallMethodResult,
} from './element-handlers.js'
