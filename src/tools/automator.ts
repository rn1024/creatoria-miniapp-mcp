/**
 * Automator tool implementations
 * Handles launch, connect, disconnect, and close operations
 */

import automator from 'miniprogram-automator'
import type { SessionState } from '../types.js'

/**
 * Default automation port for WeChat DevTools
 */
const DEFAULT_PORT = 9420

/**
 * Default CLI path for macOS
 */
const DEFAULT_CLI_PATH =
  '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'

/**
 * Launch WeChat DevTools and connect to miniprogram
 */
export async function launch(
  session: SessionState,
  args: {
    projectPath: string
    cliPath?: string
    port?: number
  }
): Promise<{
  success: boolean
  message: string
  port?: number
}> {
  const { projectPath, cliPath = DEFAULT_CLI_PATH, port = DEFAULT_PORT } = args

  const logger = session.logger

  try {
    logger?.info('Launching miniprogram', {
      projectPath,
      cliPath,
      port,
    })

    // Check if already connected
    if (session.miniProgram) {
      logger?.warn('MiniProgram already connected, disconnecting first')
      await disconnect(session)
    }

    // Launch using miniprogram-automator
    const miniProgram = await automator.launch({
      projectPath,
      cliPath,
      port,
    })

    // Store in session
    session.miniProgram = miniProgram
    session.config = {
      ...session.config,
      projectPath,
      cliPath,
      port,
    }

    logger?.info('MiniProgram launched successfully', { port })

    return {
      success: true,
      message: `MiniProgram launched successfully on port ${port}`,
      port,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to launch miniprogram', {
      error: errorMessage,
      projectPath,
    })

    throw new Error(`Failed to launch miniprogram: ${errorMessage}`)
  }
}

/**
 * Connect to an already running WeChat DevTools instance
 * Note: The port must be configured in WeChat DevTools settings before connecting
 */
export async function connect(
  session: SessionState,
  args: {
    port?: number
  } = {}
): Promise<{
  success: boolean
  message: string
  port?: number
}> {
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

    // Store in session
    session.miniProgram = miniProgram
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

/**
 * Disconnect from miniprogram but keep IDE process running
 */
export async function disconnect(
  session: SessionState
): Promise<{
  success: boolean
  message: string
}> {
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

/**
 * Close miniprogram session completely
 * This will disconnect and cleanup all resources
 * The session itself will be deleted by the caller
 */
export async function close(
  session: SessionState
): Promise<{
  success: boolean
  message: string
}> {
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
