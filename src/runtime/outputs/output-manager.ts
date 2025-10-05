import { mkdir, writeFile as fsWriteFile } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import type { OutputManager, OutputType } from '../../types.js'

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
    const count = this.counter.get(type) || 0
    this.counter.set(type, count + 1)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    return `${type}-${count + 1}-${timestamp}.${extension}`
  }

  async writeFile(filename: string, content: Buffer | string): Promise<string> {
    await this.ensureOutputDir()
    const fullPath = join(this.outputDir, filename)
    const fileDir = dirname(fullPath)
    if (!existsSync(fileDir)) {
      await mkdir(fileDir, { recursive: true })
    }
    await fsWriteFile(fullPath, content)
    return fullPath
  }

  async ensureOutputDir(): Promise<void> {
    if (!existsSync(this.outputDir)) {
      await mkdir(this.outputDir, { recursive: true })
    }
  }
}

export function createOutputManager(outputDir: string): OutputManager {
  return new FileOutputManager(outputDir)
}
