/**
 * Network Mock tool implementations
 * Handles wx.request and other network API mocking
 */

import type { SessionState } from '../types.js'

/**
 * Mock a WeChat API method (wx.*)
 * Useful for testing without real network calls
 */
export async function mockWxMethod(
  session: SessionState,
  args: {
    method: string
    result: any
    type?: 'success' | 'fail'
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { method, result, type = 'success' } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Mocking wx method', { method, type })

    // Mock the WeChat API method
    session.miniProgram.mockWxMethod(method, result, { type })

    logger?.info('Wx method mocked successfully', { method, type })

    return {
      success: true,
      message: `Successfully mocked wx.${method} to return ${type}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Mock wx method failed', {
      error: errorMessage,
      method,
    })

    throw new Error(`Failed to mock wx.${method}: ${errorMessage}`)
  }
}

/**
 * Restore a previously mocked WeChat API method
 */
export async function restoreWxMethod(
  session: SessionState,
  args: {
    method: string
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { method } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Restoring wx method', { method })

    // Restore the WeChat API method to its original behavior
    session.miniProgram.restoreWxMethod(method)

    logger?.info('Wx method restored successfully', { method })

    return {
      success: true,
      message: `Successfully restored wx.${method} to original behavior`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Restore wx method failed', {
      error: errorMessage,
      method,
    })

    throw new Error(`Failed to restore wx.${method}: ${errorMessage}`)
  }
}

/**
 * Mock wx.request to return specific data
 * Convenient wrapper for mocking network requests
 */
export async function mockRequest(
  session: SessionState,
  args: {
    data?: any
    statusCode?: number
    header?: Record<string, string>
    type?: 'success' | 'fail'
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { data = {}, statusCode = 200, header = {}, type = 'success' } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Mocking wx.request', { statusCode, type })

    const result = {
      data,
      statusCode,
      header,
    }

    // Mock wx.request
    session.miniProgram.mockWxMethod('request', result, { type })

    logger?.info('wx.request mocked successfully', { statusCode, type })

    return {
      success: true,
      message: `Successfully mocked wx.request to return ${type} with status ${statusCode}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Mock request failed', {
      error: errorMessage,
    })

    throw new Error(`Failed to mock wx.request: ${errorMessage}`)
  }
}

/**
 * Mock wx.request to fail with specific error
 * Useful for testing error handling
 */
export async function mockRequestFailure(
  session: SessionState,
  args: {
    errMsg?: string
    errno?: number
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { errMsg = 'request:fail', errno = -1 } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Mocking wx.request failure', { errMsg, errno })

    const result = {
      errMsg,
      errno,
    }

    // Mock wx.request to fail
    session.miniProgram.mockWxMethod('request', result, { type: 'fail' })

    logger?.info('wx.request failure mocked successfully', { errMsg })

    return {
      success: true,
      message: `Successfully mocked wx.request to fail with: ${errMsg}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Mock request failure failed', {
      error: errorMessage,
    })

    throw new Error(`Failed to mock wx.request failure: ${errorMessage}`)
  }
}

/**
 * Restore wx.request to original behavior
 */
export async function restoreRequest(session: SessionState): Promise<{
  success: boolean
  message: string
}> {
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Restoring wx.request')

    // Restore wx.request
    session.miniProgram.restoreWxMethod('request')

    logger?.info('wx.request restored successfully')

    return {
      success: true,
      message: 'Successfully restored wx.request to original behavior',
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Restore request failed', {
      error: errorMessage,
    })

    throw new Error(`Failed to restore wx.request: ${errorMessage}`)
  }
}

/**
 * Restore all mocked WeChat API methods
 */
export async function restoreAllMocks(session: SessionState): Promise<{
  success: boolean
  message: string
}> {
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    logger?.info('Restoring all mocked wx methods')

    // Common methods that might be mocked
    const commonMethods = [
      'request',
      'uploadFile',
      'downloadFile',
      'connectSocket',
      'getStorage',
      'setStorage',
      'removeStorage',
      'clearStorage',
      'getSystemInfo',
      'getLocation',
      'chooseImage',
      'showToast',
      'showModal',
      'navigateTo',
      'redirectTo',
    ]

    let restoredCount = 0
    for (const method of commonMethods) {
      try {
        session.miniProgram.restoreWxMethod(method)
        restoredCount++
      } catch {
        // Ignore errors for methods that weren't mocked
      }
    }

    logger?.info('All mocks restored', { restoredCount })

    return {
      success: true,
      message: `Successfully restored ${restoredCount} mocked wx methods`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Restore all mocks failed', {
      error: errorMessage,
    })

    throw new Error(`Failed to restore all mocks: ${errorMessage}`)
  }
}
