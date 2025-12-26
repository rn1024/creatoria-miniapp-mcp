/**
 * Disconnect handler - Disconnects from miniprogram but keeps IDE running
 */

import type { SessionState } from '../../../types.js'

/**
 * Disconnect result
 */
export interface DisconnectResult {
  success: boolean
  message: string
}

/**
 * Disconnect from miniprogram but keep IDE process running
 */
export async function disconnect(session: SessionState): Promise<DisconnectResult> {
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      logger?.warn('No active miniProgram connection to disconnect')
      return {
        success: true,
        message: 'No active connection',
      }
    }

    logger?.info('Disconnecting from miniprogram')

    // Disconnect from miniprogram-automator
    await session.miniProgram.disconnect()

    // Clear miniProgram reference but keep session
    session.miniProgram = undefined

    // Clear element cache
    session.elements.clear()

    // Clear page stack
    session.pages = []

    logger?.info('Disconnected from miniprogram successfully')

    return {
      success: true,
      message: 'Disconnected from miniprogram successfully',
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Error disconnecting from miniprogram', {
      error: errorMessage,
    })

    // Even if disconnect fails, clear the session state
    session.miniProgram = undefined
    session.elements.clear()
    session.pages = []

    throw new Error(`Error disconnecting from miniprogram: ${errorMessage}`)
  }
}
