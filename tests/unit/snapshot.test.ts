/**
 * Unit tests for Snapshot tools
 */

import * as snapshotTools from '../../src/tools/snapshot'
import * as miniprogramTools from '../../src/tools/miniprogram'
import * as pageTools from '../../src/tools/page'
import type { SessionState } from '../../src/types'

// Mock the miniprogram and page tools
jest.mock('../../src/tools/miniprogram')
jest.mock('../../src/tools/page')
jest.mock('../../src/tools/element')

describe('Snapshot Tools', () => {
  let mockSession: SessionState

  beforeEach(() => {
    const mockOutputManager = {
      ensureOutputDir: jest.fn().mockResolvedValue(undefined),
      generateFilename: jest.fn((prefix: string, ext: string) => `${prefix}-${Date.now()}.${ext}`),
      writeFile: jest.fn((filename: string) => Promise.resolve(`/tmp/test-output/${filename}`)),
    }

    mockSession = {
      sessionId: 'test-session',
      pages: [],
      elements: new Map(),
      outputDir: '/tmp/test-output',
      outputManager: mockOutputManager as any,
      miniProgram: {} as any,
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

  describe('snapshotPage', () => {
    it('should capture page snapshot with screenshot', async () => {
      ;(miniprogramTools.getPageStack as jest.Mock).mockResolvedValue({
        success: true,
        pages: [
          { path: 'pages/index/index', query: {} },
          { path: 'pages/detail/detail', query: { id: '123' } },
        ],
      })
      ;(pageTools.getData as jest.Mock).mockResolvedValue({
        success: true,
        data: { count: 5, items: [] },
      })
      ;(miniprogramTools.screenshot as jest.Mock).mockResolvedValue({
        success: true,
        path: '/tmp/test-output/page-snapshot-123.png',
      })

      const result = await snapshotTools.snapshotPage(mockSession, {})

      expect(result.success).toBe(true)
      expect(result.snapshotPath).toBeDefined()
      expect(result.screenshotPath).toBeDefined()
      expect(result.data.pagePath).toBe('pages/detail/detail')
      expect(result.data.pageData).toEqual({ count: 5, items: [] })
      expect(result.data.pageQuery).toEqual({ id: '123' })

      expect(miniprogramTools.getPageStack).toHaveBeenCalledWith(mockSession)
      expect(pageTools.getData).toHaveBeenCalledWith(mockSession, {
        pagePath: undefined,
      })
      expect(miniprogramTools.screenshot).toHaveBeenCalled()
    })

    it('should capture page snapshot without screenshot', async () => {
      ;(miniprogramTools.getPageStack as jest.Mock).mockResolvedValue({
        success: true,
        pages: [{ path: 'pages/index/index', query: {} }],
      })
      ;(pageTools.getData as jest.Mock).mockResolvedValue({
        success: true,
        data: { text: 'Hello' },
      })

      const result = await snapshotTools.snapshotPage(mockSession, {
        includeScreenshot: false,
      })

      expect(result.success).toBe(true)
      expect(result.snapshotPath).toBeDefined()
      expect(result.screenshotPath).toBeUndefined()
      expect(miniprogramTools.screenshot).not.toHaveBeenCalled()
    })

    it('should support custom filename', async () => {
      ;(miniprogramTools.getPageStack as jest.Mock).mockResolvedValue({
        success: true,
        pages: [{ path: 'pages/index/index', query: {} }],
      })
      ;(pageTools.getData as jest.Mock).mockResolvedValue({
        success: true,
        data: {},
      })
      ;(miniprogramTools.screenshot as jest.Mock).mockResolvedValue({
        success: true,
        path: '/tmp/test-output/custom-snapshot.png',
      })

      const result = await snapshotTools.snapshotPage(mockSession, {
        filename: 'custom-snapshot.json',
      })

      expect(result.success).toBe(true)
      expect(mockSession.outputManager?.writeFile).toHaveBeenCalledWith(
        'custom-snapshot.json',
        expect.any(Buffer)
      )
    })

    it('should fail when no miniProgram connected', async () => {
      const sessionWithoutMP = { ...mockSession, miniProgram: undefined }

      await expect(snapshotTools.snapshotPage(sessionWithoutMP, {})).rejects.toThrow(
        'MiniProgram not connected'
      )
    })

    it('should fail when no active page', async () => {
      ;(miniprogramTools.getPageStack as jest.Mock).mockResolvedValue({
        success: true,
        pages: [],
      })

      await expect(snapshotTools.snapshotPage(mockSession, {})).rejects.toThrow(
        'No active page found'
      )
    })
  })

  describe('snapshotFull', () => {
    it('should capture full application snapshot', async () => {
      ;(miniprogramTools.getSystemInfo as jest.Mock).mockResolvedValue({
        success: true,
        systemInfo: {
          platform: 'devtools',
          version: '8.0.0',
        },
      })
      ;(miniprogramTools.getPageStack as jest.Mock).mockResolvedValue({
        success: true,
        pages: [
          { path: 'pages/index/index', query: {} },
          { path: 'pages/detail/detail', query: { id: '123' } },
        ],
      })
      ;(pageTools.getData as jest.Mock).mockResolvedValue({
        success: true,
        data: { count: 5 },
      })
      ;(miniprogramTools.screenshot as jest.Mock).mockResolvedValue({
        success: true,
        path: '/tmp/test-output/app-snapshot-123.png',
      })

      const result = await snapshotTools.snapshotFull(mockSession, {})

      expect(result.success).toBe(true)
      expect(result.snapshotPath).toBeDefined()
      expect(result.screenshotPath).toBeDefined()
      expect(result.data.systemInfo).toEqual({
        platform: 'devtools',
        version: '8.0.0',
      })
      expect(result.data.pageStack).toHaveLength(2)
      expect(result.data.currentPage.path).toBe('pages/detail/detail')
      expect(result.data.currentPage.data).toEqual({ count: 5 })

      expect(miniprogramTools.getSystemInfo).toHaveBeenCalledWith(mockSession)
      expect(miniprogramTools.getPageStack).toHaveBeenCalledWith(mockSession)
      expect(pageTools.getData).toHaveBeenCalledWith(mockSession, {})
      expect(miniprogramTools.screenshot).toHaveBeenCalled()
    })

    it('should capture full snapshot without screenshot', async () => {
      ;(miniprogramTools.getSystemInfo as jest.Mock).mockResolvedValue({
        success: true,
        systemInfo: { platform: 'devtools' },
      })
      ;(miniprogramTools.getPageStack as jest.Mock).mockResolvedValue({
        success: true,
        pages: [{ path: 'pages/index/index', query: {} }],
      })
      ;(pageTools.getData as jest.Mock).mockResolvedValue({
        success: true,
        data: {},
      })

      const result = await snapshotTools.snapshotFull(mockSession, {
        includeScreenshot: false,
      })

      expect(result.success).toBe(true)
      expect(result.screenshotPath).toBeUndefined()
      expect(miniprogramTools.screenshot).not.toHaveBeenCalled()
    })

    it('should fail when no miniProgram connected', async () => {
      const sessionWithoutMP = { ...mockSession, miniProgram: undefined }

      await expect(snapshotTools.snapshotFull(sessionWithoutMP, {})).rejects.toThrow(
        'MiniProgram not connected'
      )
    })
  })

  describe('snapshotElement', () => {
    it('should fail when no miniProgram connected', async () => {
      const sessionWithoutMP = { ...mockSession, miniProgram: undefined }

      await expect(
        snapshotTools.snapshotElement(sessionWithoutMP, { refId: 'test-ref' })
      ).rejects.toThrow('MiniProgram not connected')
    })

    it('should fail when no outputManager available', async () => {
      const sessionWithoutOM = { ...mockSession, outputManager: undefined }

      await expect(
        snapshotTools.snapshotElement(sessionWithoutOM, { refId: 'test-ref' })
      ).rejects.toThrow('OutputManager not available')
    })
  })
})
