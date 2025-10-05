import type { ZodTypeAny } from 'zod'

export interface ToolSchemaDefinition {
  /** 工具名称，与 MCP 注册名一致 */
  name: string
  /** 能力分组，例如 automator/miniprogram 等 */
  capability: string
  /** 与工具清单描述保持一致的简介 */
  description: string
  /** 输入参数 schema */
  input: ZodTypeAny
  /** 可选输出 schema（后续阶段使用） */
  output?: ZodTypeAny
}

export type ToolSchemaRegistry = Record<string, ToolSchemaDefinition>

export interface ToolSchemaLookupResult {
  name: string
  capability: string
  description: string
  input: ZodTypeAny
  output?: ZodTypeAny
}
