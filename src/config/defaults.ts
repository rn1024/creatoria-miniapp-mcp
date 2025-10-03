/**
 * Default configuration values for the MCP server
 */

import { join as _join } from 'path'
import type { ServerConfig, SessionConfig } from '../types.js'

/**
 * Default CLI path for WeChat DevTools on macOS
 */
export const DEFAULT_CLI_PATH_MACOS = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'

/**
 * Default automation port for WeChat DevTools
 */
export const DEFAULT_AUTOMATION_PORT = 9420

/**
 * Default output directory for artifacts (relative to cwd)
 */
export const DEFAULT_OUTPUT_DIR = '.mcp-artifacts'

/**
 * Default session timeout (30 minutes in milliseconds)
 */
export const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000

/**
 * Default global timeout for operations (30 seconds in milliseconds)
 */
export const DEFAULT_TIMEOUT = 30 * 1000

/**
 * Default timeout for evaluate operations (5 seconds in milliseconds)
 */
export const DEFAULT_EVALUATE_TIMEOUT = 5 * 1000

/**
 * Default timeout for launch operations (60 seconds in milliseconds)
 */
export const DEFAULT_LAUNCH_TIMEOUT = 60 * 1000

/**
 * Default timeout for screenshot operations (10 seconds in milliseconds)
 */
export const DEFAULT_SCREENSHOT_TIMEOUT = 10 * 1000

/**
 * Default capabilities (all tools enabled)
 */
export const DEFAULT_CAPABILITIES = ['core']

/**
 * Default log level
 */
export const DEFAULT_LOG_LEVEL = 'info' as const

/**
 * Default log buffer size (number of log entries)
 */
export const DEFAULT_LOG_BUFFER_SIZE = 100

/**
 * Default log flush interval (5 seconds in milliseconds)
 */
export const DEFAULT_LOG_FLUSH_INTERVAL = 5000

/**
 * Default server configuration
 */
export const DEFAULT_SERVER_CONFIG: Required<ServerConfig> = {
  projectPath: '', // Must be provided by user
  cliPath: process.platform === 'darwin' ? DEFAULT_CLI_PATH_MACOS : '',
  port: DEFAULT_AUTOMATION_PORT,
  autoPort: DEFAULT_AUTOMATION_PORT, // Alias for port
  capabilities: DEFAULT_CAPABILITIES,
  outputDir: DEFAULT_OUTPUT_DIR,
  timeout: DEFAULT_TIMEOUT,
  sessionTimeout: DEFAULT_SESSION_TIMEOUT,
  logLevel: DEFAULT_LOG_LEVEL,
  enableFileLog: false,
  logBufferSize: DEFAULT_LOG_BUFFER_SIZE,
  logFlushInterval: DEFAULT_LOG_FLUSH_INTERVAL,
  enableSessionReport: false, // F3: Session report generation (default: disabled)
  enableFailureSnapshot: false, // F2: Automatic failure snapshot capture (default: disabled)
}

/**
 * Default session configuration
 */
export const DEFAULT_SESSION_CONFIG: Required<SessionConfig> = {
  projectPath: '', // Must be provided by user
  cliPath: process.platform === 'darwin' ? DEFAULT_CLI_PATH_MACOS : '',
  port: DEFAULT_AUTOMATION_PORT,
  timeout: DEFAULT_TIMEOUT,
  evaluateTimeout: DEFAULT_EVALUATE_TIMEOUT,
  launchTimeout: DEFAULT_LAUNCH_TIMEOUT,
  screenshotTimeout: DEFAULT_SCREENSHOT_TIMEOUT,
}

/**
 * Get default CLI path for current platform
 */
export function getDefaultCliPath(): string {
  if (process.platform === 'darwin') {
    return DEFAULT_CLI_PATH_MACOS
  }
  // Windows and Linux paths are not standardized
  // User must provide via config
  return ''
}

/**
 * Merge user config with defaults for server config
 */
export function mergeServerConfig(userConfig: Partial<ServerConfig>): Required<ServerConfig> {
  return {
    ...DEFAULT_SERVER_CONFIG,
    ...userConfig,
    // Ensure cliPath has a sensible default if not provided
    cliPath: userConfig.cliPath || getDefaultCliPath(),
    // Ensure capabilities is always an array
    capabilities: userConfig.capabilities || DEFAULT_CAPABILITIES,
  }
}

/**
 * Merge user config with defaults for session config
 */
export function mergeSessionConfig(userConfig: Partial<SessionConfig>): Required<SessionConfig> {
  return {
    ...DEFAULT_SESSION_CONFIG,
    ...userConfig,
    // Ensure cliPath has a sensible default if not provided
    cliPath: userConfig.cliPath || getDefaultCliPath(),
  }
}
