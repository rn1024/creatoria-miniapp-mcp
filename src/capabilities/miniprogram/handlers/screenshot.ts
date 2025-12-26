/**
 * Screenshot handler - Capture mini program screenshots
 */

import { join } from 'path'
import type { SessionState } from '../../../types.js'
import { withTimeout, getTimeout, DEFAULT_TIMEOUTS } from '../../../runtime/timeout/timeout.js'
import { withRetry, RetryPredicates } from '../../../runtime/retry/retry.js'

/**
 * Screenshot input arguments
 */
export interface ScreenshotArgs {
  filename?: string
  fullPage?: boolean
  returnBase64?: boolean
}

/**
 * Screenshot result
 */
export interface ScreenshotResult {
  success: boolean
  message: string
  path?: string
  base64?: string
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
  args: ScreenshotArgs = {}
): Promise<ScreenshotResult> {
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

    const { validateFilename } = await import('../../../runtime/validation/validation.js')

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
    const result: ScreenshotResult = {
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
