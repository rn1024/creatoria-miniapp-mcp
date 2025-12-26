/**
 * Connect handler - Connects to an already running WeChat DevTools instance
 */

import automator from 'miniprogram-automator'
import type { SessionState } from '../../../types.js'
import { disconnect } from './disconnect.js'

/**
 * Connect input arguments
 */
export interface ConnectArgs {
  port?: number
}

/**
 * Connect result
 */
export interface ConnectResult {
  success: boolean
  message: string
  port?: number
}

/**
 * Connect to an already running WeChat DevTools instance
 * Note: The port must be configured in WeChat DevTools settings before connecting
 */
export async function connect(
  session: SessionState,
  args: ConnectArgs = {}
): Promise<ConnectResult> {
  const { port } = args
  const logger = session.logger

  try {
    logger?.info('Connecting to existing DevTools instance', { port })

    // Check if already connected
    if (session.miniProgram) {
      logger?.warn('MiniProgram already connected, disconnecting first')
      await disconnect(session)
    }

    // Connect using miniprogram-automator
    // Note: automator.connect() uses the port configured in WeChat DevTools
    const miniProgram = await automator.connect({
      wsEndpoint: port ? `ws://localhost:${port}` : undefined,
    } as any)

    // Store in session (use 'as any' to bypass type incompatibility between official types and our interface)
    session.miniProgram = miniProgram as any
    if (port) {
      session.config = {
        ...session.config,
        port,
      }
    }

    logger?.info('Connected to DevTools successfully', { port })

    return {
      success: true,
      message: port
        ? `Connected to DevTools on port ${port}`
        : 'Connected to DevTools successfully',
      port,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to connect to DevTools', {
      error: errorMessage,
      port,
    })

    throw new Error(`Failed to connect to DevTools: ${errorMessage}`)
  }
}
