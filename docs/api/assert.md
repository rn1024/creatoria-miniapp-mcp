# Assert API

> Assert 工具提供自动化测试断言功能，用于验证元素存在性、文本内容、属性值和页面数据，支持完整的测试脚本编写。

## 工具列表

| 工具名称 | 描述 | 主要用途 |
|---------|------|----------|
| `assert_exists` | 验证元素存在 | 检查页面是否包含特定元素 |
| `assert_not_exists` | 验证元素不存在 | 检查元素是否已移除 |
| `assert_text` | 精确文本匹配 | 验证元素文本是否完全一致 |
| `assert_text_contains` | 文本包含检查 | 验证元素文本是否包含子串 |
| `assert_value` | 输入值验证 | 验证表单输入框的值 |
| `assert_attribute` | 属性值验证 | 验证元素 HTML 属性 |
| `assert_property` | 属性对象验证 | 验证元素 DOM 属性 |
| `assert_data` | 页面数据验证 | 验证页面 data 状态 |
| `assert_visible` | 可见性验证 | 验证元素是否可见（非零尺寸） |

---

## assert_exists

验证指定选择器的元素存在于页面中。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `selector` | string | ✅ | - | CSS 选择器 |
| `pagePath` | string | ⭐ | currentPage | 页面路径（默认当前页面） |

### 返回值

```typescript
{
  success: true,
  message: "Element exists: .submit-btn"
}
```

### 错误处理

- **元素不存在**: `Error: Assertion failed: Element not found with selector: {selector}`

### 使用示例

```javascript
// 示例 1: 验证按钮存在
await assert_exists({
  selector: ".submit-btn"
})
console.log("✅ 提交按钮存在")

// 示例 2: 验证成功提示出现
await element_tap({ refId: btn.refId })
await page_wait_for({
  selector: ".success-toast",
  timeout: 2000
})
await assert_exists({
  selector: ".success-toast"
})
console.log("✅ 成功提示已显示")

// 示例 3: 验证特定页面的元素
await assert_exists({
  selector: ".user-profile",
  pagePath: "/pages/user/index"
})

// 示例 4: 验证列表项数量
await assert_exists({
  selector: ".product-item:nth-child(5)"
})
console.log("✅ 至少有 5 个商品")

// 示例 5: 测试流程中的断言
try {
  await element_input({ refId: input.refId, value: "test" })
  await element_tap({ refId: submitBtn.refId })
  await assert_exists({ selector: ".success-message" })
  console.log("✅ 表单提交成功")
} catch (error) {
  console.error("❌ 测试失败:", error.message)
}
```

### 注意事项

- 💡 **仅验证存在**: 不关心元素是否可见（display: none 的元素也算存在）
- 💡 **立即执行**: 不等待元素出现，如需等待请先使用 `page_wait_for`
- ⚠️ **失败即抛出**: 断言失败会抛出异常，中断后续代码执行

### 相关工具

- [`assert_not_exists`](#assert_not_exists) - 验证元素不存在
- [`assert_visible`](#assert_visible) - 验证元素可见
- [`page_wait_for`](./page.md#page_wait_for) - 等待元素出现

---

## assert_not_exists

验证指定选择器的元素不存在于页面中（已移除或从未存在）。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `selector` | string | ✅ | - | CSS 选择器 |
| `pagePath` | string | ⭐ | currentPage | 页面路径 |

### 返回值

```typescript
{
  success: true,
  message: "Element does not exist: .loading-spinner"
}
```

### 错误处理

- **元素存在**: `Error: Assertion failed: Element should not exist but found with selector: {selector}`

### 使用示例

```javascript
// 示例 1: 验证加载动画已消失
await element_tap({ refId: loadBtn.refId })
await page_wait_for({ timeout: 2000 })
await assert_not_exists({
  selector: ".loading-spinner"
})
console.log("✅ 加载已完成")

// 示例 2: 验证删除操作
const beforeCount = await page_query_all({
  selector: ".item"
})
await element_tap({ refId: deleteBtn.refId })
await page_wait_for({ timeout: 500 })
await assert_not_exists({
  selector: ".item:nth-child(5)"
})
console.log("✅ 项目已删除")

// 示例 3: 验证错误提示消失
await element_tap({ refId: closeBtn.refId })
await assert_not_exists({
  selector: ".error-toast"
})

// 示例 4: 验证模态框关闭
await element_tap({ refId: modalClose.refId })
await page_wait_for({ timeout: 300 })
await assert_not_exists({
  selector: ".modal.visible"
})
```

### 注意事项

- 💡 **通过条件**: 元素从未存在或已被移除
- 💡 **display: none**: 设置为 display: none 的元素算"不存在"（取决于选择器）
- ⚠️ **等待时机**: 如果元素需要时间消失，先使用 `page_wait_for` 或延时

---

## assert_text

验证元素的文本内容与预期值完全一致。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `expected` | string | ✅ | - | 预期文本值 |

### 返回值

```typescript
{
  success: true,
  message: "Text matches: \"Hello World\"",
  actual: "Hello World"
}
```

### 错误处理

- **文本不匹配**: `Error: Assertion failed: Text mismatch. Expected: "{expected}", Actual: "{actual}"`

### 使用示例

```javascript
// 示例 1: 验证标题文本
const title = await page_query({
  selector: ".page-title",
  save: true
})
await assert_text({
  refId: title.refId,
  expected: "商品详情"
})
console.log("✅ 标题正确")

// 示例 2: 验证计数器
const counter = await page_query({
  selector: ".count",
  save: true
})
await element_tap({ refId: plusBtn.refId })
await assert_text({
  refId: counter.refId,
  expected: "1"
})

// 示例 3: 验证表单反馈
await element_input({ refId: input.refId, value: "test@example.com" })
await element_tap({ refId: submitBtn.refId })
const feedback = await page_query({
  selector: ".feedback-message",
  save: true
})
await assert_text({
  refId: feedback.refId,
  expected: "邮箱格式正确"
})

// 示例 4: 错误处理
try {
  await assert_text({
    refId: element.refId,
    expected: "预期文本"
  })
} catch (error) {
  console.error("文本不匹配:", error.message)
  // 错误消息包含期望值和实际值
}
```

### 注意事项

- ⚠️ **完全匹配**: 必须完全一致，包括大小写、空格和换行
- 💡 **部分匹配**: 如需部分匹配，使用 `assert_text_contains`
- 💡 **空白字符**: 注意前后空白字符，可能需要 trim 处理

---

## assert_text_contains

验证元素文本包含指定的子串。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `expected` | string | ✅ | - | 预期包含的子串 |

### 返回值

```typescript
{
  success: true,
  message: "Text contains: \"iPhone\"",
  actual: "Apple iPhone 15 Pro Max 256GB"
}
```

### 错误处理

- **不包含子串**: `Error: Assertion failed: Text does not contain expected substring. Expected to contain: "{expected}", Actual: "{actual}"`

### 使用示例

```javascript
// 示例 1: 验证商品名称包含关键词
const productName = await page_query({
  selector: ".product-name",
  save: true
})
await assert_text_contains({
  refId: productName.refId,
  expected: "iPhone"
})
console.log("✅ 商品名称包含 iPhone")

// 示例 2: 验证价格格式
const price = await page_query({
  selector: ".price",
  save: true
})
await assert_text_contains({
  refId: price.refId,
  expected: "¥"
})

// 示例 3: 验证错误提示包含关键信息
await element_tap({ refId: submitBtn.refId })
const error = await page_query({
  selector: ".error-message",
  save: true
})
await assert_text_contains({
  refId: error.refId,
  expected: "用户名"
})

// 示例 4: 验证列表描述
const description = await page_query({
  selector: ".item-description",
  save: true
})
await assert_text_contains({
  refId: description.refId,
  expected: "免运费"
})
```

### 注意事项

- 💡 **子串匹配**: 只要包含子串即可，不要求完全一致
- 💡 **大小写敏感**: 区分大小写
- 💡 **灵活性**: 比 `assert_text` 更灵活，适合动态内容

---

## assert_value

验证输入框或表单组件的值与预期一致。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是表单组件） |
| `expected` | string | ✅ | - | 预期值 |

### 返回值

```typescript
{
  success: true,
  message: "Value matches: \"test@example.com\"",
  actual: "test@example.com"
}
```

### 错误处理

- **值不匹配**: `Error: Assertion failed: Value mismatch. Expected: "{expected}", Actual: "{actual}"`

### 使用示例

```javascript
// 示例 1: 验证输入框值
const input = await page_query({
  selector: "#email",
  save: true
})
await element_input({
  refId: input.refId,
  value: "user@example.com"
})
await assert_value({
  refId: input.refId,
  expected: "user@example.com"
})
console.log("✅ 输入值正确")

// 示例 2: 验证表单提交前的数据
const username = await page_query({
  selector: "#username",
  save: true
})
const password = await page_query({
  selector: "#password",
  save: true
})

await element_input({ refId: username.refId, value: "alice" })
await element_input({ refId: password.refId, value: "secret123" })

await assert_value({ refId: username.refId, expected: "alice" })
await assert_value({ refId: password.refId, expected: "secret123" })

await element_tap({ refId: submitBtn.refId })

// 示例 3: 验证默认值
const select = await page_query({
  selector: "picker",
  save: true
})
await assert_value({
  refId: select.refId,
  expected: "0" // 默认选中第一项
})
```

### 注意事项

- ⚠️ **仅表单组件**: 仅适用于 input, textarea, picker 等表单组件
- 💡 **输入后验证**: 通常在 `element_input` 后立即验证
- 💡 **类型转换**: 值始终为字符串类型

---

## assert_attribute

验证元素的 HTML 属性值与预期一致。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `name` | string | ✅ | - | 属性名称 |
| `expected` | string | ✅ | - | 预期属性值 |

### 返回值

```typescript
{
  success: true,
  message: "Attribute \"class\" matches: \"btn primary\"",
  actual: "btn primary"
}
```

### 错误处理

- **属性值不匹配**: `Error: Assertion failed: Attribute "{name}" mismatch. Expected: "{expected}", Actual: "{actual}"`

### 使用示例

```javascript
// 示例 1: 验证 class 属性
const button = await page_query({
  selector: ".submit-btn",
  save: true
})
await assert_attribute({
  refId: button.refId,
  name: "class",
  expected: "submit-btn primary"
})

// 示例 2: 验证自定义属性
const item = await page_query({
  selector: ".product-item",
  save: true
})
await assert_attribute({
  refId: item.refId,
  name: "data-id",
  expected: "12345"
})

// 示例 3: 验证按钮状态
const btn = await page_query({
  selector: ".action-btn",
  save: true
})
// 验证按钮已禁用
await assert_attribute({
  refId: btn.refId,
  name: "disabled",
  expected: "true"
})

// 示例 4: 验证链接目标
const link = await page_query({
  selector: ".external-link",
  save: true
})
await assert_attribute({
  refId: link.refId,
  name: "href",
  expected: "https://example.com"
})
```

### 注意事项

- 💡 **Attribute vs Property**: 属性（attribute）是 HTML 标签上的，属性（property）是 DOM 对象的
- 💡 **字符串类型**: 属性值始终为字符串
- ⚠️ **null 值**: 如果属性不存在，`actual` 为 `null`

---

## assert_property

验证元素的 DOM 属性值与预期一致（支持对象和数组）。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `name` | string | ✅ | - | 属性名称 |
| `expected` | any | ✅ | - | 预期属性值（任意类型） |

### 返回值

```typescript
{
  success: true,
  message: "Property \"checked\" matches",
  actual: true
}
```

### 错误处理

- **属性值不匹配**: `Error: Assertion failed: Property "{name}" mismatch. Expected: {expected}, Actual: {actual}`

### 使用示例

```javascript
// 示例 1: 验证 checkbox 状态
const checkbox = await page_query({
  selector: "checkbox",
  save: true
})
await element_tap({ refId: checkbox.refId })
await assert_property({
  refId: checkbox.refId,
  name: "checked",
  expected: true
})

// 示例 2: 验证 dataset 对象
const item = await page_query({
  selector: ".item",
  save: true
})
await assert_property({
  refId: item.refId,
  name: "dataset",
  expected: { id: "123", type: "product" }
})

// 示例 3: 验证数组属性
const list = await page_query({
  selector: "custom-list",
  save: true
})
await assert_property({
  refId: list.refId,
  name: "items",
  expected: ["item1", "item2", "item3"]
})

// 示例 4: 验证数值属性
const slider = await page_query({
  selector: "slider",
  save: true
})
await assert_property({
  refId: slider.refId,
  name: "value",
  expected: 75
})
```

### 注意事项

- 💡 **JSON 比较**: 使用 JSON.stringify 进行深度比较
- 💡 **类型敏感**: 区分 `"123"` 和 `123`
- 💡 **对象和数组**: 支持复杂数据结构验证

---

## assert_data

验证页面 data 对象或指定路径的数据与预期一致。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `path` | string | ⭐ | - | 数据路径（如 `userInfo.name`），为空验证整个 data |
| `expected` | any | ✅ | - | 预期数据值 |
| `pagePath` | string | ⭐ | currentPage | 页面路径 |

### 返回值

```typescript
{
  success: true,
  message: "Page data at \"userInfo.name\" matches",
  actual: "Alice"
}
```

### 错误处理

- **数据不匹配**: `Error: Assertion failed: Page data at path "{path}" mismatch. Expected: {expected}, Actual: {actual}`

### 使用示例

```javascript
// 示例 1: 验证页面数据字段
await page_set_data({
  data: { count: 10 }
})
await assert_data({
  path: "count",
  expected: 10
})
console.log("✅ 计数器数据正确")

// 示例 2: 验证嵌套数据
await assert_data({
  path: "userInfo.name",
  expected: "Alice"
})
await assert_data({
  path: "userInfo.age",
  expected: 25
})

// 示例 3: 验证整个对象
await assert_data({
  path: "userInfo",
  expected: {
    name: "Alice",
    age: 25,
    isVip: true
  }
})

// 示例 4: 验证数组数据
await assert_data({
  path: "productList",
  expected: [
    { id: 1, name: "商品1" },
    { id: 2, name: "商品2" }
  ]
})

// 示例 5: 验证布尔值
await assert_data({
  path: "isLoading",
  expected: false
})
```

### 注意事项

- 💡 **JSON 比较**: 使用 JSON.stringify 进行深度比较
- 💡 **路径语法**: 使用点号分隔（`a.b.c`）
- 💡 **整个 data**: 不提供 `path` 参数验证整个 data 对象
- ⚠️ **不存在路径**: 路径不存在时 `actual` 为 `undefined`

---

## assert_visible

验证元素是否可见（尺寸非零）。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |

### 返回值

```typescript
{
  success: true,
  message: "Element is visible",
  size: {
    width: 100,
    height: 50
  }
}
```

### 错误处理

- **元素不可见**: `Error: Assertion failed: Element is not visible. Size: {size}`

### 使用示例

```javascript
// 示例 1: 验证元素可见
const button = await page_query({
  selector: ".submit-btn",
  save: true
})
await assert_visible({
  refId: button.refId
})
console.log("✅ 按钮可见")

// 示例 2: 验证动画后的可见性
await element_tap({ refId: showBtn.refId })
await page_wait_for({ timeout: 300 }) // 等待动画
const modal = await page_query({
  selector: ".modal",
  save: true
})
await assert_visible({
  refId: modal.refId
})

// 示例 3: 验证隐藏操作
const tooltip = await page_query({
  selector: ".tooltip",
  save: true
})
await element_tap({ refId: closeBtn.refId })
try {
  await assert_visible({ refId: tooltip.refId })
  console.error("❌ 提示框应该已隐藏")
} catch {
  console.log("✅ 提示框已隐藏")
}

// 示例 4: 获取可见元素尺寸
try {
  const result = await assert_visible({ refId: el.refId })
  console.log(`元素尺寸: ${result.size.width}x${result.size.height}`)
} catch (error) {
  console.log("元素不可见")
}
```

### 注意事项

- 💡 **尺寸判断**: 宽度或高度为 0 即认为不可见
- ⚠️ **display: none**: 元素设置为 display: none 时尺寸为 0
- ⚠️ **不验证 z-index**: 不检查元素是否被其他元素遮挡
- 💡 **透明度**: opacity: 0 的元素仍可能有尺寸（取决于布局）

---

## 完整示例：登录表单测试

```javascript
// 场景：完整的登录表单自动化测试
async function testLoginForm() {
  try {
    // 1. 启动并导航
    await miniprogram_launch({
      projectPath: "/path/to/project"
    })
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/login/login"
    })

    // 2. 验证页面元素存在
    await assert_exists({ selector: "#username" })
    await assert_exists({ selector: "#password" })
    await assert_exists({ selector: ".submit-btn" })
    console.log("✅ 页面元素完整")

    // 3. 查询表单元素
    const username = await page_query({
      selector: "#username",
      save: true
    })
    const password = await page_query({
      selector: "#password",
      save: true
    })
    const submitBtn = await page_query({
      selector: ".submit-btn",
      save: true
    })

    // 4. 验证初始状态
    await assert_value({
      refId: username.refId,
      expected: ""
    })
    await assert_visible({
      refId: submitBtn.refId
    })
    console.log("✅ 初始状态正确")

    // 5. 填写表单
    await element_input({
      refId: username.refId,
      value: "testuser"
    })
    await element_input({
      refId: password.refId,
      value: "password123"
    })

    // 6. 验证输入值
    await assert_value({
      refId: username.refId,
      expected: "testuser"
    })
    await assert_value({
      refId: password.refId,
      expected: "password123"
    })
    console.log("✅ 表单数据填写正确")

    // 7. 提交表单
    await element_tap({ refId: submitBtn.refId })

    // 8. 验证加载状态
    await page_wait_for({
      selector: ".loading",
      timeout: 500
    })
    await assert_exists({ selector: ".loading" })
    console.log("✅ 加载中")

    // 9. 等待并验证成功状态
    await page_wait_for({
      selector: ".success-toast",
      timeout: 3000
    })
    await assert_exists({ selector: ".success-toast" })
    await assert_not_exists({ selector: ".loading" })

    const toast = await page_query({
      selector: ".success-toast .message",
      save: true
    })
    await assert_text_contains({
      refId: toast.refId,
      expected: "登录成功"
    })
    console.log("✅ 登录成功")

    // 10. 验证页面跳转
    await page_wait_for({ timeout: 1000 })
    const pageStack = await miniprogram_get_page_stack()
    const currentPage = pageStack.pages[pageStack.pages.length - 1]
    if (currentPage.path === "pages/home/index") {
      console.log("✅ 已跳转到首页")
    }

    // 11. 验证登录后的数据
    await assert_data({
      path: "userInfo.username",
      expected: "testuser"
    })
    await assert_data({
      path: "isLoggedIn",
      expected: true
    })
    console.log("✅ 用户数据正确")

    console.log("✅ 所有测试通过")

  } catch (error) {
    console.error("❌ 测试失败:", error.message)
    await miniprogram_screenshot({
      filename: "test-failure.png"
    })
    throw error
  } finally {
    await miniprogram_close()
  }
}

testLoginForm()
```

---

## 故障排除

### 问题 1: 断言失败但元素确实存在

**错误**: `Assertion failed: Element not found`

**可能原因**:
1. 元素尚未渲染完成
2. 选择器错误
3. 页面路径不正确

**解决方案**:
```javascript
// ❌ 错误：元素还在加载中
await element_tap({ refId: btn.refId })
await assert_exists({ selector: ".result" }) // 可能失败

// ✅ 正确：等待元素出现
await element_tap({ refId: btn.refId })
await page_wait_for({
  selector: ".result",
  timeout: 2000
})
await assert_exists({ selector: ".result" })
```

### 问题 2: 文本断言失败但看起来一样

**错误**: `Text mismatch. Expected: "Hello", Actual: "Hello "`

**可能原因**:
1. 包含不可见空白字符
2. 大小写不匹配
3. 换行符差异

**解决方案**:
```javascript
// 使用 assert_text_contains 降低严格度
await assert_text_contains({
  refId: el.refId,
  expected: "Hello"
})

// 或者先 trim 处理
const text = await element_get_text({ refId: el.refId })
await assert_text({
  refId: el.refId,
  expected: text.text.trim()
})
```

### 问题 3: 数据断言失败但数据正确

**错误**: `Page data mismatch`

**可能原因**:
1. 数据类型不匹配（`"10"` vs `10`）
2. 对象属性顺序不同
3. 额外的 undefined 字段

**解决方案**:
```javascript
// 使用 page_get_data 先查看实际数据
const actual = await page_get_data({ path: "count" })
console.log("实际数据:", actual.data, typeof actual.data)

// 确保类型匹配
await assert_data({
  path: "count",
  expected: 10  // number, not "10"
})
```

---

## 最佳实践

### 1. 断言顺序

```javascript
// ✅ 推荐：先验证存在，再验证内容
await assert_exists({ selector: ".message" })
const el = await page_query({ selector: ".message", save: true })
await assert_text({ refId: el.refId, expected: "Success" })

// ❌ 不推荐：直接验证内容（可能因元素不存在而失败）
const el = await page_query({ selector: ".message", save: true })
await assert_text({ refId: el.refId, expected: "Success" })
```

### 2. 等待 + 断言

```javascript
// ✅ 推荐：先等待再断言
await page_wait_for({ selector: ".result", timeout: 2000 })
await assert_exists({ selector: ".result" })

// ❌ 不推荐：仅断言（可能因异步操作失败）
await assert_exists({ selector: ".result" })
```

### 3. 使用合适的断言

```javascript
// 动态内容：使用 contains
await assert_text_contains({
  refId: timestamp.refId,
  expected: "2025"
})

// 静态内容：使用精确匹配
await assert_text({
  refId: title.refId,
  expected: "商品详情"
})
```

### 4. 错误处理

```javascript
// ✅ 推荐：捕获断言错误并截图
try {
  await assert_exists({ selector: ".success" })
} catch (error) {
  await miniprogram_screenshot({
    filename: "assertion-failure.png"
  })
  console.error("断言失败:", error.message)
  throw error
}
```

---

**相关文档**:
- [Page API](./page.md) - 页面操作和数据访问
- [Element API](./element.md) - 元素交互
- [Snapshot API](./snapshot.md) - 状态捕获
- [使用示例](../../examples/03-assertion-testing.md) - 断言测试示例

**最后更新**: 2025-10-02
