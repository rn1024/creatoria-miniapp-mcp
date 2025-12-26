/**
 * Record handlers exports
 *
 * All 6 handlers are now independently implemented in this directory.
 */

export {
  startRecording,
  stopRecording,
  recordAction,
  listSequences,
  getSequence,
  deleteSequence,
  replaySequence,
  type StartRecordingArgs,
  type StartRecordingResult,
  type StopRecordingArgs,
  type StopRecordingResult,
  type ListSequencesResult,
  type GetSequenceArgs,
  type GetSequenceResult,
  type DeleteSequenceArgs,
  type DeleteSequenceResult,
  type ReplaySequenceArgs,
  type ReplaySequenceResult,
} from './record-handlers.js'
