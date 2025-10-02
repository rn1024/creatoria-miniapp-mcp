# 使用示例

完整的 creatoria-miniapp-mcp 使用示例集合，涵盖从基础操作到高级自动化的完整场景。

---

## 📚 示例分类

### 基础示例（Basic）

适合初学者，演示核心功能的基本用法。

| 示例 | 描述 | 难度 | 涵盖工具 |
|------|------|------|----------|
| [01-basic-navigation](./01-basic-navigation.md) | 页面导航基础 | ⭐ | launch, navigate, screenshot |
| [02-element-interaction](./02-element-interaction.md) | 元素查询与交互 | ⭐ | query, queryAll, tap, input, getText |

### 进阶示例（Advanced）

演示断言、快照和复杂交互场景。

| 示例 | 描述 | 难度 | 涵盖工具 |
|------|------|------|----------|
| [03-assertion-testing](./03-assertion-testing.md) | 断言验证测试 | ⭐⭐ | assert_*, page_wait_for |
| [04-snapshot-debugging](./04-snapshot-debugging.md) | 快照调试技巧 | ⭐⭐ | snapshot_*, screenshot |

### 综合示例（Comprehensive）

完整的端到端自动化测试流程。

| 示例 | 描述 | 难度 | 涵盖工具 |
|------|------|------|----------|
| [05-record-replay](./05-record-replay.md) | 录制回放测试 | ⭐⭐⭐ | record.*, 回归测试 |

---

## 🚀 快速开始

### 前置条件

1. 已安装微信开发者工具
2. 已配置 MCP 客户端（如 Claude Desktop）
3. 准备好小程序项目用于测试

### 运行示例

所有示例均基于 MCP 协议，通过 Claude Desktop 或其他 MCP 客户端运行：

```
# 方式 1: 通过自然语言（推荐）
用户：按照 examples/01-basic-navigation.md 的步骤，帮我测试页面导航功能

# 方式 2: 直接调用工具（Claude Desktop）
Claude 会读取示例文档并依次调用对应的 MCP 工具
```

---

## 📖 示例详情

### [01-basic-navigation](./01-basic-navigation.md)

**学习目标**:
- 启动和连接微信开发者工具
- 使用 5 种导航方法跳转页面
- 截图记录页面状态

**关键步骤**:
1. 启动小程序 (`automator_launch` or `automator_connect`)
2. 导航到不同页面 (`miniprogram_navigate`)
3. 截图记录 (`miniprogram_screenshot`)

**适合场景**: 页面导航测试、页面栈验证

---

### [02-element-interaction](./02-element-interaction.md)

**学习目标**:
- 查询单个和多个元素
- 缓存元素引用（refId）
- 执行点击、长按、输入操作
- 获取元素文本、属性和尺寸
- 理解 Attribute vs Property

**关键步骤**:
1. 查询单个元素 (`page_query`)
2. 查询多个元素 (`page_queryAll`)
3. 输入文本 (`element_input`)
4. 点击和长按 (`element_tap`, `element_longPress`)
5. 获取内容 (`element_getText`, `element_getValue`)
6. 获取属性 (`element_getAttribute`, `element_getProperty`)

**适合场景**: 登录表单、商品列表、搜索功能、元素信息获取

---

### [03-assertion-testing](./03-assertion-testing.md)

**学习目标**:
- 使用断言验证页面状态
- 编写自动化测试脚本
- 处理异步操作
- 错误场景处理

**关键步骤**:
1. 验证元素存在 (`assert_exists`)
2. 验证文本内容 (`assert_text`)
3. 验证页面数据 (`assert_data`)
4. 等待异步操作 (`page_wait_for`)

**适合场景**: UI 测试、回归测试、功能验证

---

### [04-snapshot-debugging](./04-snapshot-debugging.md)

**学习目标**:
- 捕获页面快照用于调试
- 记录元素状态
- 对比操作前后变化
- 生成调试报告

**关键步骤**:
1. 捕获页面快照 (`snapshot_page`)
2. 捕获元素快照 (`snapshot_element`)
3. 捕获完整应用状态 (`snapshot_full`)
4. 分析快照数据

**适合场景**: Bug 调试、问题诊断、状态记录

---

### [05-record-replay](./05-record-replay.md)

**学习目标**:
- 录制用户操作序列
- 保存和管理测试用例
- 回放测试序列实现回归测试
- 处理回放中的错误

**关键步骤**:
1. 启动录制 (`record.start`)
2. 执行操作序列
3. 停止并保存 (`record.stop`)
4. 回放录制 (`record.replay`)
5. 验证回放结果

**适合场景**: 回归测试、自动化测试录制、CI/CD 集成

---

## 💡 使用技巧

### 1. 元素引用缓存

```javascript
// ✅ 推荐：使用 save: true 缓存引用
const btn = await page_query({
  selector: ".submit-btn",
  save: true  // 保存引用
})
await element_tap({ refId: btn.refId })  // 复用引用
await element_get_text({ refId: btn.refId })

// ❌ 不推荐：每次都查询
await element_tap({ selector: ".submit-btn" })  // 不支持
```

### 2. 等待异步操作

```javascript
// ✅ 推荐：等待元素出现
await element_tap({ refId: btn.refId })
await page_wait_for({
  selector: ".result",
  timeout: 2000
})
await assert_exists({ selector: ".result" })

// ❌ 不推荐：直接断言
await element_tap({ refId: btn.refId })
await assert_exists({ selector: ".result" })  // 可能失败
```

### 3. 错误处理

```javascript
// ✅ 推荐：捕获错误并截图
try {
  await automator_launch({ projectPath: "/path" })
  // 测试逻辑...
} catch (error) {
  await miniprogram_screenshot({
    filename: "error-state.png"
  })
  console.error("测试失败:", error.message)
  throw error
} finally {
  await automator_close()
}
```

### 4. 断言顺序

```javascript
// ✅ 推荐：先验证存在，再验证内容
await assert_exists({ selector: ".message" })
const el = await page_query({ selector: ".message", save: true })
await assert_text({ refId: el.refId, expected: "Success" })

// ❌ 不推荐：直接验证内容
const el = await page_query({ selector: ".message", save: true })
await assert_text({ refId: el.refId, expected: "Success" })
```

---

## 🔗 相关资源

### 官方文档
- [API 参考](../docs/api/README.md) - 完整的 API 文档
- [配置指南](../docs/setup-guide.md) - 环境配置步骤
- [系统架构](../docs/architecture.md) - 架构设计文档

### 工具分类 (59 Tools across 7 Categories)
- [Automator API](../docs/api/automator.md) - 连接和生命周期 (4 tools)
- [MiniProgram API](../docs/api/miniprogram.md) - 小程序操作 (6 tools)
- [Page API](../docs/api/page.md) - 页面级别操作 (8 tools)
- [Element API](../docs/api/element.md) - 元素交互 (23 tools)
- [Assert API](../docs/api/assert.md) - 断言验证 (9 tools)
- [Snapshot API](../docs/api/snapshot.md) - 状态捕获 (3 tools)
- [Record API](../docs/api/record.md) - 录制回放 (6 tools)

### 外部资源
- [miniprogram-automator 官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

## 🤝 贡献示例

欢迎贡献新的使用示例！请参考 [贡献指南](../CONTRIBUTING.md) 了解：

1. 示例编写规范
2. 代码风格要求
3. Pull Request 流程

### 示例模板

```markdown
# 示例标题

> 一句话描述示例目标

## 难度

⭐⭐ 进阶

## 学习目标

- 目标 1
- 目标 2

## 前置条件

- 条件 1
- 条件 2

## 完整代码

\`\`\`javascript
// 完整可运行的代码
\`\`\`

## 分步讲解

### 步骤 1: 标题
解释...

## 预期输出

\`\`\`
输出示例
\`\`\`

## 常见问题

### 问题 1
解决方案...
```

---

## 📮 反馈

如果您有问题或建议，欢迎：

- 提交 [GitHub Issue](https://github.com/your-org/creatoria-miniapp-mcp/issues)
- 参与 [GitHub Discussions](https://github.com/your-org/creatoria-miniapp-mcp/discussions)

---

**最后更新**: 2025-10-02
