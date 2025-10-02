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
  logger?: Logger // Session-specific logger
  outputManager?: OutputManager // Session-specific output manager
  recording?: RecordingState // Recording state
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

/**
 * Element reference input - supports multiple ways to locate elements
 */
export interface ElementRefInput {
  refId?: string // Previously cached element handle
  selector?: string // CSS-style WXML selector
  xpath?: string // XPath selector (requires SDK 0.11.0+)
  index?: number // Index when using $$ (query all)
  pagePath?: string // Specific page path (defaults to currentPage)
  save?: boolean // Whether to cache handle and return refId
}

/**
 * Resolved element result
 */
export interface ResolvedElement {
  page: any // Page object from miniprogram-automator
  element: any // Element object from miniprogram-automator
  refId?: string // Generated refId if save=true
}

/**
 * Log level
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  sessionId?: string
  toolName?: string
  context?: Record<string, any>
}

/**
 * Logger interface for structured logging
 */
export interface Logger {
  info(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, context?: Record<string, any>): void
  debug(message: string, context?: Record<string, any>): void
}

/**
 * Output file type
 */
export type OutputType = 'screenshot' | 'snapshot' | 'log' | 'other'

/**
 * Output manager for artifact generation
 */
export interface OutputManager {
  /**
   * Get output directory for the session
   */
  getOutputDir(): string

  /**
   * Generate filename for output artifact
   */
  generateFilename(type: OutputType, extension: string): string

  /**
   * Write content to file
   */
  writeFile(filename: string, content: Buffer | string): Promise<string>

  /**
   * Check if output directory exists
   */
  ensureOutputDir(): Promise<void>
}

/**
 * Recorded action in a sequence
 */
export interface RecordedAction {
  timestamp: Date
  toolName: string
  args: Record<string, any>
  duration?: number // milliseconds
  success: boolean
  error?: string
}

/**
 * Action sequence for recording/replay
 */
export interface ActionSequence {
  id: string
  name: string
  description?: string
  createdAt: Date
  actions: RecordedAction[]
  metadata?: Record<string, any>
}

/**
 * Recording state
 */
export interface RecordingState {
  isRecording: boolean
  currentSequence?: ActionSequence
  startedAt?: Date
}
