/**
 * Record Capability Module
 *
 * Provides tools for action recording and replay including starting/stopping
 * recordings, managing sequences, and replaying recorded actions.
 */

import type { CapabilityModule, ToolDefinition } from '../registry.js'
import {
  startRecordingSchema,
  stopRecordingSchema,
  listSequencesSchema,
  getSequenceSchema,
  deleteSequenceSchema,
  replaySequenceSchema,
} from './schemas/index.js'
import {
  startRecording,
  stopRecording,
  listSequences,
  getSequence,
  deleteSequence,
  replaySequence,
} from './handlers/index.js'

// Re-export schemas for external use
export * from './schemas/index.js'

// Re-export handlers for external use
export * from './handlers/index.js'

/**
 * Record tool definitions - 6 tools
 */
const tools: ToolDefinition[] = [
  {
    name: 'record_start',
    description: 'Start recording user actions for later replay',
    capability: 'record',
    inputSchema: startRecordingSchema,
    handler: startRecording,
  },
  {
    name: 'record_stop',
    description: 'Stop the current recording and save the sequence',
    capability: 'record',
    inputSchema: stopRecordingSchema,
    handler: stopRecording,
  },
  {
    name: 'record_list',
    description: 'List all saved action sequences',
    capability: 'record',
    inputSchema: listSequencesSchema,
    handler: listSequences,
  },
  {
    name: 'record_get',
    description: 'Get details of a specific sequence',
    capability: 'record',
    inputSchema: getSequenceSchema,
    handler: getSequence,
  },
  {
    name: 'record_delete',
    description: 'Delete a saved sequence',
    capability: 'record',
    inputSchema: deleteSequenceSchema,
    handler: deleteSequence,
  },
  {
    name: 'record_replay',
    description: 'Replay a recorded action sequence',
    capability: 'record',
    inputSchema: replaySequenceSchema,
    handler: replaySequence,
  },
]

/**
 * Record capability module
 */
export const capability: CapabilityModule = {
  name: 'record',
  description: 'Action recording and replay utilities (6 tools)',
  tools,
}

export default capability
