/**
 * Core type definitions for creatoria-miniapp-mcp
 */

export interface ServerConfig {
  projectPath?: string
  cliPath?: string
  port?: number
  capabilities?: string[]
  outputDir?: string
  timeout?: number
}

export interface SessionState {
  sessionId: string
  miniProgram?: any // miniprogram-automator MiniProgram instance
  ideProcess?: any
  elements: Map<string, any>
  createdAt: Date
  lastActivity: Date
}
