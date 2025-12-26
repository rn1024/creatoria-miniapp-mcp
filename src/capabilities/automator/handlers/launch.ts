/**
 * Launch handler - Launches WeChat DevTools and connects to miniprogram
 */

import automator from 'miniprogram-automator'
import type { SessionState } from '../../../types.js'
import { disconnect } from './disconnect.js'

/**
 * Default automation port for WeChat DevTools
 */
const DEFAULT_PORT = 9420

/**
 * Default CLI path for macOS
 */
const DEFAULT_CLI_PATH = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'

/**
 * Launch input arguments
 */
export interface LaunchArgs {
  projectPath: string
  cliPath?: string
  port?: number
}

/**
 * Launch result
 */
export interface LaunchResult {
  success: boolean
  message: string
  port?: number
}

/**
 * Launch WeChat DevTools and connect to miniprogram
 */
export async function launch(session: SessionState, args: LaunchArgs): Promise<LaunchResult> {
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

    // Store in session (use 'as any' to bypass type incompatibility between official types and our interface)
    session.miniProgram = miniProgram as any
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
