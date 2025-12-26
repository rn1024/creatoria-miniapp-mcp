# 示例 05: 录制回放与回归测试

> 学习如何录制操作序列、回放测试、构建回归测试套件

## 难度

⭐⭐⭐ 综合

## 学习目标

- 使用 `record_start` 开始录制操作序列
- 使用 `record_stop` 停止并保存录制
- 使用 `record_list` 查看所有录制序列
- 使用 `record_get` 查看序列详情
- 使用 `record_replay` 回放测试序列
- 使用 `record_delete` 管理序列文件
- 实现回归测试自动化
- 处理回放错误和失败场景

## 前置条件

- 已安装微信开发者工具
- 已配置 MCP 客户端（Claude Desktop）
- 准备好测试用小程序项目，包含完整用户流程（如电商购物流程）

---

## 完整代码

```javascript
/**
 * 录制回放与回归测试示例
 * 演示如何录制操作序列、回放测试、构建测试套件
 */
async function recordReplayExample() {
  try {
    console.log("=== 录制回放与回归测试示例 ===\n")

    // ============================================================================
    // 步骤 1: 启动小程序
    // ============================================================================
    console.log("步骤 1: 启动小程序...")
    const launchResult = await miniprogram_launch({
      projectPath: process.env.PROJECT_PATH || "/path/to/your/miniprogram"
    })
    console.log("✅", launchResult.message)
    console.log(`   项目路径: ${launchResult.projectPath}\n`)

    await page_wait_for({ timeout: 2000 })

    // ============================================================================
    // 步骤 2: 开始录制 - 商品搜索购买流程
    // ============================================================================
    console.log("步骤 2: 开始录制商品搜索购买流程...")
    const recordStart = await record_start({
      name: "product-search-and-purchase",
      description: "完整的商品搜索、查看详情、加入购物车、结算流程"
    })
    console.log("✅", recordStart.message)
    console.log(`   序列 ID: ${recordStart.sequenceId}`)
    console.log("   🔴 录制中...\n`)

    // ============================================================================
    // 步骤 3: 执行完整购物流程（所有操作将被录制）
    // ============================================================================
    console.log("步骤 3: 执行商品购买流程...")

    // 3.1 导航到搜索页
    console.log("   3.1 导航到搜索页...")
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/search/search"
    })
    await page_wait_for({ timeout: 1000 })

    // 3.2 输入搜索关键词
    console.log("   3.2 输入搜索关键词 'iPhone 15 Pro'...")
    await element_tap({
      selector: "input.search-input"
    })
    await page_wait_for({ timeout: 500 })

    await element_input({
      selector: "input.search-input",
      value: "iPhone 15 Pro"
    })

    // 3.3 点击搜索按钮
    console.log("   3.3 点击搜索按钮...")
    await element_tap({
      selector: "button.search-btn"
    })
    await page_wait_for({ timeout: 2000 })

    // 3.4 等待搜索结果加载
    console.log("   3.4 等待搜索结果加载...")
    await page_wait_for({
      selector: ".product-list .product-item",
      timeout: 5000
    })

    // 3.5 点击第一个商品
    console.log("   3.5 点击第一个商品...")
    await element_tap({
      selector: ".product-list .product-item",
      index: 0
    })
    await page_wait_for({ timeout: 1500 })

    // 3.6 验证商品详情页
    console.log("   3.6 验证商品详情页...")
    await assert_element_exists({
      selector: ".product-detail",
      message: "商品详情页应该存在"
    })

    await assert_text_contains({
      selector: ".product-title",
      text: "iPhone 15 Pro",
      message: "商品标题应包含搜索关键词"
    })

    // 3.7 点击加入购物车
    console.log("   3.7 点击加入购物车...")
    await element_tap({
      selector: "button.add-to-cart"
    })
    await page_wait_for({ timeout: 1000 })

    // 3.8 验证加购成功提示
    console.log("   3.8 验证加购成功提示...")
    await assert_element_exists({
      selector: ".toast.success",
      timeout: 3000,
      message: "应显示加购成功提示"
    })

    // 3.9 导航到购物车
    console.log("   3.9 导航到购物车...")
    await miniprogram_navigate({
      method: "switchTab",
      url: "/pages/cart/cart"
    })
    await page_wait_for({ timeout: 1500 })

    // 3.10 验证购物车内容
    console.log("   3.10 验证购物车内容...")
    await assert_element_exists({
      selector: ".cart-item",
      message: "购物车应包含商品"
    })

    await assert_text_contains({
      selector: ".cart-item .product-name",
      text: "iPhone 15 Pro",
      message: "购物车商品名称正确"
    })

    // 3.11 点击结算按钮
    console.log("   3.11 点击结算按钮...")
    await element_tap({
      selector: "button.checkout-btn"
    })
    await page_wait_for({ timeout: 1500 })

    // 3.12 验证订单确认页
    console.log("   3.12 验证订单确认页...")
    await assert_element_exists({
      selector: ".order-confirm",
      message: "应进入订单确认页"
    })

    console.log("✅ 购物流程执行完成\n")

    // ============================================================================
    // 步骤 4: 停止录制并保存
    // ============================================================================
    console.log("步骤 4: 停止录制并保存...")
    const recordStop = await record_stop({
      save: true  // 保存序列到文件
    })
    console.log("✅", recordStop.message)
    console.log(`   序列 ID: ${recordStop.sequenceId}`)
    console.log(`   录制动作数: ${recordStop.actionCount}`)
    console.log(`   保存路径: ${recordStop.filePath}`)
    console.log("   ⏹️  录制已停止\n`)

    // ============================================================================
    // 步骤 5: 查看所有序列
    // ============================================================================
    console.log("步骤 5: 查看所有保存的序列...")
    const sequencesList = await record_list()
    console.log("✅", sequencesList.message)
    console.log("   已保存的序列:")
    sequencesList.sequences.forEach((seq, idx) => {
      console.log(`   ${idx + 1}. ${seq.name}`)
      console.log(`      ID: ${seq.id}`)
      console.log(`      描述: ${seq.description || '(无描述)'}`)
      console.log(`      创建时间: ${new Date(seq.createdAt).toLocaleString()}`)
      console.log(`      动作数量: ${seq.actionCount}`)
    })
    console.log("")

    // ============================================================================
    // 步骤 6: 获取序列详情
    // ============================================================================
    console.log("步骤 6: 获取序列详情...")
    const sequenceDetail = await record_get({
      sequenceId: recordStop.sequenceId
    })
    console.log("✅", sequenceDetail.message)
    console.log(`   序列名称: ${sequenceDetail.sequence.name}`)
    console.log(`   描述: ${sequenceDetail.sequence.description}`)
    console.log(`   动作列表 (前 5 个):`)

    sequenceDetail.sequence.actions.slice(0, 5).forEach((action, idx) => {
      console.log(`   ${idx + 1}. ${action.toolName}`)
      console.log(`      参数: ${JSON.stringify(action.args).substring(0, 80)}...`)
      console.log(`      状态: ${action.success ? '✅ 成功' : '❌ 失败'}`)
      if (action.duration) {
        console.log(`      耗时: ${action.duration}ms`)
      }
    })
    console.log(`   ... 共 ${sequenceDetail.sequence.actions.length} 个动作\n`)

    // ============================================================================
    // 步骤 7: 回放序列（严格模式 - 遇到错误即停止）
    // ============================================================================
    console.log("步骤 7: 回放序列（严格模式）...")
    console.log("   重新启动小程序以清空状态...\n")

    await miniprogram_navigate({
      method: "reLaunch",
      url: "/pages/index/index"
    })
    await page_wait_for({ timeout: 2000 })

    console.log("   开始回放...")
    try {
      const replayResult = await record_replay({
        sequenceId: recordStop.sequenceId,
        continueOnError: false  // 严格模式：遇到错误立即停止
      })

      console.log("✅", replayResult.message)
      console.log(`   总动作数: ${replayResult.totalActions}`)
      console.log(`   成功: ${replayResult.successCount}`)
      console.log(`   失败: ${replayResult.failureCount}`)
      console.log(`   通过率: ${((replayResult.successCount / replayResult.totalActions) * 100).toFixed(2)}%`)

      if (replayResult.failureCount > 0) {
        console.log("\n   失败的动作:")
        replayResult.results
          .filter(r => !r.success)
          .forEach((result, idx) => {
            console.log(`   ${idx + 1}. ${result.toolName}`)
            console.log(`      错误: ${result.error}`)
          })
      }
      console.log("")
    } catch (error) {
      console.error("❌ 回放失败:", error.message)
      console.log("   提示: 严格模式下，任何错误都会停止回放\n")
    }

    // ============================================================================
    // 步骤 8: 回放序列（容错模式 - 继续执行所有动作）
    // ============================================================================
    console.log("步骤 8: 回放序列（容错模式）...")
    console.log("   重新启动小程序...\n")

    await miniprogram_navigate({
      method: "reLaunch",
      url: "/pages/index/index"
    })
    await page_wait_for({ timeout: 2000 })

    console.log("   开始回放（容错模式）...")
    const replayResultTolerant = await record_replay({
      sequenceId: recordStop.sequenceId,
      continueOnError: true  // 容错模式：即使遇到错误也继续执行
    })

    console.log("✅", replayResultTolerant.message)
    console.log(`   总动作数: ${replayResultTolerant.totalActions}`)
    console.log(`   成功: ${replayResultTolerant.successCount}`)
    console.log(`   失败: ${replayResultTolerant.failureCount}`)
    console.log(`   通过率: ${((replayResultTolerant.successCount / replayResultTolerant.totalActions) * 100).toFixed(2)}%`)

    if (replayResultTolerant.failureCount > 0) {
      console.log("\n   失败的动作:")
      replayResultTolerant.results
        .filter(r => !r.success)
        .forEach((result, idx) => {
          console.log(`   ${idx + 1}. ${result.toolName}`)
          console.log(`      错误: ${result.error}`)
        })
    }
    console.log("")

    // ============================================================================
    // 步骤 9: 回归测试套件 - 运行多个序列
    // ============================================================================
    console.log("步骤 9: 执行回归测试套件...")
    console.log("   模拟多个测试场景...\n")

    // 9.1 录制登录流程
    console.log("   9.1 录制登录流程...")
    await miniprogram_navigate({
      method: "reLaunch",
      url: "/pages/index/index"
    })
    await page_wait_for({ timeout: 1000 })

    await record_start({
      name: "user-login",
      description: "用户登录流程"
    })

    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/login/login"
    })
    await page_wait_for({ timeout: 1000 })

    await element_input({
      selector: "input.username",
      value: "testuser@example.com"
    })

    await element_input({
      selector: "input.password",
      value: "test123456"
    })

    await element_tap({
      selector: "button.login-btn"
    })
    await page_wait_for({ timeout: 2000 })

    const loginRecording = await record_stop({ save: true })
    console.log(`   ✅ 登录流程已录制 (${loginRecording.actionCount} 个动作)\n`)

    // 9.2 录制商品收藏流程
    console.log("   9.2 录制商品收藏流程...")
    await miniprogram_navigate({
      method: "reLaunch",
      url: "/pages/index/index"
    })
    await page_wait_for({ timeout: 1000 })

    await record_start({
      name: "product-favorite",
      description: "商品收藏流程"
    })

    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/detail/detail?id=12345"
    })
    await page_wait_for({ timeout: 1500 })

    await element_tap({
      selector: "button.favorite-btn"
    })
    await page_wait_for({ timeout: 1000 })

    await assert_element_exists({
      selector: ".favorite-btn.active",
      message: "收藏按钮应处于激活状态"
    })

    const favoriteRecording = await record_stop({ save: true })
    console.log(`   ✅ 收藏流程已录制 (${favoriteRecording.actionCount} 个动作)\n`)

    // 9.3 运行完整回归测试套件
    console.log("   9.3 运行完整回归测试套件...\n")

    const testSuiteResults = []
    const allSequences = await record_list()

    for (const seq of allSequences.sequences) {
      console.log(`   测试: ${seq.name}`)
      console.log(`   描述: ${seq.description}`)

      // 重置应用状态
      await miniprogram_navigate({
        method: "reLaunch",
        url: "/pages/index/index"
      })
      await page_wait_for({ timeout: 1500 })

      try {
        const result = await record_replay({
          sequenceId: seq.id,
          continueOnError: true
        })

        const passed = result.failureCount === 0
        testSuiteResults.push({
          name: seq.name,
          passed,
          successCount: result.successCount,
          failureCount: result.failureCount,
          totalActions: result.totalActions,
        })

        console.log(`   ${passed ? '✅ 通过' : '❌ 失败'} - ${result.successCount}/${result.totalActions} 动作成功`)
      } catch (error) {
        testSuiteResults.push({
          name: seq.name,
          passed: false,
          error: error.message,
        })
        console.log(`   ❌ 失败 - ${error.message}`)
      }
      console.log("")
    }

    // 9.4 生成测试报告
    console.log("   9.4 测试报告:")
    console.log("   " + "=".repeat(60))

    const totalTests = testSuiteResults.length
    const passedTests = testSuiteResults.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    const passRate = ((passedTests / totalTests) * 100).toFixed(2)

    console.log(`   总测试数: ${totalTests}`)
    console.log(`   通过: ${passedTests}`)
    console.log(`   失败: ${failedTests}`)
    console.log(`   通过率: ${passRate}%`)
    console.log("   " + "=".repeat(60))

    testSuiteResults.forEach((result, idx) => {
      console.log(`   ${idx + 1}. ${result.name}: ${result.passed ? '✅ PASS' : '❌ FAIL'}`)
      if (result.totalActions) {
        console.log(`      动作成功率: ${result.successCount}/${result.totalActions}`)
      }
      if (result.error) {
        console.log(`      错误: ${result.error}`)
      }
    })
    console.log("")

    // ============================================================================
    // 步骤 10: 清理旧序列
    // ============================================================================
    console.log("步骤 10: 清理旧序列...")
    console.log(`   保留最近的 3 个序列，删除其他...\n`)

    const allSeq = await record_list()
    const sortedSeq = allSeq.sequences
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const toDelete = sortedSeq.slice(3)  // 删除除最近 3 个之外的序列

    for (const seq of toDelete) {
      try {
        await record_delete({
          sequenceId: seq.id
        })
        console.log(`   ✅ 已删除: ${seq.name} (${seq.id})`)
      } catch (error) {
        console.log(`   ❌ 删除失败: ${seq.name} - ${error.message}`)
      }
    }

    if (toDelete.length === 0) {
      console.log("   无需删除序列")
    }
    console.log("")

    // ============================================================================
    // 测试总结
    // ============================================================================
    console.log("=== 录制回放测试完成 ===\n")
    console.log("📊 功能总结:")
    console.log("   ✅ 录制了完整的购物流程")
    console.log("   ✅ 保存序列到文件系统")
    console.log("   ✅ 成功回放序列（严格模式 & 容错模式）")
    console.log("   ✅ 构建并运行回归测试套件")
    console.log("   ✅ 生成测试报告")
    console.log("   ✅ 清理旧序列文件")
    console.log("")
    console.log("🎯 测试场景:")
    console.log("   1. 商品搜索购买流程")
    console.log("   2. 用户登录流程")
    console.log("   3. 商品收藏流程")
    console.log("")
    console.log(`📈 回归测试通过率: ${passRate}%`)
    console.log("")

  } catch (error) {
    console.error("\n❌ 测试失败:", error.message)

    // 错误时停止录制（如果正在录制）
    try {
      await record_stop({ save: false })
      console.log("   录制已停止（未保存）")
    } catch (stopError) {
      // 忽略停止录制时的错误
    }

    // 错误截图
    try {
      await miniprogram_screenshot({
        filename: "error-record-replay.png"
      })
      console.log("📸 错误截图已保存: error-record-replay.png")
    } catch (screenshotError) {
      console.error("截图失败:", screenshotError.message)
    }

    throw error

  } finally {
    // ============================================================================
    // 清理资源
    // ============================================================================
    console.log("清理资源...")
    try {
      await miniprogram_close()
      console.log("✅ 资源已清理，微信开发者工具已关闭\n")
    } catch (closeError) {
      console.error("关闭失败:", closeError.message)
    }
  }
}

// 运行示例
recordReplayExample()
```

---

## 分步讲解

### 步骤 1: 启动小程序

```javascript
const launchResult = await miniprogram_launch({
  projectPath: process.env.PROJECT_PATH || "/path/to/your/miniprogram"
})
```

**说明**:
- 使用 `miniprogram_launch` 启动微信开发者工具
- 为录制回放测试准备环境

---

### 步骤 2: 开始录制

```javascript
const recordStart = await record_start({
  name: "product-search-and-purchase",
  description: "完整的商品搜索、查看详情、加入购物车、结算流程"
})
```

**说明**:
- `record_start` 开始录制操作序列
- `name`: 序列名称（必填，建议使用 kebab-case 命名）
- `description`: 序列描述（可选，便于理解测试目的）
- 返回唯一的 `sequenceId` 用于后续操作

**命名规范建议**:
- 使用描述性名称：`user-login`, `product-search`, `checkout-flow`
- 避免使用时间戳：使用描述性名称而非 `test-2024-01-01`
- 包含测试场景：`happy-path-checkout`, `error-invalid-coupon`

**录制内容**:
- 所有 MCP 工具调用（导航、元素操作、断言等）
- 工具参数
- 执行结果（成功/失败）
- 执行时长
- 错误信息（如果有）

**录制状态**:
- 录制期间，Session 的 `recording.isRecording` 为 `true`
- 所有工具调用会自动记录到 `recording.currentSequence.actions`

---

### 步骤 3: 执行测试流程

```javascript
// 所有这些操作都会被自动录制
await miniprogram_navigate({
  method: "navigateTo",
  url: "/pages/search/search"
})

await element_input({
  selector: "input.search-input",
  value: "iPhone 15 Pro"
})

await element_tap({
  selector: "button.search-btn"
})
```

**说明**:
- 录制开始后，所有工具调用自动记录
- 无需额外代码，只需正常执行测试操作
- 建议录制有意义的完整流程，而非碎片化操作

**最佳实践**:
- **录制完整流程**: 从用户入口到业务闭环（如：首页 → 搜索 → 详情 → 加购 → 结算）
- **包含验证点**: 录制中包含 `assert_*` 断言，回放时自动验证
- **添加等待**: 使用 `page_wait_for` 确保页面/元素加载完成
- **状态独立**: 确保测试流程不依赖外部状态（如已登录用户、特定数据）

---

### 步骤 4: 停止录制

```javascript
const recordStop = await record_stop({
  save: true  // 保存序列到文件
})
```

**说明**:
- `record_stop` 停止录制并可选保存序列
- `save: true`: 保存到文件系统（默认值）
- `save: false`: 仅停止录制，不保存（用于丢弃录制）

**返回值**:
- `sequenceId`: 序列唯一标识
- `actionCount`: 录制的动作数量
- `filePath`: 序列文件保存路径

**序列文件格式** (JSON):
```json
{
  "id": "seq_1704124800000_abc123",
  "name": "product-search-and-purchase",
  "description": "完整的商品搜索、查看详情、加入购物车、结算流程",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "actions": [
    {
      "timestamp": "2024-01-01T12:00:01.000Z",
      "toolName": "miniprogram_navigate",
      "args": {
        "method": "navigateTo",
        "url": "/pages/search/search"
      },
      "duration": 850,
      "success": true
    },
    {
      "timestamp": "2024-01-01T12:00:02.500Z",
      "toolName": "element_input",
      "args": {
        "selector": "input.search-input",
        "value": "iPhone 15 Pro"
      },
      "duration": 120,
      "success": true
    }
    // ... 更多动作
  ]
}
```

**存储位置**:
- 默认目录: `{outputDir}/sequences/`
- 文件名: `{sequenceId}.json`
- 示例: `output/sequences/seq_1704124800000_abc123.json`

---

### 步骤 5: 查看所有序列

```javascript
const sequencesList = await record_list()
console.log("已保存的序列:")
sequencesList.sequences.forEach((seq) => {
  console.log(`  ${seq.name} (${seq.actionCount} 个动作)`)
})
```

**说明**:
- `record_list` 返回所有保存的序列
- 每个序列包含元数据：名称、描述、创建时间、动作数量

**返回值**:
```javascript
{
  success: true,
  message: "Found 3 sequences",
  sequences: [
    {
      id: "seq_1704124800000_abc123",
      name: "product-search-and-purchase",
      description: "商品搜索购买流程",
      createdAt: "2024-01-01T12:00:00.000Z",
      actionCount: 24
    },
    // ...
  ]
}
```

**使用场景**:
- 查看可用的测试序列
- 选择要回放的序列
- 构建测试套件清单

---

### 步骤 6: 获取序列详情

```javascript
const sequenceDetail = await record_get({
  sequenceId: "seq_1704124800000_abc123"
})

console.log("动作列表:")
sequenceDetail.sequence.actions.forEach((action, idx) => {
  console.log(`${idx + 1}. ${action.toolName} - ${action.success ? '成功' : '失败'}`)
})
```

**说明**:
- `record_get` 获取完整的序列信息（包括所有动作详情）
- 用于审查录制内容、调试回放问题

**返回值**:
- 完整的 `ActionSequence` 对象
- 包含所有 `RecordedAction` 详情

**使用场景**:
- 审查录制的动作是否符合预期
- 分析回放失败的原因
- 生成详细的测试报告

---

### 步骤 7: 回放序列（严格模式）

```javascript
const replayResult = await record_replay({
  sequenceId: "seq_1704124800000_abc123",
  continueOnError: false  // 遇到错误立即停止
})
```

**说明**:
- `record_replay` 回放录制的操作序列
- `continueOnError: false`: 严格模式，任何错误都停止回放
- 回放时会依次执行序列中的所有动作

**返回值**:
```javascript
{
  success: true,  // 所有动作都成功时为 true
  message: "Replay completed: 24 success, 0 failures",
  totalActions: 24,
  successCount: 24,
  failureCount: 0,
  results: [
    {
      toolName: "miniprogram_navigate",
      success: true
    },
    // ...
  ]
}
```

**严格模式特点**:
- 任何动作失败，立即抛出异常
- 适用于冒烟测试、关键路径测试
- 快速发现阻塞性问题

**注意事项**:
- 回放前建议重置应用状态（使用 `reLaunch`）
- RefId 可能失效（页面刷新后），建议使用 `selector` 而非缓存的 `refId`
- 时间敏感的操作（如验证码）可能导致回放失败

---

### 步骤 8: 回放序列（容错模式）

```javascript
const replayResult = await record_replay({
  sequenceId: "seq_1704124800000_abc123",
  continueOnError: true  // 遇到错误继续执行
})
```

**说明**:
- `continueOnError: true`: 容错模式，即使遇到错误也继续执行
- 适用于回归测试、功能覆盖测试

**容错模式特点**:
- 所有动作都会执行，不会中断
- 记录每个动作的成功/失败状态
- 最终返回完整的执行报告

**使用场景**:
- 回归测试：查看哪些功能受影响
- 批量测试：一次运行多个测试点
- 问题诊断：收集所有失败点

**分析失败结果**:
```javascript
if (replayResult.failureCount > 0) {
  console.log("失败的动作:")
  replayResult.results
    .filter(r => !r.success)
    .forEach((result) => {
      console.log(`${result.toolName}: ${result.error}`)
    })
}
```

---

### 步骤 9: 回归测试套件

```javascript
// 运行多个测试序列
const testSuiteResults = []
const allSequences = await record_list()

for (const seq of allSequences.sequences) {
  // 重置应用状态
  await miniprogram_navigate({
    method: "reLaunch",
    url: "/pages/index/index"
  })

  // 回放测试
  const result = await record_replay({
    sequenceId: seq.id,
    continueOnError: true
  })

  testSuiteResults.push({
    name: seq.name,
    passed: result.failureCount === 0,
    successCount: result.successCount,
    totalActions: result.totalActions,
  })
}

// 生成测试报告
const passRate = (passedTests / totalTests) * 100
console.log(`通过率: ${passRate.toFixed(2)}%`)
```

**说明**:
- 批量回放多个测试序列
- 每个测试前重置应用状态
- 收集所有测试结果并生成报告

**测试套件最佳实践**:
- **独立性**: 每个测试序列应独立，不依赖其他测试
- **幂等性**: 测试可以重复执行，结果一致
- **状态重置**: 每个测试前使用 `reLaunch` 清空状态
- **超时控制**: 设置合理的 `timeout` 避免测试卡住

**CI/CD 集成**:
```bash
# 在 CI/CD 中运行回归测试
export PROJECT_PATH=/path/to/miniprogram
export OUTPUT_DIR=/tmp/mcp-output

node run-regression-tests.js

# 检查退出码
if [ $? -ne 0 ]; then
  echo "回归测试失败"
  exit 1
fi
```

---

### 步骤 10: 清理旧序列

```javascript
await record_delete({
  sequenceId: "seq_1704124800000_abc123"
})
```

**说明**:
- `record_delete` 删除指定序列文件
- 用于清理过期、无效的测试序列

**清理策略**:
```javascript
// 保留最近 N 个序列
const allSeq = await record_list()
const sortedSeq = allSeq.sequences
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

const toDelete = sortedSeq.slice(3)  // 保留最近 3 个

for (const seq of toDelete) {
  await record_delete({ sequenceId: seq.id })
}
```

**使用场景**:
- 定期清理旧测试序列
- 删除失效的测试
- 磁盘空间管理

---

## 预期输出

```
=== 录制回放与回归测试示例 ===

步骤 1: 启动小程序...
✅ Successfully launched mini program
   项目路径: /Users/username/my-miniprogram

步骤 2: 开始录制商品搜索购买流程...
✅ Recording started: product-search-and-purchase
   序列 ID: seq_1704124800000_abc123
   🔴 录制中...

步骤 3: 执行商品购买流程...
   3.1 导航到搜索页...
   3.2 输入搜索关键词 'iPhone 15 Pro'...
   3.3 点击搜索按钮...
   3.4 等待搜索结果加载...
   3.5 点击第一个商品...
   3.6 验证商品详情页...
   3.7 点击加入购物车...
   3.8 验证加购成功提示...
   3.9 导航到购物车...
   3.10 验证购物车内容...
   3.11 点击结算按钮...
   3.12 验证订单确认页...
✅ 购物流程执行完成

步骤 4: 停止录制并保存...
✅ Recording stopped: product-search-and-purchase (24 actions)
   序列 ID: seq_1704124800000_abc123
   录制动作数: 24
   保存路径: /path/to/output/sequences/seq_1704124800000_abc123.json
   ⏹️  录制已停止

步骤 5: 查看所有保存的序列...
✅ Found 3 sequences
   已保存的序列:
   1. product-search-and-purchase
      ID: seq_1704124800000_abc123
      描述: 完整的商品搜索、查看详情、加入购物车、结算流程
      创建时间: 2024-01-01 12:00:00
      动作数量: 24
   2. user-login
      ID: seq_1704124700000_def456
      描述: 用户登录流程
      创建时间: 2024-01-01 11:58:20
      动作数量: 8
   3. product-favorite
      ID: seq_1704124600000_ghi789
      描述: 商品收藏流程
      创建时间: 2024-01-01 11:56:40
      动作数量: 6

步骤 6: 获取序列详情...
✅ Sequence retrieved: product-search-and-purchase
   序列名称: product-search-and-purchase
   描述: 完整的商品搜索、查看详情、加入购物车、结算流程
   动作列表 (前 5 个):
   1. miniprogram_navigate
      参数: {"method":"navigateTo","url":"/pages/search/search"}...
      状态: ✅ 成功
      耗时: 850ms
   2. element_tap
      参数: {"selector":"input.search-input"}...
      状态: ✅ 成功
      耗时: 120ms
   3. element_input
      参数: {"selector":"input.search-input","value":"iPhone 15 Pro"}...
      状态: ✅ 成功
      耗时: 95ms
   4. element_tap
      参数: {"selector":"button.search-btn"}...
      状态: ✅ 成功
      耗时: 180ms
   5. page_wait_for
      参数: {"selector":".product-list .product-item","timeout":5000}...
      状态: ✅ 成功
      耗时: 1240ms
   ... 共 24 个动作

步骤 7: 回放序列（严格模式）...
   重新启动小程序以清空状态...

   开始回放...
✅ Replay completed: 24 success, 0 failures
   总动作数: 24
   成功: 24
   失败: 0
   通过率: 100.00%

步骤 8: 回放序列（容错模式）...
   重新启动小程序...

   开始回放（容错模式）...
✅ Replay completed: 24 success, 0 failures
   总动作数: 24
   成功: 24
   失败: 0
   通过率: 100.00%

步骤 9: 执行回归测试套件...
   模拟多个测试场景...

   9.1 录制登录流程...
   ✅ 登录流程已录制 (8 个动作)

   9.2 录制商品收藏流程...
   ✅ 收藏流程已录制 (6 个动作)

   9.3 运行完整回归测试套件...

   测试: product-search-and-purchase
   描述: 完整的商品搜索、查看详情、加入购物车、结算流程
   ✅ 通过 - 24/24 动作成功

   测试: user-login
   描述: 用户登录流程
   ✅ 通过 - 8/8 动作成功

   测试: product-favorite
   描述: 商品收藏流程
   ✅ 通过 - 6/6 动作成功

   9.4 测试报告:
   ============================================================
   总测试数: 3
   通过: 3
   失败: 0
   通过率: 100.00%
   ============================================================
   1. product-search-and-purchase: ✅ PASS
      动作成功率: 24/24
   2. user-login: ✅ PASS
      动作成功率: 8/8
   3. product-favorite: ✅ PASS
      动作成功率: 6/6

步骤 10: 清理旧序列...
   保留最近的 3 个序列，删除其他...

   无需删除序列

=== 录制回放测试完成 ===

📊 功能总结:
   ✅ 录制了完整的购物流程
   ✅ 保存序列到文件系统
   ✅ 成功回放序列（严格模式 & 容错模式）
   ✅ 构建并运行回归测试套件
   ✅ 生成测试报告
   ✅ 清理旧序列文件

🎯 测试场景:
   1. 商品搜索购买流程
   2. 用户登录流程
   3. 商品收藏流程

📈 回归测试通过率: 100.00%

清理资源...
✅ 资源已清理，微信开发者工具已关闭
```

---

## 常见问题

### 问题 1: 录制包含 0 个动作

**错误**: `Recording stopped: test (0 actions)`

**原因**:
- 调用 `record_stop` 时没有执行任何操作
- 录制状态被意外重置

**解决方案**:
```javascript
// ✅ 确保在 start 和 stop 之间执行操作
await record_start({ name: "test" })

// 执行操作
await miniprogram_navigate({ method: "navigateTo", url: "/pages/test/test" })
await element_tap({ selector: "button.test-btn" })

// 停止录制
await record_stop({ save: true })
```

---

### 问题 2: 回放失败 - RefId 失效

**错误**: `Element not found: refId xyz123 is invalid`

**原因**:
- RefId 是临时句柄，页面刷新后失效
- 录制时使用了 `save: true` 缓存 RefId

**解决方案**:
```javascript
// ❌ 错误：使用 RefId（不适合录制回放）
await element_tap({
  refId: "xyz123",  // 回放时会失效
  save: true
})

// ✅ 正确：使用 selector（适合录制回放）
await element_tap({
  selector: "button.submit-btn"  // 回放时重新查询
})
```

---

### 问题 3: 回放速度过快导致失败

**错误**: `Element not ready: .loading-indicator still visible`

**原因**:
- 回放时没有等待异步操作完成
- 网络请求、动画、数据加载需要时间

**解决方案**:
```javascript
// ✅ 添加等待确保元素就绪
await element_tap({ selector: "button.search-btn" })

// 等待加载完成
await page_wait_for({
  selector: ".search-results",
  timeout: 5000
})

// 或等待加载指示器消失
await page_wait_for({
  selector: ".loading-indicator",
  hidden: true,
  timeout: 3000
})
```

---

### 问题 4: 状态依赖导致回放失败

**错误**: `Login required to access this page`

**原因**:
- 录制时处于登录状态，回放时未登录
- 测试依赖外部状态（如用户数据、购物车）

**解决方案**:
```javascript
// ✅ 录制完整流程（包括登录）
await record_start({ name: "complete-checkout" })

// 1. 登录
await miniprogram_navigate({ method: "navigateTo", url: "/pages/login/login" })
await element_input({ selector: "input.username", value: "test@example.com" })
await element_input({ selector: "input.password", value: "test123" })
await element_tap({ selector: "button.login-btn" })
await page_wait_for({ timeout: 2000 })

// 2. 执行业务流程
await miniprogram_navigate({ method: "navigateTo", url: "/pages/product/product" })
// ...

await record_stop({ save: true })
```

---

### 问题 5: 序列文件损坏

**错误**: `Failed to parse sequence file: Unexpected token`

**原因**:
- JSON 文件格式错误
- 文件被手动编辑或损坏

**解决方案**:
```bash
# 验证 JSON 格式
jq . output/sequences/seq_xxx.json

# 如果损坏，删除并重新录制
rm output/sequences/seq_xxx.json
```

---

## 录制回放最佳实践

### 1. 录制稳定的测试序列

**避免不稳定因素**:
- ❌ 硬编码时间相关数据（如今天的日期）
- ❌ 依赖外部服务（如支付接口）
- ❌ 使用随机数据（如随机用户名）
- ✅ 使用固定测试数据
- ✅ Mock 外部服务
- ✅ 包含充分的等待时间

### 2. 序列命名和组织

**命名规范**:
```javascript
// ✅ 好的命名
await record_start({
  name: "user-registration-happy-path",
  description: "用户注册成功流程（正常场景）"
})

await record_start({
  name: "checkout-invalid-coupon",
  description: "结算流程 - 无效优惠券错误场景"
})

// ❌ 不好的命名
await record_start({
  name: "test1",  // 不描述性
  description: ""
})
```

**目录组织** (手动整理):
```
output/sequences/
  ├── user-flows/
  │   ├── seq_xxx_user-login.json
  │   ├── seq_xxx_user-registration.json
  │   └── seq_xxx_user-logout.json
  ├── checkout/
  │   ├── seq_xxx_checkout-happy-path.json
  │   └── seq_xxx_checkout-invalid-coupon.json
  └── product/
      ├── seq_xxx_product-search.json
      └── seq_xxx_product-favorite.json
```

### 3. CI/CD 集成

**GitHub Actions 示例**:
```yaml
name: Regression Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨 2 点

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run regression tests
        run: node scripts/run-regression-tests.js
        env:
          PROJECT_PATH: ${{ secrets.PROJECT_PATH }}

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: output/test-report.html
```

**测试脚本** (`scripts/run-regression-tests.js`):
```javascript
// 注意：这是概念性示例，展示 MCP 工具的使用模式
// 实际使用时需要通过 MCP 客户端调用这些工具

async function runRegressionTests(mcpClient) {
  // 使用 MCP 工具启动小程序
  await mcpClient.callTool('miniprogram_launch', {
    projectPath: process.env.PROJECT_PATH
  })

  // 获取所有录制序列
  const { sequences } = await mcpClient.callTool('record_list_sequences')
  const results = []

  for (const seq of sequences) {
    // 回放每个序列
    const result = await mcpClient.callTool('record_replay_sequence', {
      sequenceId: seq.id,
      continueOnError: true
    })

    results.push({
      name: seq.name,
      passed: result.failureCount === 0,
      ...result
    })
  }

  // 关闭小程序
  await mcpClient.callTool('miniprogram_close')

  // 生成 HTML 报告
  generateReport(results)

  // 如果有失败，退出码为 1
  const hasFailed = results.some(r => !r.passed)
  process.exit(hasFailed ? 1 : 0)
}

runRegressionTests()
```

### 4. 测试数据管理

**使用测试 Fixtures**:
```javascript
// fixtures/test-users.json
{
  "validUser": {
    "username": "test@example.com",
    "password": "Test123456"
  },
  "adminUser": {
    "username": "admin@example.com",
    "password": "Admin123456"
  }
}

// 在录制中使用
import testUsers from './fixtures/test-users.json'

await record_start({ name: "user-login" })

await element_input({
  selector: "input.username",
  value: testUsers.validUser.username
})

await element_input({
  selector: "input.password",
  value: testUsers.validUser.password
})

await record_stop({ save: true })
```

---

## 下一步

- 查看 [API 文档 - Record](../docs/api/record.md) - 录制回放工具详细说明
- 学习 [示例 01: 基础页面导航](./01-basic-navigation.md) - 了解导航操作
- 学习 [示例 03: 断言测试](./03-assertion-testing.md) - 在录制中使用断言
- 查看 [CONTRIBUTING.md](../CONTRIBUTING.md) - CI/CD 集成指南

---

**相关文档**:
- [Record API](../docs/api/record.md)
- [Automator API](../docs/api/automator.md)
- [MiniProgram API](../docs/api/miniprogram.md)
- [Element API](../docs/api/element.md)
- [Assert API](../docs/api/assert.md)
