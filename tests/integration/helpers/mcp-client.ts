/**
 * MCP Test Client - 简化的 MCP 客户端用于集成测试
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

export interface ToolCallResult {
  content: Array<{
    type: string
    text?: string
    [key: string]: unknown
  }>
  isError?: boolean
}

/**
 * 简化的 MCP 客户端，用于集成测试
 */
export class McpClient {
  private sessionId: string | null = null

  constructor(private server: Server) {}

  /**
   * 建立连接（模拟 MCP 客户端初始化）
   */
  async connect(): Promise<void> {
    // 在真实场景中，这里会建立 stdio 传输
    // 集成测试中我们直接使用 server 实例
    this.sessionId = `test-session-${Date.now()}`
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.sessionId = null
  }

  /**
   * 调用 MCP 工具
   *
   * @param toolName - 工具名称（如 'miniprogram_launch'）
   * @param args - 工具参数
   * @returns 工具调用结果
   */
  async callTool(toolName: string, args: Record<string, unknown>): Promise<ToolCallResult> {
    if (!this.sessionId) {
      throw new Error('Client not connected. Call connect() first.')
    }

    // 使用 MCP SDK 的请求处理机制
    // 通过 request() 方法发送 tools/call 请求
    try {
      const result = await this.server.request(
        {
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args,
          },
        },
        CallToolRequestSchema
      )

      return result as ToolCallResult
    } catch (error) {
      // Preserve stack trace for better debugging
      const errorMessage =
        error instanceof Error ? `${error.message}\n\nStack trace:\n${error.stack}` : String(error)

      return {
        content: [
          {
            type: 'text',
            text: errorMessage,
          },
        ],
        isError: true,
      }
    }
  }

  /**
   * 批量调用多个工具
   */
  async callTools(
    calls: Array<{ tool: string; args: Record<string, unknown> }>
  ): Promise<ToolCallResult[]> {
    const results: ToolCallResult[] = []

    for (const call of calls) {
      const result = await this.callTool(call.tool, call.args)
      results.push(result)

      // 如果有工具调用失败，提前终止
      if (result.isError) {
        break
      }
    }

    return results
  }

  /**
   * 提取工具调用结果的文本内容
   */
  extractText(result: ToolCallResult): string {
    return result.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text || '')
      .join('\n')
  }

  /**
   * 检查工具调用是否成功
   */
  isSuccess(result: ToolCallResult): boolean {
    return !result.isError
  }

  /**
   * 等待一段时间（用于等待异步操作完成）
   */
  async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 断言工具调用成功，失败时抛出包含完整上下文的错误
   */
  assertSuccess(result: ToolCallResult, context?: string): void {
    if (result.isError) {
      const error = new Error(
        `Tool call failed${context ? ` (${context})` : ''}:\n${this.extractText(result)}`
      )
      // Preserve stack trace starting from caller
      Error.captureStackTrace?.(error, this.assertSuccess)
      throw error
    }
  }

  /**
   * 断言工具调用返回特定文本，失败时提供详细上下文
   */
  assertTextContains(result: ToolCallResult, expected: string, context?: string): void {
    const text = this.extractText(result)
    if (!text.includes(expected)) {
      const error = new Error(
        `Expected text to contain "${expected}"${context ? ` (${context})` : ''}\n` +
          `Actual: ${text}`
      )
      Error.captureStackTrace?.(error, this.assertTextContains)
      throw error
    }
  }
}
