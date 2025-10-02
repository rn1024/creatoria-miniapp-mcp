/**
 * Recording and replay tool implementations
 * Handles action sequence recording, saving, and replay
 */

import { promises as fs } from 'fs'
import path from 'path'
import type { SessionState, ActionSequence, RecordedAction } from '../types.js'

/**
 * Generate a unique sequence ID
 */
function generateSequenceId(): string {
  return `seq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get sequences directory path
 */
function getSequencesDir(session: SessionState): string {
  return path.join(session.outputDir, 'sequences')
}

/**
 * Ensure sequences directory exists
 */
async function ensureSequencesDir(session: SessionState): Promise<void> {
  const dir = getSequencesDir(session)
  await fs.mkdir(dir, { recursive: true })
}

/**
 * Start recording actions
 */
export async function startRecording(
  session: SessionState,
  args: {
    name?: string
    description?: string
  } = {}
): Promise<{
  success: boolean
  message: string
  sequenceId?: string
}> {
  const { name = `Recording ${new Date().toISOString()}`, description } = args
  const logger = session.logger

  try {
    logger?.info('Starting recording', { name })

    // Check if already recording
    if (session.recording?.isRecording) {
      throw new Error('Already recording. Stop current recording first.')
    }

    // Initialize recording state
    const sequenceId = generateSequenceId()
    session.recording = {
      isRecording: true,
      startedAt: new Date(),
      currentSequence: {
        id: sequenceId,
        name,
        description,
        createdAt: new Date(),
        actions: [],
      },
    }

    logger?.info('Recording started', { sequenceId, name })

    return {
      success: true,
      message: `Recording started: ${name}`,
      sequenceId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to start recording', { error: errorMessage })
    throw new Error(`Failed to start recording: ${errorMessage}`)
  }
}

/**
 * Stop recording and save sequence
 */
export async function stopRecording(
  session: SessionState,
  args: {
    save?: boolean
  } = {}
): Promise<{
  success: boolean
  message: string
  sequenceId?: string
  actionCount?: number
  filePath?: string
}> {
  const { save = true } = args
  const logger = session.logger

  try {
    logger?.info('Stopping recording')

    // Check if recording
    if (!session.recording?.isRecording || !session.recording.currentSequence) {
      throw new Error('Not currently recording')
    }

    const sequence = session.recording.currentSequence
    const actionCount = sequence.actions.length

    // Stop recording
    session.recording.isRecording = false

    let filePath: string | undefined

    // Save sequence if requested
    if (save) {
      await ensureSequencesDir(session)
      const filename = `${sequence.id}.json`
      filePath = path.join(getSequencesDir(session), filename)

      await fs.writeFile(filePath, JSON.stringify(sequence, null, 2), 'utf-8')

      logger?.info('Sequence saved', {
        sequenceId: sequence.id,
        filePath,
        actionCount,
      })
    }

    // Clear recording state
    session.recording = undefined

    return {
      success: true,
      message: `Recording stopped: ${sequence.name} (${actionCount} actions)`,
      sequenceId: sequence.id,
      actionCount,
      filePath,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to stop recording', { error: errorMessage })
    throw new Error(`Failed to stop recording: ${errorMessage}`)
  }
}

/**
 * Record an action (internal helper, called by tool wrapper)
 */
export function recordAction(
  session: SessionState,
  toolName: string,
  args: Record<string, any>,
  success: boolean,
  duration?: number,
  error?: string
): void {
  if (!session.recording?.isRecording || !session.recording.currentSequence) {
    return
  }

  const action: RecordedAction = {
    timestamp: new Date(),
    toolName,
    args,
    duration,
    success,
    error,
  }

  session.recording.currentSequence.actions.push(action)
}

/**
 * List all saved sequences
 */
export async function listSequences(session: SessionState): Promise<{
  success: boolean
  message: string
  sequences: Array<{
    id: string
    name: string
    description?: string
    createdAt: string
    actionCount: number
  }>
}> {
  const logger = session.logger

  try {
    logger?.info('Listing sequences')

    await ensureSequencesDir(session)
    const dir = getSequencesDir(session)
    const files = await fs.readdir(dir)

    const sequences = []
    for (const file of files) {
      if (!file.endsWith('.json')) continue

      const filePath = path.join(dir, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const sequence: ActionSequence = JSON.parse(content)

      sequences.push({
        id: sequence.id,
        name: sequence.name,
        description: sequence.description,
        createdAt: sequence.createdAt.toString(),
        actionCount: sequence.actions.length,
      })
    }

    logger?.info('Sequences listed', { count: sequences.length })

    return {
      success: true,
      message: `Found ${sequences.length} sequences`,
      sequences,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to list sequences', { error: errorMessage })
    throw new Error(`Failed to list sequences: ${errorMessage}`)
  }
}

/**
 * Get a specific sequence
 */
export async function getSequence(
  session: SessionState,
  args: {
    sequenceId: string
  }
): Promise<{
  success: boolean
  message: string
  sequence: ActionSequence
}> {
  const { sequenceId } = args
  const logger = session.logger

  try {
    logger?.info('Getting sequence', { sequenceId })

    await ensureSequencesDir(session)
    const filePath = path.join(getSequencesDir(session), `${sequenceId}.json`)

    const content = await fs.readFile(filePath, 'utf-8')
    const sequence: ActionSequence = JSON.parse(content)

    logger?.info('Sequence retrieved', {
      sequenceId,
      actionCount: sequence.actions.length,
    })

    return {
      success: true,
      message: `Sequence retrieved: ${sequence.name}`,
      sequence,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to get sequence', { error: errorMessage, sequenceId })
    throw new Error(`Failed to get sequence: ${errorMessage}`)
  }
}

/**
 * Delete a sequence
 */
export async function deleteSequence(
  session: SessionState,
  args: {
    sequenceId: string
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { sequenceId } = args
  const logger = session.logger

  try {
    logger?.info('Deleting sequence', { sequenceId })

    const filePath = path.join(getSequencesDir(session), `${sequenceId}.json`)
    await fs.unlink(filePath)

    logger?.info('Sequence deleted', { sequenceId })

    return {
      success: true,
      message: `Sequence deleted: ${sequenceId}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to delete sequence', {
      error: errorMessage,
      sequenceId,
    })
    throw new Error(`Failed to delete sequence: ${errorMessage}`)
  }
}

/**
 * Replay a recorded sequence
 */
export async function replaySequence(
  session: SessionState,
  args: {
    sequenceId: string
    continueOnError?: boolean
  }
): Promise<{
  success: boolean
  message: string
  totalActions: number
  successCount: number
  failureCount: number
  results: Array<{
    toolName: string
    success: boolean
    error?: string
  }>
}> {
  const { sequenceId, continueOnError = false } = args
  const logger = session.logger

  try {
    logger?.info('Replaying sequence', { sequenceId, continueOnError })

    // Get sequence
    const { sequence } = await getSequence(session, { sequenceId })

    // Import tools dynamically
    const tools = await import('./index.js')

    const results = []
    let successCount = 0
    let failureCount = 0

    // Replay each action
    for (const action of sequence.actions) {
      const startTime = Date.now()

      try {
        // Get tool function
        const toolFn = (tools as any)[action.toolName]
        if (!toolFn || typeof toolFn !== 'function') {
          throw new Error(`Tool not found: ${action.toolName}`)
        }

        // Execute tool
        await toolFn(session, action.args)

        const duration = Date.now() - startTime
        logger?.info('Action replayed successfully', {
          toolName: action.toolName,
          duration,
        })

        results.push({
          toolName: action.toolName,
          success: true,
        })
        successCount++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const duration = Date.now() - startTime

        logger?.error('Action replay failed', {
          toolName: action.toolName,
          error: errorMessage,
          duration,
        })

        results.push({
          toolName: action.toolName,
          success: false,
          error: errorMessage,
        })
        failureCount++

        if (!continueOnError) {
          throw new Error(`Replay stopped at action ${action.toolName}: ${errorMessage}`)
        }
      }
    }

    logger?.info('Sequence replay completed', {
      sequenceId,
      totalActions: sequence.actions.length,
      successCount,
      failureCount,
    })

    return {
      success: failureCount === 0,
      message: `Replay completed: ${successCount} success, ${failureCount} failures`,
      totalActions: sequence.actions.length,
      successCount,
      failureCount,
      results,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Failed to replay sequence', {
      error: errorMessage,
      sequenceId,
    })
    throw new Error(`Failed to replay sequence: ${errorMessage}`)
  }
}
