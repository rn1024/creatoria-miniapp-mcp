/**
 * Page handlers - Page-level operations
 * Handles element queries, data access, method calls, and page metrics
 */

import type { SessionState } from '../../../types.js'
import { resolvePage, generateRefId } from '../../../runtime/element/element-ref.js'

// ============================================================================
// Query Handlers
// ============================================================================

/**
 * Query input arguments
 */
export interface QueryArgs {
  selector: string
  pagePath?: string
  save?: boolean
}

/**
 * Query result
 */
export interface QueryResult {
  success: boolean
  message: string
  refId?: string
  exists: boolean
}

/**
 * Query a single element on the page
 * Returns an ElementRef that can be used in subsequent element operations
 */
export async function query(session: SessionState, args: QueryArgs): Promise<QueryResult> {
  const { selector, pagePath, save = true } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Querying element', { selector, pagePath })

    const page = await resolvePage(session, pagePath)
    const element = await page.$(selector)

    if (!element) {
      logger?.info('Element not found', { selector })
      return {
        success: true,
        message: `Element not found: ${selector}`,
        exists: false,
      }
    }

    let refId: string | undefined
    if (save) {
      refId = generateRefId()
      session.elements.set(refId, {
        element,
        pagePath: page.path || 'unknown',
        cachedAt: new Date(),
      })
      logger?.info(`Cached element with refId: ${refId}`, { selector, pagePath: page.path })
    }

    logger?.info('Element queried successfully', { selector, refId })

    return {
      success: true,
      message: `Element found: ${selector}`,
      refId,
      exists: true,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Query failed', { error: errorMessage, selector })
    throw new Error(`Query failed: ${errorMessage}`)
  }
}

/**
 * QueryAll input arguments
 */
export interface QueryAllArgs {
  selector: string
  pagePath?: string
  save?: boolean
}

/**
 * QueryAll result
 */
export interface QueryAllResult {
  success: boolean
  message: string
  refIds?: string[]
  count: number
}

/**
 * Query all matching elements on the page
 */
export async function queryAll(session: SessionState, args: QueryAllArgs): Promise<QueryAllResult> {
  const { selector, pagePath, save = true } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Querying all elements', { selector, pagePath })

    const page = await resolvePage(session, pagePath)
    const elements = await page.$$(selector)
    const count = elements.length

    logger?.info(`Found ${count} elements`, { selector })

    let refIds: string[] | undefined
    if (save && count > 0) {
      refIds = []
      for (const element of elements) {
        const refId = generateRefId()
        session.elements.set(refId, {
          element,
          pagePath: page.path || 'unknown',
          cachedAt: new Date(),
        })
        refIds.push(refId)
      }
      logger?.info(`Cached ${count} elements`, { selector, refIds, pagePath: page.path })
    }

    return {
      success: true,
      message: `Found ${count} elements matching: ${selector}`,
      refIds,
      count,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('QueryAll failed', { error: errorMessage, selector })
    throw new Error(`QueryAll failed: ${errorMessage}`)
  }
}

// ============================================================================
// Wait Handler
// ============================================================================

/**
 * WaitFor input arguments
 */
export interface WaitForArgs {
  condition: string | number
  pagePath?: string
  timeout?: number
}

/**
 * WaitFor result
 */
export interface WaitForResult {
  success: boolean
  message: string
}

/**
 * Wait for a condition to be met
 */
export async function waitFor(session: SessionState, args: WaitForArgs): Promise<WaitForResult> {
  const { condition, pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Waiting for condition', { condition, pagePath })

    const page = await resolvePage(session, pagePath)

    if (typeof condition === 'number') {
      await page.waitFor(condition)
      logger?.info(`Waited for ${condition}ms`)
      return {
        success: true,
        message: `Waited for ${condition}ms`,
      }
    } else {
      await page.waitFor(condition)
      logger?.info(`Waited for selector: ${condition}`)
      return {
        success: true,
        message: `Element appeared: ${condition}`,
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('WaitFor failed', { error: errorMessage, condition })
    throw new Error(`WaitFor failed: ${errorMessage}`)
  }
}

// ============================================================================
// Data Handlers
// ============================================================================

/**
 * GetData input arguments
 */
export interface GetDataArgs {
  path?: string
  pagePath?: string
}

/**
 * GetData result
 */
export interface GetDataResult {
  success: boolean
  message: string
  data: any
}

/**
 * Get page data
 */
export async function getData(
  session: SessionState,
  args: GetDataArgs = {}
): Promise<GetDataResult> {
  const { path, pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting page data', { path, pagePath })

    const page = await resolvePage(session, pagePath)
    const data = await page.data(path)

    logger?.info('Page data retrieved', { path, dataType: typeof data })

    return {
      success: true,
      message: path ? `Data at path "${path}" retrieved` : 'Page data retrieved',
      data,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetData failed', { error: errorMessage, path })
    throw new Error(`GetData failed: ${errorMessage}`)
  }
}

/**
 * SetData input arguments
 */
export interface SetDataArgs {
  data: Record<string, any>
  pagePath?: string
}

/**
 * SetData result
 */
export interface SetDataResult {
  success: boolean
  message: string
}

/**
 * Set page data
 */
export async function setData(session: SessionState, args: SetDataArgs): Promise<SetDataResult> {
  const { data, pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Setting page data', { data, pagePath })

    const page = await resolvePage(session, pagePath)
    await page.setData(data)

    logger?.info('Page data set successfully', { keys: Object.keys(data) })

    return {
      success: true,
      message: `Page data updated with ${Object.keys(data).length} keys`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('SetData failed', { error: errorMessage, data })
    throw new Error(`SetData failed: ${errorMessage}`)
  }
}

// ============================================================================
// Method Handler
// ============================================================================

/**
 * CallMethod input arguments
 */
export interface CallMethodArgs {
  method: string
  args?: any[]
  pagePath?: string
}

/**
 * CallMethod result
 */
export interface CallMethodResult {
  success: boolean
  message: string
  result?: any
}

/**
 * Call a method on the page
 */
export async function callMethod(
  session: SessionState,
  args: CallMethodArgs
): Promise<CallMethodResult> {
  const { method, args: methodArgs = [], pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Calling page method', { method, args: methodArgs, pagePath })

    const page = await resolvePage(session, pagePath)
    const result = await page.callMethod(method, ...methodArgs)

    logger?.info('Page method called successfully', { method, result })

    return {
      success: true,
      message: `Method "${method}" called successfully`,
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('CallMethod failed', { error: errorMessage, method })
    throw new Error(`CallMethod failed: ${errorMessage}`)
  }
}

// ============================================================================
// Size & Scroll Handlers
// ============================================================================

/**
 * GetSize input arguments
 */
export interface GetSizeArgs {
  pagePath?: string
}

/**
 * GetSize result
 */
export interface GetSizeResult {
  success: boolean
  message: string
  size: {
    width: number
    height: number
    scrollHeight: number
  }
}

/**
 * Get page size
 */
export async function getSize(
  session: SessionState,
  args: GetSizeArgs = {}
): Promise<GetSizeResult> {
  const { pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting page size', { pagePath })

    const page = await resolvePage(session, pagePath)
    const size = await page.size()

    logger?.info('Page size retrieved', { size })

    return {
      success: true,
      message: 'Page size retrieved',
      size: size as any,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetSize failed', { error: errorMessage })
    throw new Error(`GetSize failed: ${errorMessage}`)
  }
}

/**
 * GetScrollTop input arguments
 */
export interface GetScrollTopArgs {
  pagePath?: string
}

/**
 * GetScrollTop result
 */
export interface GetScrollTopResult {
  success: boolean
  message: string
  scrollTop: number
}

/**
 * Get page scroll position
 */
export async function getScrollTop(
  session: SessionState,
  args: GetScrollTopArgs = {}
): Promise<GetScrollTopResult> {
  const { pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting page scrollTop', { pagePath })

    const page = await resolvePage(session, pagePath)
    const scrollTop = await page.scrollTop()

    logger?.info('Page scrollTop retrieved', { scrollTop })

    return {
      success: true,
      message: 'Page scroll position retrieved',
      scrollTop,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetScrollTop failed', { error: errorMessage })
    throw new Error(`GetScrollTop failed: ${errorMessage}`)
  }
}
