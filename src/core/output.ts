/**
 * OutputManager implementation for artifact generation
 */

import { mkdir, writeFile as fsWriteFile } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import type { OutputManager, OutputType } from '../types.js'

/**
 * File system-based output manager
 */
export class FileOutputManager implements OutputManager {
  private outputDir: string
  private counter: Map<OutputType, number>

  constructor(outputDir: string) {
    this.outputDir = outputDir
    this.counter = new Map()
  }

  getOutputDir(): string {
    return this.outputDir
  }

  generateFilename(type: OutputType, extension: string): string {
    // Get current counter for this type
    const count = this.counter.get(type) || 0
    this.counter.set(type, count + 1)

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

    // Generate filename with type prefix, counter, and timestamp
    const filename = `${type}-${count + 1}-${timestamp}.${extension}`

    return filename
  }

  async writeFile(filename: string, content: Buffer | string): Promise<string> {
    // Ensure output directory exists
    await this.ensureOutputDir()

    // Resolve full path
    const fullPath = join(this.outputDir, filename)

    // Ensure subdirectories exist (if filename contains path separators)
    const fileDir = dirname(fullPath)
    if (!existsSync(fileDir)) {
      await mkdir(fileDir, { recursive: true })
    }

    // Write file
    await fsWriteFile(fullPath, content)

    return fullPath
  }

  async ensureOutputDir(): Promise<void> {
    if (!existsSync(this.outputDir)) {
      await mkdir(this.outputDir, { recursive: true })
    }
  }
}

/**
 * Create an output manager for a session
 */
export function createOutputManager(outputDir: string): OutputManager {
  return new FileOutputManager(outputDir)
}
