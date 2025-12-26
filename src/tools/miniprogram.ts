/**
 * MiniProgram tool implementations
 * Handles navigation, WX API calls, evaluation, and screenshots
 *
 * All async operations are protected with timeouts to prevent hanging.
 */

import { join } from 'path'
import type { SessionState } from '../types.js'
import { withTimeout, getTimeout, DEFAULT_TIMEOUTS } from '../runtime/timeout/timeout.js'
import { withRetry, RetryPredicates } from '../runtime/retry/retry.js'

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
 * Returns base64 string if returnBase64 is true, otherwise saves to file
 *
 * @param session - Session state
 * @param args - Screenshot options
 * @param args.filename - Optional filename to save screenshot (auto-generated if not provided)
 * @param args.fullPage - Whether to capture the full page including scroll area
 * @param args.returnBase64 - Return screenshot as base64 string instead of saving to file
 */
export async function screenshot(
  session: SessionState,
  args: {
    filename?: string
    fullPage?: boolean
    returnBase64?: boolean
  } = {}
): Promise<{
  success: boolean
  message: string
  path?: string
  base64?: string
}> {
  const { filename, fullPage = false, returnBase64 = false } = args
  const logger = session.logger
  const outputManager = session.outputManager
  const startTime = Date.now()

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    // Calculate timeout: use longer timeout for fullPage screenshots
    const baseTimeout = getTimeout(session.config?.screenshotTimeout, DEFAULT_TIMEOUTS.screenshot)
    const timeoutMs = fullPage ? DEFAULT_TIMEOUTS.screenshotFullPage : baseTimeout

    logger?.info('Taking screenshot', { filename, fullPage, returnBase64, timeoutMs })

    // If returnBase64 is true and no filename, return base64 directly (fast path)
    if (returnBase64 && !filename) {
      const buffer = (await withRetry(
        () =>
          withTimeout(
            session.miniProgram.screenshot({ fullPage }),
            timeoutMs,
            'Screenshot capture (base64)'
          ),
        {
          maxRetries: 2,
          delayMs: 1000,
          shouldRetry: RetryPredicates.onTransientError,
          onRetry: (attempt, error, delay) => {
            logger?.warn(`Screenshot retry attempt ${attempt}`, {
              error: error.message,
              nextDelayMs: delay,
            })
          },
        }
      )) as Buffer | string

      const duration = Date.now() - startTime
      const bufferLength = buffer instanceof Buffer ? buffer.length : buffer?.length
      logger?.info('Screenshot captured (base64)', {
        duration,
        fullPage,
        size: bufferLength,
      })

      // Handle both Buffer and string return types from SDK
      const base64String =
        buffer instanceof Buffer ? buffer.toString('base64') : typeof buffer === 'string' ? buffer : String(buffer)

      return {
        success: true,
        message: 'Screenshot captured successfully',
        base64: base64String,
      }
    }

    // File saving path
    if (!outputManager) {
      throw new Error('OutputManager not available. Set outputDir in config or use returnBase64=true.')
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

    // Screenshot with timeout and retry protection
    const screenshotBuffer = (await withRetry(
      () =>
        withTimeout(
          session.miniProgram.screenshot({
            path: fullPath,
            fullPage,
          }),
          timeoutMs,
          'Screenshot capture'
        ),
      {
        maxRetries: 2,
        delayMs: 1000,
        shouldRetry: RetryPredicates.onTransientError,
        onRetry: (attempt, error, delay) => {
          logger?.warn(`Screenshot retry attempt ${attempt}`, {
            error: error.message,
            nextDelayMs: delay,
          })
        },
      }
    )) as Buffer | string | undefined

    let finalPath = fullPath
    if (screenshotBuffer) {
      const bufferData = screenshotBuffer instanceof Buffer ? screenshotBuffer : Buffer.from(screenshotBuffer)
      finalPath = await outputManager.writeFile(resolvedFilename, bufferData)
    }

    const duration = Date.now() - startTime
    const bufferSize = screenshotBuffer instanceof Buffer ? screenshotBuffer.length : screenshotBuffer?.length
    logger?.info('Screenshot saved', {
      path: finalPath,
      duration,
      fullPage,
      size: bufferSize,
    })

    // If returnBase64 is also requested, include base64 in response
    const result: {
      success: boolean
      message: string
      path: string
      base64?: string
    } = {
      success: true,
      message: 'Screenshot saved to file',
      path: finalPath,
    }

    if (returnBase64 && screenshotBuffer) {
      result.base64 =
        screenshotBuffer instanceof Buffer
          ? screenshotBuffer.toString('base64')
          : typeof screenshotBuffer === 'string'
            ? screenshotBuffer
            : String(screenshotBuffer)
    }

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger?.error('Screenshot failed', {
      error: errorMessage,
      filename,
      fullPage,
      returnBase64,
      duration,
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
