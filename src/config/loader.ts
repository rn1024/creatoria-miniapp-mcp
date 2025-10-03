/**
 * Configuration loader with support for files, environment variables, and CLI args
 * Priority: CLI args > Environment variables > Config file > Defaults
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { ServerConfig } from '../types.js'
import { mergeServerConfig } from './defaults.js'

/**
 * Config file names to search for (in order of priority)
 */
const CONFIG_FILE_NAMES = ['.mcp.json', 'mcp.config.json', '.mcp.config.json']

/**
 * Environment variable prefix
 */
const ENV_PREFIX = 'MCP_'

/**
 * Find config file in current directory or parent directories
 */
export function findConfigFile(startDir: string = process.cwd()): string | null {
  let currentDir = startDir

  // Search up to 5 levels
  for (let i = 0; i < 5; i++) {
    for (const fileName of CONFIG_FILE_NAMES) {
      const filePath = join(currentDir, fileName)
      if (existsSync(filePath)) {
        return filePath
      }
    }

    const parentDir = join(currentDir, '..')
    if (parentDir === currentDir) {
      break // Reached root
    }
    currentDir = parentDir
  }

  return null
}

/**
 * Load config from file
 */
export function loadConfigFile(filePath: string): Partial<ServerConfig> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const config = JSON.parse(content)

    // Validate that it's an object (not array or null)
    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      throw new Error('Config file must contain a JSON object')
    }

    return config
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in config file ${filePath}: ${error.message}`)
    }
    throw error
  }
}

/**
 * Load config from environment variables
 * Supported variables:
 * - MCP_PROJECT_PATH
 * - MCP_CLI_PATH
 * - MCP_PORT
 * - MCP_CAPABILITIES (comma-separated)
 * - MCP_OUTPUT_DIR
 * - MCP_TIMEOUT
 * - MCP_SESSION_TIMEOUT
 */
export function loadConfigFromEnv(): Partial<ServerConfig> {
  const config: Partial<ServerConfig> = {}

  if (process.env.MCP_PROJECT_PATH) {
    config.projectPath = process.env.MCP_PROJECT_PATH
  }

  if (process.env.MCP_CLI_PATH) {
    config.cliPath = process.env.MCP_CLI_PATH
  }

  if (process.env.MCP_PORT) {
    const port = parseInt(process.env.MCP_PORT, 10)
    if (!isNaN(port)) {
      config.port = port
    }
  }

  if (process.env.MCP_CAPABILITIES) {
    config.capabilities = process.env.MCP_CAPABILITIES.split(',').map((s) => s.trim())
  }

  if (process.env.MCP_OUTPUT_DIR) {
    config.outputDir = process.env.MCP_OUTPUT_DIR
  }

  if (process.env.MCP_TIMEOUT) {
    const timeout = parseInt(process.env.MCP_TIMEOUT, 10)
    if (!isNaN(timeout)) {
      config.timeout = timeout
    }
  }

  if (process.env.MCP_SESSION_TIMEOUT) {
    const timeout = parseInt(process.env.MCP_SESSION_TIMEOUT, 10)
    if (!isNaN(timeout)) {
      config.sessionTimeout = timeout
    }
  }

  return config
}

/**
 * Merge configs with priority: cliConfig > envConfig > fileConfig > defaults
 */
export function mergeConfigs(
  fileConfig: Partial<ServerConfig> = {},
  envConfig: Partial<ServerConfig> = {},
  cliConfig: Partial<ServerConfig> = {}
): Required<ServerConfig> {
  // Start with file config
  let merged = { ...fileConfig }

  // Override with env config
  merged = { ...merged, ...envConfig }

  // Override with CLI config
  merged = { ...merged, ...cliConfig }

  // Merge with defaults (fills in missing values)
  return mergeServerConfig(merged)
}

/**
 * Load complete configuration from all sources
 *
 * @param options - Optional overrides
 * @param options.configPath - Explicit config file path (skips auto-discovery)
 * @param options.cliConfig - CLI arguments config
 * @param options.skipEnv - Skip loading from environment variables
 * @param options.skipFile - Skip loading from config file
 */
export function loadConfig(
  options: {
    configPath?: string
    cliConfig?: Partial<ServerConfig>
    skipEnv?: boolean
    skipFile?: boolean
  } = {}
): Required<ServerConfig> {
  const { configPath, cliConfig = {}, skipEnv = false, skipFile = false } = options

  // Load from file
  let fileConfig: Partial<ServerConfig> = {}
  if (!skipFile) {
    const foundPath = configPath || findConfigFile()
    if (foundPath) {
      try {
        fileConfig = loadConfigFile(foundPath)
        console.error(`Loaded config from: ${foundPath}`)
      } catch (error) {
        console.error(`Failed to load config file: ${error}`)
        // Continue with empty file config
      }
    }
  }

  // Load from environment
  let envConfig: Partial<ServerConfig> = {}
  if (!skipEnv) {
    envConfig = loadConfigFromEnv()
    const envKeys = Object.keys(envConfig)
    if (envKeys.length > 0) {
      console.error(`Loaded config from environment: ${envKeys.join(', ')}`)
    }
  }

  // Merge all configs
  return mergeConfigs(fileConfig, envConfig, cliConfig)
}
