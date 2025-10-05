#!/usr/bin/env node
import { mkdir, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { listToolSchemas } from '../src/capabilities/schema-registry.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const distDir = join(rootDir, 'dist', 'schemas')

async function generateSchemas() {
  const schemas = listToolSchemas()

  if (schemas.length === 0) {
    console.warn('No tool schemas registered. Nothing to generate.')
    return
  }

  for (const schema of schemas) {
    const capabilityDir = join(distDir, schema.capability)
    await mkdir(capabilityDir, { recursive: true })

    const jsonSchema = zodToJsonSchema(schema.input, schema.name, {
      target: 'jsonSchema7',
      basePath: [`mcp`, schema.capability, schema.name],
    })

    const filePath = join(capabilityDir, `${schema.name}.json`)
    await writeFile(filePath, JSON.stringify(jsonSchema, null, 2), 'utf-8')
    console.log(`✅ Generated schema for ${schema.name} -> ${filePath}`)
  }
}

generateSchemas().catch((error) => {
  console.error('Failed to generate tool schemas:', error)
  process.exit(1)
})
