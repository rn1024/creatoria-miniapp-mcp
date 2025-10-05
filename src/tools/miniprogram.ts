/**
 * MiniProgram tool implementations
 * Handles navigation, WX API calls, evaluation, and screenshots
 */

import { join } from 'path'
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
 *
 * ⚠️ SECURITY WARNING:
 * This tool executes arbitrary JavaScript code in the mini program context.
 * Use with caution:
 * - All evaluations are logged for audit
 * - Evaluations are limited by timeout (default: 5s)
 * - Consider restricting this tool in production environments
 * - Never pass untrusted user input directly to this function
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

    // Security: Log all evaluate calls for audit
    logger?.info('[SECURITY] Evaluating expression', {
      expression,
      argsCount: evalArgs.length,
      timestamp: new Date().toISOString(),
    })

    // Import timeout utilities
    const { withTimeout, getTimeout, DEFAULT_TIMEOUTS } = await import('../core/timeout.js')

    // Get timeout from config or use default (5 seconds for evaluate)
    const timeoutMs = getTimeout(session.config?.evaluateTimeout, DEFAULT_TIMEOUTS.evaluate)

    // Evaluate expression with timeout protection
    const result = await withTimeout(
      session.miniProgram.evaluate(expression, ...evalArgs),
      timeoutMs,
      'Evaluate expression'
    )

    logger?.info('Evaluation successful', { result })

    return {
      success: true,
      message: 'Expression evaluated successfully',
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Security: Log failed evaluations
    logger?.error('[SECURITY] Evaluation failed', {
      error: errorMessage,
      expression,
      timestamp: new Date().toISOString(),
    })

    throw new Error(`Evaluation failed: ${errorMessage}`)
  }
}

/**
 * Take a screenshot of the mini program
 * Returns base64 string by default, or saves to file if filename is provided
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
  path?: string
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

    logger?.info('Taking screenshot', { filename, fullPage })

    if (!outputManager) {
      throw new Error('OutputManager not available')
    }

    const { validateFilename } = await import('../runtime/validation/validation.js')

    const resolvedFilename = filename
      ? (() => {
          validateFilename(filename, ['png', 'jpg', 'jpeg'])
          return filename
        })()
      : (() => {
          const generated = outputManager.generateFilename('screenshot', 'png')
          validateFilename(generated, ['png', 'jpg', 'jpeg'])
          return generated
        })()

    await outputManager.ensureOutputDir()

    const fullPath = join(outputManager.getOutputDir(), resolvedFilename)

    const screenshotBuffer = await session.miniProgram.screenshot({
      path: fullPath,
      fullPage,
    })

    let finalPath = fullPath
    if (screenshotBuffer) {
      finalPath = await outputManager.writeFile(resolvedFilename, screenshotBuffer)
    }

    logger?.info('Screenshot saved', { path: finalPath })

    return {
      success: true,
      message: 'Screenshot saved to file',
      path: finalPath,
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
export async function getPageStack(session: SessionState): Promise<{
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
export async function getSystemInfo(session: SessionState): Promise<{
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
