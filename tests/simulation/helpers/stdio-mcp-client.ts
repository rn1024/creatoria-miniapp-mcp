/**
 * Stdio MCP Client - 通过 stdio 连接到真实 MCP server 进程
 *
 * 用于模拟真实的 AI 调用 MCP 的场景
 */

import { spawn, ChildProcess } from 'child_process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

export interface ToolCallResult {
  content: Array<{
    type: string
    text?: string
    [key: string]: unknown
  }>
  isError?: boolean
}

/**
 * Stdio MCP 客户端 - 模拟真实 AI 调用场景
 */
export class StdioMCPClient {
  private client: Client | null = null
  private transport: StdioClientTransport | null = null
  private serverProcess: ChildProcess | null = null

  /**
   * 连接到 MCP server（通过 stdio）
   */
  async connect(): Promise<void> {
    // 启动 MCP server 进程
    const serverPath = new URL('../../../dist/cli.js', import.meta.url).pathname

    this.transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      env: {
        ...process.env,
        // 可以在这里传入配置
        MCP_PROJECT_PATH: process.env.TEST_PROJECT_PATH || '',
      },
    })

    this.client = new Client(
      {
        name: 'simulation-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    )

    await this.client.connect(this.transport)
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
    }

    if (this.transport) {
      await this.transport.close()
      this.transport = null
    }
  }

  /**
   * 调用 MCP 工具
   */
  async callTool(toolName: string, args: Record<string, unknown>): Promise<ToolCallResult> {
    if (!this.client) {
      throw new Error('Client not connected. Call connect() first.')
    }

    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: args,
      })

      return result as ToolCallResult
    } catch (error) {
      // 将错误转换为工具调用结果格式
      const errorMessage = error instanceof Error ? error.message : String(error)
      const stack = error instanceof Error ? error.stack : ''

      return {
        content: [
          {
            type: 'text',
            text: `${errorMessage}\n\nStack trace:\n${stack}`,
          },
        ],
        isError: true,
      }
    }
  }

  /**
   * 列出可用工具
   */
  async listTools(): Promise<Array<{ name: string; description?: string }>> {
    if (!this.client) {
      throw new Error('Client not connected. Call connect() first.')
    }

    const result = await this.client.listTools()
    return result.tools
  }
}
