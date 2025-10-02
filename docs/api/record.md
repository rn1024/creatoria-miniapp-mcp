# Record & Replay API

> Record 工具提供动作序列的录制、保存和回放功能，可以记录自动化操作并在后续重放，支持测试场景复用和回归测试。

## 工具列表

| 工具名称 | 描述 | 必需参数 |
|---------|------|----------|
| `record_start` | 开始录制动作序列 | 无 |
| `record_stop` | 停止录制并保存 | 无 |
| `record_list` | 列出所有已保存的序列 | 无 |
| `record_get` | 获取指定序列的详细信息 | sequenceId |
| `record_delete` | 删除指定序列 | sequenceId |
| `record_replay` | 回放已保存的序列 | sequenceId |

---

## record_start

开始录制自动化动作序列，录制期间所有工具调用都会被记录下来。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `name` | string | ⭐ | `Recording {timestamp}` | 序列名称（便于识别） |
| `description` | string | ⭐ | - | 序列描述（说明用途或场景） |

### 返回值

```typescript
{
  success: true,
  message: "Recording started: {name}",
  sequenceId: "seq_1738425600000_abc123"
}
```

### 错误处理

- **已在录制中**: `Error: Already recording. Stop current recording first.`

### 使用示例

```javascript
// 示例 1: 基础用法（使用默认名称）
const result = await record_start()
console.log(result.sequenceId) // "seq_1738425600000_abc123"

// 示例 2: 指定名称和描述
const result = await record_start({
  name: "用户登录流程",
  description: "测试用户登录并跳转到个人中心"
})
console.log(result.message) // "Recording started: 用户登录流程"

// 示例 3: 录制复杂测试场景
await record_start({
  name: "购物车结算流程",
  description: "从商品列表到下单完成的完整流程"
})

// 执行自动化操作（这些操作会被自动记录）
await miniprogram_navigate({ method: "navigateTo", url: "/pages/cart/cart" })
await element_tap({ selector: ".checkout-btn" })
// ... 更多操作

await record_stop() // 停止录制
```

### 注意事项

- ⚠️ **单录制限制**: 同一时间只能有一个录制会话，必须先停止当前录制才能开始新的录制
- 💡 **自动记录**: 录制开始后，所有工具调用（除了 record 工具本身）都会被自动记录
- 💡 **元数据记录**: 每个动作记录包含时间戳、工具名称、参数、执行结果、耗时等信息
- 💡 **命名规范**: 建议使用清晰的名称，如 "登录流程"、"商品搜索测试" 等

### 相关工具

- [`record_stop`](#record_stop) - 停止录制并保存
- [`record_replay`](#record_replay) - 回放录制的序列

---

## record_stop

停止当前录制并保存动作序列到文件。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `save` | boolean | ⭐ | true | 是否保存序列（false 则丢弃） |

### 返回值

```typescript
{
  success: true,
  message: "Recording stopped: {name} ({actionCount} actions)",
  sequenceId: "seq_1738425600000_abc123",
  actionCount: 15,
  filePath: "/path/to/.mcp-artifacts/{sessionId}/sequences/seq_xxx.json"
}
```

### 错误处理

- **未在录制**: `Error: Not currently recording`
- **文件保存失败**: `Error: Failed to stop recording: {error}`

### 使用示例

```javascript
// 示例 1: 基础用法（保存序列）
await record_start({ name: "登录测试" })
// ... 执行自动化操作
const result = await record_stop()
console.log(result.message) // "Recording stopped: 登录测试 (8 actions)"
console.log(result.filePath) // 序列文件路径

// 示例 2: 丢弃录制（不保存）
await record_start({ name: "临时测试" })
// ... 执行操作
await record_stop({ save: false })
// 不会生成序列文件

// 示例 3: 完整的录制流程
const session = await record_start({
  name: "购物车操作",
  description: "添加商品到购物车并结算"
})

// 执行自动化操作
await miniprogram_navigate({ method: "navigateTo", url: "/pages/product/product" })
await element_tap({ selector: ".add-to-cart" })
await element_tap({ selector: ".cart-icon" })
await element_tap({ selector: ".checkout-btn" })

// 停止并保存
const result = await record_stop()
console.log(`已保存 ${result.actionCount} 个动作`)
console.log(`序列ID: ${result.sequenceId}`)
```

### 注意事项

- ⚠️ **自动清理**: 停止后录制状态会被清除，无论是否保存
- ⚠️ **文件位置**: 序列文件保存在 `.mcp-artifacts/{sessionId}/sequences/` 目录
- 💡 **调试技巧**: 测试时可以设置 `save: false` 避免生成过多序列文件
- 💡 **序列ID**: 由时间戳和随机字符串组成，全局唯一

### 相关工具

- [`record_start`](#record_start) - 开始录制
- [`record_list`](#record_list) - 查看已保存的序列
- [`record_get`](#record_get) - 查看序列详情

---

## record_list

列出当前会话中所有已保存的动作序列。

### 参数

无参数。

### 返回值

```typescript
{
  success: true,
  message: "Found {count} sequences",
  sequences: [
    {
      id: "seq_1738425600000_abc123",
      name: "用户登录流程",
      description: "测试用户登录并跳转到个人中心",
      createdAt: "2025-02-01T10:00:00.000Z",
      actionCount: 8
    },
    {
      id: "seq_1738426200000_def456",
      name: "购物车结算流程",
      createdAt: "2025-02-01T10:10:00.000Z",
      actionCount: 15
    }
  ]
}
```

### 错误处理

- **目录读取失败**: `Error: Failed to list sequences: {error}`

### 使用示例

```javascript
// 示例 1: 基础用法
const result = await record_list()
console.log(result.message) // "Found 5 sequences"
result.sequences.forEach(seq => {
  console.log(`${seq.name}: ${seq.actionCount} 个动作`)
})

// 示例 2: 查找特定序列
const result = await record_list()
const loginSeq = result.sequences.find(seq =>
  seq.name.includes("登录")
)
if (loginSeq) {
  console.log(`找到登录序列: ${loginSeq.id}`)
  await record_replay({ sequenceId: loginSeq.id })
}

// 示例 3: 显示所有序列信息
const result = await record_list()
console.log(`共有 ${result.sequences.length} 个序列:\n`)
result.sequences.forEach((seq, index) => {
  console.log(`${index + 1}. ${seq.name}`)
  console.log(`   ID: ${seq.id}`)
  console.log(`   描述: ${seq.description || '无'}`)
  console.log(`   动作数: ${seq.actionCount}`)
  console.log(`   创建时间: ${new Date(seq.createdAt).toLocaleString()}`)
  console.log()
})
```

### 注意事项

- 💡 **会话隔离**: 只列出当前会话目录下的序列
- 💡 **排序**: 序列按文件名排序（通常是时间顺序）
- 💡 **过滤**: 只读取 `.json` 文件，忽略其他文件
- 💡 **性能**: 如果序列很多，可能需要一定时间读取

### 相关工具

- [`record_get`](#record_get) - 获取序列详细信息
- [`record_delete`](#record_delete) - 删除序列

---

## record_get

获取指定序列的完整详细信息，包括所有动作记录。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `sequenceId` | string | ✅ | - | 序列ID（从 list 或 start/stop 获取） |

### 返回值

```typescript
{
  success: true,
  message: "Sequence retrieved: {name}",
  sequence: {
    id: "seq_1738425600000_abc123",
    name: "用户登录流程",
    description: "测试用户登录并跳转到个人中心",
    createdAt: "2025-02-01T10:00:00.000Z",
    actions: [
      {
        timestamp: "2025-02-01T10:00:01.234Z",
        toolName: "miniprogram_navigate",
        args: { method: "navigateTo", url: "/pages/login/login" },
        success: true,
        duration: 150
      },
      {
        timestamp: "2025-02-01T10:00:02.456Z",
        toolName: "element_input",
        args: { selector: "#username", value: "testuser" },
        success: true,
        duration: 80
      },
      // ... 更多动作
    ]
  }
}
```

### 错误处理

- **序列不存在**: `Error: Failed to get sequence: ENOENT: no such file`
- **JSON 解析失败**: `Error: Failed to get sequence: Unexpected token`

### 使用示例

```javascript
// 示例 1: 基础用法
const result = await record_get({
  sequenceId: "seq_1738425600000_abc123"
})
console.log(result.sequence.name) // "用户登录流程"
console.log(result.sequence.actions.length) // 8

// 示例 2: 分析序列内容
const result = await record_get({ sequenceId: "seq_xxx" })
const sequence = result.sequence

console.log(`序列名称: ${sequence.name}`)
console.log(`总动作数: ${sequence.actions.length}`)

// 统计工具使用
const toolStats = {}
sequence.actions.forEach(action => {
  toolStats[action.toolName] = (toolStats[action.toolName] || 0) + 1
})
console.log("工具使用统计:", toolStats)

// 查找失败的动作
const failures = sequence.actions.filter(a => !a.success)
if (failures.length > 0) {
  console.log("失败的动作:")
  failures.forEach(f => {
    console.log(`- ${f.toolName}: ${f.error}`)
  })
}

// 示例 3: 提取序列步骤
const result = await record_get({ sequenceId: "seq_xxx" })
console.log("序列步骤:")
result.sequence.actions.forEach((action, index) => {
  const time = new Date(action.timestamp).toLocaleTimeString()
  const status = action.success ? "✅" : "❌"
  console.log(`${index + 1}. [${time}] ${status} ${action.toolName}`)
  if (action.duration) {
    console.log(`   耗时: ${action.duration}ms`)
  }
})
```

### 注意事项

- 💡 **完整数据**: 返回序列的完整 JSON 数据，包括所有动作详情
- 💡 **时间戳格式**: 所有时间戳为 ISO 8601 格式字符串
- 💡 **成功标志**: `success: true/false` 标识动作执行结果
- 💡 **错误信息**: 失败的动作包含 `error` 字段（错误消息）

### 相关工具

- [`record_list`](#record_list) - 列出所有序列
- [`record_replay`](#record_replay) - 回放序列

---

## record_delete

删除指定的动作序列文件。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `sequenceId` | string | ✅ | - | 要删除的序列ID |

### 返回值

```typescript
{
  success: true,
  message: "Sequence deleted: {sequenceId}"
}
```

### 错误处理

- **序列不存在**: `Error: Failed to delete sequence: ENOENT: no such file`
- **文件删除失败**: `Error: Failed to delete sequence: Permission denied`

### 使用示例

```javascript
// 示例 1: 基础用法
const result = await record_delete({
  sequenceId: "seq_1738425600000_abc123"
})
console.log(result.message) // "Sequence deleted: seq_1738425600000_abc123"

// 示例 2: 批量删除旧序列
const { sequences } = await record_list()
const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

for (const seq of sequences) {
  const createdAt = new Date(seq.createdAt).getTime()
  if (createdAt < oneWeekAgo) {
    await record_delete({ sequenceId: seq.id })
    console.log(`已删除旧序列: ${seq.name}`)
  }
}

// 示例 3: 删除前确认
const sequenceId = "seq_xxx"
const { sequence } = await record_get({ sequenceId })

console.log(`确定要删除序列 "${sequence.name}" 吗？`)
console.log(`包含 ${sequence.actions.length} 个动作`)
// 用户确认后...
await record_delete({ sequenceId })
console.log("已删除")
```

### 注意事项

- ⚠️ **不可恢复**: 删除操作不可恢复，请谨慎使用
- ⚠️ **ID 精确匹配**: 必须提供完整的序列ID
- 💡 **批量清理**: 可以结合 `list` 实现批量删除旧序列
- 💡 **幂等性**: 删除不存在的序列会抛出错误（非幂等）

### 相关工具

- [`record_list`](#record_list) - 查看可删除的序列
- [`record_get`](#record_get) - 删除前查看详情

---

## record_replay

回放已保存的动作序列，按顺序重新执行所有记录的工具调用。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `sequenceId` | string | ✅ | - | 要回放的序列ID |
| `continueOnError` | boolean | ⭐ | false | 遇到错误时是否继续执行 |

### 返回值

```typescript
{
  success: true,  // 所有动作都成功时为 true
  message: "Replay completed: {successCount} success, {failureCount} failures",
  totalActions: 15,
  successCount: 14,
  failureCount: 1,
  results: [
    {
      toolName: "miniprogram_navigate",
      success: true
    },
    {
      toolName: "element_tap",
      success: false,
      error: "Element not found: .missing-btn"
    },
    // ... 更多结果
  ]
}
```

### 错误处理

- **序列不存在**: `Error: Failed to replay sequence: Failed to get sequence`
- **工具不存在**: `Error: Replay stopped at action {toolName}: Tool not found`
- **动作执行失败** (continueOnError=false): `Error: Replay stopped at action {toolName}: {error}`

### 使用示例

```javascript
// 示例 1: 基础用法（遇错停止）
const result = await record_replay({
  sequenceId: "seq_1738425600000_abc123"
})

if (result.success) {
  console.log("序列回放成功！")
} else {
  console.log(`回放失败: ${result.failureCount} 个动作失败`)
  result.results.forEach((r, i) => {
    if (!r.success) {
      console.log(`动作 ${i + 1} (${r.toolName}) 失败: ${r.error}`)
    }
  })
}

// 示例 2: 持续执行模式（收集所有错误）
const result = await record_replay({
  sequenceId: "seq_xxx",
  continueOnError: true
})

console.log(`总计: ${result.totalActions} 个动作`)
console.log(`成功: ${result.successCount}`)
console.log(`失败: ${result.failureCount}`)

// 生成测试报告
console.log("\n测试报告:")
result.results.forEach((r, index) => {
  const status = r.success ? "✅" : "❌"
  console.log(`${index + 1}. ${status} ${r.toolName}`)
  if (r.error) {
    console.log(`   错误: ${r.error}`)
  }
})

// 示例 3: 回归测试流程
async function regressionTest(sequenceId) {
  console.log("开始回归测试...")

  const result = await record_replay({
    sequenceId,
    continueOnError: true
  })

  const passRate = (result.successCount / result.totalActions) * 100
  console.log(`通过率: ${passRate.toFixed(2)}%`)

  if (result.failureCount > 0) {
    console.log("\n失败的测试用例:")
    result.results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`- ${r.toolName}: ${r.error}`)
      })
  }

  return result.success
}

// 运行回归测试
const passed = await regressionTest("seq_xxx")
if (!passed) {
  console.log("⚠️ 测试未通过，请检查上述错误")
}
```

### 注意事项

- ⚠️ **状态依赖**: 回放前确保环境状态符合序列录制时的状态（如页面路径、数据等）
- ⚠️ **时序问题**: 回放不会等待原录制的时间间隔，会连续执行
- ⚠️ **动态数据**: 如果序列包含动态数据（如时间戳、随机ID），回放可能失败
- 💡 **continueOnError**: 设为 `true` 时会执行完所有动作，适合测试覆盖率检查
- 💡 **错误定位**: `results` 数组与原 `actions` 数组一一对应，便于定位问题
- 💡 **性能**: 回放速度通常比原录制更快（无人工等待时间）

### 相关工具

- [`record_start`](#record_start) - 录制新序列
- [`record_get`](#record_get) - 查看序列内容

---

## 完整示例：录制与回放流程

```javascript
// 完整的录制回放示例
async function recordAndReplayDemo() {
  try {
    // 1. 开始录制
    const recordSession = await record_start({
      name: "商品搜索测试",
      description: "测试搜索功能并查看搜索结果"
    })
    console.log(`✅ 录制已开始: ${recordSession.sequenceId}`)

    // 2. 执行自动化操作（这些会被自动记录）
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/search/search"
    })

    await element_input({
      selector: "#search-input",
      value: "手机"
    })

    await element_tap({
      selector: ".search-btn"
    })

    await page_waitFor({
      selector: ".product-list",
      timeout: 5000
    })

    // 3. 停止录制
    const stopResult = await record_stop()
    console.log(`✅ 录制已停止: ${stopResult.actionCount} 个动作`)

    const sequenceId = stopResult.sequenceId

    // 4. 查看录制内容
    const { sequence } = await record_get({ sequenceId })
    console.log("\n录制的动作:")
    sequence.actions.forEach((action, i) => {
      console.log(`  ${i + 1}. ${action.toolName}`)
    })

    // 5. 回放序列
    console.log("\n开始回放...")
    const replayResult = await record_replay({
      sequenceId,
      continueOnError: true
    })

    // 6. 显示回放结果
    if (replayResult.success) {
      console.log("✅ 回放成功！")
    } else {
      console.log(`⚠️ 回放完成: ${replayResult.successCount}/${replayResult.totalActions} 成功`)
    }

    // 7. 列出所有序列
    const { sequences } = await record_list()
    console.log(`\n当前共有 ${sequences.length} 个序列:`)
    sequences.forEach(seq => {
      console.log(`  - ${seq.name} (${seq.actionCount} 动作)`)
    })

  } catch (error) {
    console.error("❌ 操作失败:", error.message)
  }
}

recordAndReplayDemo()
```

---

## 高级用例

### 用例 1: 自动化回归测试套件

```javascript
// 定义测试套件
const testSuites = [
  { id: "seq_login", name: "登录测试" },
  { id: "seq_search", name: "搜索测试" },
  { id: "seq_cart", name: "购物车测试" }
]

// 批量执行测试
async function runTestSuite() {
  const results = []

  for (const suite of testSuites) {
    console.log(`\n运行测试: ${suite.name}`)

    const result = await record_replay({
      sequenceId: suite.id,
      continueOnError: true
    })

    results.push({
      name: suite.name,
      passed: result.success,
      successRate: (result.successCount / result.totalActions) * 100
    })
  }

  // 生成测试报告
  console.log("\n=== 测试报告 ===")
  results.forEach(r => {
    const status = r.passed ? "✅" : "❌"
    console.log(`${status} ${r.name}: ${r.successRate.toFixed(2)}% 通过`)
  })

  const overallPass = results.every(r => r.passed)
  console.log(`\n总体结果: ${overallPass ? "✅ 通过" : "❌ 失败"}`)
}
```

### 用例 2: 序列对比分析

```javascript
// 对比两次执行结果
async function compareExecutions(sequenceId) {
  // 第一次执行
  const run1 = await record_replay({
    sequenceId,
    continueOnError: true
  })

  // 等待一段时间
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 第二次执行
  const run2 = await record_replay({
    sequenceId,
    continueOnError: true
  })

  // 对比结果
  console.log("执行对比:")
  console.log(`Run 1: ${run1.successCount}/${run1.totalActions} 成功`)
  console.log(`Run 2: ${run2.successCount}/${run2.totalActions} 成功`)

  // 找出结果不一致的动作
  const differences = []
  run1.results.forEach((r1, index) => {
    const r2 = run2.results[index]
    if (r1.success !== r2.success) {
      differences.push({
        index,
        toolName: r1.toolName,
        run1: r1.success,
        run2: r2.success
      })
    }
  })

  if (differences.length > 0) {
    console.log("\n不稳定的动作:")
    differences.forEach(d => {
      console.log(`  ${d.index + 1}. ${d.toolName}`)
    })
  }
}
```

### 用例 3: 序列管理与清理

```javascript
// 序列管理工具
async function manageSequences() {
  const { sequences } = await record_list()

  // 按创建时间排序
  sequences.sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  // 显示统计信息
  const totalActions = sequences.reduce((sum, seq) => sum + seq.actionCount, 0)
  console.log(`总序列数: ${sequences.length}`)
  console.log(`总动作数: ${totalActions}`)
  console.log(`平均动作数: ${(totalActions / sequences.length).toFixed(2)}`)

  // 清理超过30天的序列
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  let deletedCount = 0

  for (const seq of sequences) {
    if (new Date(seq.createdAt).getTime() < thirtyDaysAgo) {
      await record_delete({ sequenceId: seq.id })
      console.log(`已删除旧序列: ${seq.name}`)
      deletedCount++
    }
  }

  console.log(`\n清理完成: 删除了 ${deletedCount} 个序列`)
}
```

---

## 序列文件格式

录制的序列保存为 JSON 文件，格式如下：

```json
{
  "id": "seq_1738425600000_abc123",
  "name": "用户登录流程",
  "description": "测试用户登录并跳转到个人中心",
  "createdAt": "2025-02-01T10:00:00.000Z",
  "actions": [
    {
      "timestamp": "2025-02-01T10:00:01.234Z",
      "toolName": "miniprogram_navigate",
      "args": {
        "method": "navigateTo",
        "url": "/pages/login/login"
      },
      "duration": 150,
      "success": true
    },
    {
      "timestamp": "2025-02-01T10:00:02.456Z",
      "toolName": "element_input",
      "args": {
        "selector": "#username",
        "value": "testuser"
      },
      "duration": 80,
      "success": true
    },
    {
      "timestamp": "2025-02-01T10:00:03.789Z",
      "toolName": "element_tap",
      "args": {
        "selector": ".login-btn"
      },
      "duration": 120,
      "success": false,
      "error": "Element not found: .login-btn"
    }
  ]
}
```

### 字段说明

- **id**: 序列唯一标识符（格式: `seq_{timestamp}_{random}`）
- **name**: 序列名称
- **description**: 序列描述（可选）
- **createdAt**: 创建时间（ISO 8601 格式）
- **actions**: 动作数组
  - **timestamp**: 动作执行时间
  - **toolName**: 工具名称
  - **args**: 工具参数（原始参数对象）
  - **duration**: 执行耗时（毫秒，可选）
  - **success**: 执行结果（true/false）
  - **error**: 错误消息（仅失败时有）

---

## 故障排除

### 问题 1: 录制未记录动作

**症状**: `stop` 时显示 0 个动作

**解决方案**:
1. 确认录制已成功启动（`start` 返回 success: true）
2. 检查执行的工具是否在录制工具包装器中
3. 确认没有在录制期间调用 `stop({ save: false })`

### 问题 2: 回放失败率高

**症状**: 回放时大量动作失败

**解决方案**:
1. 检查环境状态是否与录制时一致（页面路径、数据等）
2. 确认动态数据（如 refId）是否已失效
3. 使用 `page_query` 重新获取元素引用，而非直接使用录制的 refId
4. 考虑录制时使用 selector 而非 refId

### 问题 3: 序列文件损坏

**症状**: `get` 或 `replay` 时报 JSON 解析错误

**解决方案**:
1. 检查序列文件是否完整（手动打开查看）
2. 确认录制时 `stop` 正常完成
3. 删除损坏的序列文件并重新录制

### 问题 4: 回放速度过快

**症状**: 回放时动作执行过快导致失败

**解决方案**:
1. 在关键步骤添加 `page_waitFor` 等待元素加载
2. 使用 `miniprogram_wait` 添加延迟
3. 录制时确保每步操作都有适当的等待

---

## 技术细节

### 录制机制

- **拦截层**: 通过工具包装器拦截所有工具调用
- **自动记录**: 录制期间自动调用 `recordAction()` 记录每个动作
- **元数据**: 记录时间戳、参数、结果、耗时等完整信息

### 存储位置

- **目录**: `.mcp-artifacts/{sessionId}/sequences/`
- **文件名**: `{sequenceId}.json`
- **权限**: 自动创建目录（recursive: true）

### 回放策略

- **顺序执行**: 严格按录制顺序执行
- **参数重用**: 使用录制时的原始参数
- **错误处理**: 支持遇错停止或继续执行
- **结果收集**: 记录每个动作的执行结果

### 性能考虑

- **文件I/O**: 序列保存和读取涉及磁盘操作
- **内存占用**: 大型序列会占用更多内存
- **回放速度**: 通常比原录制更快（无人工等待）

---

## 最佳实践

### 1. 命名规范

```javascript
// ✅ 推荐：清晰描述测试场景
await record_start({
  name: "用户登录-成功路径",
  description: "使用正确的用户名密码登录并验证跳转"
})

// ❌ 避免：模糊的名称
await record_start({
  name: "test1"
})
```

### 2. 录制粒度

```javascript
// ✅ 推荐：单一功能点
await record_start({ name: "商品搜索" })
// 只录制搜索相关操作
await record_stop()

await record_start({ name: "商品详情" })
// 只录制详情页操作
await record_stop()

// ❌ 避免：混合多个无关功能
await record_start({ name: "整个流程" })
// 搜索、详情、购物车、结算...
await record_stop()
```

### 3. 使用 selector 而非 refId

```javascript
// ✅ 推荐：使用 selector（回放更稳定）
await element_tap({ selector: ".login-btn" })

// ⚠️ 注意：refId 在回放时可能失效
await element_tap({ refId: "elem_123" })
```

### 4. 添加等待步骤

```javascript
// ✅ 推荐：录制时包含等待
await element_tap({ selector: ".submit-btn" })
await page_waitFor({ selector: ".success-message", timeout: 5000 })

// ❌ 避免：无等待（回放可能失败）
await element_tap({ selector: ".submit-btn" })
await element_tap({ selector: ".next-btn" }) // 可能执行过快
```

### 5. 定期清理

```javascript
// 定期清理旧序列（避免占用过多空间）
async function cleanup() {
  const { sequences } = await record_list()
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  for (const seq of sequences) {
    if (new Date(seq.createdAt).getTime() < sevenDaysAgo) {
      await record_delete({ sequenceId: seq.id })
    }
  }
}
```

---

**相关文档**:
- [Automator API](./automator.md) - 启动和连接
- [Element API](./element.md) - 元素操作
- [测试指南](../testing-guide.md) - 测试最佳实践

**最后更新**: 2025-10-02
