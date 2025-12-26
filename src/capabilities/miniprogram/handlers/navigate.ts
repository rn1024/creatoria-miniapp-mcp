/**
 * Navigate handler - Page navigation operations
 */

import type { SessionState } from '../../../types.js'
import { withTimeout, getTimeout, DEFAULT_TIMEOUTS } from '../../../runtime/timeout/timeout.js'

/**
 * Navigate input arguments
 */
export interface NavigateArgs {
  method: 'navigateTo' | 'redirectTo' | 'reLaunch' | 'switchTab' | 'navigateBack'
  url?: string
  delta?: number
}

/**
 * Navigate result
 */
export interface NavigateResult {
  success: boolean
  message: string
  currentPage?: string
}

/**
 * Navigate to a page in the mini program
 * Supports: navigateTo, redirectTo, reLaunch, switchTab, navigateBack
 */
export async function navigate(session: SessionState, args: NavigateArgs): Promise<NavigateResult> {
  const { method, url, delta } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info(`Navigating using ${method}`, { url, delta })

    // Get timeout for navigation operations
    const timeoutMs = getTimeout(session.config?.timeout, DEFAULT_TIMEOUTS.navigation)

    // Execute navigation method with timeout protection
    switch (method) {
      case 'navigateTo':
      case 'redirectTo':
      case 'reLaunch':
      case 'switchTab':
        if (!url) {
          throw new Error(`URL is required for ${method}`)
        }
        await withTimeout(
          session.miniProgram[method](url),
          timeoutMs,
          `Navigation (${method})`
        )
        break

      case 'navigateBack':
        await withTimeout(
          session.miniProgram.navigateBack(delta),
          timeoutMs,
          'Navigation (navigateBack)'
        )
        break

      default:
        throw new Error(`Unknown navigation method: ${method}`)
    }

    // Get current page after navigation with timeout
    const currentPage = await withTimeout(
      session.miniProgram.currentPage(),
      DEFAULT_TIMEOUTS.pageStack,
      'Get current page'
    ) as { path?: string } | null
    const currentPath = currentPage?.path || 'unknown'

    logger?.info(`Navigation successful, current page: ${currentPath}`)

    return {
      success: true,
      message: `Successfully navigated using ${method}`,
      currentPage: currentPath,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error(`Navigation failed`, {
      error: errorMessage,
      method,
      url,
    })

    throw new Error(`Navigation failed: ${errorMessage}`)
  }
}
