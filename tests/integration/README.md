# 集成测试指南

> **注意**: 集成测试需要运行中的微信开发者工具和一个测试用的小程序项目。

## 前置要求

1. **微信开发者工具**: 已安装并启用自动化端口
2. **测试小程序项目**: 用于测试的小程序项目（建议使用 `test-miniprogram/` 示例项目）
3. **环境变量配置**: 设置测试项目路径

## 快速开始

### 1. 准备测试项目

```bash
# 选项 A: 使用项目中的示例项目（如果有）
export TEST_PROJECT_PATH="/path/to/creatoria-miniapp-mcp/test-miniprogram"

# 选项 B: 使用你自己的小程序项目
export TEST_PROJECT_PATH="/path/to/your/miniprogram"
```

### 2. 启动微信开发者工具

```bash
# macOS
/Applications/wechatwebdevtools.app/Contents/MacOS/cli \
  --auto "$TEST_PROJECT_PATH" \
  --auto-port 9420

# 或使用项目提供的脚本
npm run launch-devtools
```

### 3. 运行集成测试

```bash
# 运行所有集成测试
npm run test:integration

# 运行特定测试
npm run test:integration -- basic-flow.test.ts

# 调试模式（详细日志）
DEBUG=mcp:* npm run test:integration
```

## 测试场景

### 场景 1: 基础导航流程
**文件**: `01-basic-navigation.test.ts`

测试内容：
- ✅ 启动小程序（automator.launch）
- ✅ 导航到指定页面（miniprogram.navigate）
- ✅ 截图验证（miniprogram.screenshot）
- ✅ 关闭连接（automator.disconnect）

### 场景 2: 元素交互流程
**文件**: `02-element-interaction.test.ts`

测试内容：
- ✅ 查询元素（page.query）
- ✅ 点击元素（element.tap）
- ✅ 输入文本（element.input）
- ✅ 验证元素属性（element.getAttribute）

### 场景 3: 断言验证流程
**文件**: `03-assertion-testing.test.ts`

测试内容：
- ✅ 元素存在性断言（assert.exists）
- ✅ 文本内容断言（assert.text）
- ✅ 页面数据断言（assert.data）
- ✅ 快照保存（snapshot.page）

### 场景 4: 录制回放流程
**文件**: `04-record-replay.test.ts`

测试内容：
- ✅ 开始录制（record.start）
- ✅ 执行操作序列
- ✅ 停止录制（record.stop）
- ✅ 回放录制（record.replay）

### 场景 5: 失败快照收集 (F2)
**文件**: `05-failure-snapshot.test.ts`

测试内容：
- ✅ 配置失败快照功能
- ✅ 触发工具失败
- ✅ 验证快照自动保存
- ✅ 检查快照内容完整性

### 场景 6: 会话报告生成 (F3)
**文件**: `06-session-report.test.ts`

测试内容：
- ✅ 配置会话报告功能
- ✅ 执行多个工具调用
- ✅ 验证报告生成
- ✅ 检查报告内容准确性

## 环境变量

```bash
# 必需
TEST_PROJECT_PATH=/path/to/miniprogram  # 测试项目路径

# 可选
TEST_AUTO_PORT=9420                     # 自动化端口
TEST_TIMEOUT=60000                      # 测试超时（毫秒）
TEST_SKIP_CLEANUP=false                 # 跳过测试后清理
TEST_VERBOSE=false                      # 详细日志
```

## 跳过集成测试

如果没有可用的测试环境，可以跳过集成测试：

```bash
# 只运行单元测试
npm run test:unit

# 或设置环境变量
SKIP_INTEGRATION_TESTS=true npm test
```

## 故障排查

### 问题 1: 连接失败

```
Error: Failed to connect to automation port 9420
```

**解决方法**:
1. 确认微信开发者工具已启动
2. 检查自动化端口是否启用：设置 → 安全设置 → 服务端口
3. 尝试重启开发者工具

### 问题 2: 项目路径错误

```
Error: Project path not found
```

**解决方法**:
1. 检查 `TEST_PROJECT_PATH` 是否正确
2. 确认路径是绝对路径
3. 确认项目包含 `project.config.json`

### 问题 3: 元素未找到

```
Error: Element not found: .test-button
```

**解决方法**:
1. 确认测试项目页面结构与测试匹配
2. 使用 `page.query` 先检查元素是否存在
3. 增加等待时间：`page.waitFor`

## 编写新的集成测试

### 模板

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { startServer } from '../../src/server.js'
import { McpClient } from './helpers/mcp-client.js'

describe('My Integration Test', () => {
  let client: McpClient

  beforeAll(async () => {
    // 启动 MCP Server
    const server = await startServer({
      projectPath: process.env.TEST_PROJECT_PATH,
      enableSessionReport: true,
    })

    // 创建测试客户端
    client = new McpClient(server)
    await client.connect()
  })

  afterAll(async () => {
    await client.disconnect()
  })

  it('should do something', async () => {
    // 调用 MCP 工具
    const result = await client.callTool('automator_launch', {
      projectPath: process.env.TEST_PROJECT_PATH,
    })

    // 验证结果
    expect(result.connected).toBe(true)
  })
})
```

### 辅助工具

- `helpers/mcp-client.ts` - MCP 客户端封装
- `helpers/test-project.ts` - 测试项目管理
- `helpers/assertions.ts` - 自定义断言

## CI/CD 集成

> 注意：集成测试在 CI 中需要特殊配置（安装微信开发者工具）

参考 `.github/workflows/integration-test.yml` 配置示例。

## 相关文档

- [单元测试指南](../unit/README.md)
- [MCP 工具清单](../../README.md#tools)
- [开发者工具文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)
