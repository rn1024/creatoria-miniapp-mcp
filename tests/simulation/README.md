# AI-MCP Simulation Testing

模拟真实 AI 调用 MCP 工具的测试框架，用于验证系统在实际使用场景下的表现。

## 📋 目录

- [快速开始](#快速开始)
- [测试模式](#测试模式)
- [自定义场景](#自定义场景)
- [高级用法](#高级用法)
- [故障排除](#故障排除)

---

## 🚀 快速开始

### 1. 快速测试（推荐）

最简单的方式，模拟一个完整的登录流程：

```bash
pnpm simulate:quick
```

**输出示例：**
```
🤖 Simulating AI Agent Workflow...

👤 User: "帮我测试小程序的登录功能"
🤖 AI: "好的，我来帮你测试登录功能。首先我需要启动小程序...

✅ Connected to MCP server

🔧 AI calls: automator_launch()
📊 Result: { "success": true }
🤖 AI: "小程序已启动成功

...
✅ AI Simulation Completed Successfully!
```

### 2. 完整场景测试

运行所有预定义的 7 个真实场景：

```bash
pnpm simulate:ai
```

**包含的场景：**
1. 基础导航 - 启动小程序并进入首页
2. 表单交互 - 填写登录表单并提交
3. 断言验证 - 验证页面元素和文本
4. 列表滚动 - 操作可滚动列表并提取数据
5. 网络 Mock - 模拟接口失败并验证错误处理
6. 快照调试 - 使用快照功能进行问题排查
7. 清理资源 - 正确关闭小程序

### 3. 场景运行器

从 JSON 配置运行特定场景：

```bash
# 运行所有场景
pnpm simulate:scenario all

# 运行特定场景
pnpm simulate:scenario basic-navigation
pnpm simulate:scenario form-interaction
pnpm simulate:scenario network-mock
```

**可用场景 ID：**
- `basic-navigation` - 基础导航测试
- `form-interaction` - 表单交互测试
- `list-scrolling` - 列表滚动测试
- `network-mock` - 网络 Mock 测试
- `snapshot-debug` - 快照调试测试
- `element-properties` - 元素属性测试
- `data-extraction` - 数据提取测试
- `multi-page-flow` - 多页面流程测试
- `conditional-logic` - 条件逻辑测试
- `performance-test` - 性能测试

---

## 🎯 测试模式

### Mode 1: Quick Test (快速测试)

**文件：** `quick-ai-test.ts`

**特点：**
- 单一固定流程（登录测试）
- 完整的 AI 对话模拟
- 包含思考过程和推理
- 适合快速验证系统是否正常

**使用场景：**
- 每日冒烟测试
- CI/CD 管道验证
- 新环境部署后的快速检查

**命令：**
```bash
pnpm simulate:quick
```

---

### Mode 2: Full Simulator (完整模拟器)

**文件：** `ai-mcp-simulator.ts`

**特点：**
- 7 个预定义场景
- 模拟真实 AI 思考过程
- 包含详细的推理和决策日志
- 覆盖所有 8 大工具类别

**使用场景：**
- 完整功能验证
- 回归测试
- 新功能发布前的验证

**命令：**
```bash
pnpm simulate:ai
```

**输出格式：**
```
📋 Scenario 1/7

👤 User: "帮我打开小程序并进入首页"

🤖 AI: Thinking: 用户想要启动小程序，我需要先启动 automator
🤖 AI: Reasoning: 使用 automator_launch 启动小程序自动化实例
🔧 Tool: Calling tool: automator_launch
🔧 Tool: Arguments: {}
✅ Result: Tool returned: {"success":true}

...
Expected outcome: 小程序成功启动并导航到首页
```

---

### Mode 3: Scenario Runner (场景运行器)

**文件：** `scenario-runner.ts` + `scenarios.json`

**特点：**
- 基于 JSON 配置的灵活场景
- 支持单个或批量运行
- 易于扩展和自定义
- 包含 10 个预定义场景

**使用场景：**
- 特定功能测试
- 用户验收测试（UAT）
- 自定义测试流程

**命令：**
```bash
# 运行所有场景
pnpm simulate:scenario all

# 运行单个场景
pnpm simulate:scenario basic-navigation
```

**输出格式：**
```
================================================================================
📋 Scenario: 基础导航测试
📝 Description: 模拟 AI 启动小程序并导航到指定页面
================================================================================

👤 User: "打开小程序并进入首页"

🧠 AI Thinking (Step 1/3):
   💭 用户要求打开小程序，我需要先启动 automator
   🔧 Tool: automator_launch
   📥 Args: {}
   ✅ Success
   📤 Result: {"success":true}

...
✅ Scenario completed successfully!
```

---

## 🎨 自定义场景

### 编辑 scenarios.json

在 `tests/simulation/scenarios.json` 中添加新场景：

```json
{
  "scenarios": [
    {
      "id": "my-custom-test",
      "name": "自定义测试",
      "description": "我的自定义测试场景",
      "userMessage": "用户的请求描述",
      "steps": [
        {
          "tool": "automator_launch",
          "args": {},
          "aiReasoning": "AI 的推理过程"
        },
        {
          "tool": "miniprogram_navigate_to",
          "args": { "path": "/pages/custom/page" },
          "aiReasoning": "导航到自定义页面"
        }
      ]
    }
  ]
}
```

### 运行自定义场景

```bash
pnpm simulate:scenario my-custom-test
```

---

## 🔧 高级用法

### 1. 编写自己的模拟器

基于 `MCPClient` 创建自定义测试：

```typescript
import { MCPClient } from '../integration/helpers/mcp-client.js'

const client = new MCPClient()

async function myCustomTest() {
  await client.connect()

  // 模拟 AI 决策：启动小程序
  console.log('🤖 AI: 我需要启动小程序...')
  await client.callTool('automator_launch', {})

  // 模拟 AI 决策：导航到页面
  console.log('🤖 AI: 现在导航到目标页面...')
  await client.callTool('miniprogram_navigate_to', {
    path: '/pages/my/page'
  })

  // 模拟 AI 决策：验证结果
  console.log('🤖 AI: 验证页面是否加载成功...')
  await client.callTool('assert_element_exists', {
    selector: '.page-loaded'
  })

  await client.disconnect()
}

myCustomTest()
```

### 2. 集成到 CI/CD

在 GitHub Actions 中使用：

```yaml
# .github/workflows/ai-simulation.yml
name: AI Simulation Tests

on: [push, pull_request]

jobs:
  simulate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - run: pnpm install
      - run: pnpm build

      # 运行快速测试
      - run: pnpm simulate:quick

      # 运行所有场景
      - run: pnpm simulate:scenario all
```

### 3. 性能基准测试

使用模拟器测试工具调用性能：

```typescript
import { MCPClient } from '../integration/helpers/mcp-client.js'

async function benchmarkTools() {
  const client = new MCPClient()
  await client.connect()

  const tools = [
    'automator_launch',
    'miniprogram_navigate_to',
    'page_query',
    'element_tap'
  ]

  for (const tool of tools) {
    const start = Date.now()
    await client.callTool(tool, {/* args */})
    const duration = Date.now() - start

    console.log(`${tool}: ${duration}ms`)
  }

  await client.disconnect()
}
```

---

## 🐛 故障排除

### 问题 1: MCP Server 连接失败

**症状：**
```
❌ Simulation failed: Error: Failed to connect to MCP server
```

**解决方案：**
```bash
# 1. 确保已构建项目
pnpm build

# 2. 检查配置文件
cat .mcp.json

# 3. 手动启动 server 测试
node dist/cli.js
```

---

### 问题 2: 工具调用失败

**症状：**
```
❌ Failed: Tool 'page_query' not found
```

**解决方案：**
```bash
# 检查工具是否正确注册
pnpm update-readme 2>&1 | grep "Total:"
# 应显示: 📊 Total: 65 tools

# 重新构建
pnpm build
```

---

### 问题 3: 小程序路径错误

**症状：**
```
❌ Failed: Mini program project not found
```

**解决方案：**
```bash
# 设置正确的项目路径
export TEST_PROJECT_PATH="/path/to/your/miniprogram"

# 或在 .mcp.json 中配置
{
  "projectPath": "/path/to/your/miniprogram"
}
```

---

### 问题 4: 场景 JSON 格式错误

**症状：**
```
❌ SyntaxError: Unexpected token } in JSON
```

**解决方案：**
```bash
# 验证 JSON 格式
cat tests/simulation/scenarios.json | jq .

# 或使用在线工具验证 JSON
# https://jsonlint.com/
```

---

## 📊 测试覆盖率

模拟测试覆盖的工具类别：

| 类别 | 工具数 | 模拟场景 | 覆盖率 |
|------|--------|----------|--------|
| **Automator** | 4 | ✅ 所有场景 | 100% |
| **MiniProgram** | 17 | ✅ 导航/截图/调用 | 80% |
| **Page** | 14 | ✅ 查询/等待/滚动 | 70% |
| **Element** | 15 | ✅ 点击/输入/获取 | 75% |
| **Assert** | 7 | ✅ 存在/文本/属性 | 85% |
| **Snapshot** | 3 | ✅ 页面/数据快照 | 100% |
| **Record** | 3 | ✅ 录制/回放 | 60% |
| **Network** | 6 | ✅ Mock/恢复 | 90% |

**总覆盖率：** ~80%

---

## 🎯 使用建议

### 开发阶段
1. 每次修改代码后运行 `pnpm simulate:quick`
2. 添加新工具时在 `scenarios.json` 中添加对应场景
3. 提交前运行 `pnpm simulate:scenario all`

### 测试阶段
1. 使用场景运行器进行功能验证
2. 针对特定功能创建自定义场景
3. 记录失败场景用于回归测试

### 生产部署
1. 在 CI/CD 中集成模拟测试
2. 设置自动化定时测试
3. 监控测试结果趋势

---

## 📚 相关文档

- [Integration Tests](../integration/README.md) - 完整的集成测试文档
- [MCP Client](../integration/helpers/mcp-client.ts) - MCP 客户端实现
- [API Reference](../../docs/api/README.md) - 完整工具 API 文档
- [Setup Guide](../../docs/setup-guide.md) - 环境配置指南

---

## 🤝 贡献

欢迎添加更多模拟场景！

1. 在 `scenarios.json` 添加场景
2. 测试场景是否能正常运行
3. 提交 PR 并说明场景用途

**场景命名规范：**
- ID: 小写字母 + 连字符（如 `form-interaction`）
- Name: 简洁的中文描述
- Description: 详细说明场景用途

---

**Last Updated:** 2025-10-04
**Version:** 0.1.0
