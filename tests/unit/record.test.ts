/**
 * Unit tests for Record tools
 */

import * as recordTools from '../../src/tools/record'
import type { SessionState, ActionSequence } from '../../src/types'
import { promises as fs } from 'fs'
import path from 'path'

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    readdir: jest.fn(),
    unlink: jest.fn(),
  },
}))

describe('Record Tools', () => {
  let mockSession: SessionState

  beforeEach(() => {
    mockSession = {
      sessionId: 'test-session',
      pages: [],
      elements: new Map(),
      outputDir: '/tmp/test-output',
      createdAt: new Date(),
      lastActivity: new Date(),
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        child: jest.fn().mockReturnThis(),
      },
    }

    jest.clearAllMocks()
  })

  describe('startRecording', () => {
    it('should start recording with default name', async () => {
      const result = await recordTools.startRecording(mockSession, {})

      expect(result.success).toBe(true)
      expect(result.message).toContain('Recording started')
      expect(result.sequenceId).toBeDefined()
      expect(mockSession.recording?.isRecording).toBe(true)
      expect(mockSession.recording?.currentSequence).toBeDefined()
      expect(mockSession.recording?.currentSequence?.actions).toEqual([])
    })

    it('should start recording with custom name and description', async () => {
      const result = await recordTools.startRecording(mockSession, {
        name: 'Test Recording',
        description: 'A test sequence',
      })

      expect(result.success).toBe(true)
      expect(mockSession.recording?.currentSequence?.name).toBe('Test Recording')
      expect(mockSession.recording?.currentSequence?.description).toBe('A test sequence')
    })

    it('should fail if already recording', async () => {
      await recordTools.startRecording(mockSession, { name: 'First' })

      await expect(recordTools.startRecording(mockSession, { name: 'Second' })).rejects.toThrow(
        'Already recording'
      )
    })
  })

  describe('stopRecording', () => {
    beforeEach(async () => {
      await recordTools.startRecording(mockSession, { name: 'Test Recording' })
    })

    it('should stop recording and save sequence', async () => {
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(fs.writeFile as jest.Mock).mockResolvedValue(undefined)

      const result = await recordTools.stopRecording(mockSession, {})

      expect(result.success).toBe(true)
      expect(result.actionCount).toBe(0)
      expect(result.filePath).toBeDefined()
      expect(mockSession.recording).toBeUndefined()

      expect(fs.mkdir).toHaveBeenCalled()
      expect(fs.writeFile).toHaveBeenCalled()
    })

    it('should stop recording without saving', async () => {
      const result = await recordTools.stopRecording(mockSession, {
        save: false,
      })

      expect(result.success).toBe(true)
      expect(result.filePath).toBeUndefined()
      expect(mockSession.recording).toBeUndefined()

      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    it('should fail if not recording', async () => {
      await recordTools.stopRecording(mockSession, {})

      await expect(recordTools.stopRecording(mockSession, {})).rejects.toThrow(
        'Not currently recording'
      )
    })
  })

  describe('recordAction', () => {
    beforeEach(async () => {
      await recordTools.startRecording(mockSession, { name: 'Test Recording' })
    })

    it('should record an action when recording is active', () => {
      recordTools.recordAction(mockSession, 'element_tap', { refId: 'elem_123' }, true, 150)

      const actions = mockSession.recording?.currentSequence?.actions
      expect(actions).toHaveLength(1)
      expect(actions?.[0]).toMatchObject({
        toolName: 'element_tap',
        args: { refId: 'elem_123' },
        success: true,
        duration: 150,
      })
    })

    it('should record failed action with error', () => {
      recordTools.recordAction(
        mockSession,
        'element_tap',
        { refId: 'elem_123' },
        false,
        100,
        'Element not found'
      )

      const actions = mockSession.recording?.currentSequence?.actions
      expect(actions).toHaveLength(1)
      expect(actions?.[0]).toMatchObject({
        toolName: 'element_tap',
        success: false,
        error: 'Element not found',
      })
    })

    it('should not record action when not recording', () => {
      const session: SessionState = {
        ...mockSession,
        recording: undefined,
      }

      recordTools.recordAction(session, 'element_tap', { refId: 'elem_123' }, true)

      expect(session.recording).toBeUndefined()
    })

    it('should record multiple actions in sequence', () => {
      recordTools.recordAction(mockSession, 'page_query', { selector: '.button' }, true, 50)
      recordTools.recordAction(mockSession, 'element_tap', { refId: 'elem_123' }, true, 100)
      recordTools.recordAction(
        mockSession,
        'element_input',
        { refId: 'elem_456', value: 'test' },
        true,
        75
      )

      const actions = mockSession.recording?.currentSequence?.actions
      expect(actions).toHaveLength(3)
      expect(actions?.map((a) => a.toolName)).toEqual([
        'page_query',
        'element_tap',
        'element_input',
      ])
    })
  })

  describe('listSequences', () => {
    it('should list all saved sequences', async () => {
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(fs.readdir as jest.Mock).mockResolvedValue(['seq_1.json', 'seq_2.json', 'other.txt'])

      const mockSeq1: ActionSequence = {
        id: 'seq_1',
        name: 'Sequence 1',
        description: 'First sequence',
        createdAt: new Date('2025-01-01'),
        actions: [
          {
            timestamp: new Date(),
            toolName: 'element_tap',
            args: {},
            success: true,
          },
        ],
      }

      const mockSeq2: ActionSequence = {
        id: 'seq_2',
        name: 'Sequence 2',
        createdAt: new Date('2025-01-02'),
        actions: [],
      }

      ;(fs.readFile as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockSeq1))
        .mockResolvedValueOnce(JSON.stringify(mockSeq2))

      const result = await recordTools.listSequences(mockSession)

      expect(result.success).toBe(true)
      expect(result.sequences).toHaveLength(2)
      expect(result.sequences[0]).toMatchObject({
        id: 'seq_1',
        name: 'Sequence 1',
        description: 'First sequence',
        actionCount: 1,
      })
      expect(result.sequences[1]).toMatchObject({
        id: 'seq_2',
        name: 'Sequence 2',
        actionCount: 0,
      })
    })

    it('should return empty list when no sequences exist', async () => {
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(fs.readdir as jest.Mock).mockResolvedValue([])

      const result = await recordTools.listSequences(mockSession)

      expect(result.success).toBe(true)
      expect(result.sequences).toEqual([])
      expect(result.message).toContain('0 sequences')
    })
  })

  describe('getSequence', () => {
    it('should retrieve a specific sequence', async () => {
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)

      const mockSequence: ActionSequence = {
        id: 'seq_test',
        name: 'Test Sequence',
        description: 'Test description',
        createdAt: new Date('2025-01-01'),
        actions: [
          {
            timestamp: new Date(),
            toolName: 'element_tap',
            args: { refId: 'elem_123' },
            success: true,
          },
        ],
      }

      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockSequence))

      const result = await recordTools.getSequence(mockSession, {
        sequenceId: 'seq_test',
      })

      expect(result.success).toBe(true)
      expect(result.sequence.id).toBe('seq_test')
      expect(result.sequence.name).toBe('Test Sequence')
      expect(result.sequence.actions).toHaveLength(1)
    })

    it('should fail when sequence not found', async () => {
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file'))

      await expect(
        recordTools.getSequence(mockSession, { sequenceId: 'nonexistent' })
      ).rejects.toThrow()
    })
  })

  describe('deleteSequence', () => {
    it('should delete a sequence', async () => {
      ;(fs.unlink as jest.Mock).mockResolvedValue(undefined)

      const result = await recordTools.deleteSequence(mockSession, {
        sequenceId: 'seq_test',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('deleted')

      expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining('seq_test.json'))
    })

    it('should fail when sequence not found', async () => {
      ;(fs.unlink as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file'))

      await expect(
        recordTools.deleteSequence(mockSession, { sequenceId: 'nonexistent' })
      ).rejects.toThrow()
    })
  })

  describe('replaySequence', () => {
    it('should replay a sequence successfully', async () => {
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)

      const mockSequence: ActionSequence = {
        id: 'seq_test',
        name: 'Test Sequence',
        createdAt: new Date(),
        actions: [
          {
            timestamp: new Date(),
            toolName: 'miniprogram_navigate',
            args: { method: 'navigateTo', url: '/pages/index/index' },
            success: true,
          },
        ],
      }

      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockSequence))

      // Mock the imported tools module
      const mockNavigate = jest.fn().mockResolvedValue({
        success: true,
        message: 'Navigated',
      })

      jest.doMock('../../src/tools/index.js', () => ({
        miniprogram_navigate: mockNavigate,
      }))

      const result = await recordTools.replaySequence(mockSession, {
        sequenceId: 'seq_test',
      })

      expect(result.totalActions).toBe(1)
      expect(result.successCount).toBe(1)
      expect(result.failureCount).toBe(0)
    })

    it('should stop on first error when continueOnError is false', async () => {
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)

      const mockSequence: ActionSequence = {
        id: 'seq_test',
        name: 'Test Sequence',
        createdAt: new Date(),
        actions: [
          {
            timestamp: new Date(),
            toolName: 'element_tap',
            args: { refId: 'elem_123' },
            success: true,
          },
          {
            timestamp: new Date(),
            toolName: 'element_tap',
            args: { refId: 'elem_456' },
            success: true,
          },
        ],
      }

      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockSequence))

      await expect(
        recordTools.replaySequence(mockSession, {
          sequenceId: 'seq_test',
          continueOnError: false,
        })
      ).rejects.toThrow()
    })
  })
})
