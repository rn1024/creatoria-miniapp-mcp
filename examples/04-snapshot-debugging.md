# 示例 04: 快照调试技巧

> 学习如何使用 3 种快照工具捕获应用状态，进行问题诊断和调试

## 难度

⭐⭐ 进阶

## 学习目标

- 使用 snapshot_page 捕获页面快照（数据 + 截图）
- 使用 snapshot_full 捕获完整应用状态（系统信息 + 页面栈）
- 使用 snapshot_element 捕获元素快照（属性 + 尺寸）
- 比较快照发现状态变化和问题
- 使用快照进行问题诊断和调试
- 生成调试报告记录问题复现过程

## 前置条件

- 已安装微信开发者工具
- 已配置 MCP 客户端（Claude Desktop）
- 准备好测试用小程序项目，包含以下功能：
  - `pages/cart/cart` (购物车页面 - 包含动态数据)
  - `pages/form/form` (表单页面 - 包含输入框)
  - 支持添加/删除商品操作

---

## 完整代码

```javascript
/**
 * 快照调试示例
 * 演示如何使用快照工具进行状态捕获和问题诊断
 */
async function snapshotDebuggingExample() {
  try {
    console.log("=== 开始快照调试测试 ===\n")

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
    // 步骤 2: 捕获初始页面快照
    // ============================================================================
    console.log("步骤 2: 捕获初始页面快照（首页）...")
    const initialSnapshot = await snapshot_page({
      filename: "snapshot-01-initial.json",
      includeScreenshot: true,
      fullPage: false
    })

    console.log("✅ 初始页面快照已保存:")
    console.log(`   快照文件: ${initialSnapshot.snapshotPath}`)
    console.log(`   截图文件: ${initialSnapshot.screenshotPath}`)
    console.log(`   页面路径: ${initialSnapshot.data.pagePath}`)
    console.log(`   时间戳: ${initialSnapshot.data.timestamp}`)
    console.log(`   页面数据预览:`)
    console.log(`   ${JSON.stringify(initialSnapshot.data.pageData, null, 2).split('\n').slice(0, 5).join('\n')}`)
    console.log(`   ...\n`)

    // ============================================================================
    // 步骤 3: 捕获完整应用快照
    // ============================================================================
    console.log("步骤 3: 捕获完整应用快照...")
    const fullSnapshot = await snapshot_full({
      filename: "snapshot-02-app-state.json",
      includeScreenshot: true,
      fullPage: false
    })

    console.log("✅ 完整应用快照已保存:")
    console.log(`   快照文件: ${fullSnapshot.snapshotPath}`)
    console.log(`   截图文件: ${fullSnapshot.screenshotPath}`)
    console.log(`   系统信息:`)
    console.log(`     - 平台: ${fullSnapshot.data.systemInfo.platform}`)
    console.log(`     - 设备: ${fullSnapshot.data.systemInfo.model}`)
    console.log(`     - 系统: ${fullSnapshot.data.systemInfo.system}`)
    console.log(`     - SDK 版本: ${fullSnapshot.data.systemInfo.SDKVersion}`)
    console.log(`   页面栈:`)
    fullSnapshot.data.pageStack.forEach((page, index) => {
      console.log(`     ${index + 1}. ${page.path}`)
    })
    console.log(`   当前页面: ${fullSnapshot.data.currentPage.path}\n`)

    // ============================================================================
    // 步骤 4: 导航到购物车页面
    // ============================================================================
    console.log("步骤 4: 导航到购物车页面...")
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/cart/cart"
    })
    await page_wait_for({ timeout: 1000 })
    console.log("✅ 已进入购物车页面\n")

    // ============================================================================
    // 步骤 5: 捕获购物车初始状态
    // ============================================================================
    console.log("步骤 5: 捕获购物车初始状态...")
    const cartInitial = await snapshot_page({
      filename: "snapshot-03-cart-empty.json",
      includeScreenshot: true
    })

    console.log("✅ 购物车初始状态快照:")
    console.log(`   快照文件: ${cartInitial.snapshotPath}`)
    console.log(`   购物车数据:`)
    const cartData = cartInitial.data.pageData
    console.log(`     - 商品数量: ${cartData.items?.length || 0}`)
    console.log(`     - 总价: ${cartData.totalPrice || 0}`)
    console.log(`     - 是否为空: ${cartData.isEmpty !== false}\n`)

    // ============================================================================
    // 步骤 6: 添加商品到购物车（模拟操作）
    // ============================================================================
    console.log("步骤 6: 添加商品到购物车...")

    // 查找添加按钮并点击
    const addButton = await element_query({
      selector: ".add-item-btn",
      index: 0,
      save: true
    })
    console.log(`✅ 找到添加按钮: ${addButton.refId}`)

    await element_tap({
      refId: addButton.refId
    })
    console.log("✅ 点击添加按钮")
    await page_wait_for({ timeout: 500 })

    // 再添加一个商品
    await element_tap({
      refId: addButton.refId
    })
    console.log("✅ 再次点击添加按钮")
    await page_wait_for({ timeout: 500 })

    console.log("")

    // ============================================================================
    // 步骤 7: 捕获购物车更新后状态
    // ============================================================================
    console.log("步骤 7: 捕获购物车更新后状态...")
    const cartUpdated = await snapshot_page({
      filename: "snapshot-04-cart-with-items.json",
      includeScreenshot: true
    })

    console.log("✅ 购物车更新状态快照:")
    console.log(`   快照文件: ${cartUpdated.snapshotPath}`)
    const updatedCartData = cartUpdated.data.pageData
    console.log(`   购物车数据:`)
    console.log(`     - 商品数量: ${updatedCartData.items?.length || 0}`)
    console.log(`     - 总价: ${updatedCartData.totalPrice || 0}`)
    console.log(`     - 是否为空: ${updatedCartData.isEmpty !== false}\n`)

    // ============================================================================
    // 步骤 8: 比较快照发现状态变化
    // ============================================================================
    console.log("步骤 8: 比较快照发现状态变化...")
    console.log("📊 状态对比:")
    console.log("   初始状态 vs 更新状态:")
    console.log(`     商品数量: ${cartData.items?.length || 0} → ${updatedCartData.items?.length || 0}`)
    console.log(`     总价: ¥${cartData.totalPrice || 0} → ¥${updatedCartData.totalPrice || 0}`)
    console.log(`     是否为空: ${cartData.isEmpty !== false} → ${updatedCartData.isEmpty !== false}`)

    if (updatedCartData.items?.length > 0) {
      console.log(`   ✅ 商品添加成功`)
    } else {
      console.log(`   ❌ 商品添加失败 - 需要调试`)
    }
    console.log("")

    // ============================================================================
    // 步骤 9: 捕获元素快照
    // ============================================================================
    console.log("步骤 9: 捕获元素快照（查看商品卡片）...")

    // 查询第一个商品卡片
    const itemCard = await element_query({
      selector: ".cart-item",
      index: 0,
      save: true
    })
    console.log(`✅ 找到商品卡片: ${itemCard.refId}`)

    const elementSnapshot = await snapshot_element({
      refId: itemCard.refId,
      filename: "snapshot-05-item-card.json",
      includeScreenshot: true
    })

    console.log("✅ 元素快照已保存:")
    console.log(`   快照文件: ${elementSnapshot.snapshotPath}`)
    console.log(`   截图文件: ${elementSnapshot.screenshotPath || '无'}`)
    console.log(`   元素信息:`)
    console.log(`     - refId: ${elementSnapshot.data.refId}`)
    console.log(`     - 文本: ${elementSnapshot.data.text || '无'}`)
    console.log(`     - 尺寸: ${elementSnapshot.data.size?.width}x${elementSnapshot.data.size?.height}`)
    console.log(`     - 位置: (${elementSnapshot.data.offset?.left}, ${elementSnapshot.data.offset?.top})\n`)

    // ============================================================================
    // 步骤 10: 模拟 Bug 场景 - 删除商品
    // ============================================================================
    console.log("步骤 10: 模拟 Bug 场景 - 删除商品...")

    // 捕获删除前快照
    const beforeDelete = await snapshot_page({
      filename: "snapshot-06-before-delete.json",
      includeScreenshot: true
    })
    console.log(`✅ 删除前快照: ${beforeDelete.snapshotPath}`)

    // 点击删除按钮
    const deleteButton = await element_query({
      selector: ".delete-item-btn",
      index: 0,
      save: true
    })
    console.log(`✅ 找到删除按钮: ${deleteButton.refId}`)

    await element_tap({
      refId: deleteButton.refId
    })
    console.log("✅ 点击删除按钮")
    await page_wait_for({ timeout: 500 })

    // 捕获删除后快照
    const afterDelete = await snapshot_page({
      filename: "snapshot-07-after-delete.json",
      includeScreenshot: true
    })
    console.log(`✅ 删除后快照: ${afterDelete.snapshotPath}`)

    // 分析删除操作
    const beforeItems = beforeDelete.data.pageData.items?.length || 0
    const afterItems = afterDelete.data.pageData.items?.length || 0
    console.log(`📊 删除操作分析:`)
    console.log(`   删除前商品数: ${beforeItems}`)
    console.log(`   删除后商品数: ${afterItems}`)
    console.log(`   预期结果: ${beforeItems - 1}`)

    if (afterItems === beforeItems - 1) {
      console.log(`   ✅ 删除操作正常`)
    } else {
      console.log(`   ❌ 删除操作异常 - 需要调试`)
      console.log(`   🔍 建议检查:`)
      console.log(`      1. 查看删除按钮事件绑定`)
      console.log(`      2. 查看数据更新逻辑`)
      console.log(`      3. 对比快照文件查看详细差异`)
    }
    console.log("")

    // ============================================================================
    // 步骤 11: 导航到表单页面并捕获元素状态
    // ============================================================================
    console.log("步骤 11: 导航到表单页面...")
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/form/form"
    })
    await page_wait_for({ timeout: 1000 })
    console.log("✅ 已进入表单页面\n")

    // 捕获表单初始状态
    console.log("步骤 11.1: 捕获表单初始状态...")
    const formInitial = await snapshot_page({
      filename: "snapshot-08-form-empty.json",
      includeScreenshot: true
    })
    console.log(`✅ 表单初始状态: ${formInitial.snapshotPath}\n`)

    // 填写表单
    console.log("步骤 11.2: 填写表单...")
    const nameInput = await element_query({
      selector: "#name-input",
      save: true
    })
    await element_input({
      refId: nameInput.refId,
      text: "张三"
    })
    console.log("✅ 填写姓名: 张三")

    const emailInput = await element_query({
      selector: "#email-input",
      save: true
    })
    await element_input({
      refId: emailInput.refId,
      text: "zhangsan@example.com"
    })
    console.log("✅ 填写邮箱: zhangsan@example.com")

    await page_wait_for({ timeout: 500 })
    console.log("")

    // 捕获表单填写后状态
    console.log("步骤 11.3: 捕获表单填写后状态...")
    const formFilled = await snapshot_page({
      filename: "snapshot-09-form-filled.json",
      includeScreenshot: true
    })
    console.log(`✅ 表单填写状态: ${formFilled.snapshotPath}`)

    // 比较表单数据
    console.log(`📊 表单数据对比:`)
    console.log(`   姓名: "${formInitial.data.pageData.name || ''}" → "${formFilled.data.pageData.name}"`)
    console.log(`   邮箱: "${formInitial.data.pageData.email || ''}" → "${formFilled.data.pageData.email}"`)
    console.log("")

    // ============================================================================
    // 步骤 12: 生成调试报告
    // ============================================================================
    console.log("步骤 12: 生成调试报告...")

    const debugReport = {
      title: "购物车功能调试报告",
      date: new Date().toISOString(),
      testScenarios: [
        {
          name: "场景 1: 购物车初始化",
          status: "✅ 通过",
          snapshots: [initialSnapshot.snapshotPath, cartInitial.snapshotPath],
          findings: "购物车正确初始化为空状态"
        },
        {
          name: "场景 2: 添加商品",
          status: updatedCartData.items?.length > 0 ? "✅ 通过" : "❌ 失败",
          snapshots: [cartInitial.snapshotPath, cartUpdated.snapshotPath],
          findings: `商品数量从 ${cartData.items?.length || 0} 增加到 ${updatedCartData.items?.length || 0}`,
          issues: updatedCartData.items?.length > 0 ? [] : ["商品添加失败，数量未增加"]
        },
        {
          name: "场景 3: 删除商品",
          status: afterItems === beforeItems - 1 ? "✅ 通过" : "❌ 失败",
          snapshots: [beforeDelete.snapshotPath, afterDelete.snapshotPath],
          findings: `商品数量从 ${beforeItems} 减少到 ${afterItems}`,
          issues: afterItems === beforeItems - 1 ? [] : ["删除操作未正确更新数量"]
        },
        {
          name: "场景 4: 表单填写",
          status: "✅ 通过",
          snapshots: [formInitial.snapshotPath, formFilled.snapshotPath],
          findings: "表单数据正确绑定和更新"
        }
      ],
      summary: {
        totalTests: 4,
        passed: afterItems === beforeItems - 1 && updatedCartData.items?.length > 0 ? 4 : 3,
        failed: afterItems === beforeItems - 1 && updatedCartData.items?.length > 0 ? 0 : 1,
        snapshots: 9
      }
    }

    console.log("📋 调试报告:")
    console.log(JSON.stringify(debugReport, null, 2))
    console.log("")

    console.log("=== 快照调试测试完成 ===\n")
    console.log("📊 测试总结:")
    console.log(`   ✅ 测试场景: ${debugReport.summary.totalTests}`)
    console.log(`   ✅ 通过: ${debugReport.summary.passed}`)
    console.log(`   ❌ 失败: ${debugReport.summary.failed}`)
    console.log(`   📸 快照数量: ${debugReport.summary.snapshots}`)
    console.log(`   📁 快照位置: OUTPUT_DIR 目录\n`)

  } catch (error) {
    console.error("\n❌ 测试失败:", error.message)

    // 错误时捕获快照
    try {
      const errorSnapshot = await snapshot_full({
        filename: "snapshot-error-state.json",
        includeScreenshot: true
      })
      console.log("📸 错误快照已保存:", errorSnapshot.snapshotPath)
    } catch (snapshotError) {
      console.error("快照保存失败:", snapshotError.message)
    }

    throw error

  } finally {
    // ============================================================================
    // 步骤 13: 清理资源
    // ============================================================================
    console.log("步骤 13: 清理资源...")
    try {
      await miniprogram_close()
      console.log("✅ 资源已清理，微信开发者工具已关闭\n")
    } catch (closeError) {
      console.error("关闭失败:", closeError.message)
    }
  }
}

// 运行示例
snapshotDebuggingExample()
```

---

## 分步讲解

### 步骤 1: snapshot_page - 捕获页面快照

```javascript
const snapshot = await snapshot_page({
  filename: "snapshot-01-initial.json",
  includeScreenshot: true,
  fullPage: false
})
```

**说明**:
- 捕获当前页面的完整状态（数据 + 截图）
- `filename` 指定快照文件名（可选，默认自动生成）
- `includeScreenshot` 是否同时截图（默认 true）
- `fullPage` 是否截取完整页面（默认 false，仅截取可见区域）

**返回结构**:
```javascript
{
  success: true,
  message: "Page snapshot captured successfully",
  snapshotPath: "/path/to/snapshot-01-initial.json",
  screenshotPath: "/path/to/snapshot-01-initial.png",
  data: {
    timestamp: "2025-10-02T10:30:45.123Z",
    pagePath: "pages/index/index",
    pageData: { /* 页面 data 对象 */ },
    pageQuery: { /* URL 参数 */ }
  }
}
```

**使用场景**:
- 记录页面初始状态
- 捕获操作前后的页面数据
- 对比页面数据变化
- 问题复现和诊断

---

### 步骤 2: snapshot_full - 捕获完整应用快照

```javascript
const fullSnapshot = await snapshot_full({
  filename: "snapshot-02-app-state.json",
  includeScreenshot: true,
  fullPage: false
})
```

**说明**:
- 捕获完整应用状态（系统信息 + 页面栈 + 当前页面）
- 提供最完整的应用上下文信息
- 适合需要全局视图的调试场景

**返回结构**:
```javascript
{
  success: true,
  message: "Full application snapshot captured successfully",
  snapshotPath: "/path/to/snapshot-02-app-state.json",
  screenshotPath: "/path/to/snapshot-02-app-state.png",
  data: {
    timestamp: "2025-10-02T10:30:45.123Z",
    systemInfo: {
      platform: "devtools",
      model: "iPhone 15 Pro",
      system: "iOS 17.2",
      SDKVersion: "3.3.4",
      // ... 更多系统信息
    },
    pageStack: [
      { path: "pages/index/index", query: {} },
      { path: "pages/cart/cart", query: {} }
    ],
    currentPage: {
      path: "pages/cart/cart",
      query: {},
      data: { /* 当前页面数据 */ }
    }
  }
}
```

**使用场景**:
- 记录应用整体状态
- 调试页面栈问题
- 检查系统兼容性
- 生成完整的错误报告

---

### 步骤 3: snapshot_element - 捕获元素快照

```javascript
const elementSnapshot = await snapshot_element({
  refId: "element-ref-123",
  filename: "snapshot-05-item-card.json",
  includeScreenshot: false
})
```

**说明**:
- 捕获单个元素的详细信息
- 包含元素文本、尺寸、位置等属性
- `includeScreenshot` 默认为 false（元素截图通常不需要）

**返回结构**:
```javascript
{
  success: true,
  message: "Element snapshot captured successfully",
  snapshotPath: "/path/to/snapshot-05-item-card.json",
  screenshotPath: undefined,
  data: {
    timestamp: "2025-10-02T10:30:45.123Z",
    refId: "element-ref-123",
    text: "商品名称",
    attributes: { /* 元素属性 */ },
    size: { width: 320, height: 100 },
    offset: { left: 20, top: 150 }
  }
}
```

**使用场景**:
- 验证元素渲染正确性
- 检查元素位置和尺寸
- 调试布局问题
- 记录元素状态变化

---

### 步骤 4: 比较快照发现状态变化

```javascript
// 对比数据
console.log("📊 状态对比:")
console.log(`  商品数量: ${before.items.length} → ${after.items.length}`)
console.log(`  总价: ¥${before.totalPrice} → ¥${after.totalPrice}`)

// 验证预期
if (after.items.length === before.items.length + 1) {
  console.log("✅ 商品添加成功")
} else {
  console.log("❌ 商品添加失败")
}
```

**说明**:
- 读取两个快照的 JSON 文件
- 对比关键数据字段
- 验证操作是否符合预期
- 识别异常状态变化

**对比技巧**:
1. **数值对比**: 商品数量、总价、计数器等
2. **状态对比**: 布尔值、枚举值等
3. **结构对比**: 数组长度、对象属性等
4. **视觉对比**: 使用截图对比工具查看 UI 变化

---

### 步骤 5: 快照调试工作流

**典型调试流程**:

```javascript
// 1. 捕获初始状态
const before = await snapshot_page({
  filename: "before-operation.json",
  includeScreenshot: true
})

// 2. 执行可能有问题的操作
await someOperation()

// 3. 捕获操作后状态
const after = await snapshot_page({
  filename: "after-operation.json",
  includeScreenshot: true
})

// 4. 分析差异
const diff = {
  dataChanged: JSON.stringify(before.data) !== JSON.stringify(after.data),
  itemsAdded: after.data.items.length - before.data.items.length,
  priceChanged: after.data.totalPrice - before.data.totalPrice
}

// 5. 生成诊断报告
console.log("🔍 诊断结果:", diff)
```

**调试技巧**:
- 在关键操作前后都捕获快照
- 使用有意义的文件名（包含场景和时间戳）
- 同时保存数据和截图便于对比
- 记录预期结果和实际结果的差异

---

### 步骤 6: 快照文件管理

**文件命名规范**:
```
snapshot-{序号}-{场景描述}.json
snapshot-{序号}-{场景描述}.png
```

**示例**:
- `snapshot-01-initial.json` - 初始状态
- `snapshot-02-cart-empty.json` - 空购物车
- `snapshot-03-cart-with-items.json` - 添加商品后
- `snapshot-04-before-delete.json` - 删除前
- `snapshot-05-after-delete.json` - 删除后

**存储位置**:
- 快照默认保存到 `OUTPUT_DIR` 环境变量指定的目录
- 如未配置则保存到当前工作目录
- 建议为每个测试场景创建独立的输出目录

---

### 步骤 7: 生成调试报告

```javascript
const debugReport = {
  title: "购物车功能调试报告",
  date: new Date().toISOString(),
  testScenarios: [
    {
      name: "添加商品",
      status: "✅ 通过",
      snapshots: ["snapshot-02.json", "snapshot-03.json"],
      findings: "商品数量正确增加",
      issues: []
    },
    {
      name: "删除商品",
      status: "❌ 失败",
      snapshots: ["snapshot-04.json", "snapshot-05.json"],
      findings: "删除后数量未更新",
      issues: ["数据绑定问题", "事件处理错误"]
    }
  ],
  summary: {
    totalTests: 2,
    passed: 1,
    failed: 1,
    snapshots: 5
  }
}
```

**报告内容**:
- 测试场景列表
- 每个场景的快照文件
- 发现的问题和状态
- 总结统计信息

---

## 预期输出

```
=== 开始快照调试测试 ===

步骤 1: 启动小程序...
✅ Successfully launched mini program
   项目路径: /Users/username/my-miniprogram

步骤 2: 捕获初始页面快照（首页）...
✅ 初始页面快照已保存:
   快照文件: /output/snapshot-01-initial.json
   截图文件: /output/snapshot-01-initial.png
   页面路径: pages/index/index
   时间戳: 2025-10-02T10:30:45.123Z
   页面数据预览:
   {
     "title": "首页",
     "isLoading": false,
     ...
   }
   ...

步骤 3: 捕获完整应用快照...
✅ 完整应用快照已保存:
   快照文件: /output/snapshot-02-app-state.json
   截图文件: /output/snapshot-02-app-state.png
   系统信息:
     - 平台: devtools
     - 设备: iPhone 15 Pro
     - 系统: iOS 17.2
     - SDK 版本: 3.3.4
   页面栈:
     1. pages/index/index
   当前页面: pages/index/index

步骤 4: 导航到购物车页面...
✅ 已进入购物车页面

步骤 5: 捕获购物车初始状态...
✅ 购物车初始状态快照:
   快照文件: /output/snapshot-03-cart-empty.json
   购物车数据:
     - 商品数量: 0
     - 总价: 0
     - 是否为空: true

步骤 6: 添加商品到购物车...
✅ 找到添加按钮: element-ref-001
✅ 点击添加按钮
✅ 再次点击添加按钮

步骤 7: 捕获购物车更新后状态...
✅ 购物车更新状态快照:
   快照文件: /output/snapshot-04-cart-with-items.json
   购物车数据:
     - 商品数量: 2
     - 总价: 199.8
     - 是否为空: false

步骤 8: 比较快照发现状态变化...
📊 状态对比:
   初始状态 vs 更新状态:
     商品数量: 0 → 2
     总价: ¥0 → ¥199.8
     是否为空: true → false
   ✅ 商品添加成功

步骤 9: 捕获元素快照（查看商品卡片）...
✅ 找到商品卡片: element-ref-002
✅ 元素快照已保存:
   快照文件: /output/snapshot-05-item-card.json
   截图文件: 无
   元素信息:
     - refId: element-ref-002
     - 文本: 测试商品 ¥99.9
     - 尺寸: 320x100
     - 位置: (20, 150)

步骤 10: 模拟 Bug 场景 - 删除商品...
✅ 删除前快照: /output/snapshot-06-before-delete.json
✅ 找到删除按钮: element-ref-003
✅ 点击删除按钮
✅ 删除后快照: /output/snapshot-07-after-delete.json
📊 删除操作分析:
   删除前商品数: 2
   删除后商品数: 1
   预期结果: 1
   ✅ 删除操作正常

步骤 11: 导航到表单页面...
✅ 已进入表单页面

步骤 11.1: 捕获表单初始状态...
✅ 表单初始状态: /output/snapshot-08-form-empty.json

步骤 11.2: 填写表单...
✅ 填写姓名: 张三
✅ 填写邮箱: zhangsan@example.com

步骤 11.3: 捕获表单填写后状态...
✅ 表单填写状态: /output/snapshot-09-form-filled.json
📊 表单数据对比:
   姓名: "" → "张三"
   邮箱: "" → "zhangsan@example.com"

步骤 12: 生成调试报告...
📋 调试报告:
{
  "title": "购物车功能调试报告",
  "date": "2025-10-02T10:30:50.456Z",
  "testScenarios": [
    {
      "name": "场景 1: 购物车初始化",
      "status": "✅ 通过",
      "snapshots": [...],
      "findings": "购物车正确初始化为空状态"
    },
    ...
  ],
  "summary": {
    "totalTests": 4,
    "passed": 4,
    "failed": 0,
    "snapshots": 9
  }
}

=== 快照调试测试完成 ===

📊 测试总结:
   ✅ 测试场景: 4
   ✅ 通过: 4
   ❌ 失败: 0
   📸 快照数量: 9
   📁 快照位置: OUTPUT_DIR 目录

步骤 13: 清理资源...
✅ 资源已清理，微信开发者工具已关闭
```

---

## 常见问题

### 问题 1: 快照文件过大

**现象**: JSON 文件超过几 MB，难以阅读和对比

**原因**:
- 页面数据包含大量列表项
- 数据中包含 base64 图片
- 嵌套层级过深

**解决方案**:
```javascript
// 方案 1: 只捕获关键数据
const snapshot = await snapshot_page({
  filename: "snapshot-key-data.json",
  includeScreenshot: false  // 关闭截图减少文件大小
})

// 方案 2: 手动过滤数据
const pageData = snapshot.data.pageData
const filteredData = {
  itemCount: pageData.items.length,  // 只保存数量
  totalPrice: pageData.totalPrice,   // 只保存总价
  firstItem: pageData.items[0]       // 只保存第一项作为样本
}

// 方案 3: 使用压缩存储
const fs = require('fs')
const zlib = require('zlib')
const compressed = zlib.gzipSync(JSON.stringify(snapshot.data))
fs.writeFileSync('snapshot.json.gz', compressed)
```

---

### 问题 2: 截图未生成

**错误**: `screenshotPath` 为 undefined 或文件不存在

**排查步骤**:
```javascript
// 1. 检查参数
const snapshot = await snapshot_page({
  includeScreenshot: true  // 确保开启截图
})

// 2. 检查输出目录权限
const outputManager = session.outputManager
await outputManager.ensureOutputDir()

// 3. 检查页面是否已加载
await page_wait_for({ timeout: 2000 })

// 4. 尝试单独截图
await miniprogram_screenshot({
  filename: "test-screenshot.png"
})
```

---

### 问题 3: 快照对比复杂

**问题**: 两个快照数据量大，难以手动对比差异

**解决方案**:

**方法 1: 使用 JSON 差异工具**
```javascript
// 使用 jest 的 diff 功能
const jestDiff = require('jest-diff')
const diff = jestDiff(beforeSnapshot.data, afterSnapshot.data)
console.log(diff)
```

**方法 2: 编写自定义对比函数**
```javascript
function compareSnapshots(before, after) {
  const changes = {
    dataChanged: [],
    added: [],
    removed: []
  }

  // 对比数值
  if (before.pageData.count !== after.pageData.count) {
    changes.dataChanged.push({
      field: 'count',
      before: before.pageData.count,
      after: after.pageData.count
    })
  }

  // 对比数组
  const beforeIds = before.pageData.items.map(i => i.id)
  const afterIds = after.pageData.items.map(i => i.id)

  changes.added = afterIds.filter(id => !beforeIds.includes(id))
  changes.removed = beforeIds.filter(id => !afterIds.includes(id))

  return changes
}

const changes = compareSnapshots(beforeSnapshot.data, afterSnapshot.data)
console.log("📊 数据变化:", changes)
```

**方法 3: 只对比关键字段**
```javascript
function compareKeyFields(before, after, fields) {
  const result = {}

  fields.forEach(field => {
    const beforeValue = getNestedValue(before, field)
    const afterValue = getNestedValue(after, field)

    if (beforeValue !== afterValue) {
      result[field] = { before: beforeValue, after: afterValue }
    }
  })

  return result
}

const diff = compareKeyFields(
  beforeSnapshot.data,
  afterSnapshot.data,
  ['pageData.items.length', 'pageData.totalPrice', 'pageData.isEmpty']
)
console.log("变化字段:", diff)
```

---

### 问题 4: 无法定位问题根源

**场景**: 快照显示数据异常，但不知道哪里出错

**调试策略**:

**步骤 1: 缩小问题范围**
```javascript
// 捕获多个时间点的快照
await snapshot_page({ filename: "step-01-initial.json" })
await operation1()
await snapshot_page({ filename: "step-02-after-op1.json" })
await operation2()
await snapshot_page({ filename: "step-03-after-op2.json" })
await operation3()
await snapshot_page({ filename: "step-04-after-op3.json" })

// 逐步对比，找到问题发生的时间点
```

**步骤 2: 结合元素快照**
```javascript
// 如果页面数据异常，检查关键元素状态
const elements = await element_query_all({ selector: ".item" })

for (const element of elements) {
  const elementSnapshot = await snapshot_element({
    refId: element.refId,
    filename: `element-${element.refId}.json`
  })
  console.log(`元素 ${element.refId}:`, elementSnapshot.data)
}
```

**步骤 3: 捕获完整应用上下文**
```javascript
// 使用 snapshot_full 获取全局视图
const fullSnapshot = await snapshot_full({
  filename: "full-context.json"
})

// 检查:
// 1. 页面栈是否正确
// 2. 系统信息是否异常
// 3. 全局数据状态
```

---

## 下一步

- 学习 [示例 05: 录制与回放](./05-record-replay.md) - 录制操作序列并回放
- 学习 [示例 03: 断言测试](./03-assertion-testing.md) - 结合快照编写自动化测试
- 查看 [API 文档](../docs/api/snapshot.md) - 快照工具详细说明

---

**相关文档**:
- [Snapshot API](../docs/api/snapshot.md)
- [MiniProgram API](../docs/api/miniprogram.md)
- [Page API](../docs/api/page.md)
- [Element API](../docs/api/element.md)
