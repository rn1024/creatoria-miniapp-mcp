#!/usr/bin/env npx tsx
/**
 * 真实连接测试
 *
 * 前提:
 * 1. 微信开发者工具已打开
 * 2. 已打开一个小程序项目
 * 3. 设置 → 安全设置 → "CLI/HTTP 调用" 已开启
 * 4. 设置中显示的服务端口(默认可能是 62777)
 */

import automator from 'miniprogram-automator'

const PORT = process.env.DEVTOOLS_PORT || '62777'

console.log('🔗 尝试连接到已运行的微信开发者工具...')
console.log(`   WebSocket 端点: ws://localhost:${PORT}\n`)

automator.connect({
  wsEndpoint: `ws://localhost:${PORT}`,
}).then(async (miniProgram: any) => {
  console.log('✅ 连接成功！\n')

  console.log('📍 获取当前页面路径...')
  try {
    const currentPage = await miniProgram.currentPage()
    console.log('   当前页面:', currentPage.path)
  } catch (err: any) {
    console.log('   错误:', err.message)
  }

  console.log('\n📊 获取系统信息...')
  try {
    const systemInfo = await miniProgram.systemInfo()
    console.log('   系统信息:', JSON.stringify(systemInfo, null, 2))
  } catch (err: any) {
    console.log('   错误:', err.message)
  }

  console.log('\n📸 尝试截图...')
  try {
    await miniProgram.screenshot({ path: '/tmp/test-screenshot.png' })
    console.log('   截图已保存到: /tmp/test-screenshot.png')
  } catch (err: any) {
    console.log('   错误:', err.message)
  }

  console.log('\n✅ 测试完成！')
  console.log('\n💡 如果成功，说明自动化已正常工作')
  console.log('   下一步可以运行完整的 MCP 测试\n')

  process.exit(0)
}).catch((err: any) => {
  console.log('❌ 连接失败:', err.message, '\n')

  console.log('🔧 故障排除步骤：')
  console.log('   1. 确认微信开发者工具已打开')
  console.log('   2. 确认已打开了一个小程序项目')
  console.log('   3. 检查设置中的端口号是否为', PORT)
  console.log('   4. 确认 "CLI/HTTP 调用" 已开启')
  console.log('   5. 如果端口不对，设置环境变量：')
  console.log(`      DEVTOOLS_PORT=<实际端口> npx tsx ${process.argv[1]}\n`)

  console.log('错误详情:', err)
  process.exit(1)
})
