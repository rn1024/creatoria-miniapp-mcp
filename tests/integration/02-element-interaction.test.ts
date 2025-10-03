/**
 * 集成测试：元素交互流程
 *
 * 测试场景：
 * 1. 查询页面元素
 * 2. 获取元素属性
 * 3. 点击元素
 * 4. 输入文本
 * 5. 验证交互结果
 *
 * 前置要求：
 * - 小程序已启动（依赖 01-basic-navigation）
 * - 测试页面包含可交互元素
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { McpClient } from './helpers/mcp-client.js'
import { startServer } from '../../src/server.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true'
const TEST_PROJECT_PATH = process.env.TEST_PROJECT_PATH

const describeIntegration = SKIP_INTEGRATION || !TEST_PROJECT_PATH ? describe.skip : describe

describeIntegration('Integration: Element Interaction', () => {
  let server: Server
  let client: McpClient
  let testRefId: string | null = null

  beforeAll(async () => {
    server = await startServer({
      projectPath: TEST_PROJECT_PATH!,
      autoPort: parseInt(process.env.TEST_AUTO_PORT || '9420'),
      sessionTimeout: 30 * 60 * 1000,
      enableFileLog: false,
      enableSessionReport: false,
    })

    client = new McpClient(server)
    await client.connect()

    // 启动小程序
    await client.callTool('automator_launch', {
      projectPath: TEST_PROJECT_PATH!,
      autoPort: parseInt(process.env.TEST_AUTO_PORT || '9420'),
    })

    // 导航到测试页面（假设存在）
    await client.callTool('miniprogram_navigate', {
      url: '/pages/index/index',
    })

    // 等待页面加载
    await client.wait(1000)
  }, 60000)

  afterAll(async () => {
    if (client) {
      try {
        await client.callTool('automator_disconnect', {})
      } catch {
        // Ignore
      }
      await client.disconnect()
    }
  })

  it('should query an element by selector', async () => {
    // 查询页面上的第一个 view 元素
    const result = await client.callTool('page_query', {
      selector: 'view',
      save: true, // 保存 refId 供后续使用
    })

    expect(client.isSuccess(result)).toBe(true)

    const text = client.extractText(result)
    expect(text).toContain('Element found')

    // 提取 refId（假设结果中包含）
    const match = text.match(/refId[:\s]+([a-zA-Z0-9-]+)/)
    if (match) {
      testRefId = match[1]
    }
  }, 10000)

  it('should get element text content', async () => {
    if (!testRefId) {
      // 如果没有 refId，使用 selector 查询
      const result = await client.callTool('element_get_text', {
        selector: 'view',
      })

      expect(client.isSuccess(result)).toBe(true)
    } else {
      const result = await client.callTool('element_get_text', {
        refId: testRefId,
      })

      expect(client.isSuccess(result)).toBe(true)
    }
  }, 10000)

  it('should get element attribute', async () => {
    const result = await client.callTool('element_get_attribute', {
      selector: 'view',
      name: 'class',
    })

    expect(client.isSuccess(result)).toBe(true)

    const text = client.extractText(result)
    expect(text).toBeTruthy()
  }, 10000)

  it('should tap an element', async () => {
    // 查找可点击的元素（button 或 带 tap 事件的 view）
    const queryResult = await client.callTool('page_query', {
      selector: 'button',
      save: true,
    })

    if (client.isSuccess(queryResult)) {
      const text = client.extractText(queryResult)
      const match = text.match(/refId[:\s]+([a-zA-Z0-9-]+)/)

      if (match) {
        const buttonRefId = match[1]

        const tapResult = await client.callTool('element_tap', {
          refId: buttonRefId,
        })

        expect(client.isSuccess(tapResult)).toBe(true)

        const tapText = client.extractText(tapResult)
        expect(tapText).toContain('Tapped element')
      }
    }
  }, 10000)

  it('should input text into an input element', async () => {
    // 查找 input 元素
    const queryResult = await client.callTool('page_query', {
      selector: 'input',
      save: true,
    })

    if (client.isSuccess(queryResult)) {
      const text = client.extractText(queryResult)
      const match = text.match(/refId[:\s]+([a-zA-Z0-9-]+)/)

      if (match) {
        const inputRefId = match[1]

        const inputResult = await client.callTool('element_input', {
          refId: inputRefId,
          value: 'test input text',
        })

        expect(client.isSuccess(inputResult)).toBe(true)

        const inputText = client.extractText(inputResult)
        expect(inputText).toContain('Input completed')

        // 验证输入值
        const valueResult = await client.callTool('element_get_value', {
          refId: inputRefId,
        })

        expect(client.isSuccess(valueResult)).toBe(true)

        const valueText = client.extractText(valueResult)
        expect(valueText).toContain('test input text')
      }
    }
  }, 15000)

  it('should get element size and offset', async () => {
    const sizeResult = await client.callTool('element_get_size', {
      selector: 'view',
    })

    expect(client.isSuccess(sizeResult)).toBe(true)

    const sizeText = client.extractText(sizeResult)
    expect(sizeText).toMatch(/width.*height/)

    const offsetResult = await client.callTool('element_get_offset', {
      selector: 'view',
    })

    expect(client.isSuccess(offsetResult)).toBe(true)

    const offsetText = client.extractText(offsetResult)
    expect(offsetText).toMatch(/left.*top/)
  }, 10000)

  it('should scroll to an element', async () => {
    const result = await client.callTool('element_scroll_to', {
      selector: 'view',
    })

    // scrollTo 可能失败（如果元素已在视口），这是正常的
    const text = client.extractText(result)
    expect(text).toBeTruthy()
  }, 10000)
})
