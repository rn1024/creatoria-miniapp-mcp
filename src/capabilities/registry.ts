/**
 * Centralized Tool Registry for MCP Server
 *
 * Provides unified tool registration, lookup, and validation.
 * All capabilities register their tools through this registry.
 */

import type { ZodTypeAny } from 'zod'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { SessionState } from '../types.js'

/**
 * Tool handler function signature
 * Uses 'any' for args to allow typed handlers to be assigned
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolHandler = (session: SessionState, args: any) => Promise<any>

/**
 * Complete tool definition including schema and handler
 */
export interface ToolDefinition {
  /** Tool name (must be unique across all capabilities) */
  name: string
  /** Human-readable description */
  description: string
  /** Capability category (automator, miniprogram, page, element, etc.) */
  capability: string
  /** Zod schema for input validation */
  inputSchema: ZodTypeAny
  /** Optional Zod schema for output validation */
  outputSchema?: ZodTypeAny
  /** Handler function that executes the tool */
  handler: ToolHandler
}

/**
 * Capability module that groups related tools
 */
export interface CapabilityModule {
  /** Capability name */
  name: string
  /** Human-readable description */
  description: string
  /** List of tool definitions in this capability */
  tools: ToolDefinition[]
}

/**
 * Centralized Tool Registry
 *
 * Features:
 * - Unique tool name enforcement
 * - Capability-based organization
 * - Schema and handler management
 * - MCP Tool type conversion
 */
export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>()
  private capabilities = new Map<string, CapabilityModule>()

  /**
   * Register a single tool definition
   */
  register(definition: ToolDefinition): void {
    if (this.tools.has(definition.name)) {
      throw new Error(`Duplicate tool registration: ${definition.name}`)
    }
    this.tools.set(definition.name, definition)
  }

  /**
   * Register a complete capability module
   */
  registerCapability(module: CapabilityModule): void {
    if (this.capabilities.has(module.name)) {
      throw new Error(`Duplicate capability registration: ${module.name}`)
    }

    this.capabilities.set(module.name, module)

    // Register all tools from this capability
    for (const tool of module.tools) {
      this.register({ ...tool, capability: module.name })
    }
  }

  /**
   * Get a tool definition by name
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name)
  }

  /**
   * Get handler for a tool
   */
  getHandler(name: string): ToolHandler | undefined {
    return this.tools.get(name)?.handler
  }

  /**
   * Get all registered tool definitions
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get tools by capability name
   */
  getByCapability(capabilityName: string): ToolDefinition[] {
    return Array.from(this.tools.values()).filter((t) => t.capability === capabilityName)
  }

  /**
   * Get all registered capabilities
   */
  getCapabilities(): CapabilityModule[] {
    return Array.from(this.capabilities.values())
  }

  /**
   * Check if a tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name)
  }

  /**
   * Get total number of registered tools
   */
  get size(): number {
    return this.tools.size
  }

  /**
   * JSON Schema type for MCP Tool inputSchema
   */
  private createJsonSchema(
    properties: Record<string, unknown> = {},
    required?: string[]
  ): { type: 'object'; properties: Record<string, unknown>; required?: string[] } {
    return {
      type: 'object' as const,
      properties,
      ...(required && required.length > 0 ? { required } : {}),
    }
  }

  /**
   * Convert Zod schema to JSON Schema for MCP Tool format
   */
  private zodToJsonSchema(
    schema: ZodTypeAny
  ): { type: 'object'; properties: Record<string, unknown>; required?: string[] } {
    // Use zod-to-json-schema or manual conversion
    // For now, use the shape if available
    const zodSchema = schema as any

    if (zodSchema._def?.typeName === 'ZodObject') {
      const shape = zodSchema._def.shape?.()
      if (shape) {
        const properties: Record<string, unknown> = {}
        const required: string[] = []

        for (const [key, value] of Object.entries(shape)) {
          const fieldSchema = value as any
          properties[key] = this.zodFieldToJsonSchema(fieldSchema)

          // Check if field is required (not optional)
          if (!fieldSchema.isOptional?.()) {
            required.push(key)
          }
        }

        return this.createJsonSchema(properties, required)
      }
    }

    // Fallback for non-object schemas
    return this.createJsonSchema({})
  }

  /**
   * Convert a single Zod field to JSON Schema
   */
  private zodFieldToJsonSchema(field: any): Record<string, unknown> {
    const typeName = field._def?.typeName

    // Handle optional wrapper
    if (typeName === 'ZodOptional') {
      return this.zodFieldToJsonSchema(field._def.innerType)
    }

    // Handle basic types
    switch (typeName) {
      case 'ZodString':
        return {
          type: 'string',
          ...(field._def.description ? { description: field._def.description } : {}),
        }
      case 'ZodNumber':
        return {
          type: 'number',
          ...(field._def.description ? { description: field._def.description } : {}),
        }
      case 'ZodBoolean':
        return {
          type: 'boolean',
          ...(field._def.description ? { description: field._def.description } : {}),
        }
      case 'ZodArray':
        return {
          type: 'array',
          items: this.zodFieldToJsonSchema(field._def.type),
          ...(field._def.description ? { description: field._def.description } : {}),
        }
      case 'ZodEnum':
        return {
          type: 'string',
          enum: field._def.values,
          ...(field._def.description ? { description: field._def.description } : {}),
        }
      case 'ZodObject':
        return this.zodToJsonSchema(field)
      default:
        // Default to any type
        return { description: field._def?.description }
    }
  }

  /**
   * Convert registered tools to MCP Tool format
   */
  toMCPTools(): Tool[] {
    return Array.from(this.tools.values()).map((def) => ({
      name: def.name,
      description: def.description,
      inputSchema: this.zodToJsonSchema(def.inputSchema),
    }))
  }

  /**
   * Convert tools for specific capabilities to MCP Tool format
   */
  toMCPToolsForCapabilities(capabilityNames: string[]): Tool[] {
    // If 'core' is specified, return all tools
    if (capabilityNames.includes('core')) {
      return this.toMCPTools()
    }

    // Otherwise, filter by capability names
    return Array.from(this.tools.values())
      .filter((def) => capabilityNames.includes(def.capability))
      .map((def) => ({
        name: def.name,
        description: def.description,
        inputSchema: this.zodToJsonSchema(def.inputSchema),
      }))
  }

  /**
   * Get handlers map for specific capabilities
   */
  getHandlersForCapabilities(capabilityNames: string[]): Map<string, ToolHandler> {
    const handlers = new Map<string, ToolHandler>()

    // If 'core' is specified, return all handlers
    if (capabilityNames.includes('core')) {
      for (const [name, def] of this.tools) {
        handlers.set(name, def.handler)
      }
      return handlers
    }

    // Otherwise, filter by capability names
    for (const [name, def] of this.tools) {
      if (capabilityNames.includes(def.capability)) {
        handlers.set(name, def.handler)
      }
    }

    return handlers
  }

  /**
   * Get statistics about registered tools
   */
  getStats(): {
    total: number
    byCapability: Record<string, number>
  } {
    const byCapability: Record<string, number> = {}

    for (const def of this.tools.values()) {
      byCapability[def.capability] = (byCapability[def.capability] || 0) + 1
    }

    return {
      total: this.tools.size,
      byCapability,
    }
  }

  /**
   * Validate all registrations
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const def of this.tools.values()) {
      // Check required fields
      if (!def.name) {
        errors.push('Tool missing name')
      }
      if (!def.description) {
        errors.push(`Tool ${def.name} missing description`)
      }
      if (!def.handler) {
        errors.push(`Tool ${def.name} missing handler`)
      }
      if (!def.inputSchema) {
        errors.push(`Tool ${def.name} missing inputSchema`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.tools.clear()
    this.capabilities.clear()
  }
}

/**
 * Global tool registry instance
 */
export const globalRegistry = new ToolRegistry()
