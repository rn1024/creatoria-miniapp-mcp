# Element API

> Element 工具提供元素级别的交互操作、属性获取和组件特定功能，是自动化测试的核心执行层。

## 工具列表

### 基础交互（3 个工具）

| 工具名称 | 描述 | 主要用途 |
|---------|------|----------|
| `element_tap` | 点击元素 | 按钮点击、链接跳转 |
| `element_longpress` | 长按元素 | 长按菜单触发 |
| `element_input` | 输入文本 | 表单填写 |

### 获取信息（7 个工具）

| 工具名称 | 描述 | 主要用途 |
|---------|------|----------|
| `element_get_text` | 获取文本内容 | 文本验证 |
| `element_get_value` | 获取输入框值 | 表单数据验证 |
| `element_get_attribute` | 获取 HTML 属性 | 属性检查 |
| `element_get_property` | 获取 DOM 属性 | 属性对象访问 |
| `element_get_style` | 获取样式值 | 样式验证 |
| `element_get_size` | 获取元素尺寸 | 布局验证 |
| `element_get_offset` | 获取元素偏移 | 位置验证 |

### 触摸事件（4 个工具）

| 工具名称 | 描述 | 主要用途 |
|---------|------|----------|
| `element_touchstart` | 触摸开始 | 自定义手势起始 |
| `element_touchmove` | 触摸移动 | 拖动、滑动操作 |
| `element_touchend` | 触摸结束 | 手势完成 |
| `element_trigger` | 触发事件 | 自定义事件模拟 |

### 滚动操作（3 个工具 - ScrollView）

| 工具名称 | 描述 | 主要用途 |
|---------|------|----------|
| `element_scroll_to` | 滚动到指定位置 | 定位滚动 |
| `element_scroll_width` | 获取滚动宽度 | 横向滚动范围检查 |
| `element_scroll_height` | 获取滚动高度 | 纵向滚动范围检查 |

### 组件特定操作（6 个工具）

| 工具名称 | 描述 | 组件类型 |
|---------|------|----------|
| `element_swipe_to` | 滑动到指定索引 | Swiper |
| `element_move_to` | 移动到指定位置 | MovableView |
| `element_slide_to` | 滑动到指定值 | Slider |
| `element_call_context_method` | 调用上下文方法 | ContextElement |
| `element_set_data` | 设置自定义组件数据 | CustomElement |
| `element_call_method` | 调用自定义组件方法 | CustomElement |

---

## 基础交互

### element_tap

点击元素（模拟用户点击操作）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（来自 `page_query`） |

#### 返回值

```typescript
{
  success: true,
  message: "Element tapped: elem_abc123"
}
```

#### 错误处理

- **元素不存在**: `Error: Element not found with refId: {refId}. Use page_query to get element reference first.`
- **点击失败**: `Error: Tap failed: {reason}`

#### 使用示例

```javascript
// 示例 1: 点击按钮
const btn = await page_query({
  selector: ".submit-btn",
  save: true
})
await element_tap({ refId: btn.refId })

// 示例 2: 点击列表项
const items = await page_query_all({
  selector: ".product-item",
  save: true
})
// 点击第 3 个商品
await element_tap({ refId: items.elements[2].refId })

// 示例 3: 点击后验证跳转
await element_tap({ refId: btn.refId })
await page_wait_for({
  selector: ".detail-page",
  timeout: 2000
})

// 示例 4: 连续点击
await element_tap({ refId: plusBtn.refId }) // 数量 +1
await element_tap({ refId: plusBtn.refId }) // 数量 +2
const count = await element_get_text({ refId: countDisplay.refId })
console.log(count.text) // "2"
```

#### 注意事项

- 💡 **必需引用**: 必须先使用 `page_query` 获取元素引用
- 💡 **等待渲染**: 确保元素已渲染完成，否则使用 `page_wait_for`
- ⚠️ **事件触发**: 会触发小程序的 tap 事件和相关生命周期

#### 相关工具

- [`element_longpress`](#element_longpress) - 长按元素
- [`page_query`](./page.md#page_query) - 查询元素获取 refId

---

### element_longpress

长按元素（模拟用户长按操作）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |

#### 返回值

```typescript
{
  success: true,
  message: "Element long pressed: elem_abc123"
}
```

#### 使用示例

```javascript
// 示例 1: 长按触发菜单
const item = await page_query({
  selector: ".message-item",
  save: true
})
await element_longpress({ refId: item.refId })
await page_wait_for({
  selector: ".context-menu",
  timeout: 1000
})

// 示例 2: 长按删除
await element_longpress({ refId: item.refId })
await element_tap({ selector: ".delete-btn" })
await assert_not_exists({ selector: ".message-item" })
```

#### 注意事项

- 💡 **长按时长**: 默认长按时长由小程序组件决定（通常 350ms）
- ⚠️ **事件触发**: 会触发 longpress 事件，不会触发 tap 事件

---

### element_input

向输入框或文本域输入文本。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `value` | string | ✅ | - | 要输入的文本内容 |

#### 返回值

```typescript
{
  success: true,
  message: "Text input to element: elem_abc123"
}
```

#### 错误处理

- **元素不可输入**: `Error: Input failed: Element is not an input or textarea`

#### 使用示例

```javascript
// 示例 1: 表单填写
const username = await page_query({
  selector: "#username",
  save: true
})
const password = await page_query({
  selector: "#password",
  save: true
})

await element_input({
  refId: username.refId,
  value: "testuser"
})
await element_input({
  refId: password.refId,
  value: "password123"
})

await element_tap({ selector: ".login-btn" })

// 示例 2: 搜索操作
const searchInput = await page_query({
  selector: ".search-input",
  save: true
})
await element_input({
  refId: searchInput.refId,
  value: "iPhone 15"
})
await element_tap({ selector: ".search-btn" })

// 示例 3: 覆盖已有内容
// 注意：element_input 会覆盖原有内容，不是追加
await element_input({
  refId: input.refId,
  value: "新内容"
})

// 示例 4: 输入后验证
await element_input({
  refId: input.refId,
  value: "测试文本"
})
const result = await element_get_value({ refId: input.refId })
console.log(result.value) // "测试文本"
```

#### 注意事项

- ⚠️ **仅限输入组件**: 仅适用于 `input` 和 `textarea` 组件
- 💡 **覆盖内容**: 会覆盖原有内容，不是追加
- 💡 **触发事件**: 会触发 input 和 change 事件

---

## 获取信息

### element_get_text

获取元素的文本内容（innerText）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |

#### 返回值

```typescript
{
  success: true,
  message: "Element text retrieved",
  text: "Hello World"
}
```

#### 使用示例

```javascript
// 示例 1: 获取标题文本
const title = await page_query({
  selector: ".page-title",
  save: true
})
const result = await element_get_text({ refId: title.refId })
console.log(result.text) // "商品详情"

// 示例 2: 获取列表所有文本
const items = await page_query_all({
  selector: ".item-title",
  save: true
})
const titles = []
for (const item of items.elements) {
  const text = await element_get_text({ refId: item.refId })
  titles.push(text.text)
}
console.log("商品列表:", titles)

// 示例 3: 文本验证
const price = await page_query({
  selector: ".price",
  save: true
})
const result = await element_get_text({ refId: price.refId })
if (result.text.includes("¥")) {
  console.log("价格格式正确")
}

// 示例 4: 获取嵌套文本
const card = await page_query({
  selector: ".user-card",
  save: true
})
const text = await element_get_text({ refId: card.refId })
console.log(text.text) // 包含所有子元素文本
```

#### 注意事项

- 💡 **包含子元素**: 返回的文本包含所有子元素的文本
- 💡 **空白字符**: 可能包含前后空白字符
- ⚠️ **不可见元素**: 即使元素不可见也能获取文本

---

### element_get_value

获取输入框或文本域的当前值。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |

#### 返回值

```typescript
{
  success: true,
  message: "Element value retrieved",
  value: "user input text"
}
```

#### 使用示例

```javascript
// 示例 1: 获取输入框值
const input = await page_query({
  selector: "#email",
  save: true
})
const result = await element_get_value({ refId: input.refId })
console.log("邮箱:", result.value)

// 示例 2: 验证表单数据
await element_input({ refId: username.refId, value: "alice" })
const check = await element_get_value({ refId: username.refId })
if (check.value === "alice") {
  console.log("✅ 输入成功")
}

// 示例 3: 获取初始值
// 未输入时返回空字符串或默认值
const result = await element_get_value({ refId: input.refId })
console.log(result.value) // "" 或默认值
```

#### 注意事项

- ⚠️ **仅限输入组件**: 仅适用于 `input`, `textarea`, `picker` 等表单组件
- 💡 **非文本元素**: 对于非表单元素，使用 `element_get_text`

---

### element_get_attribute

获取元素的 HTML 属性值（attribute）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `name` | string | ✅ | - | 属性名称（如 `class`, `id`, `data-id`） |

#### 返回值

```typescript
{
  success: true,
  message: "Attribute \"class\" retrieved",
  value: "btn primary"
}
```

#### 使用示例

```javascript
// 示例 1: 获取 class 属性
const btn = await page_query({
  selector: ".submit-btn",
  save: true
})
const result = await element_get_attribute({
  refId: btn.refId,
  name: "class"
})
console.log(result.value) // "submit-btn primary"

// 示例 2: 获取自定义属性
const item = await page_query({
  selector: ".product-item",
  save: true
})
const productId = await element_get_attribute({
  refId: item.refId,
  name: "data-id"
})
console.log("商品 ID:", productId.value)

// 示例 3: 检查属性是否存在
const result = await element_get_attribute({
  refId: el.refId,
  name: "disabled"
})
if (result.value !== null) {
  console.log("按钮已禁用")
}
```

#### 注意事项

- 💡 **Attribute vs Property**: 属性（attribute）是 HTML 标签上的，属性（property）是 DOM 对象的
- 💡 **不存在返回 null**: 如果属性不存在，返回 `null`
- 💡 **小程序专有属性**: 支持小程序组件的自定义属性（如 `data-*`）

---

### element_get_property

获取元素的 DOM 属性值（property）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `name` | string | ✅ | - | 属性名称（如 `value`, `checked`, `dataset`） |

#### 返回值

```typescript
{
  success: true,
  message: "Property \"checked\" retrieved",
  value: true  // 可能是任意类型
}
```

#### 使用示例

```javascript
// 示例 1: 获取 checkbox 状态
const checkbox = await page_query({
  selector: "checkbox",
  save: true
})
const result = await element_get_property({
  refId: checkbox.refId,
  name: "checked"
})
console.log("选中状态:", result.value) // true/false

// 示例 2: 获取 dataset
const item = await page_query({
  selector: ".item",
  save: true
})
const dataset = await element_get_property({
  refId: item.refId,
  name: "dataset"
})
console.log("数据集:", dataset.value) // { id: "123", type: "product" }

// 示例 3: 获取 value（property 形式）
const input = await page_query({
  selector: "input",
  save: true
})
const result = await element_get_property({
  refId: input.refId,
  name: "value"
})
console.log(result.value)
```

#### 注意事项

- 💡 **返回类型**: 可能返回任意 JavaScript 类型（string, number, boolean, object, array）
- 💡 **与 attribute 的区别**: property 是 DOM 对象的运行时状态，attribute 是 HTML 标签的静态定义

---

### element_get_style

获取元素的样式值。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `name` | string | ✅ | - | 样式属性名（如 `color`, `fontSize`, `display`） |

#### 返回值

```typescript
{
  success: true,
  message: "Style \"color\" retrieved",
  value: "rgb(255, 0, 0)"
}
```

#### 使用示例

```javascript
// 示例 1: 获取颜色
const title = await page_query({
  selector: ".title",
  save: true
})
const color = await element_get_style({
  refId: title.refId,
  name: "color"
})
console.log("标题颜色:", color.value) // "rgb(255, 0, 0)"

// 示例 2: 检查显示状态
const modal = await page_query({
  selector: ".modal",
  save: true
})
const display = await element_get_style({
  refId: modal.refId,
  name: "display"
})
if (display.value === "none") {
  console.log("模态框已隐藏")
}

// 示例 3: 获取字体大小
const fontSize = await element_get_style({
  refId: el.refId,
  name: "fontSize"
})
console.log(fontSize.value) // "16px"
```

#### 注意事项

- 💡 **计算样式**: 返回的是计算后的样式值，包含继承和默认值
- 💡 **单位**: 数值类型样式会包含单位（如 `16px`, `1.5em`）
- ⚠️ **驼峰命名**: 使用 JavaScript 驼峰命名（`fontSize` 而非 `font-size`）

---

### element_get_size

获取元素的宽度和高度（尺寸）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |

#### 返回值

```typescript
{
  success: true,
  message: "Element size retrieved",
  size: {
    width: 375,   // 宽度（px）
    height: 50    // 高度（px）
  }
}
```

#### 使用示例

```javascript
// 示例 1: 获取按钮尺寸
const btn = await page_query({
  selector: ".submit-btn",
  save: true
})
const size = await element_get_size({ refId: btn.refId })
console.log(`按钮尺寸: ${size.size.width}x${size.size.height}`)

// 示例 2: 验证布局
const card = await page_query({
  selector: ".card",
  save: true
})
const { size } = await element_get_size({ refId: card.refId })
if (size.width < 300) {
  console.warn("卡片宽度不足")
}

// 示例 3: 计算宽高比
const image = await page_query({
  selector: ".product-image",
  save: true
})
const { size } = await element_get_size({ refId: image.refId })
const ratio = size.width / size.height
console.log("图片宽高比:", ratio.toFixed(2))
```

#### 注意事项

- 💡 **单位**: 返回值单位为物理像素（px）
- 💡 **包含 padding 和 border**: 返回的是元素的外部尺寸
- ⚠️ **不可见元素**: 不可见元素（display: none）宽高为 0

---

### element_get_offset

获取元素相对于页面的偏移位置。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |

#### 返回值

```typescript
{
  success: true,
  message: "Element offset retrieved",
  offset: {
    left: 20,   // 左偏移（px）
    top: 100    // 上偏移（px）
  }
}
```

#### 使用示例

```javascript
// 示例 1: 获取元素位置
const element = await page_query({
  selector: ".floating-btn",
  save: true
})
const offset = await element_get_offset({ refId: element.refId })
console.log(`位置: (${offset.offset.left}, ${offset.offset.top})`)

// 示例 2: 判断元素是否在视口内
const { offset } = await element_get_offset({ refId: el.refId })
const { size } = await page_get_size()
const isVisible = offset.top >= 0 && offset.top < size.height
console.log("是否可见:", isVisible)

// 示例 3: 计算两个元素的相对位置
const offset1 = await element_get_offset({ refId: el1.refId })
const offset2 = await element_get_offset({ refId: el2.refId })
const distance = Math.abs(offset2.offset.top - offset1.offset.top)
console.log("垂直距离:", distance)
```

#### 注意事项

- 💡 **相对于页面**: 偏移量是相对于页面左上角，不是视口
- 💡 **滚动影响**: 不受页面滚动影响（始终相对页面原点）
- ⚠️ **定位元素**: position: fixed 元素的 offset 可能不符合预期

---

## 触摸事件

### element_touchstart

触发触摸开始事件。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `touches` | array | ✅ | - | 当前屏幕上的触摸点数组 |
| `changedTouches` | array | ✅ | - | 变化的触摸点数组 |

#### 返回值

```typescript
{
  success: true,
  message: "Touch start on element: elem_abc123"
}
```

#### 使用示例

```javascript
// 示例 1: 单点触摸开始
const element = await page_query({
  selector: ".canvas",
  save: true
})
await element_touchstart({
  refId: element.refId,
  touches: [{ identifier: 0, pageX: 100, pageY: 200 }],
  changedTouches: [{ identifier: 0, pageX: 100, pageY: 200 }]
})

// 示例 2: 配合 touchmove 和 touchend 实现滑动
await element_touchstart({
  refId: el.refId,
  touches: [{ identifier: 0, pageX: 100, pageY: 200 }],
  changedTouches: [{ identifier: 0, pageX: 100, pageY: 200 }]
})
await element_touchmove({
  refId: el.refId,
  touches: [{ identifier: 0, pageX: 100, pageY: 100 }],
  changedTouches: [{ identifier: 0, pageX: 100, pageY: 100 }]
})
await element_touchend({
  refId: el.refId,
  touches: [],
  changedTouches: [{ identifier: 0, pageX: 100, pageY: 100 }]
})
```

#### 注意事项

- 💡 **触摸点格式**: `{ identifier: number, pageX: number, pageY: number }`
- 💡 **多点触摸**: `touches` 可包含多个触摸点
- ⚠️ **必须配对**: touchstart 必须与 touchmove/touchend 配对使用

---

### element_touchmove

触发触摸移动事件。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `touches` | array | ✅ | - | 当前屏幕上的触摸点数组 |
| `changedTouches` | array | ✅ | - | 变化的触摸点数组 |

#### 使用示例

```javascript
// 示例 1: 拖动元素
await element_touchstart({ refId, touches: [{ identifier: 0, pageX: 100, pageY: 100 }], changedTouches: [{ identifier: 0, pageX: 100, pageY: 100 }] })
for (let i = 0; i < 10; i++) {
  await element_touchmove({
    refId,
    touches: [{ identifier: 0, pageX: 100 + i * 10, pageY: 100 }],
    changedTouches: [{ identifier: 0, pageX: 100 + i * 10, pageY: 100 }]
  })
}
await element_touchend({ refId, touches: [], changedTouches: [{ identifier: 0, pageX: 200, pageY: 100 }] })
```

---

### element_touchend

触发触摸结束事件。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `touches` | array | ✅ | - | 当前屏幕上的触摸点数组（通常为空） |
| `changedTouches` | array | ✅ | - | 变化的触摸点数组 |

#### 使用示例

```javascript
// 示例 1: 完成触摸手势
await element_touchend({
  refId: el.refId,
  touches: [],  // 所有手指离开屏幕
  changedTouches: [{ identifier: 0, pageX: 200, pageY: 100 }]
})
```

---

### element_trigger

触发自定义事件。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID |
| `type` | string | ✅ | - | 事件类型（如 `change`, `custom-event`） |
| `detail` | object | ⭐ | {} | 事件详细数据 |

#### 返回值

```typescript
{
  success: true,
  message: "Event \"change\" triggered on element: elem_abc123"
}
```

#### 使用示例

```javascript
// 示例 1: 触发 change 事件
const picker = await page_query({
  selector: "picker",
  save: true
})
await element_trigger({
  refId: picker.refId,
  type: "change",
  detail: { value: 2 }
})

// 示例 2: 触发自定义事件
const component = await page_query({
  selector: ".custom-component",
  save: true
})
await element_trigger({
  refId: component.refId,
  type: "custom-event",
  detail: { action: "submit", data: { id: 123 } }
})
```

#### 注意事项

- 💡 **小程序事件**: 支持所有小程序标准事件（tap, change, input 等）
- 💡 **自定义事件**: 可触发组件的自定义事件
- ⚠️ **事件冒泡**: 会按照小程序事件系统冒泡

---

## 滚动操作（ScrollView）

### element_scroll_to

滚动到指定位置（仅限 ScrollView 组件）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是 ScrollView） |
| `x` | number | ✅ | - | 横向滚动位置（px） |
| `y` | number | ✅ | - | 纵向滚动位置（px） |

#### 返回值

```typescript
{
  success: true,
  message: "Scrolled to (0, 300)"
}
```

#### 使用示例

```javascript
// 示例 1: 滚动到顶部
const scrollView = await page_query({
  selector: "scroll-view",
  save: true
})
await element_scroll_to({
  refId: scrollView.refId,
  x: 0,
  y: 0
})

// 示例 2: 滚动到底部
const height = await element_scroll_height({ refId: scrollView.refId })
await element_scroll_to({
  refId: scrollView.refId,
  x: 0,
  y: height.height
})

// 示例 3: 横向滚动
await element_scroll_to({
  refId: scrollView.refId,
  x: 300,
  y: 0
})
```

#### 注意事项

- ⚠️ **仅 ScrollView**: 仅适用于 `scroll-view` 组件
- 💡 **超出范围**: 如果滚动位置超出范围，会滚动到最大/最小值
- 💡 **动画**: 滚动有动画效果，建议使用 `page_wait_for` 等待

---

### element_scroll_width

获取 ScrollView 的滚动宽度（内容总宽度）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是 ScrollView） |

#### 返回值

```typescript
{
  success: true,
  message: "Scroll width retrieved",
  width: 800  // 内容总宽度（px）
}
```

#### 使用示例

```javascript
// 示例 1: 获取可滚动宽度
const scrollView = await page_query({
  selector: "scroll-view",
  save: true
})
const result = await element_scroll_width({ refId: scrollView.refId })
console.log("内容宽度:", result.width)

// 示例 2: 判断是否可滚动
const viewWidth = await element_get_size({ refId: scrollView.refId })
const contentWidth = await element_scroll_width({ refId: scrollView.refId })
if (contentWidth.width > viewWidth.size.width) {
  console.log("内容超出，可以滚动")
}
```

---

### element_scroll_height

获取 ScrollView 的滚动高度（内容总高度）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是 ScrollView） |

#### 返回值

```typescript
{
  success: true,
  message: "Scroll height retrieved",
  height: 1200  // 内容总高度（px）
}
```

#### 使用示例

```javascript
// 示例 1: 滚动到底部
const height = await element_scroll_height({ refId: scrollView.refId })
await element_scroll_to({
  refId: scrollView.refId,
  x: 0,
  y: height.height
})
```

---

## 组件特定操作

### element_swipe_to

滑动到指定索引（仅限 Swiper 组件）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是 Swiper） |
| `index` | number | ✅ | - | 目标索引（从 0 开始） |

#### 返回值

```typescript
{
  success: true,
  message: "Swiped to index 2"
}
```

#### 使用示例

```javascript
// 示例 1: 滑动到第 3 张轮播图
const swiper = await page_query({
  selector: "swiper",
  save: true
})
await element_swipe_to({
  refId: swiper.refId,
  index: 2  // 索引从 0 开始
})

// 示例 2: 遍历所有轮播图
for (let i = 0; i < 5; i++) {
  await element_swipe_to({ refId: swiper.refId, index: i })
  await page_wait_for({ timeout: 500 })
  await miniprogram_screenshot({ filename: `swiper-${i}.png` })
}
```

#### 注意事项

- ⚠️ **仅 Swiper**: 仅适用于 `swiper` 组件
- 💡 **索引范围**: 索引从 0 开始，超出范围不报错但不滚动
- 💡 **动画**: 切换有动画效果

---

### element_move_to

移动到指定位置（仅限 MovableView 组件）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是 MovableView） |
| `x` | number | ✅ | - | X 坐标（px） |
| `y` | number | ✅ | - | Y 坐标（px） |

#### 返回值

```typescript
{
  success: true,
  message: "Moved to (100, 200)"
}
```

#### 使用示例

```javascript
// 示例 1: 移动可拖动元素
const movable = await page_query({
  selector: "movable-view",
  save: true
})
await element_move_to({
  refId: movable.refId,
  x: 100,
  y: 200
})
```

---

### element_slide_to

滑动到指定值（仅限 Slider 组件）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是 Slider） |
| `value` | number | ✅ | - | 目标值 |

#### 返回值

```typescript
{
  success: true,
  message: "Slid to value 50"
}
```

#### 使用示例

```javascript
// 示例 1: 设置音量滑块
const slider = await page_query({
  selector: ".volume-slider",
  save: true
})
await element_slide_to({
  refId: slider.refId,
  value: 75  // 音量设为 75%
})

// 示例 2: 调整价格范围
await element_slide_to({
  refId: minPrice.refId,
  value: 100
})
await element_slide_to({
  refId: maxPrice.refId,
  value: 500
})
```

#### 注意事项

- ⚠️ **仅 Slider**: 仅适用于 `slider` 组件
- 💡 **值范围**: 值必须在 slider 的 min 和 max 范围内

---

### element_call_context_method

调用上下文元素的方法（仅限 ContextElement）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是 ContextElement） |
| `method` | string | ✅ | - | 方法名 |
| `args` | array | ⭐ | [] | 方法参数 |

#### 返回值

```typescript
{
  success: true,
  message: "Context method \"play\" called successfully",
  result: { success: true }  // 方法返回值
}
```

#### 使用示例

```javascript
// 示例 1: 调用 video 上下文方法
const video = await page_query({
  selector: "video",
  save: true
})
await element_call_context_method({
  refId: video.refId,
  method: "play"
})

// 示例 2: 调用 canvas 绘图方法
const canvas = await page_query({
  selector: "canvas",
  save: true
})
await element_call_context_method({
  refId: canvas.refId,
  method: "drawImage",
  args: ["/images/photo.jpg", 0, 0, 100, 100]
})
```

#### 注意事项

- ⚠️ **仅 Context 元素**: 仅适用于有上下文的元素（video, canvas, map 等）
- 💡 **方法列表**: 参考小程序官方文档查看可用方法

---

### element_set_data

设置自定义组件的数据（仅限 CustomElement）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是自定义组件） |
| `data` | object | ✅ | - | 数据对象 |

#### 返回值

```typescript
{
  success: true,
  message: "Element data updated with 2 keys"
}
```

#### 使用示例

```javascript
// 示例 1: 设置自定义组件数据
const component = await page_query({
  selector: "custom-component",
  save: true
})
await element_set_data({
  refId: component.refId,
  data: {
    title: "新标题",
    count: 10
  }
})
```

---

### element_call_method

调用自定义组件的方法（仅限 CustomElement）。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `refId` | string | ✅ | - | 元素引用 ID（必须是自定义组件） |
| `method` | string | ✅ | - | 方法名 |
| `args` | array | ⭐ | [] | 方法参数 |

#### 返回值

```typescript
{
  success: true,
  message: "Element method \"refresh\" called successfully",
  result: { success: true }
}
```

#### 使用示例

```javascript
// 示例 1: 调用自定义组件方法
const component = await page_query({
  selector: "custom-list",
  save: true
})
await element_call_method({
  refId: component.refId,
  method: "loadMore"
})

// 示例 2: 带参数调用
await element_call_method({
  refId: component.refId,
  method: "updateItem",
  args: [123, { name: "新名称" }]
})
```

---

## 完整示例：表单交互测试

```javascript
// 场景：测试登录表单的完整交互流程
async function testLoginForm() {
  try {
    // 1. 启动并导航到登录页
    await miniprogram_launch({ projectPath: "/path/to/project" })
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/login/login"
    })

    // 2. 查询表单元素
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

    // 3. 填写表单
    await element_input({
      refId: username.refId,
      value: "testuser"
    })
    await element_input({
      refId: password.refId,
      value: "password123"
    })

    // 4. 验证输入内容
    const usernameValue = await element_get_value({ refId: username.refId })
    console.log("✅ 用户名:", usernameValue.value)

    // 5. 检查按钮状态
    const btnClass = await element_get_attribute({
      refId: submitBtn.refId,
      name: "class"
    })
    if (!btnClass.value.includes("disabled")) {
      console.log("✅ 提交按钮已启用")
    }

    // 6. 点击提交
    await element_tap({ refId: submitBtn.refId })

    // 7. 等待并验证结果
    await page_wait_for({
      selector: ".success-toast",
      timeout: 3000
    })
    const toast = await page_query({
      selector: ".success-toast",
      save: true
    })
    const toastText = await element_get_text({ refId: toast.refId })
    console.log("✅ 登录成功:", toastText.text)

    // 8. 截图
    await miniprogram_screenshot({
      filename: "login-success.png"
    })

    console.log("✅ 表单测试完成")

  } catch (error) {
    console.error("❌ 测试失败:", error.message)
    await miniprogram_screenshot({
      filename: "test-error.png"
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

### 问题 1: 元素引用失效

**错误**: `Element not found with refId: elem_xxx`

**解决方案**:
1. 检查元素是否已被销毁（页面跳转、组件卸载）
2. 使用 `page_query` 重新获取引用
3. 确认 `save: true` 已设置

```javascript
// ❌ 错误：页面跳转后引用失效
const btn = await page_query({ selector: ".btn", save: true })
await miniprogram_navigate({ method: "navigateTo", url: "/other" })
await element_tap({ refId: btn.refId }) // 错误！

// ✅ 正确：跳转后重新查询
await miniprogram_navigate({ method: "navigateTo", url: "/other" })
const newBtn = await page_query({ selector: ".btn", save: true })
await element_tap({ refId: newBtn.refId })
```

### 问题 2: 组件特定方法调用失败

**错误**: `Method not supported for this element type`

**解决方案**:
确认元素类型与方法匹配：
- `element_scroll_to` → `scroll-view`
- `element_swipe_to` → `swiper`
- `element_slide_to` → `slider`
- `element_move_to` → `movable-view`

```javascript
// 检查元素类型
const tagName = await element_get_property({
  refId: el.refId,
  name: "tagName"
})
console.log("元素类型:", tagName.value)
```

### 问题 3: 触摸事件不生效

**错误**: 触摸手势没有效果

**解决方案**:
1. 确保 touchstart/move/end 正确配对
2. 检查触摸点坐标是否在元素范围内
3. 使用 `element_trigger` 作为替代

```javascript
// ✅ 正确的触摸手势序列
await element_touchstart({ refId, touches: [p0], changedTouches: [p0] })
await element_touchmove({ refId, touches: [p1], changedTouches: [p1] })
await element_touchend({ refId, touches: [], changedTouches: [p1] })
```

---

## 技术细节

### 元素引用生命周期

- **创建**: `page_query({ save: true })` 时创建
- **存储**: 存储在 Session 的 `elements` Map 中
- **失效**: 页面销毁、会话超时（30 分钟）、`miniprogram_close()`
- **清理**: `miniprogram_disconnect()` 保留，`miniprogram_close()` 清除

### 坐标系统

- **物理像素**: 所有坐标和尺寸均为物理像素（px），非 rpx
- **原点**: 页面左上角为 (0, 0)
- **触摸坐标**: `pageX/pageY` 相对于页面，`clientX/clientY` 相对于视口

### 性能优化

- **批量操作**: 使用 `page_query_all` 一次获取多个元素
- **引用缓存**: 使用 `save: true` 避免重复查询
- **避免频繁截图**: 截图操作较慢，仅在必要时使用

---

**相关文档**:
- [Page API](./page.md) - 页面级别操作
- [Assert API](./assert.md) - 元素断言验证
- [Snapshot API](./snapshot.md) - 元素快照捕获
- [使用示例](../../examples/02-form-interaction.md) - 表单交互完整示例

**最后更新**: 2025-10-02
