/**
 * MiniProgram handlers exports
 *
 * All handlers are now independently implemented in this directory.
 */

export { navigate, type NavigateArgs, type NavigateResult } from './navigate.js'
export { callWx, type CallWxArgs, type CallWxResult } from './call-wx.js'
export { evaluate, type EvaluateArgs, type EvaluateResult } from './evaluate.js'
export { screenshot, type ScreenshotArgs, type ScreenshotResult } from './screenshot.js'
export { getPageStack, type PageStackResult } from './page-stack.js'
export { getSystemInfo, type SystemInfoResult } from './system-info.js'
