/**
 * 集成测试：断言和快照流程
 *
 * 测试场景：
 * 1. 元素存在性断言
 * 2. 文本内容断言
 * 3. 页面数据断言
 * 4. 页面快照保存
 * 5. 元素快照保存
 *
 * 前置要求：
 * - 小程序已启动
 * - 测试页面包含可验证的元素和数据
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { MCPClient } from './helpers/mcp-client.js'
import { startServer } from '../../src/server.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

const SKIP_INTEGRATION = process.env.SKIP_INTEGRATION_TESTS === 'true'
const TEST_PROJECT_PATH = process.env.TEST_PROJECT_PATH

const describeIntegration = SKIP_INTEGRATION || !TEST_PROJECT_PATH ? describe.skip : describe

describeIntegration('Integration: Assertion & Snapshot', () => {
  let server: Server
  let client: MCPClient

  beforeAll(async () => {
    server = await startServer({
      projectPath: TEST_PROJECT_PATH!,
      autoPort: parseInt(process.env.TEST_AUTO_PORT || '9420'),
      sessionTimeout: 30 * 60 * 1000,
      enableFileLog: false,
      enableSessionReport: false,
    })

    client = new MCPClient(server)
    await client.connect()

    // 启动小程序并导航
    await client.callTool('automator_launch', {
      projectPath: TEST_PROJECT_PATH!,
    })

    await client.callTool('miniprogram_navigate', {
      url: '/pages/index/index',
    })

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

  describe('Assertions', () => {
    it('should assert element exists', async () => {
      const result = await client.callTool('assert_exists', {
        selector: 'view',
      })

      expect(client.isSuccess(result)).toBe(true)

      const text = client.extractText(result)
      expect(text).toContain('Assertion passed')
      expect(text).toContain('exists')
    }, 10000)

    it('should assert element does not exist', async () => {
      const result = await client.callTool('assert_not_exists', {
        selector: '.non-existent-element-12345',
      })

      expect(client.isSuccess(result)).toBe(true)

      const text = client.extractText(result)
      expect(text).toContain('Assertion passed')
      expect(text).toContain('not exist')
    }, 10000)

    it('should assert element visibility', async () => {
      const result = await client.callTool('assert_visible', {
        selector: 'view',
      })

      expect(client.isSuccess(result)).toBe(true)

      const text = client.extractText(result)
      expect(text).toContain('Assertion passed')
      expect(text).toContain('visible')
    }, 10000)

    it('should assert text contains', async () => {
      // 首先获取元素文本
      const queryResult = await client.callTool('element_get_text', {
        selector: 'view',
      })

      if (client.isSuccess(queryResult)) {
        const textContent = client.extractText(queryResult)

        // 如果有文本内容，执行断言
        if (textContent && textContent.length > 0) {
          const firstWord = textContent.split(/\s+/)[0]

          if (firstWord) {
            const result = await client.callTool('assert_text_contains', {
              selector: 'view',
              expected: firstWord,
            })

            expect(client.isSuccess(result)).toBe(true)

            const assertText = client.extractText(result)
            expect(assertText).toContain('Assertion passed')
          }
        }
      }
    }, 10000)

    it('should fail assertion gracefully', async () => {
      const result = await client.callTool('assert_text', {
        selector: 'view',
        expected: 'this-text-should-not-exist-12345',
      })

      // 断言失败应该返回错误
      expect(result.isError).toBe(true)

      const text = client.extractText(result)
      expect(text).toContain('Assertion failed')
    }, 10000)
  })

  describe('Snapshots', () => {
    it('should capture page snapshot', async () => {
      const result = await client.callTool('snapshot_page', {
        filename: 'test-page-snapshot.json',
        includeScreenshot: true,
      })

      expect(client.isSuccess(result)).toBe(true)

      const text = client.extractText(result)
      expect(text).toContain('Snapshot saved')
      expect(text).toContain('test-page-snapshot.json')
    }, 15000)

    it('should capture full app snapshot', async () => {
      const result = await client.callTool('snapshot_full', {
        filename: 'test-full-snapshot.json',
        includeScreenshot: true,
      })

      expect(client.isSuccess(result)).toBe(true)

      const text = client.extractText(result)
      expect(text).toContain('Full snapshot saved')
      expect(text).toContain('test-full-snapshot.json')
    }, 15000)

    it('should capture element snapshot', async () => {
      const result = await client.callTool('snapshot_element', {
        selector: 'view',
        filename: 'test-element-snapshot.json',
        includeScreenshot: true,
      })

      expect(client.isSuccess(result)).toBe(true)

      const text = client.extractText(result)
      expect(text).toContain('Element snapshot saved')
      expect(text).toContain('test-element-snapshot.json')
    }, 15000)

    it('should capture snapshot without screenshot', async () => {
      const result = await client.callTool('snapshot_page', {
        filename: 'test-no-screenshot.json',
        includeScreenshot: false,
      })

      expect(client.isSuccess(result)).toBe(true)

      const text = client.extractText(result)
      expect(text).toContain('Snapshot saved')
      expect(text).not.toContain('.png')
    }, 10000)
  })

  describe('Combined Workflow', () => {
    it('should execute assert → snapshot workflow', async () => {
      // 1. 断言元素存在
      const assertResult = await client.callTool('assert_exists', {
        selector: 'view',
      })

      expect(client.isSuccess(assertResult)).toBe(true)

      // 2. 如果断言通过，保存快照作为验证
      const snapshotResult = await client.callTool('snapshot_page', {
        filename: 'test-after-assertion.json',
        includeScreenshot: true,
      })

      expect(client.isSuccess(snapshotResult)).toBe(true)

      // 3. 验证两个操作都成功
      const assertText = client.extractText(assertResult)
      const snapshotText = client.extractText(snapshotResult)

      expect(assertText).toContain('Assertion passed')
      expect(snapshotText).toContain('Snapshot saved')
    }, 20000)
  })
})
