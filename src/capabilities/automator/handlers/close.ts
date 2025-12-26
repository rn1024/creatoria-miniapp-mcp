/**
 * Close handler - Closes miniprogram session completely
 */

import type { SessionState } from '../../../types.js'
import { disconnect } from './disconnect.js'

/**
 * Close result
 */
export interface CloseResult {
  success: boolean
  message: string
}

/**
 * Close miniprogram session completely
 * This will disconnect and cleanup all resources
 * The session itself will be deleted by the caller
 */
export async function close(session: SessionState): Promise<CloseResult> {
  const logger = session.logger

  try {
    logger?.info('Closing miniprogram session', {
      sessionId: session.sessionId,
    })

    // Disconnect if connected
    if (session.miniProgram) {
      await disconnect(session)
    }

    // Kill IDE process if we launched it
    if (session.ideProcess && typeof session.ideProcess.kill === 'function') {
      logger?.info('Killing IDE process')
      session.ideProcess.kill()
      session.ideProcess = undefined
    }

    logger?.info('Miniprogram session closed successfully')

    return {
      success: true,
      message: 'Miniprogram session closed successfully',
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Error closing miniprogram session', {
      error: errorMessage,
    })

    // Best effort cleanup
    session.miniProgram = undefined
    session.ideProcess = undefined
    session.elements.clear()
    session.pages = []

    throw new Error(`Error closing miniprogram session: ${errorMessage}`)
  }
}
