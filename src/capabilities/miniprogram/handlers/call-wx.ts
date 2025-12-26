/**
 * CallWx handler - Call WeChat API methods (wx.*)
 */

import type { SessionState } from '../../../types.js'
import { withTimeout, getTimeout, DEFAULT_TIMEOUTS } from '../../../runtime/timeout/timeout.js'

/**
 * CallWx input arguments
 */
export interface CallWxArgs {
  method: string
  args?: any[]
}

/**
 * CallWx result
 */
export interface CallWxResult {
  success: boolean
  message: string
  result?: any
}

/**
 * Call a WeChat API method (wx.*)
 */
export async function callWx(session: SessionState, args: CallWxArgs): Promise<CallWxResult> {
  const { method, args: wxArgs = [] } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info(`Calling wx.${method}`, { args: wxArgs })

    // Get timeout for wx API calls
    const timeoutMs = getTimeout(session.config?.timeout, DEFAULT_TIMEOUTS.callWx)

    // Call WX API method with timeout protection
    const result = await withTimeout(
      session.miniProgram.callWxMethod(method, ...wxArgs),
      timeoutMs,
      `wx.${method} call`
    )

    logger?.info(`wx.${method} call successful`, { result })

    return {
      success: true,
      message: `Successfully called wx.${method}`,
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error(`wx.${method} call failed`, {
      error: errorMessage,
      method,
      args: wxArgs,
    })

    throw new Error(`wx.${method} call failed: ${errorMessage}`)
  }
}
