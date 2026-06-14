/**
 * Logging Handlers
 *
 * Handlers for collecting and reading console/error logs
 * from the WeChat Mini Program runtime.
 */

import type {
  SessionState,
  ConsoleLogEntry,
  ErrorLogEntry,
  MiniProgramLogEntry,
} from '../../../types.js'

// --- log_start ---

export interface LogStartArgs {
  maxEntries?: number
}

export interface LogStartResult {
  success: boolean
  message: string
  isListening: boolean
}

export async function logStart(
  session: SessionState,
  args: LogStartArgs = {}
): Promise<LogStartResult> {
  const { maxEntries = 1000 } = args
  const logger = session.logger

  if (!session.miniProgram) {
    throw new Error(
      'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
    )
  }

  // If already listening, return current state
  if (session.logBuffer?.isListening) {
    return {
      success: true,
      message: `Already listening. Buffer has ${session.logBuffer.entries.length} entries.`,
      isListening: true,
    }
  }

  logger?.info('Starting log collection', { maxEntries })

  const buffer: MiniProgramLogEntry[] = []

  const consoleHandler = (data: { type: string; args: any[] }) => {
    const entry: ConsoleLogEntry = {
      timestamp: new Date().toISOString(),
      type: (data.type as ConsoleLogEntry['type']) || 'log',
      args: data.args,
    }
    buffer.push(entry)
    if (buffer.length > maxEntries) {
      buffer.splice(0, buffer.length - maxEntries)
    }
  }

  const errorHandler = (data: { message: string; stack?: string }) => {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      message: data.message,
      stack: data.stack,
    }
    buffer.push(entry)
    if (buffer.length > maxEntries) {
      buffer.splice(0, buffer.length - maxEntries)
    }
  }

  session.miniProgram.on('console', consoleHandler)
  session.miniProgram.on('error', errorHandler)

  session.logBuffer = {
    isListening: true,
    entries: buffer,
    maxEntries,
    _consoleHandler: consoleHandler,
    _errorHandler: errorHandler,
  }

  logger?.info('Log collection started')

  return {
    success: true,
    message: 'Log collection started. Use log_read to retrieve entries.',
    isListening: true,
  }
}

// --- log_read ---

export interface LogReadArgs {
  level?: 'all' | 'error' | 'warn' | 'log' | 'info'
  count?: number
  after?: string
}

export interface LogReadResult {
  success: boolean
  count: number
  totalInBuffer: number
  entries: MiniProgramLogEntry[]
}

export async function logRead(
  session: SessionState,
  args: LogReadArgs = {}
): Promise<LogReadResult> {
  const { level = 'all', count = 50, after } = args

  if (!session.logBuffer) {
    throw new Error('Log collection not started. Call log_start first.')
  }

  let entries = session.logBuffer.entries

  // Filter by timestamp
  if (after) {
    const afterTime = new Date(after).getTime()
    entries = entries.filter(
      (e) => new Date(e.timestamp).getTime() > afterTime
    )
  }

  // Filter by level
  if (level !== 'all') {
    entries = entries.filter((e) => {
      // ErrorLogEntry has 'message' field
      if ('message' in e) return level === 'error'
      // ConsoleLogEntry has 'type' field
      return (e as ConsoleLogEntry).type === level
    })
  }

  // Take last N entries
  const result = entries.slice(-count)

  return {
    success: true,
    count: result.length,
    totalInBuffer: session.logBuffer.entries.length,
    entries: result,
  }
}

// --- log_stop ---

export interface LogStopResult {
  success: boolean
  message: string
  entriesCollected: number
}

export async function logStop(session: SessionState): Promise<LogStopResult> {
  const logger = session.logger

  if (!session.logBuffer?.isListening) {
    return {
      success: true,
      message: 'Log collection is not active.',
      entriesCollected: session.logBuffer?.entries.length ?? 0,
    }
  }

  const buffer = session.logBuffer
  const entryCount = buffer.entries.length

  // Remove event listeners
  if (session.miniProgram && buffer._consoleHandler) {
    session.miniProgram.off('console', buffer._consoleHandler)
  }
  if (session.miniProgram && buffer._errorHandler) {
    session.miniProgram.off('error', buffer._errorHandler)
  }

  // Clear buffer state
  session.logBuffer = {
    isListening: false,
    entries: [],
    maxEntries: buffer.maxEntries,
  }

  logger?.info('Log collection stopped', { entriesCollected: entryCount })

  return {
    success: true,
    message: `Log collection stopped. ${entryCount} entries were collected.`,
    entriesCollected: entryCount,
  }
}

// --- log_clear ---

export interface LogClearResult {
  success: boolean
  message: string
  cleared: number
}

export async function logClear(session: SessionState): Promise<LogClearResult> {
  if (!session.logBuffer) {
    throw new Error('Log collection not started. Call log_start first.')
  }

  const cleared = session.logBuffer.entries.length
  session.logBuffer.entries = []

  session.logger?.info('Log buffer cleared', { cleared })

  return {
    success: true,
    message: `Cleared ${cleared} entries from the log buffer.`,
    cleared,
  }
}
