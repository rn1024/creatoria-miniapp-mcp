/**
 * Core type definitions for creatoria-miniapp-mcp
 */

import type { ChildProcess } from 'child_process'

// Re-export miniprogram-automator types for easier imports
export type { MiniProgram, Page, Element, SystemInfo } from './types/miniprogram-automator.js'

export interface ServerConfig {
  projectPath?: string
  cliPath?: string
  port?: number
  autoPort?: number // Automation port for WeChat DevTools (alias for port)
  capabilities?: string[]
  outputDir?: string
  timeout?: number
  sessionTimeout?: number // Session timeout in milliseconds (default: 30 minutes)
  logLevel?: LogLevel // Log level (default: 'info')
  enableFileLog?: boolean // Enable file logging (default: false)
  logBufferSize?: number // Log buffer size (default: 100)
  logFlushInterval?: number // Log flush interval in ms (default: 5000)
  enableSessionReport?: boolean // Enable session report generation (default: false)
  enableFailureSnapshot?: boolean // Enable automatic failure snapshot capture (F2 feature, default: false)
}

/**
 * Cached element with page metadata for invalidation
 */
export interface CachedElement {
  element: any // The actual element object (using any to allow mocking and avoid type conflicts)
  pagePath: string // Page path where element was cached
  cachedAt: Date // When the element was cached
}

export interface SessionState {
  sessionId: string
  miniProgram?: any // miniprogram-automator MiniProgram instance (using any to allow mocking)
  ideProcess?: ChildProcess // IDE process handle
  pages: any[] // Page stack (using any to avoid type conflicts)
  elements: Map<string, CachedElement> // Element cache (refId -> CachedElement)
  currentPagePath?: string // Current page path for cache invalidation
  outputDir: string // Session-specific output directory
  createdAt: Date
  lastActivity: Date
  config?: SessionConfig
  logger?: Logger // Session-specific logger
  loggerConfig?: LoggerConfig // Logger configuration (for ToolLogger)
  outputManager?: OutputManager // Session-specific output manager
  recording?: RecordingState // Recording state
  reportData?: ReportData // Session report collection (F3)
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
  page: any // Page object from miniprogram-automator
  element: any // Element object from miniprogram-automator (using any to avoid type conflicts)
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
 * Logger configuration
 */
export interface LoggerConfig {
  level?: LogLevel // Minimum log level (default: 'info')
  enableFileLog?: boolean // Enable file logging (default: false)
  outputDir?: string // Output directory for logs
  bufferSize?: number // Buffer size for file writes (default: 100)
  flushInterval?: number // Flush interval in ms (default: 5000)
  enableFailureSnapshot?: boolean // Enable automatic failure snapshot capture (default: false)
}

/**
 * Logger interface for structured logging
 */
export interface Logger {
  info(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, context?: Record<string, any>): void
  debug(message: string, context?: Record<string, any>): void
  child(toolName: string): Logger
  dispose?(): Promise<void> // Flush buffer and close file handles
  flush?(): Promise<void> // Force flush buffer to disk
}

/**
 * Tool execution log entry with timing
 */
export interface ToolLogEntry extends LogEntry {
  toolName: string // Tool name (e.g., "page_query")
  phase: 'START' | 'END' | 'ERROR'
  args?: any // Tool input arguments (START phase)
  result?: any // Tool output result (END phase)
  error?: string // Error message (ERROR phase)
  duration?: number // Execution time in ms (END/ERROR phase)
  stackTrace?: string // Error stack trace (ERROR phase)
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

/**
 * Tool call record for session report (F3)
 */
export interface ToolCallRecord {
  timestamp: Date
  toolName: string
  duration: number // milliseconds
  success: boolean
  result?: any // Sanitized result (success case)
  error?: {
    message: string
    snapshotPath?: string // Link to F2 failure snapshot
  }
}

/**
 * Report data collected during session (F3)
 */
export interface ReportData {
  toolCalls: ToolCallRecord[]
  startTime: Date
  endTime?: Date
}

/**
 * Session report (JSON format) (F3)
 */
export interface SessionReport {
  sessionId: string
  startTime: string // ISO 8601
  endTime: string // ISO 8601
  duration: number // milliseconds
  summary: {
    totalCalls: number
    successCount: number
    failureCount: number
    successRate: number // 0-1
    avgDuration: number // milliseconds
    maxDuration: number
    minDuration: number
  }
  toolCalls: ToolCallRecord[]
  failures: Array<{
    toolName: string
    timestamp: string
    error: string
    snapshotPath?: string
  }>
}
