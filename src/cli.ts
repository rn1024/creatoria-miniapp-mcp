#!/usr/bin/env node

/**
 * CLI entry point for creatoria-miniapp-mcp
 */

import { startServer } from './server.js'
import { loadConfig } from './config/loader.js'
import type { ServerConfig } from './types.js'

/**
 * Parse CLI arguments
 * Supports:
 * - --project-path <path>
 * - --cli-path <path>
 * - --port <number>
 * - --capabilities <cap1,cap2,...>
 * - --output-dir <path>
 * - --timeout <ms>
 * - --session-timeout <ms>
 * - --config <path> (explicit config file)
 */
function parseCLIArgs(): {
  cliConfig: Partial<ServerConfig>
  configPath?: string
} {
  const args = process.argv.slice(2)
  const cliConfig: Partial<ServerConfig> = {}
  let configPath: string | undefined

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case '--project-path':
        if (nextArg) {
          cliConfig.projectPath = nextArg
          i++
        }
        break
      case '--cli-path':
        if (nextArg) {
          cliConfig.cliPath = nextArg
          i++
        }
        break
      case '--port':
        if (nextArg) {
          const port = parseInt(nextArg, 10)
          if (!isNaN(port)) {
            cliConfig.port = port
          }
          i++
        }
        break
      case '--capabilities':
        if (nextArg) {
          cliConfig.capabilities = nextArg.split(',').map((s) => s.trim())
          i++
        }
        break
      case '--output-dir':
        if (nextArg) {
          cliConfig.outputDir = nextArg
          i++
        }
        break
      case '--timeout':
        if (nextArg) {
          const timeout = parseInt(nextArg, 10)
          if (!isNaN(timeout)) {
            cliConfig.timeout = timeout
          }
          i++
        }
        break
      case '--session-timeout':
        if (nextArg) {
          const timeout = parseInt(nextArg, 10)
          if (!isNaN(timeout)) {
            cliConfig.sessionTimeout = timeout
          }
          i++
        }
        break
      case '--config':
        if (nextArg) {
          configPath = nextArg
          i++
        }
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
    }
  }

  return { cliConfig, configPath }
}

function printHelp() {
  console.log(`
creatoria-miniapp-mcp - WeChat Mini Program MCP Server

Usage:
  creatoria-miniapp-mcp [options]

Options:
  --project-path <path>       Path to mini program project
  --cli-path <path>           Path to WeChat DevTools CLI
  --port <number>             Automation port (default: 9420)
  --capabilities <list>       Comma-separated capability list (default: core)
  --output-dir <path>         Output directory for artifacts (default: .mcp-artifacts)
  --timeout <ms>              Global timeout in milliseconds (default: 30000)
  --session-timeout <ms>      Session timeout in milliseconds (default: 1800000)
  --config <path>             Path to config file
  --help, -h                  Show this help message

Configuration Priority:
  CLI arguments > Environment variables > Config file > Defaults

Environment Variables:
  MCP_PROJECT_PATH           Project path
  MCP_CLI_PATH               CLI path
  MCP_PORT                   Port number
  MCP_CAPABILITIES           Comma-separated capabilities
  MCP_OUTPUT_DIR             Output directory
  MCP_TIMEOUT                Timeout in milliseconds
  MCP_SESSION_TIMEOUT        Session timeout in milliseconds

Config File:
  Searches for .mcp.json, mcp.config.json, or .mcp.config.json
  in current directory and parent directories.

Example:
  creatoria-miniapp-mcp --project-path ./my-miniprogram --port 9420
  creatoria-miniapp-mcp --config ./custom-config.json
`)
}

// Parse CLI arguments and load configuration
const { cliConfig, configPath } = parseCLIArgs()

// Load full configuration from all sources
const config = loadConfig({
  configPath,
  cliConfig,
})

// Start server with merged configuration
startServer(config).catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
