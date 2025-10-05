/**
 * Page tool implementations
 * Handles page-level operations: query elements, data access, method calls
 */

import type { SessionState } from '../types.js'
import { resolvePage } from '../runtime/element/element-ref.js'
import { generateRefId } from '../runtime/element/element-ref.js'

/**
 * Query a single element on the page
 * Returns an ElementRef that can be used in subsequent element operations
 */
export async function query(
  session: SessionState,
  args: {
    selector: string
    pagePath?: string
    save?: boolean
  }
): Promise<{
  success: boolean
  message: string
  refId?: string
  exists: boolean
}> {
  const { selector, pagePath, save = true } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Querying element', { selector, pagePath })

    // Resolve page (current or specified)
    const page = await resolvePage(session, pagePath)

    // Query element
    const element = await page.$(selector)

    if (!element) {
      logger?.info('Element not found', { selector })
      return {
        success: true,
        message: `Element not found: ${selector}`,
        exists: false,
      }
    }

    // Save element to session if requested
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
    logger?.error('Query failed', {
      error: errorMessage,
      selector,
    })

    throw new Error(`Query failed: ${errorMessage}`)
  }
}

/**
 * Query all matching elements on the page
 * Returns an array of ElementRefs
 */
export async function queryAll(
  session: SessionState,
  args: {
    selector: string
    pagePath?: string
    save?: boolean
  }
): Promise<{
  success: boolean
  message: string
  refIds?: string[]
  count: number
}> {
  const { selector, pagePath, save = true } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Querying all elements', { selector, pagePath })

    // Resolve page (current or specified)
    const page = await resolvePage(session, pagePath)

    // Query all elements
    const elements = await page.$$(selector)
    const count = elements.length

    logger?.info(`Found ${count} elements`, { selector })

    // Save elements to session if requested
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
    logger?.error('QueryAll failed', {
      error: errorMessage,
      selector,
    })

    throw new Error(`QueryAll failed: ${errorMessage}`)
  }
}

/**
 * Wait for a condition to be met
 * Supports: selector (string), timeout (number), or function
 */
export async function waitFor(
  session: SessionState,
  args: {
    condition: string | number
    pagePath?: string
    timeout?: number
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { condition, pagePath, timeout } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Waiting for condition', { condition, pagePath, timeout })

    // Resolve page (current or specified)
    const page = await resolvePage(session, pagePath)

    // Wait for condition
    if (typeof condition === 'number') {
      await page.waitFor(condition)
      logger?.info(`Waited for ${condition}ms`)
      return {
        success: true,
        message: `Waited for ${condition}ms`,
      }
    } else {
      // String condition (selector)
      await page.waitFor(condition)
      logger?.info(`Waited for selector: ${condition}`)
      return {
        success: true,
        message: `Element appeared: ${condition}`,
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('WaitFor failed', {
      error: errorMessage,
      condition,
    })

    throw new Error(`WaitFor failed: ${errorMessage}`)
  }
}

/**
 * Get page data
 * Optionally specify a path to get nested data
 */
export async function getData(
  session: SessionState,
  args: {
    path?: string
    pagePath?: string
  } = {}
): Promise<{
  success: boolean
  message: string
  data: any
}> {
  const { path, pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting page data', { path, pagePath })

    // Resolve page (current or specified)
    const page = await resolvePage(session, pagePath)

    // Get data
    const data = await page.data(path)

    logger?.info('Page data retrieved', { path, dataType: typeof data })

    return {
      success: true,
      message: path ? `Data at path "${path}" retrieved` : 'Page data retrieved',
      data,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetData failed', {
      error: errorMessage,
      path,
    })

    throw new Error(`GetData failed: ${errorMessage}`)
  }
}

/**
 * Set page data
 * Updates the page's data object
 */
export async function setData(
  session: SessionState,
  args: {
    data: Record<string, any>
    pagePath?: string
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { data, pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Setting page data', { data, pagePath })

    // Resolve page (current or specified)
    const page = await resolvePage(session, pagePath)

    // Set data
    await page.setData(data)

    logger?.info('Page data set successfully', { keys: Object.keys(data) })

    return {
      success: true,
      message: `Page data updated with ${Object.keys(data).length} keys`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('SetData failed', {
      error: errorMessage,
      data,
    })

    throw new Error(`SetData failed: ${errorMessage}`)
  }
}

/**
 * Call a method on the page
 * Invokes a method defined in the page's JS logic
 */
export async function callMethod(
  session: SessionState,
  args: {
    method: string
    args?: any[]
    pagePath?: string
  }
): Promise<{
  success: boolean
  message: string
  result?: any
}> {
  const { method, args: methodArgs = [], pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Calling page method', { method, args: methodArgs, pagePath })

    // Resolve page (current or specified)
    const page = await resolvePage(session, pagePath)

    // Call method
    const result = await page.callMethod(method, ...methodArgs)

    logger?.info('Page method called successfully', { method, result })

    return {
      success: true,
      message: `Method "${method}" called successfully`,
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('CallMethod failed', {
      error: errorMessage,
      method,
    })

    throw new Error(`CallMethod failed: ${errorMessage}`)
  }
}

/**
 * Get page size
 * Returns page width, height, and scrollable height
 */
export async function getSize(
  session: SessionState,
  args: {
    pagePath?: string
  } = {}
): Promise<{
  success: boolean
  message: string
  size: {
    width: number
    height: number
    scrollHeight: number
  }
}> {
  const { pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting page size', { pagePath })

    // Resolve page (current or specified)
    const page = await resolvePage(session, pagePath)

    // Get size
    const size = await page.size()

    logger?.info('Page size retrieved', { size })

    return {
      success: true,
      message: 'Page size retrieved',
      size: size as any,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetSize failed', {
      error: errorMessage,
    })

    throw new Error(`GetSize failed: ${errorMessage}`)
  }
}

/**
 * Get page scroll position
 * Returns the current vertical scroll offset
 */
export async function getScrollTop(
  session: SessionState,
  args: {
    pagePath?: string
  } = {}
): Promise<{
  success: boolean
  message: string
  scrollTop: number
}> {
  const { pagePath } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting page scrollTop', { pagePath })

    // Resolve page (current or specified)
    const page = await resolvePage(session, pagePath)

    // Get scrollTop
    const scrollTop = await page.scrollTop()

    logger?.info('Page scrollTop retrieved', { scrollTop })

    return {
      success: true,
      message: 'Page scroll position retrieved',
      scrollTop,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('GetScrollTop failed', {
      error: errorMessage,
    })

    throw new Error(`GetScrollTop failed: ${errorMessage}`)
  }
}
