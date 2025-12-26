/**
 * Record schemas exports - 6 recording tool schemas
 */

import { z } from 'zod'

export const startRecordingSchema = z
  .object({
    name: z.string().optional().describe('Name for this recording sequence'),
    description: z.string().optional().describe('Optional description of what this sequence does'),
  })
  .describe('Start recording user actions for later replay')

export const stopRecordingSchema = z
  .object({
    save: z.boolean().optional().describe('Whether to save the sequence (default: true)'),
  })
  .describe('Stop the current recording and save the sequence')

export const listSequencesSchema = z.object({}).describe('List all saved action sequences')

export const getSequenceSchema = z
  .object({
    sequenceId: z.string().min(1).describe('ID of the sequence to retrieve'),
  })
  .describe('Get details of a specific sequence')

export const deleteSequenceSchema = z
  .object({
    sequenceId: z.string().min(1).describe('ID of the sequence to delete'),
  })
  .describe('Delete a saved sequence')

export const replaySequenceSchema = z
  .object({
    sequenceId: z.string().min(1).describe('ID of the sequence to replay'),
    continueOnError: z.boolean().optional().describe('Whether to continue replaying if an action fails (default: false)'),
  })
  .describe('Replay a recorded action sequence')
