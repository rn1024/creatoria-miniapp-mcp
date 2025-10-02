# Page API

> Page 工具提供页面级别的元素查询、数据操作和方法调用功能，是自动化测试的核心模块。

## 工具列表

| 工具名称 | 描述 | 主要用途 |
|---------|------|----------|
| `page_query` | 查询单个元素 | 元素定位和引用缓存 |
| `page_query_all` | 查询所有匹配元素 | 批量元素操作 |
| `page_wait_for` | 等待元素或条件 | 异步操作同步化 |
| `page_get_data` | 获取页面 data | 状态验证 |
| `page_set_data` | 设置页面 data | 数据模拟 |
| `page_call_method` | 调用页面方法 | 页面逻辑触发 |
| `page_get_size` | 获取页面尺寸 | 布局验证 |
| `page_get_scroll_top` | 获取滚动位置 | 滚动状态检查 |

---

## page_query

查询单个符合条件的元素，支持元素引用缓存（refId）以提高性能。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `selector` | string | ✅ | - | CSS 选择器（如 `.btn`, `#input-username`） |
| `pagePath` | string | ⭐ | currentPage | 页面路径（默认当前页面） |
| `save` | boolean | ⭐ | false | 是否缓存元素引用（推荐设为 true） |

### 返回值

```typescript
{
  success: true,
  message: "Element found",
  refId: "elem_abc123",        // 元素引用 ID（如果 save: true）
  selector: ".btn",             // 原始选择器
  pagePath: "/pages/index/index"
}
```

### 错误处理

- **未连接**: `Error: Mini program not connected. Call miniprogram_launch or miniprogram_connect first.`
- **元素不存在**: `Error: Element not found: {selector}`
- **选择器无效**: `Error: Invalid selector: {selector}`

### 使用示例

```javascript
// 示例 1: 基础查询（不缓存）
const result = await page_query({
  selector: ".submit-btn"
})
console.log(result.message) // "Element found"

// 示例 2: 查询并缓存引用（推荐）
const result = await page_query({
  selector: ".product-item",
  save: true
})
// 后续可以使用 refId 操作元素，避免重复查询
await element_tap({ refId: result.refId })
await element_get_text({ refId: result.refId })

// 示例 3: 查询指定页面的元素
const result = await page_query({
  selector: "#username-input",
  pagePath: "/pages/login/login",
  save: true
})

// 示例 4: 组合选择器
const result = await page_query({
  selector: ".product-list .item:first-child .title",
  save: true
})

// 示例 5: 查询后立即操作
const btn = await page_query({
  selector: ".delete-btn",
  save: true
})
await element_tap({ refId: btn.refId })
await assert_exists({ selector: ".success-toast" })
```

### 注意事项

- 💡 **推荐做法**: 始终使用 `save: true` 缓存元素引用，避免重复查询
- ⚠️ **选择器规则**: 遵循小程序 CSS 选择器规范（不支持伪元素）
- 💡 **性能优化**: refId 有效期为会话周期（30 分钟），自动清理
- ⚠️ **多元素匹配**: 如果选择器匹配多个元素，返回第一个匹配项

### 相关工具

- [`page_query_all`](#page_query_all) - 查询所有匹配元素
- [`element_tap`](./element.md#element_tap) - 点击查询到的元素
- [`element_get_text`](./element.md#element_get_text) - 获取元素文本

---

## page_query_all

查询所有符合条件的元素，返回元素数组。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `selector` | string | ✅ | - | CSS 选择器 |
| `pagePath` | string | ⭐ | currentPage | 页面路径（默认当前页面） |
| `save` | boolean | ⭐ | false | 是否缓存所有元素引用 |

### 返回值

```typescript
{
  success: true,
  message: "Found 5 elements",
  elements: [
    { refId: "elem_001", selector: ".item", index: 0 },
    { refId: "elem_002", selector: ".item", index: 1 },
    { refId: "elem_003", selector: ".item", index: 2 },
    { refId: "elem_004", selector: ".item", index: 3 },
    { refId: "elem_005", selector: ".item", index: 4 }
  ],
  count: 5,
  pagePath: "/pages/list/list"
}
```

### 错误处理

- **未连接**: `Error: Mini program not connected`
- **无匹配元素**: 返回空数组（不报错）

### 使用示例

```javascript
// 示例 1: 查询所有商品项
const result = await page_query_all({
  selector: ".product-item",
  save: true
})
console.log(`找到 ${result.count} 个商品`) // "找到 10 个商品"

// 示例 2: 批量操作元素
const items = await page_query_all({
  selector: ".checkbox",
  save: true
})
// 全选所有复选框
for (const item of items.elements) {
  await element_tap({ refId: item.refId })
}

// 示例 3: 获取列表文本
const items = await page_query_all({
  selector: ".todo-item .title",
  save: true
})
const titles = []
for (const item of items.elements) {
  const text = await element_get_text({ refId: item.refId })
  titles.push(text.text)
}
console.log("待办事项:", titles)

// 示例 4: 验证列表数量
const result = await page_query_all({
  selector: ".comment-item"
})
if (result.count < 5) {
  throw new Error("评论数量不足")
}

// 示例 5: 操作特定索引的元素
const items = await page_query_all({
  selector: ".product-item",
  save: true
})
// 点击第 3 个商品
await element_tap({ refId: items.elements[2].refId })
```

### 注意事项

- 💡 **空结果**: 如果没有匹配元素，返回空数组（`count: 0`），不报错
- 💡 **索引访问**: `elements` 数组包含 `index` 字段，方便定位
- ⚠️ **性能考虑**: 大量元素（>100）建议不使用 `save: true`，避免内存占用

### 相关工具

- [`page_query`](#page_query) - 查询单个元素
- [`assert_exists`](./assert.md#assert_exists) - 验证元素存在

---

## page_wait_for

等待元素出现、消失或指定时间，用于异步操作同步化。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `selector` | string | ⭐ | - | 等待出现的元素选择器 |
| `timeout` | number | ⭐ | - | 等待时间（毫秒） |
| `pagePath` | string | ⭐ | currentPage | 页面路径 |

### 返回值

```typescript
// 等待元素出现
{
  success: true,
  message: "Element appeared",
  selector: ".success-toast",
  waitedTime: 1234  // 实际等待时间（毫秒）
}

// 等待指定时间
{
  success: true,
  message: "Waited for 2000ms",
  timeout: 2000
}
```

### 错误处理

- **超时**: `Error: Timeout waiting for element: {selector}`
- **参数错误**: `Error: Must provide either selector or timeout`

### 使用示例

```javascript
// 示例 1: 等待加载完成
await element_tap({ selector: ".load-more-btn" })
await page_wait_for({
  selector: ".loading-indicator",
  timeout: 5000
})
console.log("加载完成")

// 示例 2: 等待提示消息出现
await element_tap({ selector: ".submit-btn" })
await page_wait_for({
  selector: ".success-toast",
  timeout: 3000
})

// 示例 3: 等待固定时间（动画播放）
await element_tap({ selector: ".modal-close" })
await page_wait_for({ timeout: 500 }) // 等待关闭动画

// 示例 4: 等待页面跳转后的元素
await miniprogram_navigate({
  method: "navigateTo",
  url: "/pages/detail/detail"
})
await page_wait_for({
  selector: ".detail-content",
  timeout: 2000
})

// 示例 5: 错误处理
try {
  await page_wait_for({
    selector: ".non-existent",
    timeout: 1000
  })
} catch (error) {
  console.log("元素未出现，继续其他操作")
}
```

### 注意事项

- ⚠️ **必需参数**: 必须提供 `selector` 或 `timeout` 之一
- 💡 **超时设置**: 建议根据实际场景设置合理超时（网络请求 5s+，动画 1s-）
- 💡 **性能优化**: 使用 `selector` 等待比定时等待更精确
- ⚠️ **等待消失**: 当前版本不支持等待元素消失，请使用 `assert_not_exists`

### 相关工具

- [`assert_exists`](./assert.md#assert_exists) - 验证元素存在
- [`assert_not_exists`](./assert.md#assert_not_exists) - 验证元素不存在

---

## page_get_data

获取页面 `data` 对象或指定路径的数据。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `path` | string | ⭐ | - | 数据路径（如 `userInfo.name`），为空返回整个 data |
| `pagePath` | string | ⭐ | currentPage | 页面路径 |

### 返回值

```typescript
// 获取整个 data
{
  success: true,
  message: "Retrieved page data",
  data: {
    userInfo: { name: "Alice", age: 25 },
    productList: [...],
    isLoading: false
  }
}

// 获取指定路径
{
  success: true,
  message: "Retrieved page data at path: userInfo.name",
  data: "Alice",
  path: "userInfo.name"
}
```

### 错误处理

- **未连接**: `Error: Mini program not connected`
- **路径不存在**: 返回 `undefined`（不报错）

### 使用示例

```javascript
// 示例 1: 获取整个 data
const result = await page_get_data()
console.log("页面数据:", result.data)

// 示例 2: 获取用户信息
const result = await page_get_data({
  path: "userInfo"
})
console.log("用户名:", result.data.name)

// 示例 3: 获取嵌套属性
const result = await page_get_data({
  path: "userInfo.settings.theme"
})
console.log("主题:", result.data) // "dark"

// 示例 4: 获取数组长度
const result = await page_get_data({
  path: "productList"
})
console.log(`共 ${result.data.length} 个商品`)

// 示例 5: 验证数据状态
const result = await page_get_data({
  path: "isLoading"
})
if (result.data === true) {
  await page_wait_for({ timeout: 2000 })
}
```

### 注意事项

- 💡 **路径语法**: 使用点号分隔（`a.b.c`），支持嵌套对象和数组
- ⚠️ **不存在路径**: 返回 `undefined`，不报错
- 💡 **调试技巧**: 先获取整个 data 查看结构，再获取具体路径
- 💡 **性能**: 获取整个 data 开销较大，建议指定路径

### 相关工具

- [`page_set_data`](#page_set_data) - 设置页面数据
- [`assert_data`](./assert.md#assert_data) - 验证页面数据

---

## page_set_data

设置页面 `data` 对象的值，用于数据模拟和状态注入。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `data` | object | ✅ | - | 要设置的数据对象（支持路径语法） |
| `pagePath` | string | ⭐ | currentPage | 页面路径 |

### 返回值

```typescript
{
  success: true,
  message: "Page data set successfully",
  data: {
    "userInfo.name": "Bob",
    "isVip": true
  }
}
```

### 错误处理

- **未连接**: `Error: Mini program not connected`
- **参数错误**: `Error: data is required and must be an object`

### 使用示例

```javascript
// 示例 1: 设置单个属性
await page_set_data({
  data: { isLoading: false }
})

// 示例 2: 设置嵌套属性（路径语法）
await page_set_data({
  data: {
    "userInfo.name": "Bob",
    "userInfo.age": 30
  }
})

// 示例 3: 模拟登录状态
await page_set_data({
  data: {
    isLoggedIn: true,
    userInfo: {
      id: 12345,
      name: "测试用户",
      avatar: "https://example.com/avatar.png"
    }
  }
})

// 示例 4: 模拟数据加载完成
await page_set_data({
  data: {
    isLoading: false,
    productList: [
      { id: 1, name: "商品 1", price: 99 },
      { id: 2, name: "商品 2", price: 199 }
    ]
  }
})

// 示例 5: 触发视图更新后验证
await page_set_data({
  data: { count: 10 }
})
const result = await element_get_text({
  selector: ".count-display"
})
console.log(result.text) // "10"
```

### 注意事项

- 💡 **路径语法**: 使用 `"a.b.c"` 修改嵌套属性，无需修改整个对象
- ⚠️ **视图更新**: setData 会触发页面视图更新（与小程序原生行为一致）
- 💡 **数据覆盖**: 只覆盖指定路径的数据，不影响其他属性
- ⚠️ **类型检查**: 不会校验数据类型，请确保数据格式正确

### 相关工具

- [`page_get_data`](#page_get_data) - 获取页面数据
- [`assert_data`](./assert.md#assert_data) - 验证数据设置结果

---

## page_call_method

调用页面中定义的方法（Page 对象的方法）。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `method` | string | ✅ | - | 方法名 |
| `args` | any[] | ⭐ | [] | 方法参数数组 |
| `pagePath` | string | ⭐ | currentPage | 页面路径 |

### 返回值

```typescript
{
  success: true,
  message: "Method called: onRefresh",
  method: "onRefresh",
  result: { success: true, data: [...] }  // 方法返回值
}
```

### 错误处理

- **未连接**: `Error: Mini program not connected`
- **方法不存在**: `Error: Method not found: {method}`
- **方法错误**: 返回方法抛出的错误

### 使用示例

```javascript
// 示例 1: 调用无参数方法
await page_call_method({
  method: "onRefresh"
})

// 示例 2: 调用带参数方法
await page_call_method({
  method: "addToCart",
  args: [{ productId: 123, quantity: 2 }]
})

// 示例 3: 获取方法返回值
const result = await page_call_method({
  method: "calculateTotal"
})
console.log("总价:", result.result)

// 示例 4: 调用多参数方法
await page_call_method({
  method: "updateProduct",
  args: [123, "新商品名", 299]
})

// 示例 5: 调用页面生命周期方法
await page_call_method({
  method: "onPullDownRefresh"
})
// 等待刷新完成
await page_wait_for({ timeout: 2000 })
await page_call_method({
  method: "onReachBottom"
})
```

### 注意事项

- ⚠️ **方法定义**: 只能调用 Page() 中定义的方法，不能调用生命周期钩子外的函数
- 💡 **参数传递**: 使用数组传递多个参数（`args: [arg1, arg2, arg3]`）
- 💡 **异步方法**: 如果方法返回 Promise，会等待 Promise resolve
- ⚠️ **错误处理**: 方法内部错误会被捕获并抛出

### 相关工具

- [`miniprogram_evaluate`](./miniprogram.md#miniprogram_evaluate) - 执行任意 JavaScript 代码
- [`page_get_data`](#page_get_data) - 获取方法执行后的数据变化

---

## page_get_size

获取页面的宽度和高度（视口尺寸）。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `pagePath` | string | ⭐ | currentPage | 页面路径 |

### 返回值

```typescript
{
  success: true,
  message: "Retrieved page size",
  size: {
    width: 375,   // 页面宽度（px）
    height: 667   // 页面高度（px）
  }
}
```

### 错误处理

- **未连接**: `Error: Mini program not connected`

### 使用示例

```javascript
// 示例 1: 获取当前页面尺寸
const result = await page_get_size()
console.log(`页面尺寸: ${result.size.width}x${result.size.height}`)

// 示例 2: 验证布局适配
const { size } = await page_get_size()
if (size.width < 375) {
  console.warn("页面宽度小于 iPhone SE，可能存在布局问题")
}

// 示例 3: 计算滚动范围
const { size } = await page_get_size()
const scrollTop = await page_get_scroll_top()
const maxScroll = size.height * 2  // 假设页面高度为 2 倍视口
if (scrollTop.scrollTop < maxScroll) {
  await element_scroll({ selector: "page", distance: 100 })
}

// 示例 4: 获取指定页面尺寸
const result = await page_get_size({
  pagePath: "/pages/detail/detail"
})
```

### 注意事项

- 💡 **单位**: 返回值单位为物理像素（px），非 rpx
- 💡 **视口尺寸**: 返回的是视口尺寸，不是页面内容实际高度
- ⚠️ **动态变化**: 屏幕旋转或窗口大小改变时尺寸会变化

### 相关工具

- [`miniprogram_get_system_info`](./miniprogram.md#miniprogram_get_system_info) - 获取设备信息（含屏幕尺寸）
- [`element_get_size`](./element.md#element_get_size) - 获取元素尺寸

---

## page_get_scroll_top

获取页面当前的滚动位置（垂直方向）。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `pagePath` | string | ⭐ | currentPage | 页面路径 |

### 返回值

```typescript
{
  success: true,
  message: "Retrieved scroll position",
  scrollTop: 320  // 滚动距离（px）
}
```

### 错误处理

- **未连接**: `Error: Mini program not connected`

### 使用示例

```javascript
// 示例 1: 获取当前滚动位置
const result = await page_get_scroll_top()
console.log(`当前滚动: ${result.scrollTop}px`)

// 示例 2: 验证滚动到底部
const { scrollTop } = await page_get_scroll_top()
const { size } = await page_get_size()
const isBottom = scrollTop + size.height >= 1200  // 假设页面总高度 1200px
if (isBottom) {
  console.log("已滚动到底部")
}

// 示例 3: 验证滚动操作
const before = await page_get_scroll_top()
await element_scroll({
  selector: "page",
  distance: 200
})
const after = await page_get_scroll_top()
console.log(`滚动了 ${after.scrollTop - before.scrollTop}px`)

// 示例 4: 等待滚动完成
await element_scroll_to({
  selector: "page",
  top: 500
})
await page_wait_for({ timeout: 300 })
const { scrollTop } = await page_get_scroll_top()
if (Math.abs(scrollTop - 500) < 5) {
  console.log("滚动到位")
}
```

### 注意事项

- 💡 **单位**: 返回值单位为物理像素（px）
- 💡 **初始值**: 页面未滚动时 `scrollTop` 为 0
- ⚠️ **精度**: 滚动动画可能导致实际值与预期有 1-2px 偏差
- 💡 **仅垂直**: 当前仅支持垂直滚动，不支持水平滚动

### 相关工具

- [`element_scroll`](./element.md#element_scroll) - 滚动元素
- [`element_scroll_to`](./element.md#element_scroll_to) - 滚动到指定位置
- [`page_get_size`](#page_get_size) - 获取页面尺寸

---

## 完整示例：页面数据操作和验证

```javascript
// 场景：测试商品列表页的数据加载和交互
async function testProductList() {
  try {
    // 1. 启动小程序并导航
    await miniprogram_launch({
      projectPath: "/path/to/project"
    })
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/product/list"
    })

    // 2. 等待数据加载完成
    await page_wait_for({
      selector: ".product-item",
      timeout: 5000
    })

    // 3. 验证初始数据状态
    const data = await page_get_data({
      path: "productList"
    })
    console.log(`✅ 加载了 ${data.data.length} 个商品`)

    // 4. 模拟数据注入（测试空状态）
    await page_set_data({
      data: {
        productList: [],
        isEmpty: true
      }
    })
    await assert_exists({ selector: ".empty-state" })
    console.log("✅ 空状态显示正确")

    // 5. 恢复数据并查询所有商品
    await page_call_method({
      method: "loadProducts"
    })
    await page_wait_for({ timeout: 1000 })

    const items = await page_query_all({
      selector: ".product-item",
      save: true
    })
    console.log(`✅ 找到 ${items.count} 个商品项`)

    // 6. 点击第一个商品
    await element_tap({
      refId: items.elements[0].refId
    })
    await page_wait_for({
      selector: ".product-detail",
      timeout: 2000
    })
    console.log("✅ 成功进入商品详情页")

    // 7. 验证页面滚动
    const { size } = await page_get_size()
    console.log(`✅ 详情页尺寸: ${size.width}x${size.height}`)

    await element_scroll({
      selector: "page",
      distance: 300
    })
    const { scrollTop } = await page_get_scroll_top()
    console.log(`✅ 滚动位置: ${scrollTop}px`)

    // 8. 清理
    await miniprogram_close()
    console.log("✅ 测试完成")

  } catch (error) {
    console.error("❌ 测试失败:", error.message)
    await miniprogram_screenshot({
      filename: "test-error.png"
    })
    throw error
  }
}

testProductList()
```

---

## 故障排除

### 问题 1: 元素查询失败

**错误**: `Element not found: .my-selector`

**解决方案**:
1. 检查选择器语法是否正确（使用浏览器 DevTools 验证）
2. 确认元素是否已渲染（使用 `page_wait_for` 等待）
3. 检查页面路径是否正确（`pagePath` 参数）
4. 使用 `page_get_data` 检查数据是否已加载

```javascript
// ❌ 错误：元素未渲染完成
await page_query({ selector: ".async-content" })

// ✅ 正确：等待元素出现
await page_wait_for({
  selector: ".async-content",
  timeout: 3000
})
const result = await page_query({
  selector: ".async-content",
  save: true
})
```

### 问题 2: page_set_data 不生效

**错误**: 设置数据后页面未更新

**解决方案**:
1. 检查路径语法是否正确（嵌套属性用 `"a.b.c"`）
2. 确认页面是否有对应的数据字段
3. 使用 `page_get_data` 验证设置是否成功
4. 检查页面是否有 setData 监听器覆盖了值

```javascript
// ❌ 错误：路径语法错误
await page_set_data({
  data: { userInfo: { name: "Bob" } }  // 会覆盖整个 userInfo
})

// ✅ 正确：使用路径语法
await page_set_data({
  data: { "userInfo.name": "Bob" }  // 只修改 name 字段
})

// 验证设置结果
const result = await page_get_data({ path: "userInfo.name" })
console.log(result.data)  // "Bob"
```

### 问题 3: page_call_method 方法不存在

**错误**: `Method not found: myMethod`

**解决方案**:
1. 确认方法是在 `Page()` 中定义的，不是外部函数
2. 检查方法名是否拼写正确（区分大小写）
3. 使用 `miniprogram_evaluate` 查看页面对象结构

```javascript
// 检查页面可用方法
const result = await miniprogram_evaluate({
  expression: "Object.keys(getCurrentPages()[0])"
})
console.log("可用方法:", result.result)

// 调用确认存在的方法
await page_call_method({
  method: "onPullDownRefresh"
})
```

---

## 技术细节

### 元素引用缓存机制

- **refId 生成**: `elem_${timestamp}_${random}`
- **缓存有效期**: 会话周期（30 分钟不活动自动清理）
- **缓存容量**: 无限制（建议单会话 < 1000 个）
- **清理时机**:
  - 会话超时自动清理
  - `miniprogram_close()` 清理
  - `miniprogram_disconnect()` 保留缓存

### 选择器支持

- **支持**: 类选择器（`.class`）、ID 选择器（`#id`）、标签选择器（`view`）、属性选择器（`[attr="value"]`）、组合选择器（`.a .b`、`.a > .b`）
- **不支持**: 伪类（`:hover`）、伪元素（`::before`）、CSS4 选择器

### 数据路径语法

```javascript
// 支持的路径格式
"a"           // 单层属性
"a.b"         // 嵌套属性
"a.b.c"       // 多层嵌套
"a[0]"        // 数组索引
"a[0].b"      // 数组元素的属性
"a.b[1].c"    // 复杂嵌套
```

---

**相关文档**:
- [MiniProgram API](./miniprogram.md) - 小程序级别操作
- [Element API](./element.md) - 元素交互操作
- [Assert API](./assert.md) - 断言验证
- [使用示例](../../examples/02-form-interaction.md) - 表单交互示例

**最后更新**: 2025-10-02
