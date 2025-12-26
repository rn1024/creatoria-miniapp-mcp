/**
 * PageStack handler - Get current page stack
 */

import type { SessionState } from '../../../types.js'
import { withTimeout, getTimeout, DEFAULT_TIMEOUTS } from '../../../runtime/timeout/timeout.js'

/**
 * PageStack result
 */
export interface PageStackResult {
  success: boolean
  message: string
  pages: Array<{ path: string; query: Record<string, any> }>
}

/**
 * Get current page stack
 */
export async function getPageStack(session: SessionState): Promise<PageStackResult> {
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting page stack')

    // Get page stack with timeout protection
    const timeoutMs = getTimeout(session.config?.timeout, DEFAULT_TIMEOUTS.pageStack)
    const pageStack = await withTimeout(
      session.miniProgram.pageStack(),
      timeoutMs,
      'Get page stack'
    ) as any[]

    // Update session page stack
    session.pages = pageStack

    const pages = pageStack.map((page: any) => ({
      path: page.path,
      query: page.query || {},
    }))

    logger?.info('Page stack retrieved', { count: pages.length })

    return {
      success: true,
      message: 'Page stack retrieved successfully',
      pages,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to get page stack', { error: errorMessage })

    throw new Error(`Failed to get page stack: ${errorMessage}`)
  }
}
