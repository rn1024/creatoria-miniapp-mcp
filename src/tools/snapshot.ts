/**
 * Snapshot tools for MCP server
 * Provides utilities for capturing page and application state snapshots
 */

import type { SessionState } from '../types.js'
import * as miniprogramTools from './miniprogram.js'
import * as pageTools from './page.js'

/**
 * Capture a complete page snapshot (data + screenshot)
 * Includes page data, page info, and screenshot
 */
export async function snapshotPage(
  session: SessionState,
  args: {
    pagePath?: string
    filename?: string
    includeScreenshot?: boolean
    fullPage?: boolean
  }
): Promise<{
  success: boolean
  message: string
  snapshotPath: string
  screenshotPath?: string
  data: {
    timestamp: string
    pagePath: string
    pageData: any
    pageQuery: Record<string, any>
  }
}> {
  const { pagePath, filename, includeScreenshot = true, fullPage = false } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    if (!session.outputManager) {
      throw new Error('OutputManager not available')
    }

    logger?.info('Capturing page snapshot', { pagePath, includeScreenshot })

    // Get current page from session or specified path
    const pageStackResult = await miniprogramTools.getPageStack(session)
    const currentPageInfo = pageStackResult.pages[pageStackResult.pages.length - 1]

    if (!currentPageInfo) {
      throw new Error('No active page found')
    }

    // Get page data
    const pageDataResult = await pageTools.getData(session, { pagePath })

    // Build snapshot data
    const timestamp = new Date().toISOString()
    const snapshotData = {
      timestamp,
      pagePath: currentPageInfo.path,
      pageData: pageDataResult.data,
      pageQuery: currentPageInfo.query,
    }

    // Save snapshot JSON
    const outputManager = session.outputManager
    await outputManager.ensureOutputDir()

    const snapshotFilename =
      filename || outputManager.generateFilename('snapshot', 'json')
    const snapshotPath = await outputManager.writeFile(
      snapshotFilename,
      Buffer.from(JSON.stringify(snapshotData, null, 2))
    )

    logger?.info('Page snapshot data saved', { path: snapshotPath })

    // Take screenshot if requested
    let screenshotPath: string | undefined
    if (includeScreenshot) {
      const screenshotFilename = snapshotFilename.replace('.json', '.png')
      const screenshotResult = await miniprogramTools.screenshot(session, {
        filename: screenshotFilename,
        fullPage,
      })
      screenshotPath = screenshotResult.path

      logger?.info('Page screenshot saved', { path: screenshotPath })
    }

    logger?.info('Page snapshot completed', { snapshotPath, screenshotPath })

    return {
      success: true,
      message: 'Page snapshot captured successfully',
      snapshotPath,
      screenshotPath,
      data: snapshotData,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Page snapshot failed', {
      error: errorMessage,
      pagePath,
    })

    throw new Error(`Page snapshot failed: ${errorMessage}`)
  }
}

/**
 * Capture a complete application snapshot
 * Includes system info, page stack, current page data, and screenshot
 */
export async function snapshotFull(
  session: SessionState,
  args: {
    filename?: string
    includeScreenshot?: boolean
    fullPage?: boolean
  }
): Promise<{
  success: boolean
  message: string
  snapshotPath: string
  screenshotPath?: string
  data: {
    timestamp: string
    systemInfo: any
    pageStack: Array<{ path: string; query: Record<string, any> }>
    currentPage: {
      path: string
      query: Record<string, any>
      data: any
    }
  }
}> {
  const { filename, includeScreenshot = true, fullPage = false } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    if (!session.outputManager) {
      throw new Error('OutputManager not available')
    }

    logger?.info('Capturing full application snapshot', { includeScreenshot })

    // Get system info
    const systemInfoResult = await miniprogramTools.getSystemInfo(session)

    // Get page stack
    const pageStackResult = await miniprogramTools.getPageStack(session)
    const currentPageInfo =
      pageStackResult.pages[pageStackResult.pages.length - 1]

    if (!currentPageInfo) {
      throw new Error('No active page found')
    }

    // Get current page data
    const pageDataResult = await pageTools.getData(session, {})

    // Build snapshot data
    const timestamp = new Date().toISOString()
    const snapshotData = {
      timestamp,
      systemInfo: systemInfoResult.systemInfo,
      pageStack: pageStackResult.pages,
      currentPage: {
        path: currentPageInfo.path,
        query: currentPageInfo.query,
        data: pageDataResult.data,
      },
    }

    // Save snapshot JSON
    const outputManager = session.outputManager
    await outputManager.ensureOutputDir()

    const snapshotFilename =
      filename || outputManager.generateFilename('snapshot', 'json')
    const snapshotPath = await outputManager.writeFile(
      snapshotFilename,
      Buffer.from(JSON.stringify(snapshotData, null, 2))
    )

    logger?.info('Application snapshot data saved', { path: snapshotPath })

    // Take screenshot if requested
    let screenshotPath: string | undefined
    if (includeScreenshot) {
      const screenshotFilename = snapshotFilename.replace('.json', '.png')
      const screenshotResult = await miniprogramTools.screenshot(session, {
        filename: screenshotFilename,
        fullPage,
      })
      screenshotPath = screenshotResult.path

      logger?.info('Application screenshot saved', { path: screenshotPath })
    }

    logger?.info('Full application snapshot completed', {
      snapshotPath,
      screenshotPath,
    })

    return {
      success: true,
      message: 'Full application snapshot captured successfully',
      snapshotPath,
      screenshotPath,
      data: snapshotData,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Full application snapshot failed', {
      error: errorMessage,
    })

    throw new Error(`Full application snapshot failed: ${errorMessage}`)
  }
}

/**
 * Capture an element snapshot (properties + screenshot)
 * Includes element attributes, properties, size, and optional screenshot
 */
export async function snapshotElement(
  session: SessionState,
  args: {
    refId: string
    filename?: string
    includeScreenshot?: boolean
  }
): Promise<{
  success: boolean
  message: string
  snapshotPath: string
  screenshotPath?: string
  data: {
    timestamp: string
    refId: string
    text?: string
    attributes: Record<string, any>
    size: { width: number; height: number } | null
    offset: { left: number; top: number } | null
  }
}> {
  const { refId, filename, includeScreenshot = false } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    if (!session.outputManager) {
      throw new Error('OutputManager not available')
    }

    logger?.info('Capturing element snapshot', { refId, includeScreenshot })

    // Import element tools dynamically to avoid circular dependency
    const elementTools = await import('./element.js')

    // Get element text
    let text: string | undefined
    try {
      const textResult = await elementTools.getText(session, { refId })
      text = textResult.text
    } catch {
      // Element might not have text
      text = undefined
    }

    // Get element size
    const sizeResult = await elementTools.getSize(session, { refId })

    // Get element offset
    const offsetResult = await elementTools.getOffset(session, { refId })

    // Build snapshot data
    const timestamp = new Date().toISOString()
    const snapshotData = {
      timestamp,
      refId,
      text,
      attributes: {}, // We would need to know which attributes to get
      size: sizeResult.size,
      offset: offsetResult.offset,
    }

    // Save snapshot JSON
    const outputManager = session.outputManager
    await outputManager.ensureOutputDir()

    const snapshotFilename =
      filename || outputManager.generateFilename('snapshot', 'json')
    const snapshotPath = await outputManager.writeFile(
      snapshotFilename,
      Buffer.from(JSON.stringify(snapshotData, null, 2))
    )

    logger?.info('Element snapshot data saved', { path: snapshotPath })

    // Take screenshot if requested
    let screenshotPath: string | undefined
    if (includeScreenshot) {
      const screenshotFilename = snapshotFilename.replace('.json', '.png')
      const screenshotResult = await miniprogramTools.screenshot(session, {
        filename: screenshotFilename,
      })
      screenshotPath = screenshotResult.path

      logger?.info('Element screenshot saved', { path: screenshotPath })
    }

    logger?.info('Element snapshot completed', {
      snapshotPath,
      screenshotPath,
    })

    return {
      success: true,
      message: 'Element snapshot captured successfully',
      snapshotPath,
      screenshotPath,
      data: snapshotData,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Element snapshot failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`Element snapshot failed: ${errorMessage}`)
  }
}
