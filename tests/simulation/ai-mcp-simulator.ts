#!/usr/bin/env npx tsx
/**
 * AI-MCP Interaction Simulator
 *
 * Simulates realistic AI agent calling MCP tools to test the complete workflow
 *
 * Usage:
 *   npx tsx tests/simulation/ai-mcp-simulator.ts
 *   or
 *   pnpm simulate:ai
 */

import { StdioMCPClient } from './helpers/stdio-mcp-client.js'

interface AIThought {
  thinking: string
  toolCall: {
    name: string
    args: Record<string, unknown>
    reasoning: string
  }
}

interface AIConversation {
  userMessage: string
  aiThoughts: AIThought[]
  expectedOutcome: string
}

/**
 * Simulates AI thinking process and tool selection
 */
class AIAgentSimulator {
  private client: StdioMCPClient
  private conversationLog: string[] = []

  constructor() {
    this.client = new StdioMCPClient()
  }

  /**
   * Log AI thinking process
   */
  private log(message: string, type: 'user' | 'ai' | 'tool' | 'result' = 'ai') {
    const prefix = {
      user: '👤 User:',
      ai: '🤖 AI:',
      tool: '🔧 Tool:',
      result: '✅ Result:',
    }[type]

    const logMessage = `${prefix} ${message}`
    this.conversationLog.push(logMessage)
    console.log(logMessage)
  }

  /**
   * Simulate AI tool calling decision
   */
  private async thinkAndAct(thought: AIThought): Promise<unknown> {
    this.log(`Thinking: ${thought.thinking}`)
    this.log(`Reasoning: ${thought.reasoning}`)
    this.log(`Calling tool: ${thought.toolCall.name}`, 'tool')
    this.log(`Arguments: ${JSON.stringify(thought.toolCall.args, null, 2)}`, 'tool')

    const result = await this.client.callTool(thought.toolCall.name, thought.toolCall.args)

    this.log(`Tool returned: ${JSON.stringify(result, null, 2)}`, 'result')
    return result
  }

  /**
   * Run a complete AI conversation scenario
   */
  async runConversation(scenario: AIConversation): Promise<void> {
    this.log(scenario.userMessage, 'user')
    console.log('\n')

    for (const thought of scenario.aiThoughts) {
      await this.thinkAndAct(thought)
      console.log('\n')
    }

    this.log(`Expected outcome: ${scenario.expectedOutcome}`)
    console.log('\n' + '='.repeat(80) + '\n')
  }

  /**
   * Connect to MCP server
   */
  async connect(): Promise<void> {
    await this.client.connect()
    this.log('Connected to MCP server', 'tool')
    console.log('\n')
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect()
    this.log('Disconnected from MCP server', 'tool')
  }

  /**
   * Get conversation log
   */
  getLog(): string[] {
    return this.conversationLog
  }
}

/**
 * Realistic AI conversation scenarios
 */
const scenarios: AIConversation[] = [
  // Scenario 1: Basic Navigation
  {
    userMessage: '帮我打开小程序并进入首页',
    aiThoughts: [
      {
        thinking: '用户想要启动小程序，我需要先启动 automator',
        toolCall: {
          name: 'automator_launch',
          args: {},
          reasoning: '使用 automator_launch 启动小程序自动化实例',
        },
      },
      {
        thinking: '小程序已启动，现在需要导航到首页',
        toolCall: {
          name: 'miniprogram_navigate_to',
          args: { path: '/pages/index/index' },
          reasoning: '使用 miniprogram_navigate_to 导航到指定页面',
        },
      },
    ],
    expectedOutcome: '小程序成功启动并导航到首页',
  },

  // Scenario 2: Form Interaction
  {
    userMessage: '在登录页面输入用户名 "testuser" 和密码 "123456"，然后点击登录按钮',
    aiThoughts: [
      {
        thinking: '首先需要导航到登录页面',
        toolCall: {
          name: 'miniprogram_navigate_to',
          args: { path: '/pages/login/login' },
          reasoning: '导航到登录页面',
        },
      },
      {
        thinking: '需要找到用户名输入框并输入内容',
        toolCall: {
          name: 'page_query',
          args: { selector: '#username', save: true },
          reasoning: '查询用户名输入框并保存引用',
        },
      },
      {
        thinking: '使用刚才保存的元素引用输入用户名',
        toolCall: {
          name: 'element_input',
          args: { refId: 'element_1', value: 'testuser' },
          reasoning: '在用户名输入框输入 "testuser"',
        },
      },
      {
        thinking: '找到密码输入框',
        toolCall: {
          name: 'page_query',
          args: { selector: '#password', save: true },
          reasoning: '查询密码输入框并保存引用',
        },
      },
      {
        thinking: '输入密码',
        toolCall: {
          name: 'element_input',
          args: { refId: 'element_2', value: '123456' },
          reasoning: '在密码输入框输入密码',
        },
      },
      {
        thinking: '找到登录按钮并点击',
        toolCall: {
          name: 'page_query',
          args: { selector: '.login-btn', save: true },
          reasoning: '查询登录按钮',
        },
      },
      {
        thinking: '点击登录按钮提交表单',
        toolCall: {
          name: 'element_tap',
          args: { refId: 'element_3' },
          reasoning: '点击登录按钮',
        },
      },
    ],
    expectedOutcome: '成功填写表单并提交登录请求',
  },

  // Scenario 3: Assertion and Verification
  {
    userMessage: '验证首页是否显示了欢迎文本 "Welcome"',
    aiThoughts: [
      {
        thinking: '需要先确保在首页',
        toolCall: {
          name: 'miniprogram_current_page',
          args: {},
          reasoning: '获取当前页面路径',
        },
      },
      {
        thinking: '使用断言工具验证文本是否存在',
        toolCall: {
          name: 'assert_element_text',
          args: {
            selector: '.welcome-text',
            expected: 'Welcome',
          },
          reasoning: '断言欢迎文本内容是否为 "Welcome"',
        },
      },
    ],
    expectedOutcome: '验证通过，首页显示正确的欢迎文本',
  },

  // Scenario 4: List Scrolling and Data Extraction
  {
    userMessage: '获取商品列表中前3个商品的名称',
    aiThoughts: [
      {
        thinking: '导航到商品列表页面',
        toolCall: {
          name: 'miniprogram_navigate_to',
          args: { path: '/pages/products/list' },
          reasoning: '进入商品列表页',
        },
      },
      {
        thinking: '等待列表加载完成',
        toolCall: {
          name: 'page_wait_for',
          args: { selector: '.product-item', timeout: 5000 },
          reasoning: '等待商品项目出现',
        },
      },
      {
        thinking: '查询第一个商品名称',
        toolCall: {
          name: 'element_get_text',
          args: { selector: '.product-item:nth-child(1) .name' },
          reasoning: '获取第一个商品名称',
        },
      },
      {
        thinking: '查询第二个商品名称',
        toolCall: {
          name: 'element_get_text',
          args: { selector: '.product-item:nth-child(2) .name' },
          reasoning: '获取第二个商品名称',
        },
      },
      {
        thinking: '查询第三个商品名称',
        toolCall: {
          name: 'element_get_text',
          args: { selector: '.product-item:nth-child(3) .name' },
          reasoning: '获取第三个商品名称',
        },
      },
    ],
    expectedOutcome: '成功提取前3个商品的名称',
  },

  // Scenario 5: Network Mock Testing
  {
    userMessage: '模拟登录接口返回失败，测试错误提示是否正确显示',
    aiThoughts: [
      {
        thinking: '先 mock 登录接口返回失败响应',
        toolCall: {
          name: 'network_mock_request_failure',
          args: {
            method: 'POST',
            url: '/api/login',
            statusCode: 401,
            errorMessage: 'Invalid credentials',
          },
          reasoning: 'Mock 登录接口返回 401 错误',
        },
      },
      {
        thinking: '导航到登录页面',
        toolCall: {
          name: 'miniprogram_navigate_to',
          args: { path: '/pages/login/login' },
          reasoning: '进入登录页',
        },
      },
      {
        thinking: '填写表单并提交',
        toolCall: {
          name: 'page_query',
          args: { selector: '.login-btn', save: true },
          reasoning: '查询登录按钮',
        },
      },
      {
        thinking: '点击登录触发 mock 的失败响应',
        toolCall: {
          name: 'element_tap',
          args: { refId: 'element_1' },
          reasoning: '点击登录按钮',
        },
      },
      {
        thinking: '验证错误提示是否正确显示',
        toolCall: {
          name: 'assert_element_text',
          args: {
            selector: '.error-toast',
            expected: 'Invalid credentials',
          },
          reasoning: '断言错误提示内容',
        },
      },
      {
        thinking: '恢复网络 mock',
        toolCall: {
          name: 'network_restore_all_mocks',
          args: {},
          reasoning: '清理所有网络 mock',
        },
      },
    ],
    expectedOutcome: '成功模拟网络错误并验证错误提示',
  },

  // Scenario 6: Snapshot and Debugging
  {
    userMessage: '拍摄当前页面快照并保存页面数据用于调试',
    aiThoughts: [
      {
        thinking: '获取当前页面数据快照',
        toolCall: {
          name: 'snapshot_page_data',
          args: {},
          reasoning: '捕获当前页面的 data 对象',
        },
      },
      {
        thinking: '拍摄页面截图',
        toolCall: {
          name: 'miniprogram_screenshot',
          args: { path: 'debug-snapshot.png' },
          reasoning: '保存页面截图到文件',
        },
      },
      {
        thinking: '获取页面完整快照（包含 DOM 和 data）',
        toolCall: {
          name: 'snapshot_page',
          args: { includeData: true },
          reasoning: '捕获完整页面状态',
        },
      },
    ],
    expectedOutcome: '成功创建页面快照用于调试分析',
  },

  // Scenario 7: Cleanup
  {
    userMessage: '测试完成，关闭小程序',
    aiThoughts: [
      {
        thinking: '清理资源并关闭小程序',
        toolCall: {
          name: 'automator_close',
          args: {},
          reasoning: '关闭小程序实例释放资源',
        },
      },
    ],
    expectedOutcome: '小程序成功关闭，资源已释放',
  },
]

/**
 * Main simulation function
 */
async function main() {
  console.log('🎭 AI-MCP Interaction Simulator\n')
  console.log('Simulating realistic AI agent calling MCP tools...\n')
  console.log('='.repeat(80) + '\n')

  const simulator = new AIAgentSimulator()

  try {
    // Connect to MCP server
    await simulator.connect()

    // Run all scenarios
    for (const [index, scenario] of scenarios.entries()) {
      console.log(`\n📋 Scenario ${index + 1}/${scenarios.length}\n`)
      await simulator.runConversation(scenario)
    }

    // Disconnect
    await simulator.disconnect()

    console.log('\n✅ Simulation completed successfully!\n')
    console.log('📊 Summary:')
    console.log(`   - Total scenarios: ${scenarios.length}`)
    console.log(`   - Total tool calls: ${simulator.getLog().filter(log => log.startsWith('🔧')).length}`)
    console.log(`   - Total results: ${simulator.getLog().filter(log => log.startsWith('✅')).length}`)

  } catch (error) {
    console.error('\n❌ Simulation failed:', error)
    process.exit(1)
  }
}

// Run simulation if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { AIAgentSimulator, scenarios }
