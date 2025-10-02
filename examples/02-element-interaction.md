# 示例 02: 元素查询与交互

> 学习如何查询元素、缓存引用、执行交互操作并获取元素信息

## 难度

⭐ 基础

## 学习目标

- 使用 page_query 查询单个元素
- 使用 page_queryAll 查询多个元素
- 使用 save: true 缓存元素引用（refId）
- 使用 element_tap、element_longPress 进行点击交互
- 使用 element_input 输入文本
- 使用 element_getText、element_getValue 获取元素内容
- 使用 element_getAttribute、element_getProperty 获取属性
- 理解元素引用的缓存与失效机制

## 前置条件

- 已安装微信开发者工具
- 已配置 MCP 客户端（Claude Desktop）
- 准备好测试用小程序项目，包含以下元素：
  - 登录表单（用户名、密码输入框，登录按钮）
  - 商品列表（多个商品卡片）
  - 搜索框（input + 搜索按钮）
  - 文本展示元素（标题、描述等）

---

## 完整代码

```javascript
/**
 * 元素查询与交互示例
 * 演示元素查询、缓存、交互和信息获取的完整流程
 */
async function elementInteractionExample() {
  try {
    console.log("=== 开始元素交互测试 ===\n")

    // ============================================================================
    // 步骤 1: 启动小程序
    // ============================================================================
    console.log("步骤 1: 启动小程序...")
    await miniprogram_launch({
      projectPath: process.env.PROJECT_PATH || "/path/to/your/miniprogram"
    })
    console.log("✅ 小程序已启动\n")

    await page_wait_for({ condition: 2000 })

    // ============================================================================
    // 步骤 2: 单个元素查询 - 使用 save: true 缓存引用
    // ============================================================================
    console.log("步骤 2: 查询登录表单元素...")

    // 查询用户名输入框（自动缓存）
    const usernameResult = await page_query({
      selector: "input[placeholder='请输入用户名']",
      save: true  // 默认为 true，会缓存元素并返回 refId
    })
    console.log("✅ 用户名输入框:")
    console.log(`   refId: ${usernameResult.refId}`)
    console.log(`   exists: ${usernameResult.exists}\n`)

    // 查询密码输入框
    const passwordResult = await page_query({
      selector: "input[placeholder='请输入密码']",
      save: true
    })
    console.log("✅ 密码输入框:")
    console.log(`   refId: ${passwordResult.refId}`)
    console.log(`   exists: ${passwordResult.exists}\n`)

    // 查询登录按钮
    const loginBtnResult = await page_query({
      selector: "button.login-btn",
      save: true
    })
    console.log("✅ 登录按钮:")
    console.log(`   refId: ${loginBtnResult.refId}`)
    console.log(`   exists: ${loginBtnResult.exists}\n`)

    // ============================================================================
    // 步骤 3: 使用 element_input 输入文本
    // ============================================================================
    console.log("步骤 3: 填写登录表单...")

    // 在用户名输入框输入文本
    await element_input({
      refId: usernameResult.refId,
      value: "testuser@example.com"
    })
    console.log("✅ 已输入用户名: testuser@example.com\n")

    // 在密码输入框输入文本
    await element_input({
      refId: passwordResult.refId,
      value: "password123"
    })
    console.log("✅ 已输入密码: ********\n")

    await page_wait_for({ condition: 500 })

    // ============================================================================
    // 步骤 4: 获取输入框的值 - element_getValue
    // ============================================================================
    console.log("步骤 4: 验证输入框的值...")

    const usernameValue = await element_getValue({
      refId: usernameResult.refId
    })
    console.log(`✅ 用户名输入框的值: ${usernameValue.value}\n`)

    const passwordValue = await element_getValue({
      refId: passwordResult.refId
    })
    console.log(`✅ 密码输入框的值: ${passwordValue.value.replace(/./g, '*')}\n`)

    // ============================================================================
    // 步骤 5: 使用 element_tap 点击按钮
    // ============================================================================
    console.log("步骤 5: 点击登录按钮...")

    await element_tap({
      refId: loginBtnResult.refId
    })
    console.log("✅ 登录按钮已点击\n")

    await page_wait_for({ condition: 2000 })

    await miniprogram_screenshot({
      filename: "01-after-login.png"
    })
    console.log("📸 已截图: 01-after-login.png\n")

    // ============================================================================
    // 步骤 6: 查询多个元素 - page_queryAll
    // ============================================================================
    console.log("步骤 6: 查询商品列表...")

    const productsResult = await page_queryAll({
      selector: ".product-card",
      save: true
    })
    console.log(`✅ 找到 ${productsResult.count} 个商品`)
    console.log(`   refIds: ${productsResult.refIds?.join(', ')}\n`)

    // ============================================================================
    // 步骤 7: 遍历元素并获取信息
    // ============================================================================
    console.log("步骤 7: 获取商品信息...")

    if (productsResult.refIds && productsResult.refIds.length > 0) {
      // 遍历前 3 个商品
      const limit = Math.min(3, productsResult.refIds.length)

      for (let i = 0; i < limit; i++) {
        const refId = productsResult.refIds[i]

        console.log(`\n   --- 商品 ${i + 1} ---`)

        // 查询商品标题
        const titleResult = await page_query({
          selector: `#product-${i} .product-title`,
          save: true
        })

        if (titleResult.exists) {
          const titleText = await element_getText({
            refId: titleResult.refId
          })
          console.log(`   标题: ${titleText.text}`)
        }

        // 查询商品价格
        const priceResult = await page_query({
          selector: `#product-${i} .product-price`,
          save: true
        })

        if (priceResult.exists) {
          const priceText = await element_getText({
            refId: priceResult.refId
          })
          console.log(`   价格: ${priceText.text}`)
        }
      }

      console.log()
    }

    // ============================================================================
    // 步骤 8: 获取元素属性 - element_getAttribute
    // ============================================================================
    console.log("步骤 8: 获取元素属性...")

    // 查询第一个商品图片
    const imageResult = await page_query({
      selector: ".product-card image",
      save: true
    })

    if (imageResult.exists) {
      // 获取 src 属性
      const srcAttr = await element_getAttribute({
        refId: imageResult.refId,
        name: "src"
      })
      console.log(`✅ 图片 src 属性: ${srcAttr.value}`)

      // 获取 mode 属性
      const modeAttr = await element_getAttribute({
        refId: imageResult.refId,
        name: "mode"
      })
      console.log(`✅ 图片 mode 属性: ${modeAttr.value}\n`)
    }

    // ============================================================================
    // 步骤 9: 获取元素属性（property） - element_getProperty
    // ============================================================================
    console.log("步骤 9: 获取元素属性（property）...")

    if (imageResult.exists) {
      // 获取 dataset 属性
      const datasetProp = await element_getProperty({
        refId: imageResult.refId,
        name: "dataset"
      })
      console.log(`✅ 图片 dataset:`, datasetProp.value)

      // 获取 id 属性
      const idProp = await element_getProperty({
        refId: imageResult.refId,
        name: "id"
      })
      console.log(`✅ 图片 id: ${idProp.value}\n`)
    }

    // ============================================================================
    // 步骤 10: 长按操作 - element_longPress
    // ============================================================================
    console.log("步骤 10: 长按第一个商品...")

    if (productsResult.refIds && productsResult.refIds.length > 0) {
      await element_longPress({
        refId: productsResult.refIds[0]
      })
      console.log("✅ 商品已长按（可能触发收藏、分享等菜单）\n")

      await page_wait_for({ condition: 1000 })

      await miniprogram_screenshot({
        filename: "02-after-longpress.png"
      })
      console.log("📸 已截图: 02-after-longpress.png\n")
    }

    // ============================================================================
    // 步骤 11: 获取元素尺寸和位置
    // ============================================================================
    console.log("步骤 11: 获取元素尺寸和位置...")

    if (productsResult.refIds && productsResult.refIds.length > 0) {
      const firstProductRef = productsResult.refIds[0]

      // 获取尺寸
      const sizeResult = await element_getSize({
        refId: firstProductRef
      })
      console.log(`✅ 商品尺寸: ${sizeResult.size.width}x${sizeResult.size.height}`)

      // 获取位置
      const offsetResult = await element_getOffset({
        refId: firstProductRef
      })
      console.log(`✅ 商品位置: left=${offsetResult.offset.left}, top=${offsetResult.offset.top}\n`)
    }

    // ============================================================================
    // 步骤 12: 使用搜索功能测试元素引用复用
    // ============================================================================
    console.log("步骤 12: 测试搜索功能...")

    // 查询搜索框
    const searchInputResult = await page_query({
      selector: "input.search-input",
      save: true
    })

    if (searchInputResult.exists) {
      // 输入搜索关键词
      await element_input({
        refId: searchInputResult.refId,
        value: "智能手表"
      })
      console.log("✅ 已输入搜索关键词: 智能手表")

      // 查询搜索按钮
      const searchBtnResult = await page_query({
        selector: "button.search-btn",
        save: true
      })

      if (searchBtnResult.exists) {
        // 点击搜索
        await element_tap({
          refId: searchBtnResult.refId
        })
        console.log("✅ 搜索按钮已点击\n")

        await page_wait_for({ condition: 2000 })

        await miniprogram_screenshot({
          filename: "03-search-results.png"
        })
        console.log("📸 已截图: 03-search-results.png\n")
      }
    }

    // ============================================================================
    // 步骤 13: 验证元素属性与特性的区别
    // ============================================================================
    console.log("步骤 13: 对比 Attribute 与 Property...")

    // 查询一个带有自定义属性的元素
    const customElemResult = await page_query({
      selector: "view[data-product-id]",
      save: true
    })

    if (customElemResult.exists) {
      // 获取 HTML attribute（WXML 特性）
      const dataAttr = await element_getAttribute({
        refId: customElemResult.refId,
        name: "data-product-id"
      })
      console.log(`   Attribute: data-product-id = ${dataAttr.value}`)

      // 获取 JavaScript property（运行时属性）
      const datasetProp = await element_getProperty({
        refId: customElemResult.refId,
        name: "dataset"
      })
      console.log(`   Property: dataset =`, datasetProp.value)
      console.log(`   说明: attribute 是 WXML 中声明的，property 是运行时对象属性\n`)
    }

    // ============================================================================
    // 步骤 14: 测试元素不存在的情况
    // ============================================================================
    console.log("步骤 14: 测试查询不存在的元素...")

    const notFoundResult = await page_query({
      selector: "button.non-existent-element",
      save: false  // 不缓存不存在的元素
    })
    console.log(`✅ 查询不存在的元素:`)
    console.log(`   exists: ${notFoundResult.exists}`)
    console.log(`   refId: ${notFoundResult.refId || 'undefined'}`)
    console.log(`   message: ${notFoundResult.message}\n`)

    console.log("=== 元素交互测试完成 ===\n")
    console.log("📊 测试总结:")
    console.log("   ✅ 单个元素查询（page_query）")
    console.log("   ✅ 多个元素查询（page_queryAll）")
    console.log("   ✅ 元素引用缓存（refId）")
    console.log("   ✅ 文本输入（element_input）")
    console.log("   ✅ 点击交互（element_tap）")
    console.log("   ✅ 长按交互（element_longPress）")
    console.log("   ✅ 获取文本（element_getText）")
    console.log("   ✅ 获取值（element_getValue）")
    console.log("   ✅ 获取特性（element_getAttribute）")
    console.log("   ✅ 获取属性（element_getProperty）")
    console.log("   ✅ 获取尺寸和位置")
    console.log("   ✅ 生成 3 张截图\n")

  } catch (error) {
    console.error("\n❌ 测试失败:", error.message)

    // 错误时截图
    try {
      await miniprogram_screenshot({
        filename: "error-element-interaction.png"
      })
      console.log("📸 错误截图已保存: error-element-interaction.png")
    } catch (screenshotError) {
      console.error("截图失败:", screenshotError.message)
    }

    throw error

  } finally {
    // ============================================================================
    // 步骤 15: 清理资源
    // ============================================================================
    console.log("步骤 15: 清理资源...")
    try {
      await miniprogram_close()
      console.log("✅ 资源已清理，微信开发者工具已关闭\n")
    } catch (closeError) {
      console.error("关闭失败:", closeError.message)
    }
  }
}

// 运行示例
elementInteractionExample()
```

---

## 分步讲解

### 步骤 1: 查询单个元素 - page_query

```javascript
const usernameResult = await page_query({
  selector: "input[placeholder='请输入用户名']",
  save: true  // 缓存元素并返回 refId
})
```

**说明**:
- `selector` 支持 CSS 选择器和 WXML 选择器语法
- `save: true` 会将元素缓存到 Session，返回唯一的 `refId`
- `refId` 是后续所有元素操作的唯一标识

**返回值**:
```javascript
{
  success: true,
  message: "Element found: input[placeholder='请输入用户名']",
  refId: "elem_abc123",  // 唯一标识，用于后续操作
  exists: true
}
```

**选择器示例**:
```javascript
// CSS 选择器
".product-card"          // class
"#product-1"             // id
"button.primary"         // 标签 + class
"input[type='text']"     // 属性选择器

// WXML 组件选择器
"view.container"
"button.login-btn"
"input[placeholder='搜索']"
```

---

### 步骤 2: 查询多个元素 - page_queryAll

```javascript
const productsResult = await page_queryAll({
  selector: ".product-card",
  save: true
})
console.log(`找到 ${productsResult.count} 个商品`)
console.log(`refIds: ${productsResult.refIds}`)
```

**说明**:
- 查询所有匹配的元素
- 返回 `refIds` 数组，每个元素都有独立的 refId
- 可以遍历 `refIds` 对每个元素执行操作

**返回值**:
```javascript
{
  success: true,
  message: "Found 5 elements matching: .product-card",
  refIds: ["elem_001", "elem_002", "elem_003", "elem_004", "elem_005"],
  count: 5
}
```

**使用场景**:
- 商品列表的遍历
- 批量操作（如全选、批量删除）
- 验证列表项数量

---

### 步骤 3: 输入文本 - element_input

```javascript
await element_input({
  refId: usernameResult.refId,
  value: "testuser@example.com"
})
```

**说明**:
- 使用 `refId` 引用之前查询到的元素
- 只能在 `input` 或 `textarea` 元素上使用
- 会触发小程序的 `input` 事件

**注意事项**:
- 确保元素是输入框类型
- 输入后元素的 `value` 属性会更新
- 可以输入中文、英文、数字、特殊字符

**错误示例**:
```javascript
// ❌ 错误：在非输入框元素上使用
await element_input({
  refId: buttonRefId,  // button 不是输入框
  value: "text"
})
// 报错: Input failed: element is not an input or textarea
```

---

### 步骤 4: 获取输入框的值 - element_getValue

```javascript
const usernameValue = await element_getValue({
  refId: usernameResult.refId
})
console.log(`用户名: ${usernameValue.value}`)
```

**说明**:
- 获取输入框、选择器等表单元素的当前值
- 返回字符串类型

**适用元素**:
- `input`
- `textarea`
- `picker`
- `slider`
- `switch`

**与 element_getText 的区别**:
```javascript
// getValue: 获取表单元素的值
const value = await element_getValue({ refId: inputRefId })
// value.value = "用户输入的内容"

// getText: 获取元素的文本内容
const text = await element_getText({ refId: labelRefId })
// text.text = "显示的文本内容"
```

---

### 步骤 5: 点击元素 - element_tap

```javascript
await element_tap({
  refId: loginBtnResult.refId
})
```

**说明**:
- 模拟用户点击（轻触）操作
- 触发元素的 `tap` 事件
- 等同于用户在屏幕上快速点击

**使用场景**:
- 按钮点击
- 列表项选择
- 链接跳转
- Tab 切换

**与 element_longPress 的区别**:
- `tap`: 快速点击（< 350ms）
- `longPress`: 长按（≥ 350ms）

---

### 步骤 6: 长按元素 - element_longPress

```javascript
await element_longPress({
  refId: productsResult.refIds[0]
})
```

**说明**:
- 模拟用户长按操作
- 触发元素的 `longpress` 事件
- 通常用于显示上下文菜单

**使用场景**:
- 显示商品操作菜单（收藏、分享）
- 图片保存
- 文字选择
- 自定义上下文菜单

---

### 步骤 7: 获取文本内容 - element_getText

```javascript
const titleText = await element_getText({
  refId: titleRefId
})
console.log(`标题: ${titleText.text}`)
```

**说明**:
- 获取元素的文本内容
- 适用于 `view`、`text`、`button` 等显示文本的元素
- 返回可见的文本内容

**使用场景**:
- 验证标题文本
- 获取商品名称
- 读取提示信息
- 断言测试

---

### 步骤 8: 获取 HTML 特性 - element_getAttribute

```javascript
const srcAttr = await element_getAttribute({
  refId: imageRefId,
  name: "src"
})
console.log(`图片路径: ${srcAttr.value}`)
```

**说明**:
- 获取 WXML 中定义的特性（attribute）
- 对应小程序组件的静态属性
- 返回字符串类型

**常用属性**:
```javascript
// image 组件
await element_getAttribute({ refId, name: "src" })
await element_getAttribute({ refId, name: "mode" })

// button 组件
await element_getAttribute({ refId, name: "type" })
await element_getAttribute({ refId, name: "size" })

// 自定义属性
await element_getAttribute({ refId, name: "data-id" })
await element_getAttribute({ refId, name: "data-index" })
```

---

### 步骤 9: 获取 JavaScript 属性 - element_getProperty

```javascript
const datasetProp = await element_getProperty({
  refId: imageRefId,
  name: "dataset"
})
console.log(`dataset:`, datasetProp.value)
```

**说明**:
- 获取运行时对象的属性（property）
- 可以返回任意 JavaScript 类型（对象、数组等）
- 对应元素在 JS 运行时的实际状态

**Attribute vs Property**:

| 特性 | Attribute (特性) | Property (属性) |
|------|-----------------|-----------------|
| 定义位置 | WXML 中声明 | JavaScript 运行时 |
| 数据类型 | 总是字符串 | 任意 JS 类型 |
| 示例 | `data-id="123"` | `dataset.id = 123` |
| 获取方法 | `getAttribute` | `getProperty` |

**示例**:
```javascript
// WXML: <view data-product-id="12345" data-name="Phone">

// Attribute（WXML 特性）
const attr = await element_getAttribute({
  refId,
  name: "data-product-id"
})
// attr.value = "12345" (字符串)

// Property（运行时属性）
const prop = await element_getProperty({
  refId,
  name: "dataset"
})
// prop.value = { productId: "12345", name: "Phone" } (对象)
```

---

### 步骤 10: 获取元素尺寸 - element_getSize

```javascript
const sizeResult = await element_getSize({
  refId: productRefId
})
console.log(`尺寸: ${sizeResult.size.width}x${sizeResult.size.height}`)
```

**说明**:
- 获取元素的宽度和高度（单位：px）
- 包含 padding 和 border，不包含 margin

**返回值**:
```javascript
{
  success: true,
  message: "Element size retrieved",
  size: {
    width: 345,   // 宽度（px）
    height: 120   // 高度（px）
  }
}
```

**使用场景**:
- 验证元素尺寸是否正确
- 计算布局位置
- 响应式设计测试

---

### 步骤 11: 获取元素位置 - element_getOffset

```javascript
const offsetResult = await element_getOffset({
  refId: productRefId
})
console.log(`位置: left=${offsetResult.offset.left}, top=${offsetResult.offset.top}`)
```

**说明**:
- 获取元素相对于页面左上角的偏移量
- 单位：px

**返回值**:
```javascript
{
  success: true,
  message: "Element offset retrieved",
  offset: {
    left: 30,   // 距离左边的距离（px）
    top: 200    // 距离顶部的距离（px）
  }
}
```

**使用场景**:
- 验证元素位置
- 滚动到指定元素
- 碰撞检测

---

### 步骤 12: 元素引用缓存机制

**refId 的生命周期**:
```javascript
// 1. 查询元素时生成 refId
const result = await page_query({
  selector: "button.login-btn",
  save: true  // 缓存到 Session
})
// result.refId = "elem_abc123"

// 2. refId 可以在当前页面反复使用
await element_tap({ refId: result.refId })
await element_tap({ refId: result.refId })  // 仍然有效

// 3. 页面跳转后，refId 会失效
await miniprogram_navigate({
  method: "navigateTo",
  url: "/pages/list/list"
})

// ❌ 错误：refId 已失效
await element_tap({ refId: result.refId })
// 报错: Element not found with refId: elem_abc123

// 4. 需要在新页面重新查询
const newResult = await page_query({
  selector: "button.filter-btn",
  save: true
})
await element_tap({ refId: newResult.refId })  // ✅ 正确
```

**最佳实践**:
- ✅ 在同一页面内复用 refId
- ✅ 查询一次，多次操作
- ❌ 不要跨页面使用 refId
- ❌ 不要长期缓存 refId

---

### 步骤 13: save 参数的使用

```javascript
// save: true（默认）- 缓存元素
const result1 = await page_query({
  selector: "button.login-btn",
  save: true
})
// result1.refId = "elem_abc123"
// 可以使用 refId 进行后续操作

// save: false - 不缓存，仅检查存在性
const result2 = await page_query({
  selector: "button.optional-element",
  save: false
})
// result2.refId = undefined
// result2.exists = true/false
// 仅用于检查元素是否存在，不进行后续操作
```

**何时使用 save: false**:
- 仅检查元素是否存在
- 临时查询，不需要后续操作
- 节省内存（大量元素查询时）

---

## 预期输出

```
=== 开始元素交互测试 ===

步骤 1: 启动小程序...
✅ 小程序已启动

步骤 2: 查询登录表单元素...
✅ 用户名输入框:
   refId: elem_001
   exists: true

✅ 密码输入框:
   refId: elem_002
   exists: true

✅ 登录按钮:
   refId: elem_003
   exists: true

步骤 3: 填写登录表单...
✅ 已输入用户名: testuser@example.com

✅ 已输入密码: ********

步骤 4: 验证输入框的值...
✅ 用户名输入框的值: testuser@example.com

✅ 密码输入框的值: ***********

步骤 5: 点击登录按钮...
✅ 登录按钮已点击

📸 已截图: 01-after-login.png

步骤 6: 查询商品列表...
✅ 找到 12 个商品
   refIds: elem_004, elem_005, elem_006, elem_007, elem_008, ...

步骤 7: 获取商品信息...

   --- 商品 1 ---
   标题: 智能手表 Pro Max
   价格: ¥2,999

   --- 商品 2 ---
   标题: 无线耳机 ANC
   价格: ¥899

   --- 商品 3 ---
   标题: 机械键盘 RGB
   价格: ¥599

步骤 8: 获取元素属性...
✅ 图片 src 属性: /images/products/watch.png
✅ 图片 mode 属性: aspectFill

步骤 9: 获取元素属性（property）...
✅ 图片 dataset: { productId: '12345', category: 'electronics' }
✅ 图片 id: product-image-1

步骤 10: 长按第一个商品...
✅ 商品已长按（可能触发收藏、分享等菜单）

📸 已截图: 02-after-longpress.png

步骤 11: 获取元素尺寸和位置...
✅ 商品尺寸: 345x120
✅ 商品位置: left=30, top=200

步骤 12: 测试搜索功能...
✅ 已输入搜索关键词: 智能手表
✅ 搜索按钮已点击

📸 已截图: 03-search-results.png

步骤 13: 对比 Attribute 与 Property...
   Attribute: data-product-id = 12345
   Property: dataset = { productId: '12345', category: 'electronics' }
   说明: attribute 是 WXML 中声明的，property 是运行时对象属性

步骤 14: 测试查询不存在的元素...
✅ 查询不存在的元素:
   exists: false
   refId: undefined
   message: Element not found: button.non-existent-element

=== 元素交互测试完成 ===

📊 测试总结:
   ✅ 单个元素查询（page_query）
   ✅ 多个元素查询（page_queryAll）
   ✅ 元素引用缓存（refId）
   ✅ 文本输入（element_input）
   ✅ 点击交互（element_tap）
   ✅ 长按交互（element_longPress）
   ✅ 获取文本（element_getText）
   ✅ 获取值（element_getValue）
   ✅ 获取特性（element_getAttribute）
   ✅ 获取属性（element_getProperty）
   ✅ 获取尺寸和位置
   ✅ 生成 3 张截图

步骤 15: 清理资源...
✅ 资源已清理，微信开发者工具已关闭
```

---

## 常见问题

### 问题 1: 元素未找到错误

**错误**: `Element not found with refId: elem_abc123`

**原因**:
- refId 在页面跳转后失效
- 元素已被删除或隐藏
- 页面还未加载完成

**解决方案**:
```javascript
// ❌ 错误：跨页面使用 refId
const btnRef = await page_query({ selector: "button", save: true })
await miniprogram_navigate({ method: "navigateTo", url: "/pages/list" })
await element_tap({ refId: btnRef.refId })  // 失败！

// ✅ 正确：页面跳转后重新查询
await miniprogram_navigate({ method: "navigateTo", url: "/pages/list" })
await page_wait_for({ condition: 1000 })  // 等待页面加载
const newBtnRef = await page_query({ selector: "button.filter", save: true })
await element_tap({ refId: newBtnRef.refId })  // 成功！
```

---

### 问题 2: 选择器语法错误

**错误**: `Query failed: Invalid selector syntax`

**解决方案**:
```javascript
// ❌ 错误的选择器
"button > .icon"           // 不支持 > 子选择器
"div:nth-child(2)"         // 不支持伪类选择器
"[data-id='123']"          // 使用单引号

// ✅ 正确的选择器
"button .icon"             // 后代选择器
".product-card"            // class 选择器
"button[type='primary']"   // 属性选择器（双引号）
"#product-1"               // id 选择器
```

---

### 问题 3: element_input 在非输入框元素上失败

**错误**: `Input failed: element is not an input or textarea`

**原因**: 只有 `input` 和 `textarea` 元素支持 `element_input`

**解决方案**:
```javascript
// ❌ 错误：在 view 元素上输入
const viewRef = await page_query({ selector: "view.content", save: true })
await element_input({ refId: viewRef.refId, value: "text" })  // 失败！

// ✅ 正确：在 input 元素上输入
const inputRef = await page_query({ selector: "input.search", save: true })
await element_input({ refId: inputRef.refId, value: "text" })  // 成功！

// ✅ 替代方案：使用 page_setData 直接修改数据
await page_set_data({
  data: { searchKeyword: "text" }
})
```

---

### 问题 4: 获取不到文本内容

**错误**: `element_getText` 返回空字符串

**原因**:
- 元素内容是动态加载的，还未渲染
- 文本在子元素中
- 元素使用了 `hidden` 属性

**解决方案**:
```javascript
// 1. 等待内容加载
await page_wait_for({ condition: 1000 })
const textRef = await page_query({ selector: ".title", save: true })
const text = await element_getText({ refId: textRef.refId })

// 2. 检查子元素
const childRef = await page_query({ selector: ".title text", save: true })
const text = await element_getText({ refId: childRef.refId })

// 3. 使用 page_getData 获取数据
const pageData = await page_get_data()
console.log("页面数据:", pageData.data)
```

---

### 问题 5: refId 何时失效？

**refId 失效的场景**:
1. ✅ **页面跳转后失效**
   ```javascript
   await miniprogram_navigate({ method: "navigateTo", url: "/pages/list" })
   // 所有之前的 refId 失效
   ```

2. ✅ **页面刷新后失效**
   ```javascript
   await miniprogram_navigate({ method: "reLaunch", url: "/pages/index" })
   // 所有 refId 失效
   ```

3. ❌ **以下情况 refId 仍然有效**:
   - 元素被隐藏（`hidden: true`）
   - 元素内容变化
   - 页面数据更新

**最佳实践**:
```javascript
// ✅ 在同一页面内复用 refId
const btnRef = await page_query({ selector: "button", save: true })
await element_tap({ refId: btnRef.refId })
await element_tap({ refId: btnRef.refId })  // 仍然有效

// ❌ 不要跨页面使用
// 页面跳转后必须重新查询
```

---

## 下一步

- 学习 [示例 03: 断言测试](./03-assertion-testing.md) - 使用断言工具编写自动化测试
- 学习 [示例 04: 快照比对](./04-snapshot-testing.md) - 使用快照工具进行 UI 回归测试
- 查看 [Element API 文档](../docs/api/element.md) - 完整的元素操作 API 参考
- 查看 [Page API 文档](../docs/api/page.md) - 页面级操作 API 参考

---

**相关文档**:
- [Automator API](../docs/api/automator.md)
- [MiniProgram API](../docs/api/miniprogram.md)
- [Page API](../docs/api/page.md)
- [Element API](../docs/api/element.md)
- [微信小程序自动化测试官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)
