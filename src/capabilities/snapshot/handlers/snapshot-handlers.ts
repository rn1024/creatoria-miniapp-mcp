/**
 * Snapshot handlers - State capture and diagnostic utilities
 */

import type { SessionState } from '../../../types.js'
import { getPageStack, getSystemInfo, screenshot } from '../../miniprogram/handlers/index.js'
import { getData } from '../../page/handlers/index.js'
import { getText, getSize, getOffset } from '../../element/handlers/index.js'

// ============================================================================
// Page Snapshot
// ============================================================================

export interface SnapshotPageArgs {
  pagePath?: string
  filename?: string
  includeScreenshot?: boolean
  fullPage?: boolean
}

export interface SnapshotPageResult {
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
}

export async function snapshotPage(session: SessionState, args: SnapshotPageArgs): Promise<SnapshotPageResult> {
  const { pagePath, filename, includeScreenshot = true, fullPage = false } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error('MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.')
    }

    if (!session.outputManager) {
      throw new Error('OutputManager not available')
    }

    logger?.info('Capturing page snapshot', { pagePath, includeScreenshot })

    if (filename) {
      const { validateFilename } = await import('../../../runtime/validation/validation.js')
      try {
        validateFilename(filename, ['json'])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Invalid filename: ${errorMessage}`)
      }
    }

    const pageStackResult = await getPageStack(session)
    const currentPageInfo = pageStackResult.pages[pageStackResult.pages.length - 1]

    if (!currentPageInfo) {
      throw new Error('No active page found')
    }

    const pageDataResult = await getData(session, { pagePath })

    const timestamp = new Date().toISOString()
    const snapshotData = {
      timestamp,
      pagePath: currentPageInfo.path,
      pageData: pageDataResult.data,
      pageQuery: currentPageInfo.query,
    }

    const outputManager = session.outputManager
    await outputManager.ensureOutputDir()

    const snapshotFilename = filename || outputManager.generateFilename('snapshot', 'json')
    const snapshotPath = await outputManager.writeFile(
      snapshotFilename,
      Buffer.from(JSON.stringify(snapshotData, null, 2))
    )

    logger?.info('Page snapshot data saved', { path: snapshotPath })

    let screenshotPath: string | undefined
    if (includeScreenshot) {
      const screenshotFilename = snapshotFilename.replace('.json', '.png')
      const screenshotResult = await screenshot(session, { filename: screenshotFilename, fullPage })
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
    logger?.error('Page snapshot failed', { error: errorMessage, pagePath })
    throw new Error(`Page snapshot failed: ${errorMessage}`)
  }
}

// ============================================================================
// Full Application Snapshot
// ============================================================================

export interface SnapshotFullArgs {
  filename?: string
  includeScreenshot?: boolean
  fullPage?: boolean
}

export interface SnapshotFullResult {
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
}

export async function snapshotFull(session: SessionState, args: SnapshotFullArgs): Promise<SnapshotFullResult> {
  const { filename, includeScreenshot = true, fullPage = false } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error('MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.')
    }

    if (!session.outputManager) {
      throw new Error('OutputManager not available')
    }

    logger?.info('Capturing full application snapshot', { includeScreenshot })

    if (filename) {
      const { validateFilename } = await import('../../../runtime/validation/validation.js')
      try {
        validateFilename(filename, ['json'])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Invalid filename: ${errorMessage}`)
      }
    }

    const systemInfoResult = await getSystemInfo(session)
    const pageStackResult = await getPageStack(session)
    const currentPageInfo = pageStackResult.pages[pageStackResult.pages.length - 1]

    if (!currentPageInfo) {
      throw new Error('No active page found')
    }

    const pageDataResult = await getData(session, {})

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

    const outputManager = session.outputManager
    await outputManager.ensureOutputDir()

    const snapshotFilename = filename || outputManager.generateFilename('snapshot', 'json')
    const snapshotPath = await outputManager.writeFile(
      snapshotFilename,
      Buffer.from(JSON.stringify(snapshotData, null, 2))
    )

    logger?.info('Application snapshot data saved', { path: snapshotPath })

    let screenshotPath: string | undefined
    if (includeScreenshot) {
      const screenshotFilename = snapshotFilename.replace('.json', '.png')
      const screenshotResult = await screenshot(session, { filename: screenshotFilename, fullPage })
      screenshotPath = screenshotResult.path
      logger?.info('Application screenshot saved', { path: screenshotPath })
    }

    logger?.info('Full application snapshot completed', { snapshotPath, screenshotPath })

    return {
      success: true,
      message: 'Full application snapshot captured successfully',
      snapshotPath,
      screenshotPath,
      data: snapshotData,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Full application snapshot failed', { error: errorMessage })
    throw new Error(`Full application snapshot failed: ${errorMessage}`)
  }
}

// ============================================================================
// Element Snapshot
// ============================================================================

export interface SnapshotElementArgs {
  refId: string
  filename?: string
  includeScreenshot?: boolean
}

export interface SnapshotElementResult {
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
}

export async function snapshotElement(session: SessionState, args: SnapshotElementArgs): Promise<SnapshotElementResult> {
  const { refId, filename, includeScreenshot = false } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error('MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.')
    }

    if (!session.outputManager) {
      throw new Error('OutputManager not available')
    }

    logger?.info('Capturing element snapshot', { refId, includeScreenshot })

    if (filename) {
      const { validateFilename } = await import('../../../runtime/validation/validation.js')
      try {
        validateFilename(filename, ['json'])
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Invalid filename: ${errorMessage}`)
      }
    }

    let text: string | undefined
    try {
      const textResult = await getText(session, { refId })
      text = textResult.text
    } catch {
      text = undefined
    }

    const sizeResult = await getSize(session, { refId })
    const offsetResult = await getOffset(session, { refId })

    const timestamp = new Date().toISOString()
    const snapshotData = {
      timestamp,
      refId,
      text,
      attributes: {},
      size: sizeResult.size,
      offset: offsetResult.offset,
    }

    const outputManager = session.outputManager
    await outputManager.ensureOutputDir()

    const snapshotFilename = filename || outputManager.generateFilename('snapshot', 'json')
    const snapshotPath = await outputManager.writeFile(
      snapshotFilename,
      Buffer.from(JSON.stringify(snapshotData, null, 2))
    )

    logger?.info('Element snapshot data saved', { path: snapshotPath })

    let screenshotPath: string | undefined
    if (includeScreenshot) {
      const screenshotFilename = snapshotFilename.replace('.json', '.png')
      const screenshotResult = await screenshot(session, { filename: screenshotFilename })
      screenshotPath = screenshotResult.path
      logger?.info('Element screenshot saved', { path: screenshotPath })
    }

    logger?.info('Element snapshot completed', { snapshotPath, screenshotPath })

    return {
      success: true,
      message: 'Element snapshot captured successfully',
      snapshotPath,
      screenshotPath,
      data: snapshotData,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Element snapshot failed', { error: errorMessage, refId })
    throw new Error(`Element snapshot failed: ${errorMessage}`)
  }
}
