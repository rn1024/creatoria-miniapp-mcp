/**
 * MiniProgram tool implementations
 * Handles navigation, WX API calls, evaluation, and screenshots
 */

import type { SessionState } from '../types.js'

/**
 * Navigate to a page in the mini program
 * Supports: navigateTo, redirectTo, reLaunch, switchTab, navigateBack
 */
export async function navigate(
  session: SessionState,
  args: {
    method: 'navigateTo' | 'redirectTo' | 'reLaunch' | 'switchTab' | 'navigateBack'
    url?: string
    delta?: number
  }
): Promise<{
  success: boolean
  message: string
  currentPage?: string
}> {
  const { method, url, delta } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info(`Navigating using ${method}`, { url, delta })

    // Execute navigation method
    switch (method) {
      case 'navigateTo':
      case 'redirectTo':
      case 'reLaunch':
      case 'switchTab':
        if (!url) {
          throw new Error(`URL is required for ${method}`)
        }
        await session.miniProgram[method](url)
        break

      case 'navigateBack':
        await session.miniProgram.navigateBack(delta)
        break

      default:
        throw new Error(`Unknown navigation method: ${method}`)
    }

    // Get current page after navigation
    const currentPage = await session.miniProgram.currentPage()
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

/**
 * Call a WeChat API method (wx.*)
 */
export async function callWx(
  session: SessionState,
  args: {
    method: string
    args?: any[]
  }
): Promise<{
  success: boolean
  message: string
  result?: any
}> {
  const { method, args: wxArgs = [] } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info(`Calling wx.${method}`, { args: wxArgs })

    // Call WX API method
    const result = await session.miniProgram.callWxMethod(method, ...wxArgs)

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

/**
 * Evaluate JavaScript code in the mini program context
 */
export async function evaluate(
  session: SessionState,
  args: {
    expression: string
    args?: any[]
  }
): Promise<{
  success: boolean
  message: string
  result?: any
}> {
  const { expression, args: evalArgs = [] } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Evaluating expression', { expression })

    // Evaluate expression in mini program context
    const result = await session.miniProgram.evaluate(expression, ...evalArgs)

    logger?.info('Evaluation successful', { result })

    return {
      success: true,
      message: 'Expression evaluated successfully',
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Evaluation failed', {
      error: errorMessage,
      expression,
    })

    throw new Error(`Evaluation failed: ${errorMessage}`)
  }
}

/**
 * Take a screenshot of the mini program
 */
export async function screenshot(
  session: SessionState,
  args: {
    filename?: string
    fullPage?: boolean
  } = {}
): Promise<{
  success: boolean
  message: string
  path: string
}> {
  const { filename, fullPage = false } = args
  const logger = session.logger
  const outputManager = session.outputManager

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    if (!outputManager) {
      throw new Error('OutputManager not available')
    }

    logger?.info('Taking screenshot', { filename, fullPage })

    // Ensure output directory exists
    await outputManager.ensureOutputDir()

    // Generate filename if not provided
    const outputFilename =
      filename || outputManager.generateFilename('screenshot', 'png')

    // Get full path
    const fullPath = await outputManager.writeFile(
      outputFilename,
      Buffer.from([]) // Placeholder, will be overwritten
    )

    // Take screenshot using miniprogram-automator
    // Note: screenshot() returns Buffer directly
    const screenshotBuffer = await session.miniProgram.screenshot({
      path: fullPath,
      fullPage,
    })

    // If screenshot() doesn't write to file directly, write the buffer
    if (screenshotBuffer) {
      await outputManager.writeFile(outputFilename, screenshotBuffer)
    }

    logger?.info('Screenshot saved', { path: fullPath })

    return {
      success: true,
      message: 'Screenshot captured successfully',
      path: fullPath,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Screenshot failed', {
      error: errorMessage,
      filename,
    })

    throw new Error(`Screenshot failed: ${errorMessage}`)
  }
}

/**
 * Get current page stack
 */
export async function getPageStack(
  session: SessionState
): Promise<{
  success: boolean
  message: string
  pages: Array<{ path: string; query: Record<string, any> }>
}> {
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting page stack')

    const pageStack = await session.miniProgram.pageStack()

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

/**
 * Get system information
 */
export async function getSystemInfo(
  session: SessionState
): Promise<{
  success: boolean
  message: string
  systemInfo: any
}> {
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Getting system information')

    const systemInfo = await session.miniProgram.systemInfo()

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
