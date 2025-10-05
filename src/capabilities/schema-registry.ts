import type { ToolSchemaLookupResult } from './schema-types.js'
import { automatorSchemas } from './automator/schemas/index.js'

const schemaMap = new Map<string, ToolSchemaLookupResult>()

function registerSchemas(schemas: ToolSchemaLookupResult[]): void {
  for (const schema of schemas) {
    if (schemaMap.has(schema.name)) {
      throw new Error(`Duplicate schema definition for tool: ${schema.name}`)
    }
    schemaMap.set(schema.name, schema)
  }
}

registerSchemas(automatorSchemas)

export function getToolSchema(toolName: string): ToolSchemaLookupResult | undefined {
  return schemaMap.get(toolName)
}

export function listToolSchemas(): ToolSchemaLookupResult[] {
  return Array.from(schemaMap.values())
}
