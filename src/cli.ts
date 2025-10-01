#!/usr/bin/env node

/**
 * CLI entry point for creatoria-miniapp-mcp
 */

import { startServer } from './server.js'

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
