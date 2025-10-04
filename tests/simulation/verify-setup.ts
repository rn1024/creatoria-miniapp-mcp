#!/usr/bin/env npx tsx
/**
 * 验证微信开发者工具配置
 *
 * 根据官方文档要求检查：
 * 1. 开发者工具是否已安装
 * 2. CLI/HTTP 调用是否已开启
 * 3. 测试小程序项目是否可用
 */

import { existsSync } from 'fs'
import automator from 'miniprogram-automator'

// 默认 CLI 路径（macOS）
const DEFAULT_CLI_PATH = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'

// 测试小程序项目路径
const DEMO_PROJECT_PATH = process.env.TEST_PROJECT_PATH || ''

console.log('🔍 验证微信开发者工具配置...\n')

// 步骤1: 检查 CLI 是否存在
console.log('1. 检查 CLI 工具...')
if (existsSync(DEFAULT_CLI_PATH)) {
  console.log(`   ✅ CLI 工具已找到: ${DEFAULT_CLI_PATH}\n`)
} else {
  console.log(`   ❌ CLI 工具未找到: ${DEFAULT_CLI_PATH}`)
  console.log(`   请确认微信开发者工具已正确安装\n`)
  process.exit(1)
}

// 步骤2: 检查测试项目
console.log('2. 检查测试小程序项目...')
if (!DEMO_PROJECT_PATH) {
  console.log('   ⚠️  未设置测试项目路径')
  console.log('\n📝 请执行以下步骤：')
  console.log('   1. 打开微信开发者工具')
  console.log('   2. 设置 → 安全设置 → 开启 "CLI/HTTP 调用"')
  console.log('   3. 创建或打开一个小程序项目')
  console.log('   4. 设置环境变量：')
  console.log('      export TEST_PROJECT_PATH="/path/to/your/miniprogram"')
  console.log('   5. 重新运行此脚本：')
  console.log('      TEST_PROJECT_PATH=/path/to/project npx tsx tests/simulation/verify-setup.ts\n')

  console.log('💡 或使用官方示例小程序：')
  console.log('   git clone https://github.com/wechat-miniprogram/miniprogram-demo.git')
  console.log('   cd miniprogram-demo')
  console.log('   TEST_PROJECT_PATH="$(pwd)" npx tsx ../tests/simulation/verify-setup.ts\n')

  process.exit(0)
}

if (!existsSync(DEMO_PROJECT_PATH)) {
  console.log(`   ❌ 项目路径不存在: ${DEMO_PROJECT_PATH}\n`)
  process.exit(1)
}

console.log(`   ✅ 项目路径: ${DEMO_PROJECT_PATH}\n`)

// 步骤3: 尝试启动自动化 (使用 launch 方法启动新实例)
console.log('3. 尝试启动自动化 (launch 方式)...')
console.log('   如果失败，请确认开发者工具的 "CLI/HTTP 调用" 已开启\n')

automator.launch({
  cliPath: DEFAULT_CLI_PATH,
  projectPath: DEMO_PROJECT_PATH,
  projectConfig: {
    appid: '',  // 空 appid 可能绕过验证
  },
}).then(async (miniProgram: any) => {
  console.log('   ✅ 自动化启动成功！\n')

  console.log('4. 获取系统信息...')
  try {
    const systemInfo = await miniProgram.systemInfo()
    console.log('   ✅ 系统信息:', JSON.stringify(systemInfo, null, 2))
  } catch (err: any) {
    console.log('   ⚠️  无法获取系统信息:', err.message)
  }

  console.log('\n5. 关闭小程序...')
  await miniProgram.close()
  console.log('   ✅ 已关闭\n')

  console.log('✅ 所有检查通过！环境配置正确。')
  console.log('\n下一步：运行完整测试')
  console.log('  TEST_PROJECT_PATH=' + DEMO_PROJECT_PATH + ' pnpm simulate:quick\n')

  process.exit(0)
}).catch((err: any) => {
  console.log('   ❌ 启动失败:', err.message, '\n')

  console.log('🔧 故障排除：')
  console.log('   1. 打开微信开发者工具')
  console.log('   2. 设置 → 安全设置 → 开启以下选项：')
  console.log('      ☑ 服务端口')
  console.log('      ☑ CLI/HTTP 调用')
  console.log('   3. 重启开发者工具')
  console.log('   4. 重新运行此脚本\n')

  console.log('错误详情:', err)

  process.exit(1)
})
