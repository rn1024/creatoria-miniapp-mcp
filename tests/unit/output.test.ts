/**
 * Unit tests for OutputManager
 */

import { FileOutputManager, createOutputManager } from '../../src/core/output'
import { existsSync } from 'fs'
import { rm, readFile } from 'fs/promises'
import { join } from 'path'

describe('OutputManager', () => {
  const testOutputDir = '.test-output'

  afterEach(async () => {
    // Clean up test output directory
    if (existsSync(testOutputDir)) {
      await rm(testOutputDir, { recursive: true, force: true })
    }
  })

  describe('FileOutputManager', () => {
    it('should return output directory', () => {
      const manager = new FileOutputManager(testOutputDir)
      expect(manager.getOutputDir()).toBe(testOutputDir)
    })

    it('should generate unique filenames', () => {
      const manager = new FileOutputManager(testOutputDir)

      const file1 = manager.generateFilename('screenshot', 'png')
      const file2 = manager.generateFilename('screenshot', 'png')
      const file3 = manager.generateFilename('snapshot', 'html')

      expect(file1).toContain('screenshot')
      expect(file1).toContain('.png')
      expect(file2).toContain('screenshot')
      expect(file2).toContain('.png')
      expect(file3).toContain('snapshot')
      expect(file3).toContain('.html')

      // Files should be different
      expect(file1).not.toBe(file2)
      expect(file1).not.toBe(file3)
    })

    it('should include counter in filename', () => {
      const manager = new FileOutputManager(testOutputDir)

      const file1 = manager.generateFilename('screenshot', 'png')
      const file2 = manager.generateFilename('screenshot', 'png')

      expect(file1).toContain('screenshot-1-')
      expect(file2).toContain('screenshot-2-')
    })

    it('should include timestamp in filename', () => {
      const manager = new FileOutputManager(testOutputDir)
      const filename = manager.generateFilename('screenshot', 'png')

      // Check for timestamp pattern: YYYY-MM-DDTHH-MM-SS
      expect(filename).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/)
    })

    it('should write string content to file', async () => {
      const manager = new FileOutputManager(testOutputDir)
      const filename = 'test.txt'
      const content = 'Hello, World!'

      const fullPath = await manager.writeFile(filename, content)

      expect(fullPath).toBe(join(testOutputDir, filename))
      expect(existsSync(fullPath)).toBe(true)

      const readContent = await readFile(fullPath, 'utf-8')
      expect(readContent).toBe(content)
    })

    it('should write buffer content to file', async () => {
      const manager = new FileOutputManager(testOutputDir)
      const filename = 'test.bin'
      const content = Buffer.from([0x00, 0x01, 0x02, 0x03])

      const fullPath = await manager.writeFile(filename, content)

      expect(existsSync(fullPath)).toBe(true)

      const readContent = await readFile(fullPath)
      expect(Buffer.compare(readContent, content)).toBe(0)
    })

    it('should create output directory if not exists', async () => {
      const manager = new FileOutputManager(testOutputDir)

      expect(existsSync(testOutputDir)).toBe(false)

      await manager.ensureOutputDir()

      expect(existsSync(testOutputDir)).toBe(true)
    })

    it('should create subdirectories if filename contains path', async () => {
      const manager = new FileOutputManager(testOutputDir)
      const filename = 'subdir/test.txt'
      const content = 'Test content'

      const fullPath = await manager.writeFile(filename, content)

      expect(existsSync(fullPath)).toBe(true)
      expect(existsSync(join(testOutputDir, 'subdir'))).toBe(true)

      const readContent = await readFile(fullPath, 'utf-8')
      expect(readContent).toBe(content)
    })

    it('should not fail if output directory already exists', async () => {
      const manager = new FileOutputManager(testOutputDir)

      await manager.ensureOutputDir()
      await manager.ensureOutputDir() // Call again

      expect(existsSync(testOutputDir)).toBe(true)
    })

    it('should maintain separate counters for different types', () => {
      const manager = new FileOutputManager(testOutputDir)

      const screenshot1 = manager.generateFilename('screenshot', 'png')
      const snapshot1 = manager.generateFilename('snapshot', 'html')
      const screenshot2 = manager.generateFilename('screenshot', 'png')

      expect(screenshot1).toContain('screenshot-1-')
      expect(snapshot1).toContain('snapshot-1-')
      expect(screenshot2).toContain('screenshot-2-')
    })
  })

  describe('createOutputManager', () => {
    it('should create FileOutputManager instance', () => {
      const manager = createOutputManager(testOutputDir)

      expect(manager).toBeInstanceOf(FileOutputManager)
      expect(manager.getOutputDir()).toBe(testOutputDir)
    })
  })
})
