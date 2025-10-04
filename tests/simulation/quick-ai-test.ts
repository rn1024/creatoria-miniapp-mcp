#!/usr/bin/env npx tsx
/**
 * Quick AI Simulation Test
 *
 * Fast simulation of AI calling MCP tools in a typical workflow
 *
 * Usage:
 *   npx tsx tests/simulation/quick-ai-test.ts
 */

import { StdioMCPClient } from './helpers/stdio-mcp-client.js'

const client = new StdioMCPClient()

async function simulateAIWorkflow() {
  console.log('🤖 Simulating AI Agent Workflow...\n')

  try {
    // 1. AI decides to connect
    console.log('👤 User: "帮我测试小程序的登录功能"')
    console.log('🤖 AI: "好的，我来帮你测试登录功能。首先我需要启动小程序...\n')

    await client.connect()
    console.log('✅ Connected to MCP server\n')

    // 2. AI connects to running mini program
    console.log('🔧 AI calls: miniprogram_connect({ port: 9420 })')
    const connectResult = await client.callTool('miniprogram_connect', { port: 9420 })
    console.log('📊 Result:', JSON.stringify(connectResult, null, 2))
    console.log('🤖 AI: "已连接到小程序\n')

    // 3. AI navigates to index page (already there, but let's test navigation)
    console.log(
      '🔧 AI calls: miniprogram_navigate({ method: "reLaunch", url: "/pages/index/index" })'
    )
    const navResult = await client.callTool('miniprogram_navigate', {
      method: 'reLaunch',
      url: '/pages/index/index',
    })
    console.log('📊 Result:', JSON.stringify(navResult, null, 2))
    console.log('🤖 AI: "已导航到页面\n')

    // 4. AI queries and fills username
    console.log('🔧 AI calls: page_query({ selector: "#username", save: true })')
    const usernameQuery = await client.callTool('page_query', {
      selector: '#username',
      save: true,
    })
    console.log('📊 Result:', JSON.stringify(usernameQuery, null, 2))
    const usernameRefId = JSON.parse(usernameQuery.content[0].text).refId

    console.log(`🔧 AI calls: element_input({ refId: "${usernameRefId}", value: "testuser" })`)
    const inputResult = await client.callTool('element_input', {
      refId: usernameRefId,
      value: 'testuser',
    })
    console.log('📊 Result:', JSON.stringify(inputResult, null, 2))
    console.log('🤖 AI: "已输入用户名\n')

    // 5. AI queries and fills password
    console.log('🔧 AI calls: page_query({ selector: "#password", save: true })')
    const passwordQuery = await client.callTool('page_query', {
      selector: '#password',
      save: true,
    })
    console.log('📊 Result:', JSON.stringify(passwordQuery, null, 2))
    const passwordRefId = JSON.parse(passwordQuery.content[0].text).refId

    console.log(`🔧 AI calls: element_input({ refId: "${passwordRefId}", value: "pass123" })`)
    const passwordInput = await client.callTool('element_input', {
      refId: passwordRefId,
      value: 'pass123',
    })
    console.log('📊 Result:', JSON.stringify(passwordInput, null, 2))
    console.log('🤖 AI: "已输入密码\n')

    // 6. AI clicks login button
    console.log('🔧 AI calls: page_query({ selector: ".login-btn", save: true })')
    const btnQuery = await client.callTool('page_query', {
      selector: '.login-btn',
      save: true,
    })
    const btnRefId = JSON.parse(btnQuery.content[0].text).refId

    console.log(`🔧 AI calls: element_tap({ refId: "${btnRefId}" })`)
    const tapResult = await client.callTool('element_tap', {
      refId: btnRefId,
    })
    console.log('📊 Result:', JSON.stringify(tapResult, null, 2))
    console.log('🤖 AI: "已点击登录按钮\n')

    // 7. AI waits for result and verifies
    console.log('🔧 AI calls: page_wait_for({ selector: ".success-msg", timeout: 3000 })')
    const waitResult = await client.callTool('page_wait_for', {
      selector: '.success-msg',
      timeout: 3000,
    })
    console.log('📊 Result:', JSON.stringify(waitResult, null, 2))

    console.log('🔧 AI calls: assert_exists({ selector: ".success-msg" })')
    const assertResult = await client.callTool('assert_exists', {
      selector: '.success-msg',
    })
    console.log('📊 Result:', JSON.stringify(assertResult, null, 2))
    console.log('🤖 AI: "登录成功！已验证成功提示显示\n')

    // 8. AI takes screenshot for evidence
    console.log('🔧 AI calls: miniprogram_screenshot({ path: "/tmp/test-result.png" })')
    const screenshotResult = await client.callTool('miniprogram_screenshot', {
      path: '/tmp/test-result.png',
    })
    console.log('📊 Result:', JSON.stringify(screenshotResult, null, 2))
    console.log('🤖 AI: "已保存截图作为测试证据\n')

    // 9. AI closes mini program
    console.log('🔧 AI calls: miniprogram_close()')
    const closeResult = await client.callTool('miniprogram_close', {})
    console.log('📊 Result:', JSON.stringify(closeResult, null, 2))
    console.log('🤖 AI: "测试完成，小程序已关闭\n')

    await client.disconnect()
    console.log('✅ Disconnected from MCP server\n')

    console.log('='.repeat(60))
    console.log('✅ AI Simulation Completed Successfully!')
    console.log('='.repeat(60))
    console.log('\n📋 Summary:')
    console.log('   - Tool calls: 10')
    console.log('   - Categories used: Automator, MiniProgram, Page, Element, Assert')
    console.log(
      '   - Workflow: Launch → Navigate → Fill Form → Submit → Verify → Screenshot → Close'
    )
    console.log('\n💡 This simulates exactly how an AI agent would interact with your MCP server!')
  } catch (error) {
    console.error('\n❌ Simulation failed:', error)
    process.exit(1)
  }
}

simulateAIWorkflow()
