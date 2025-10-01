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
  sessionTimeout?: number // Session timeout in milliseconds (default: 30 minutes)
}

export interface SessionState {
  sessionId: string
  miniProgram?: any // miniprogram-automator MiniProgram instance
  ideProcess?: any // IDE process handle
  pages: any[] // Page stack
  elements: Map<string, any> // Element cache (refId -> Element)
  outputDir: string // Session-specific output directory
  createdAt: Date
  lastActivity: Date
  config?: SessionConfig
}

export interface SessionConfig {
  projectPath?: string
  cliPath?: string
  port?: number
  timeout?: number
}

export interface SessionMetrics {
  totalSessions: number
  activeSessions: number
  oldestSession?: {
    sessionId: string
    age: number
  }
  totalElements: number
}
