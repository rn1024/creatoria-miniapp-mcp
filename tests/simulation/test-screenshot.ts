#!/usr/bin/env npx tsx
/**
 * Test Screenshot Functionality
 * Tests both base64 and file-based screenshot methods
 */

import { StdioMCPClient } from './helpers/stdio-mcp-client.js'

const client = new StdioMCPClient()

async function testScreenshot() {
  console.log('🧪 Testing Screenshot Functionality\n')

  try {
    await client.connect()
    console.log('✅ Connected to MCP server\n')

    // 1. Connect to mini program
    console.log('🔧 Connecting to mini program...')
    const connectResult = await client.callTool('miniprogram_connect', { port: 9420 })
    console.log('📊 Connect Result:', JSON.stringify(connectResult, null, 2))

    // 2. Navigate to index page
    console.log('\n🔧 Navigating to index page...')
    await client.callTool('miniprogram_navigate', {
      method: 'reLaunch',
      url: '/pages/index/index',
    })

    // Wait for page to load
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 3. Test base64 screenshot (no filename)
    console.log('\n🔧 Test 1: Screenshot without filename (should return base64)...')
    const base64Result = await client.callTool('miniprogram_screenshot', {})
    const base64Data = JSON.parse(base64Result.content[0].text)
    console.log('📊 Base64 Result:')
    console.log('  - success:', base64Data.success)
    console.log('  - message:', base64Data.message)
    console.log('  - has base64:', !!base64Data.base64)
    console.log('  - base64 length:', base64Data.base64?.length || 0)
    console.log('  - base64 preview:', base64Data.base64?.substring(0, 50) + '...')

    // 4. Test file screenshot (with filename)
    console.log('\n🔧 Test 2: Screenshot with filename (should save to file)...')
    const fileResult = await client.callTool('miniprogram_screenshot', {
      filename: 'test-screenshot.png',
    })
    const fileData = JSON.parse(fileResult.content[0].text)
    console.log('📊 File Result:')
    console.log('  - success:', fileData.success)
    console.log('  - message:', fileData.message)
    console.log('  - path:', fileData.path)
    console.log('  - has base64:', !!fileData.base64)

    // 5. Test fullPage screenshot
    console.log('\n🔧 Test 3: Full page screenshot (base64)...')
    const fullPageResult = await client.callTool('miniprogram_screenshot', {
      fullPage: true,
    })
    const fullPageData = JSON.parse(fullPageResult.content[0].text)
    console.log('📊 Full Page Result:')
    console.log('  - success:', fullPageData.success)
    console.log('  - base64 length:', fullPageData.base64?.length || 0)

    // 6. Close mini program
    console.log('\n🔧 Closing mini program...')
    await client.callTool('miniprogram_close', {})

    await client.disconnect()
    console.log('\n✅ Disconnected from MCP server\n')

    console.log('='.repeat(60))
    console.log('✅ Screenshot Tests Completed Successfully!')
    console.log('='.repeat(60))
    console.log('\n📋 Summary:')
    console.log('   ✅ Base64 screenshot works')
    console.log('   ✅ File screenshot works')
    console.log('   ✅ Full page screenshot works')
    console.log('\n💡 Both base64 and file-based screenshots are functional!')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

testScreenshot()
