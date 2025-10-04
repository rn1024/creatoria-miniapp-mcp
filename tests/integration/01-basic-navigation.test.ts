/**
 * 集成测试：基础导航流程
 *
 * 测试场景：
 * 1. 启动小程序
 * 2. 导航到指定页面
 * 3. 截图验证
 * 4. 关闭连接
 *
 * 前置要求：
 * - 微信开发者工具已启动
 * - TEST_PROJECT_PATH 环境变量已设置
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { MCPClient } from './helpers/mcp-client.js'
import { startServer } from '../../src/server.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

// 跳过集成测试（如果环境不可用）
const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true'
const TEST_PROJECT_PATH = process.env.TEST_PROJECT_PATH

const describeIntegration = SKIP_INTEGRATION || !TEST_PROJECT_PATH ? describe.skip : describe

describeIntegration('Integration: Basic Navigation', () => {
  let server: Server
  let client: MCPClient

  beforeAll(async () => {
    // 启动 MCP Server
    server = await startServer({
      projectPath: TEST_PROJECT_PATH!,
      autoPort: parseInt(process.env.TEST_AUTO_PORT || '9420'),
      sessionTimeout: 30 * 60 * 1000, // 30 minutes for testing
      enableFileLog: false, // 测试时禁用文件日志
      enableSessionReport: false, // 基础测试不需要报告
    })

    // 创建测试客户端
    client = new MCPClient(server)
    await client.connect()
  }, 60000) // 60s timeout for setup

  afterAll(async () => {
    // 清理：断开连接
    if (client) {
      try {
        await client.callTool('automator_disconnect', {})
      } catch {
        // Ignore disconnect errors
      }
      await client.disconnect()
    }
  })

  it('should launch miniprogram successfully', async () => {
    const result = await client.callTool('automator_launch', {
      projectPath: TEST_PROJECT_PATH!,
      autoPort: parseInt(process.env.TEST_AUTO_PORT || '9420'),
    })

    expect(client.isSuccess(result)).toBe(true)

    const text = client.extractText(result)
    expect(text).toContain('Mini program launched successfully')
  }, 30000) // 30s timeout

  it('should navigate to a page', async () => {
    // 假设测试项目有 pages/index/index 页面
    const result = await client.callTool('miniprogram_navigate', {
      url: '/pages/index/index',
    })

    expect(client.isSuccess(result)).toBe(true)

    const text = client.extractText(result)
    expect(text).toContain('Navigated to')
    expect(text).toContain('/pages/index/index')
  }, 10000)

  it('should take a screenshot', async () => {
    const result = await client.callTool('miniprogram_screenshot', {
      filename: 'test-basic-navigation.png',
    })

    expect(client.isSuccess(result)).toBe(true)

    const text = client.extractText(result)
    expect(text).toContain('Screenshot saved')
    expect(text).toContain('test-basic-navigation.png')
  }, 10000)

  it('should get current page path', async () => {
    const result = await client.callTool('miniprogram_current_page', {})

    expect(client.isSuccess(result)).toBe(true)

    const text = client.extractText(result)
    expect(text).toContain('pages/index/index')
  }, 5000)

  it('should disconnect successfully', async () => {
    const result = await client.callTool('automator_disconnect', {})

    expect(client.isSuccess(result)).toBe(true)

    const text = client.extractText(result)
    expect(text).toContain('Disconnected')
  }, 10000)
})
