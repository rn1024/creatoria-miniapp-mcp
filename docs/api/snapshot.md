# Snapshot API

> Snapshot 工具提供页面、应用和元素的状态捕获功能，用于调试、问题诊断和测试记录。

## 工具列表

| 工具名称 | 描述 | 捕获内容 |
|---------|------|----------|
| `snapshot_page` | 页面快照 | 页面数据 + 页面信息 + 可选截图 |
| `snapshot_full` | 完整应用快照 | 系统信息 + 页面栈 + 当前页面 + 可选截图 |
| `snapshot_element` | 元素快照 | 元素文本 + 尺寸 + 位置 + 可选截图 |

---

## snapshot_page

捕获当前页面的完整快照，包括页面数据、路径、查询参数和可选截图。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `pagePath` | string | ⭐ | currentPage | 页面路径（默认当前页面） |
| `filename` | string | ⭐ | 自动生成 | 文件名（不含扩展名） |
| `includeScreenshot` | boolean | ⭐ | true | 是否包含截图 |
| `fullPage` | boolean | ⭐ | false | 是否截取整个页面 |

### 返回值

```typescript
{
  success: true,
  message: "Page snapshot captured successfully",
  snapshotPath: "/tmp/mcp-output/snapshot-20250102-143020.json",
  screenshotPath: "/tmp/mcp-output/snapshot-20250102-143020.png",
  data: {
    timestamp: "2025-01-02T14:30:20.123Z",
    pagePath: "/pages/product/detail",
    pageData: {
      productId: 12345,
      productName: "iPhone 15 Pro",
      price: 999,
      stock: 100
    },
    pageQuery: {
      id: "12345",
      from: "list"
    }
  }
}
```

### 输出文件

**JSON 文件** (`snapshot-YYYYMMDD-HHMMSS.json`):
```json
{
  "timestamp": "2025-01-02T14:30:20.123Z",
  "pagePath": "/pages/product/detail",
  "pageData": {
    "productId": 12345,
    "productName": "iPhone 15 Pro",
    "price": 999,
    "stock": 100
  },
  "pageQuery": {
    "id": "12345",
    "from": "list"
  }
}
```

**PNG 文件** (可选):
- 与 JSON 同名，扩展名为 `.png`
- 默认截取视口内容
- `fullPage: true` 时截取整个页面

### 使用示例

```javascript
// 示例 1: 基础快照（数据 + 截图）
const result = await snapshot_page()
console.log("快照已保存:", result.snapshotPath)
console.log("截图已保存:", result.screenshotPath)

// 示例 2: 仅保存数据，不截图
const result = await snapshot_page({
  includeScreenshot: false
})
console.log("数据快照:", result.data.pageData)

// 示例 3: 全页截图
const result = await snapshot_page({
  fullPage: true,
  filename: "product-detail-full"
})

// 示例 4: 调试时捕获状态
try {
  await element_tap({ refId: btn.refId })
  await page_wait_for({ selector: ".result", timeout: 2000 })
} catch (error) {
  // 错误发生时捕获快照
  const snapshot = await snapshot_page({
    filename: "error-state"
  })
  console.error("错误快照:", snapshot.snapshotPath)
  throw error
}

// 示例 5: 测试记录
const tests = ["test1", "test2", "test3"]
for (const test of tests) {
  // 执行测试...
  await snapshot_page({
    filename: `test-${test}-result`,
    includeScreenshot: true
  })
}

// 示例 6: 比对数据变化
const before = await snapshot_page({
  filename: "before-action",
  includeScreenshot: false
})
await element_tap({ refId: btn.refId })
await page_wait_for({ timeout: 500 })
const after = await snapshot_page({
  filename: "after-action",
  includeScreenshot: false
})
console.log("前:", before.data.pageData)
console.log("后:", after.data.pageData)
```

### 注意事项

- 💡 **自动命名**: 不提供 `filename` 时自动生成时间戳文件名
- 💡 **输出目录**: 文件保存在 `OUTPUT_DIR` 环境变量指定的目录（默认 `.mcp-artifacts/`）
- 💡 **JSON + PNG**: 快照数据和截图使用相同文件名（不同扩展名）
- ⚠️ **大文件**: 全页截图可能生成较大文件
- 💡 **调试利器**: 快照包含完整的页面状态，方便问题诊断

### 相关工具

- [`snapshot_full`](#snapshot_full) - 捕获完整应用快照
- [`miniprogram_screenshot`](./miniprogram.md#miniprogram_screenshot) - 仅截图

---

## snapshot_full

捕获小程序的完整应用快照，包括系统信息、页面栈、当前页面数据和可选截图。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `filename` | string | ⭐ | 自动生成 | 文件名（不含扩展名） |
| `includeScreenshot` | boolean | ⭐ | true | 是否包含截图 |
| `fullPage` | boolean | ⭐ | false | 是否截取整个页面 |

### 返回值

```typescript
{
  success: true,
  message: "Full application snapshot captured successfully",
  snapshotPath: "/tmp/mcp-output/snapshot-20250102-143030.json",
  screenshotPath: "/tmp/mcp-output/snapshot-20250102-143030.png",
  data: {
    timestamp: "2025-01-02T14:30:30.456Z",
    systemInfo: {
      model: "iPhone 15 Pro",
      system: "iOS 17.2",
      platform: "devtools",
      version: "3.0.0",
      SDKVersion: "3.3.4",
      windowWidth: 375,
      windowHeight: 667
    },
    pageStack: [
      { path: "pages/index/index", query: {} },
      { path: "pages/list/list", query: { category: "electronics" } },
      { path: "pages/detail/detail", query: { id: "12345" } }
    ],
    currentPage: {
      path: "pages/detail/detail",
      query: { id: "12345" },
      data: {
        productId: 12345,
        productName: "iPhone 15 Pro",
        price: 999
      }
    }
  }
}
```

### 输出文件

**JSON 文件** (`snapshot-YYYYMMDD-HHMMSS.json`):
```json
{
  "timestamp": "2025-01-02T14:30:30.456Z",
  "systemInfo": {
    "model": "iPhone 15 Pro",
    "system": "iOS 17.2",
    "platform": "devtools",
    "version": "3.0.0",
    "SDKVersion": "3.3.4",
    "windowWidth": 375,
    "windowHeight": 667
  },
  "pageStack": [
    { "path": "pages/index/index", "query": {} },
    { "path": "pages/list/list", "query": { "category": "electronics" } },
    { "path": "pages/detail/detail", "query": { "id": "12345" } }
  ],
  "currentPage": {
    "path": "pages/detail/detail",
    "query": { "id": "12345" },
    "data": {
      "productId": 12345,
      "productName": "iPhone 15 Pro",
      "price": 999
    }
  }
}
```

### 使用示例

```javascript
// 示例 1: 完整应用快照
const result = await snapshot_full()
console.log("应用快照:", result.snapshotPath)
console.log("系统信息:", result.data.systemInfo)
console.log("页面栈深度:", result.data.pageStack.length)

// 示例 2: 诊断页面栈问题
const snapshot = await snapshot_full({
  filename: "page-stack-debug"
})
console.log("当前页面栈:")
snapshot.data.pageStack.forEach((page, index) => {
  console.log(`  ${index + 1}. ${page.path}`, page.query)
})

// 示例 3: 环境信息收集
const snapshot = await snapshot_full({
  includeScreenshot: false
})
console.log("设备型号:", snapshot.data.systemInfo.model)
console.log("系统版本:", snapshot.data.systemInfo.system)
console.log("SDK 版本:", snapshot.data.systemInfo.SDKVersion)

// 示例 4: 问题报告
try {
  // 执行可能出错的操作
  await miniprogram_navigate({
    method: "navigateTo",
    url: "/pages/nonexistent/index"
  })
} catch (error) {
  // 捕获完整应用状态用于问题报告
  const snapshot = await snapshot_full({
    filename: "error-report"
  })
  console.error("错误发生时的应用状态:", snapshot.snapshotPath)
  console.error("错误信息:", error.message)
  throw error
}

// 示例 5: 自动化测试报告
async function generateTestReport() {
  const snapshot = await snapshot_full({
    filename: "test-report",
    fullPage: true
  })

  return {
    timestamp: snapshot.data.timestamp,
    environment: {
      model: snapshot.data.systemInfo.model,
      system: snapshot.data.systemInfo.system
    },
    currentPage: snapshot.data.currentPage.path,
    pageStack: snapshot.data.pageStack.map(p => p.path),
    screenshot: snapshot.screenshotPath
  }
}

// 示例 6: 页面栈溢出检测
const snapshot = await snapshot_full({
  includeScreenshot: false
})
if (snapshot.data.pageStack.length > 8) {
  console.warn("⚠️ 页面栈深度过大，可能需要优化导航逻辑")
}
```

### 注意事项

- 💡 **最全面**: 包含系统信息、完整页面栈和当前页面数据
- 💡 **问题诊断**: 适合用于 bug 报告和问题分析
- 💡 **性能开销**: 比 `snapshot_page` 稍慢，因为需要获取更多信息
- ⚠️ **文件大小**: 页面栈深时 JSON 文件可能较大
- 💡 **环境信息**: `systemInfo` 包含完整的设备和运行环境信息

### 相关工具

- [`snapshot_page`](#snapshot_page) - 仅捕获当前页面
- [`miniprogram_get_system_info`](./miniprogram.md#miniprogram_get_system_info) - 获取系统信息
- [`miniprogram_get_page_stack`](./miniprogram.md#miniprogram_get_page_stack) - 获取页面栈

---

## snapshot_element

捕获单个元素的快照，包括文本、尺寸、位置和可选截图。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `filename` | string | ⭐ | 自动生成 | 文件名（不含扩展名） |
| `includeScreenshot` | boolean | ⭐ | false | 是否包含截图（注意：截取整个屏幕，非元素本身） |

### 返回值

```typescript
{
  success: true,
  message: "Element snapshot captured successfully",
  snapshotPath: "/tmp/mcp-output/snapshot-20250102-143040.json",
  screenshotPath: "/tmp/mcp-output/snapshot-20250102-143040.png",  // 可选
  data: {
    timestamp: "2025-01-02T14:30:40.789Z",
    refId: "elem_abc123",
    text: "iPhone 15 Pro Max",
    attributes: {},  // 空对象（当前版本）
    size: {
      width: 345,
      height: 60
    },
    offset: {
      left: 15,
      top: 200
    }
  }
}
```

### 输出文件

**JSON 文件** (`snapshot-YYYYMMDD-HHMMSS.json`):
```json
{
  "timestamp": "2025-01-02T14:30:40.789Z",
  "refId": "elem_abc123",
  "text": "iPhone 15 Pro Max",
  "attributes": {},
  "size": {
    "width": 345,
    "height": 60
  },
  "offset": {
    "left": 15,
    "top": 200
  }
}
```

### 使用示例

```javascript
// 示例 1: 捕获元素基本信息
const element = await page_query({
  selector: ".product-title",
  save: true
})
const snapshot = await snapshot_element({
  refId: element.refId,
  filename: "product-title"
})
console.log("元素文本:", snapshot.data.text)
console.log("元素尺寸:", snapshot.data.size)
console.log("元素位置:", snapshot.data.offset)

// 示例 2: 记录元素状态变化
const button = await page_query({
  selector: ".submit-btn",
  save: true
})

// 点击前状态
const before = await snapshot_element({
  refId: button.refId,
  filename: "button-before",
  includeScreenshot: true
})

await element_tap({ refId: button.refId })
await page_wait_for({ timeout: 500 })

// 点击后状态
const after = await snapshot_element({
  refId: button.refId,
  filename: "button-after",
  includeScreenshot: true
})

console.log("点击前文本:", before.data.text)
console.log("点击后文本:", after.data.text)

// 示例 3: 验证布局
const card = await page_query({
  selector: ".product-card",
  save: true
})
const snapshot = await snapshot_element({
  refId: card.refId
})

if (snapshot.data.size.width < 300) {
  console.warn("⚠️ 卡片宽度不足")
}
if (snapshot.data.offset.top < 0) {
  console.warn("⚠️ 卡片在视口外")
}

// 示例 4: 调试元素不可见问题
const element = await page_query({
  selector: ".hidden-element",
  save: true
})
const snapshot = await snapshot_element({
  refId: element.refId,
  includeScreenshot: true
})

console.log("元素快照:", snapshot.snapshotPath)
if (snapshot.data.size.width === 0 || snapshot.data.size.height === 0) {
  console.log("❌ 元素不可见（尺寸为零）")
}

// 示例 5: 收集多个元素信息
const items = await page_query_all({
  selector: ".product-item .title",
  save: true
})

const snapshots = []
for (const [index, item] of items.elements.entries()) {
  const snapshot = await snapshot_element({
    refId: item.refId,
    filename: `item-${index}`
  })
  snapshots.push({
    index,
    text: snapshot.data.text,
    size: snapshot.data.size
  })
}

console.log("商品标题:")
snapshots.forEach(s => {
  console.log(`  ${s.index + 1}. ${s.text} (${s.size.width}x${s.size.height})`)
})

// 示例 6: 错误诊断
try {
  await assert_text({
    refId: element.refId,
    expected: "预期文本"
  })
} catch (error) {
  // 断言失败时捕获元素快照
  const snapshot = await snapshot_element({
    refId: element.refId,
    filename: "assertion-failure",
    includeScreenshot: true
  })
  console.error("断言失败，元素实际文本:", snapshot.data.text)
  throw error
}
```

### 注意事项

- ⚠️ **截图范围**: `includeScreenshot: true` 时截取整个屏幕，不是单个元素
- 💡 **attributes 字段**: 当前版本为空对象，未来可能扩展
- 💡 **文本获取**: 如果元素没有文本内容，`text` 字段为 `undefined`
- 💡 **坐标系**: `offset` 相对于页面左上角，单位为物理像素（px）
- 💡 **轻量快照**: 比 `snapshot_page` 更轻量，仅关注单个元素

### 相关工具

- [`element_get_text`](./element.md#element_get_text) - 获取元素文本
- [`element_get_size`](./element.md#element_get_size) - 获取元素尺寸
- [`element_get_offset`](./element.md#element_get_offset) - 获取元素位置

---

## 完整示例：自动化测试快照记录

```javascript
// 场景：完整的测试流程快照记录
async function testWithSnapshots() {
  try {
    // 1. 启动并捕获初始状态
    await miniprogram_launch({
      projectPath: "/path/to/project"
    })
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/product/list"
    })

    const initial = await snapshot_full({
      filename: "01-initial-state"
    })
    console.log("✅ 初始状态已捕获:", initial.snapshotPath)

    // 2. 执行操作并记录页面快照
    const searchInput = await page_query({
      selector: ".search-input",
      save: true
    })
    await element_input({
      refId: searchInput.refId,
      value: "iPhone"
    })
    await element_tap({ selector: ".search-btn" })

    await page_wait_for({
      selector: ".product-item",
      timeout: 2000
    })

    const afterSearch = await snapshot_page({
      filename: "02-search-results",
      fullPage: true
    })
    console.log("✅ 搜索结果已捕获:", afterSearch.snapshotPath)

    // 3. 捕获列表项快照
    const items = await page_query_all({
      selector: ".product-item",
      save: true
    })
    console.log(`找到 ${items.count} 个商品`)

    const firstItem = items.elements[0]
    const itemSnapshot = await snapshot_element({
      refId: firstItem.refId,
      filename: "03-first-product",
      includeScreenshot: true
    })
    console.log("✅ 第一个商品快照:", itemSnapshot.data.text)

    // 4. 导航到详情页
    await element_tap({ refId: firstItem.refId })
    await page_wait_for({
      selector: ".product-detail",
      timeout: 2000
    })

    const detailPage = await snapshot_full({
      filename: "04-product-detail",
      fullPage: true
    })
    console.log("✅ 详情页快照:", detailPage.snapshotPath)
    console.log("页面栈深度:", detailPage.data.pageStack.length)

    // 5. 验证并记录关键元素
    const priceElement = await page_query({
      selector: ".price",
      save: true
    })
    const priceSnapshot = await snapshot_element({
      refId: priceElement.refId,
      filename: "05-price-element"
    })
    console.log("✅ 价格:", priceSnapshot.data.text)

    // 6. 测试加购操作
    const addToCartBtn = await page_query({
      selector: ".add-to-cart-btn",
      save: true
    })
    await element_tap({ refId: addToCartBtn.refId })

    await page_wait_for({
      selector: ".cart-toast",
      timeout: 1000
    })

    const afterCart = await snapshot_page({
      filename: "06-added-to-cart"
    })
    console.log("✅ 加购后状态:", afterCart.snapshotPath)

    // 7. 生成测试报告
    const finalState = await snapshot_full({
      filename: "07-final-state",
      includeScreenshot: true
    })

    const report = {
      timestamp: finalState.data.timestamp,
      testSteps: [
        "01-initial-state",
        "02-search-results",
        "03-first-product",
        "04-product-detail",
        "05-price-element",
        "06-added-to-cart",
        "07-final-state"
      ],
      environment: finalState.data.systemInfo,
      pageStack: finalState.data.pageStack,
      status: "PASSED"
    }

    console.log("✅ 测试完成")
    console.log("测试报告:", JSON.stringify(report, null, 2))

    return report

  } catch (error) {
    // 错误时捕获完整状态
    const errorState = await snapshot_full({
      filename: "error-state"
    })
    console.error("❌ 测试失败:", error.message)
    console.error("错误状态快照:", errorState.snapshotPath)

    throw error
  } finally {
    await miniprogram_close()
  }
}

testWithSnapshots()
```

---

## 故障排除

### 问题 1: 快照文件找不到

**错误**: 快照保存成功但找不到文件

**解决方案**:
1. 检查 `OUTPUT_DIR` 环境变量配置
2. 查看返回的 `snapshotPath` 完整路径
3. 确认有文件写入权限

```javascript
const result = await snapshot_page()
console.log("快照路径:", result.snapshotPath)
// 输出: /tmp/mcp-output/snapshot-20250102-143020.json
```

### 问题 2: 截图包含但内容为空白

**错误**: `screenshotPath` 存在但图片为空白

**可能原因**:
1. 页面尚未渲染完成
2. 页面内容在视口外

**解决方案**:
```javascript
// 等待页面渲染完成
await page_wait_for({
  selector: ".main-content",
  timeout: 2000
})
await page_wait_for({ timeout: 500 }) // 额外延时

// 然后再截图
const snapshot = await snapshot_page({
  includeScreenshot: true
})
```

### 问题 3: 元素快照文本为 undefined

**错误**: `snapshot.data.text` 为 `undefined`

**可能原因**:
元素不包含文本内容（如 `image`, `input` 等）

**解决方案**:
```javascript
const snapshot = await snapshot_element({
  refId: element.refId
})

if (snapshot.data.text === undefined) {
  console.log("元素无文本内容")
  // 使用其他方式获取信息
  const value = await element_get_value({ refId: element.refId })
  console.log("元素值:", value.value)
}
```

---

## 最佳实践

### 1. 快照文件命名

```javascript
// ✅ 推荐：使用有意义的文件名
await snapshot_page({
  filename: "product-detail-loaded"
})
await snapshot_full({
  filename: "error-state-login-failure"
})
await snapshot_element({
  refId: el.refId,
  filename: "submit-button-disabled"
})

// ❌ 不推荐：使用默认时间戳（难以识别）
await snapshot_page()  // snapshot-20250102-143020.json
```

### 2. 何时使用哪种快照

```javascript
// 调试单个页面问题 → snapshot_page
await snapshot_page({
  filename: "page-data-debug"
})

// 诊断页面栈或系统问题 → snapshot_full
await snapshot_full({
  filename: "navigation-issue-debug"
})

// 关注特定元素 → snapshot_element
await snapshot_element({
  refId: el.refId,
  filename: "element-layout-debug"
})
```

### 3. 测试流程快照

```javascript
// ✅ 推荐：关键步骤记录快照
async function testWorkflow() {
  await snapshot_full({ filename: "step-1-initial" })
  // 执行操作 1...
  await snapshot_page({ filename: "step-2-after-action" })
  // 执行操作 2...
  await snapshot_full({ filename: "step-3-final" })
}
```

### 4. 错误快照

```javascript
// ✅ 推荐：错误时捕获完整状态
try {
  // 测试逻辑...
} catch (error) {
  await snapshot_full({
    filename: `error-${Date.now()}`,
    includeScreenshot: true
  })
  throw error
}
```

---

**相关文档**:
- [MiniProgram API](./miniprogram.md) - 截图和系统信息
- [Page API](./page.md) - 页面数据获取
- [Assert API](./assert.md) - 断言验证
- [使用示例](../../examples/04-snapshot-debugging.md) - 快照调试示例

**最后更新**: 2025-10-02
