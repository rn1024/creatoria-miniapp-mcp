/**
 * Core type definitions for creatoria-miniapp-mcp
 */

import type { MiniProgram, Page } from './miniprogram-automator.js'
import type { ChildProcess } from 'child_process'

// Re-export miniprogram-automator types for easier imports
export type { MiniProgram, Page, Element, SystemInfo } from './miniprogram-automator.js'

export interface ServerConfig {
  projectPath?: string
  cliPath?: string
  port?: number
  capabilities?: string[]
  outputDir?: string
  timeout?: number
  sessionTimeout?: number // Session timeout in milliseconds (default: 30 minutes)
}

/**
 * Cached element with page metadata for invalidation
 */
export interface CachedElement {
  element: import('./miniprogram-automator.js').Element // The actual element object
  pagePath: string // Page path where element was cached
  cachedAt: Date // When the element was cached
}

export interface SessionState {
  sessionId: string
  miniProgram?: MiniProgram // miniprogram-automator MiniProgram instance
  ideProcess?: ChildProcess // IDE process handle
  pages: Page[] // Page stack
  elements: Map<string, CachedElement> // Element cache (refId -> CachedElement)
  currentPagePath?: string // Current page path for cache invalidation
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
  /** Global timeout for all operations (ms). Defaults to 30000 (30s) */
  timeout?: number
  /** Timeout for evaluate operations (ms). Defaults to 5000 (5s) */
  evaluateTimeout?: number
  /** Timeout for launch operations (ms). Defaults to 60000 (60s) */
  launchTimeout?: number
  /** Timeout for screenshot operations (ms). Defaults to 10000 (10s) */
  screenshotTimeout?: number
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
  page: Page // Page object from miniprogram-automator
  element: import('./miniprogram-automator.js').Element // Element object from miniprogram-automator
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
