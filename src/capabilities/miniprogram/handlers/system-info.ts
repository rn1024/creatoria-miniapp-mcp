/**
 * SystemInfo handler - Get system information
 */

import type { SessionState } from '../../../types.js'
import { withTimeout, getTimeout, DEFAULT_TIMEOUTS } from '../../../runtime/timeout/timeout.js'

/**
 * SystemInfo result
 */
export interface SystemInfoResult {
  success: boolean
  message: string
  systemInfo: any
}

/**
 * Get system information
 */
export async function getSystemInfo(session: SessionState): Promise<SystemInfoResult> {
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting system information')

    // Get system info with timeout protection
    const timeoutMs = getTimeout(session.config?.timeout, DEFAULT_TIMEOUTS.systemInfo)
    const systemInfo = await withTimeout(
      session.miniProgram.systemInfo(),
      timeoutMs,
      'Get system info'
    )

    logger?.info('System information retrieved')

    return {
      success: true,
      message: 'System information retrieved successfully',
      systemInfo,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to get system info', { error: errorMessage })

    throw new Error(`Failed to get system info: ${errorMessage}`)
  }
}
