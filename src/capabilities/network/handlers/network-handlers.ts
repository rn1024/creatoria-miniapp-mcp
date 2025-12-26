/**
 * Network handlers - Network mocking utilities
 */

import type { SessionState } from '../../../types.js'

// ============================================================================
// WX Method Mocking
// ============================================================================

export interface MockWxMethodArgs {
  method: string
  result: any
  type?: 'success' | 'fail'
}

export interface MockWxMethodResult {
  success: boolean
  message: string
}

export async function mockWxMethod(session: SessionState, args: MockWxMethodArgs): Promise<MockWxMethodResult> {
  const { method, result, type = 'success' } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error('MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.')
    }

    logger?.info('Mocking wx method', { method, type })
    session.miniProgram.mockWxMethod(method, result, { type })
    logger?.info('Wx method mocked successfully', { method, type })

    return { success: true, message: `Successfully mocked wx.${method} to return ${type}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Mock wx method failed', { error: errorMessage, method })
    throw new Error(`Failed to mock wx.${method}: ${errorMessage}`)
  }
}

export interface RestoreWxMethodArgs {
  method: string
}

export interface RestoreWxMethodResult {
  success: boolean
  message: string
}

export async function restoreWxMethod(session: SessionState, args: RestoreWxMethodArgs): Promise<RestoreWxMethodResult> {
  const { method } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error('MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.')
    }

    logger?.info('Restoring wx method', { method })
    session.miniProgram.restoreWxMethod(method)
    logger?.info('Wx method restored successfully', { method })

    return { success: true, message: `Successfully restored wx.${method} to original behavior` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Restore wx method failed', { error: errorMessage, method })
    throw new Error(`Failed to restore wx.${method}: ${errorMessage}`)
  }
}

// ============================================================================
// Request Mocking
// ============================================================================

export interface MockRequestArgs {
  data?: any
  statusCode?: number
  header?: Record<string, string>
  type?: 'success' | 'fail'
}

export interface MockRequestResult {
  success: boolean
  message: string
}

export async function mockRequest(session: SessionState, args: MockRequestArgs): Promise<MockRequestResult> {
  const { data = {}, statusCode = 200, header = {}, type = 'success' } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error('MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.')
    }

    logger?.info('Mocking wx.request', { statusCode, type })

    const result = { data, statusCode, header }
    session.miniProgram.mockWxMethod('request', result, { type })

    logger?.info('wx.request mocked successfully', { statusCode, type })
    return { success: true, message: `Successfully mocked wx.request to return ${type} with status ${statusCode}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Mock request failed', { error: errorMessage })
    throw new Error(`Failed to mock wx.request: ${errorMessage}`)
  }
}

export interface MockRequestFailureArgs {
  errMsg?: string
  errno?: number
}

export interface MockRequestFailureResult {
  success: boolean
  message: string
}

export async function mockRequestFailure(session: SessionState, args: MockRequestFailureArgs): Promise<MockRequestFailureResult> {
  const { errMsg = 'request:fail', errno = -1 } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error('MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.')
    }

    logger?.info('Mocking wx.request failure', { errMsg, errno })

    const result = { errMsg, errno }
    session.miniProgram.mockWxMethod('request', result, { type: 'fail' })

    logger?.info('wx.request failure mocked successfully', { errMsg })
    return { success: true, message: `Successfully mocked wx.request to fail with: ${errMsg}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Mock request failure failed', { error: errorMessage })
    throw new Error(`Failed to mock wx.request failure: ${errorMessage}`)
  }
}

export interface RestoreRequestResult {
  success: boolean
  message: string
}

export async function restoreRequest(session: SessionState): Promise<RestoreRequestResult> {
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error('MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.')
    }

    logger?.info('Restoring wx.request')
    session.miniProgram.restoreWxMethod('request')
    logger?.info('wx.request restored successfully')

    return { success: true, message: 'Successfully restored wx.request to original behavior' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Restore request failed', { error: errorMessage })
    throw new Error(`Failed to restore wx.request: ${errorMessage}`)
  }
}

export interface RestoreAllMocksResult {
  success: boolean
  message: string
}

export async function restoreAllMocks(session: SessionState): Promise<RestoreAllMocksResult> {
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error('MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.')
    }

    logger?.info('Restoring all mocked wx methods')

    const commonMethods = [
      'request', 'uploadFile', 'downloadFile', 'connectSocket',
      'getStorage', 'setStorage', 'removeStorage', 'clearStorage',
      'getSystemInfo', 'getLocation', 'chooseImage',
      'showToast', 'showModal', 'navigateTo', 'redirectTo',
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
    return { success: true, message: `Successfully restored ${restoredCount} mocked wx methods` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Restore all mocks failed', { error: errorMessage })
    throw new Error(`Failed to restore all mocks: ${errorMessage}`)
  }
}
