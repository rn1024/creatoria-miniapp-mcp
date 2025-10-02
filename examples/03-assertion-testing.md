# 示例 03: 断言验证测试

> 学习如何使用断言工具编写完整的自动化测试流程

## 难度

⭐⭐ 进阶

## 学习目标

- 使用 assert_exists 和 assert_notExists 验证元素存在性
- 使用 assert_text 和 assert_textContains 验证文本内容
- 使用 assert_value 验证表单值
- 使用 assert_attribute 和 assert_property 验证元素属性
- 使用 assert_data 验证页面数据
- 使用 assert_visible 验证元素可见性
- 使用 page_waitFor 处理异步操作
- 编写完整的自动化测试流程

## 前置条件

- 已安装微信开发者工具
- 已配置 MCP 客户端（Claude Desktop）
- 准备好测试用小程序项目，包含以下页面：
  - `pages/login/login` (登录页)
  - `pages/result/result` (结果页)
  - `pages/products/products` (商品列表页)

---

## 完整代码

```javascript
/**
 * 断言验证测试示例
 * 演示完整的登录表单验证和商品列表验证流程
 */
async function assertionTestingExample() {
  try {
    console.log("=== 开始断言验证测试 ===\n")

    // ============================================================================
    // 步骤 1: 启动小程序
    // ============================================================================
    console.log("步骤 1: 启动小程序...")
    const launchResult = await miniprogram_launch({
      projectPath: process.env.PROJECT_PATH || "/path/to/your/miniprogram"
    })
    console.log("✅", launchResult.message)
    console.log(`   项目路径: ${launchResult.projectPath}\n`)

    // 等待小程序加载完成
    await page_wait_for({ timeout: 2000 })

    // ============================================================================
    // 步骤 2: 导航到登录页
    // ============================================================================
    console.log("步骤 2: 导航到登录页...")
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/login/login"
    })
    await page_wait_for({ timeout: 1000 })
    console.log("✅ 已跳转到登录页\n")

    // ============================================================================
    // 步骤 3: 验证登录表单元素存在
    // ============================================================================
    console.log("步骤 3: 验证登录表单元素存在...")

    // 验证用户名输入框存在
    const usernameExists = await assert_exists({
      selector: "input[placeholder='请输入用户名']"
    })
    console.log("✅", usernameExists.message)

    // 验证密码输入框存在
    const passwordExists = await assert_exists({
      selector: "input[type='password']"
    })
    console.log("✅", passwordExists.message)

    // 验证提交按钮存在
    const submitExists = await assert_exists({
      selector: "button[type='primary']"
    })
    console.log("✅", submitExists.message)

    // 验证错误提示不存在
    const errorNotExists = await assert_notExists({
      selector: ".error-message"
    })
    console.log("✅", errorNotExists.message, "\n")

    // ============================================================================
    // 步骤 4: 查询表单元素并保存引用
    // ============================================================================
    console.log("步骤 4: 查询表单元素...")

    const usernameInput = await page_query({
      selector: "input[placeholder='请输入用户名']",
      save: true
    })
    console.log(`✅ 用户名输入框: ${usernameInput.refId}`)

    const passwordInput = await page_query({
      selector: "input[type='password']",
      save: true
    })
    console.log(`✅ 密码输入框: ${passwordInput.refId}`)

    const submitButton = await page_query({
      selector: "button[type='primary']",
      save: true
    })
    console.log(`✅ 提交按钮: ${submitButton.refId}\n`)

    // ============================================================================
    // 步骤 5: 填写表单并验证值
    // ============================================================================
    console.log("步骤 5: 填写表单...")

    // 输入用户名
    await element_input({
      refId: usernameInput.refId,
      value: "testuser"
    })
    console.log("✅ 已输入用户名")

    // 验证用户名值
    const usernameValue = await assert_value({
      refId: usernameInput.refId,
      expected: "testuser"
    })
    console.log("✅", usernameValue.message)

    // 输入密码
    await element_input({
      refId: passwordInput.refId,
      value: "password123"
    })
    console.log("✅ 已输入密码")

    // 验证密码值
    const passwordValue = await assert_value({
      refId: passwordInput.refId,
      expected: "password123"
    })
    console.log("✅", passwordValue.message, "\n")

    // 截图记录表单状态
    await miniprogram_screenshot({
      filename: "01-login-form-filled.png"
    })
    console.log("📸 已截图: 01-login-form-filled.png\n")

    // ============================================================================
    // 步骤 6: 验证按钮属性
    // ============================================================================
    console.log("步骤 6: 验证按钮属性...")

    // 验证按钮可见
    const buttonVisible = await assert_visible({
      refId: submitButton.refId
    })
    console.log("✅", buttonVisible.message)
    console.log(`   尺寸: ${buttonVisible.size.width}x${buttonVisible.size.height}`)

    // 验证按钮属性
    const buttonType = await assert_attribute({
      refId: submitButton.refId,
      name: "type",
      expected: "primary"
    })
    console.log("✅", buttonType.message)

    // 验证按钮文本
    const buttonText = await assert_text({
      refId: submitButton.refId,
      expected: "登录"
    })
    console.log("✅", buttonText.message, "\n")

    // ============================================================================
    // 步骤 7: 提交表单并等待响应
    // ============================================================================
    console.log("步骤 7: 提交表单...")

    await element_tap({
      refId: submitButton.refId
    })
    console.log("✅ 已点击登录按钮")

    // 等待页面跳转或加载完成
    console.log("⏳ 等待登录处理...")
    await page_wait_for({
      timeout: 3000,
      selector: ".success-message"  // 等待成功消息出现
    })
    console.log("✅ 登录处理完成\n")

    // ============================================================================
    // 步骤 8: 验证登录结果
    // ============================================================================
    console.log("步骤 8: 验证登录结果...")

    // 验证成功消息存在
    const successExists = await assert_exists({
      selector: ".success-message"
    })
    console.log("✅", successExists.message)

    // 查询成功消息元素
    const successMessage = await page_query({
      selector: ".success-message",
      save: true
    })

    // 验证成功消息文本包含特定内容
    const successText = await assert_textContains({
      refId: successMessage.refId,
      expected: "登录成功"
    })
    console.log("✅", successText.message)
    console.log(`   实际文本: "${successText.actual}"`)

    // 验证错误消息不存在
    const errorStillNotExists = await assert_notExists({
      selector: ".error-message"
    })
    console.log("✅", errorStillNotExists.message, "\n")

    // 截图记录登录成功状态
    await miniprogram_screenshot({
      filename: "02-login-success.png"
    })
    console.log("📸 已截图: 02-login-success.png\n")

    // ============================================================================
    // 步骤 9: 验证页面数据
    // ============================================================================
    console.log("步骤 9: 验证页面数据...")

    // 验证用户信息数据
    const userDataAssertion = await assert_data({
      path: "userInfo.username",
      expected: "testuser"
    })
    console.log("✅", userDataAssertion.message)

    // 验证登录状态
    const loginStateAssertion = await assert_data({
      path: "isLoggedIn",
      expected: true
    })
    console.log("✅", loginStateAssertion.message, "\n")

    // ============================================================================
    // 步骤 10: 导航到商品列表页
    // ============================================================================
    console.log("步骤 10: 导航到商品列表页...")

    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/products/products?category=electronics"
    })
    await page_wait_for({ timeout: 2000 })
    console.log("✅ 已跳转到商品列表页\n")

    // ============================================================================
    // 步骤 11: 验证商品列表元素
    // ============================================================================
    console.log("步骤 11: 验证商品列表元素...")

    // 验证商品列表存在
    const productListExists = await assert_exists({
      selector: ".product-list"
    })
    console.log("✅", productListExists.message)

    // 查询第一个商品
    const firstProduct = await page_query({
      selector: ".product-item",
      index: 0,
      save: true
    })
    console.log(`✅ 已查询到第一个商品: ${firstProduct.refId}`)

    // 验证第一个商品可见
    const productVisible = await assert_visible({
      refId: firstProduct.refId
    })
    console.log("✅", productVisible.message)

    // 查询商品名称
    const productName = await page_query({
      selector: ".product-item .name",
      index: 0,
      save: true
    })

    // 验证商品名称包含特定文本
    const nameContains = await assert_textContains({
      refId: productName.refId,
      expected: "iPhone"
    })
    console.log("✅", nameContains.message)
    console.log(`   商品名称: "${nameContains.actual}"\n`)

    // ============================================================================
    // 步骤 12: 验证商品属性
    // ============================================================================
    console.log("步骤 12: 验证商品属性...")

    // 验证商品 data-id 属性
    const productId = await assert_attribute({
      refId: firstProduct.refId,
      name: "data-id",
      expected: "12345"
    })
    console.log("✅", productId.message)

    // 查询商品价格
    const productPrice = await page_query({
      selector: ".product-item .price",
      index: 0,
      save: true
    })

    // 验证价格属性
    const priceProperty = await assert_property({
      refId: productPrice.refId,
      name: "dataset",
      expected: { currency: "CNY", amount: "6999" }
    })
    console.log("✅", priceProperty.message, "\n")

    // ============================================================================
    // 步骤 13: 验证列表数据
    // ============================================================================
    console.log("步骤 13: 验证列表数据...")

    // 验证商品总数
    const productCountAssertion = await assert_data({
      path: "products.length",
      expected: 10
    })
    console.log("✅", productCountAssertion.message)

    // 验证第一个商品的数据
    const firstProductData = await assert_data({
      path: "products[0].name",
      expected: "iPhone 15 Pro"
    })
    console.log("✅", firstProductData.message)

    // 验证分类参数
    const categoryAssertion = await assert_data({
      path: "category",
      expected: "electronics"
    })
    console.log("✅", categoryAssertion.message, "\n")

    // 截图记录商品列表状态
    await miniprogram_screenshot({
      filename: "03-product-list.png"
    })
    console.log("📸 已截图: 03-product-list.png\n")

    // ============================================================================
    // 步骤 14: 测试总结
    // ============================================================================
    console.log("=== 断言验证测试完成 ===\n")
    console.log("📊 测试总结:")
    console.log("   ✅ 登录表单验证通过")
    console.log("   ✅ 表单值验证通过")
    console.log("   ✅ 元素属性验证通过")
    console.log("   ✅ 页面数据验证通过")
    console.log("   ✅ 商品列表验证通过")
    console.log("   ✅ 元素可见性验证通过")
    console.log("   ✅ 生成 3 张测试截图\n")

  } catch (error) {
    console.error("\n❌ 测试失败:", error.message)

    // 错误时截图
    try {
      await miniprogram_screenshot({
        filename: "error-assertion-test.png"
      })
      console.log("📸 错误截图已保存: error-assertion-test.png")
    } catch (screenshotError) {
      console.error("截图失败:", screenshotError.message)
    }

    // 打印详细错误信息
    if (error.message.includes("Assertion failed")) {
      console.error("\n🔍 断言失败详情:")
      console.error("   请检查:")
      console.error("   1. 元素选择器是否正确")
      console.error("   2. 预期值是否匹配实际值")
      console.error("   3. 页面是否加载完成")
      console.error("   4. 异步操作是否完成")
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
assertionTestingExample()
```

---

## 分步讲解

### 步骤 1-2: 启动并导航

```javascript
const launchResult = await miniprogram_launch({
  projectPath: process.env.PROJECT_PATH || "/path/to/your/miniprogram"
})

await miniprogram_navigate({
  method: "navigateTo",
  url: "/pages/login/login"
})
```

**说明**:
- 启动小程序并导航到登录页
- 使用环境变量配置项目路径，提高可移植性
- 等待页面加载完成后再进行断言

---

### 步骤 3: assert_exists - 验证元素存在

```javascript
const usernameExists = await assert_exists({
  selector: "input[placeholder='请输入用户名']"
})

const errorNotExists = await assert_notExists({
  selector: ".error-message"
})
```

**说明**:
- `assert_exists`: 断言元素存在，找不到则抛出错误
- `assert_notExists`: 断言元素不存在，找到则抛出错误
- 用于验证页面初始状态

**使用场景**:
- 验证必需的表单元素已渲染
- 验证错误提示未显示
- 验证页面加载完成

**失败原因**:
- 元素选择器错误
- 页面未加载完成
- 元素被隐藏（CSS display: none）

---

### 步骤 4-5: assert_value - 验证表单值

```javascript
await element_input({
  refId: usernameInput.refId,
  value: "testuser"
})

const usernameValue = await assert_value({
  refId: usernameInput.refId,
  expected: "testuser"
})
```

**说明**:
- 输入值后使用 `assert_value` 验证输入是否成功
- 适用于 `input`, `textarea` 等表单元素
- 值必须完全匹配（区分大小写）

**使用场景**:
- 验证表单输入成功
- 验证数据绑定正确
- 验证表单默认值

**注意事项**:
- 值对比是严格相等（===）
- 对于数字类型，需要转换为字符串
- 对于 checkbox/radio，使用 `assert_property`

---

### 步骤 6: assert_visible - 验证元素可见

```javascript
const buttonVisible = await assert_visible({
  refId: submitButton.refId
})
// 返回: { success: true, message: "...", size: { width: 100, height: 40 } }
```

**说明**:
- 验证元素尺寸大于 0（width > 0 && height > 0）
- 返回元素的实际尺寸
- 不检查 CSS 的 `visibility` 或 `opacity`

**使用场景**:
- 验证元素已渲染
- 验证列表项已显示
- 验证对话框已弹出

**失败原因**:
- 元素未渲染
- CSS 设置了 width: 0 或 height: 0
- 元素在视口外（但仍可能通过断言）

---

### 步骤 6: assert_attribute - 验证元素属性

```javascript
const buttonType = await assert_attribute({
  refId: submitButton.refId,
  name: "type",
  expected: "primary"
})
```

**说明**:
- 验证元素的 HTML 属性（attribute）
- 属性名和值都必须完全匹配
- 返回实际属性值

**使用场景**:
- 验证按钮类型（type="submit"）
- 验证自定义属性（data-id="123"）
- 验证禁用状态（disabled="true"）

**attribute vs property**:
- **attribute**: HTML 标签上的属性（静态）
- **property**: DOM 对象的属性（动态）
- 例如：`<input value="default">` 输入 "new" 后
  - attribute: "default"（不变）
  - property: "new"（改变）

---

### 步骤 6: assert_text - 验证文本内容

```javascript
const buttonText = await assert_text({
  refId: submitButton.refId,
  expected: "登录"
})
```

**说明**:
- 验证元素的文本内容（textContent）
- 文本必须完全匹配，包括空格和换行
- 区分大小写

**使用场景**:
- 验证按钮文案
- 验证标题内容
- 验证提示信息

**注意事项**:
- 会包含子元素的所有文本
- 空格和换行符也会参与对比
- 如果只需要部分匹配，使用 `assert_textContains`

---

### 步骤 7: page_wait_for - 等待异步操作

```javascript
await page_wait_for({
  timeout: 3000,
  selector: ".success-message"  // 等待成功消息出现
})
```

**说明**:
- 等待指定元素出现或超时
- 适用于异步操作（网络请求、动画、延迟渲染）
- 超时后抛出错误

**使用场景**:
- 等待登录请求完成
- 等待列表数据加载
- 等待弹窗出现

**参数说明**:
- `timeout`: 最大等待时间（毫秒）
- `selector`: 要等待的元素选择器（可选）
- 如果不指定 `selector`，则仅等待指定时间

---

### 步骤 8: assert_textContains - 部分文本匹配

```javascript
const successText = await assert_textContains({
  refId: successMessage.refId,
  expected: "登录成功"
})
```

**说明**:
- 验证元素文本包含指定子串
- 不要求完全匹配，只需包含即可
- 区分大小写

**使用场景**:
- 验证动态消息（"登录成功，欢迎回来 testuser"）
- 验证包含时间戳的文本
- 验证多语言文本

**assert_text vs assert_textContains**:
```javascript
// 元素文本: "登录成功，欢迎回来"

// ✅ 通过
await assert_textContains({ refId, expected: "登录成功" })

// ❌ 失败（不完全匹配）
await assert_text({ refId, expected: "登录成功" })

// ✅ 通过
await assert_text({ refId, expected: "登录成功，欢迎回来" })
```

---

### 步骤 9: assert_data - 验证页面数据

```javascript
const userDataAssertion = await assert_data({
  path: "userInfo.username",
  expected: "testuser"
})

const loginStateAssertion = await assert_data({
  path: "isLoggedIn",
  expected: true
})
```

**说明**:
- 验证页面 data 中的数据
- 使用点表示法访问嵌套对象（`userInfo.username`）
- 使用数组索引访问数组元素（`products[0].name`）
- 支持任意 JSON 类型（字符串、数字、布尔、对象、数组）

**使用场景**:
- 验证用户登录状态
- 验证列表数据加载
- 验证数据绑定正确

**路径格式**:
```javascript
// 对象属性
path: "user.name"         // data.user.name

// 数组元素
path: "products[0]"       // data.products[0]

// 嵌套路径
path: "user.orders[0].id" // data.user.orders[0].id

// 数组长度
path: "products.length"   // data.products.length
```

---

### 步骤 12: assert_property - 验证元素属性

```javascript
const priceProperty = await assert_property({
  refId: productPrice.refId,
  name: "dataset",
  expected: { currency: "CNY", amount: "6999" }
})
```

**说明**:
- 验证元素的 JavaScript 属性（property）
- 支持复杂对象对比（使用 JSON.stringify）
- 常用于验证动态属性

**使用场景**:
- 验证 dataset（data-* 属性）
- 验证 classList（CSS 类列表）
- 验证 disabled、checked 等状态

**常用属性**:
```javascript
// dataset - 验证 data-* 属性
{ name: "dataset", expected: { id: "123", type: "product" } }

// classList - 验证 CSS 类
{ name: "classList", expected: ["active", "selected"] }

// disabled - 验证禁用状态
{ name: "disabled", expected: false }

// checked - 验证选中状态
{ name: "checked", expected: true }
```

---

## 预期输出

```
=== 开始断言验证测试 ===

步骤 1: 启动小程序...
✅ Successfully launched mini program
   项目路径: /Users/username/my-miniprogram

步骤 2: 导航到登录页...
✅ 已跳转到登录页

步骤 3: 验证登录表单元素存在...
✅ Element exists: input[placeholder='请输入用户名']
✅ Element exists: input[type='password']
✅ Element exists: button[type='primary']
✅ Element does not exist: .error-message

步骤 4: 查询表单元素...
✅ 用户名输入框: elem_001
✅ 密码输入框: elem_002
✅ 提交按钮: elem_003

步骤 5: 填写表单...
✅ 已输入用户名
✅ Value matches: "testuser"
✅ 已输入密码
✅ Value matches: "password123"

📸 已截图: 01-login-form-filled.png

步骤 6: 验证按钮属性...
✅ Element is visible
   尺寸: 320x44
✅ Attribute "type" matches: "primary"
✅ Text matches: "登录"

步骤 7: 提交表单...
✅ 已点击登录按钮
⏳ 等待登录处理...
✅ 登录处理完成

步骤 8: 验证登录结果...
✅ Element exists: .success-message
✅ Text contains: "登录成功"
   实际文本: "登录成功，欢迎回来 testuser"
✅ Element does not exist: .error-message

📸 已截图: 02-login-success.png

步骤 9: 验证页面数据...
✅ Page data at "userInfo.username" matches
✅ Page data at "isLoggedIn" matches

步骤 10: 导航到商品列表页...
✅ 已跳转到商品列表页

步骤 11: 验证商品列表元素...
✅ Element exists: .product-list
✅ 已查询到第一个商品: elem_004
✅ Element is visible
✅ Text contains: "iPhone"
   商品名称: "iPhone 15 Pro"

步骤 12: 验证商品属性...
✅ Attribute "data-id" matches: "12345"
✅ Property "dataset" matches

步骤 13: 验证列表数据...
✅ Page data at "products.length" matches
✅ Page data at "products[0].name" matches
✅ Page data at "category" matches

📸 已截图: 03-product-list.png

=== 断言验证测试完成 ===

📊 测试总结:
   ✅ 登录表单验证通过
   ✅ 表单值验证通过
   ✅ 元素属性验证通过
   ✅ 页面数据验证通过
   ✅ 商品列表验证通过
   ✅ 元素可见性验证通过
   ✅ 生成 3 张测试截图

步骤 15: 清理资源...
✅ 资源已清理，微信开发者工具已关闭
```

### 断言失败时的输出

```
步骤 8: 验证登录结果...
❌ 测试失败: Assertion failed: Text mismatch. Expected: "登录成功", Actual: "登录失败，用户名或密码错误"

📸 错误截图已保存: error-assertion-test.png

🔍 断言失败详情:
   请检查:
   1. 元素选择器是否正确
   2. 预期值是否匹配实际值
   3. 页面是否加载完成
   4. 异步操作是否完成
```

---

## 常见问题

### 问题 1: 断言失败 - 时序问题

**错误**: `Assertion failed: Element not found with selector: .success-message`

**原因**: 异步操作未完成，元素尚未渲染

**解决方案**:
```javascript
// ❌ 错误：立即断言
await element_tap({ refId: submitButton.refId })
await assert_exists({ selector: ".success-message" })  // 可能失败

// ✅ 正确：等待元素出现
await element_tap({ refId: submitButton.refId })
await page_wait_for({
  timeout: 3000,
  selector: ".success-message"
})
await assert_exists({ selector: ".success-message" })  // 成功
```

---

### 问题 2: 文本断言失败 - 空格问题

**错误**: `Assertion failed: Text mismatch. Expected: "登录成功", Actual: " 登录成功 "`

**原因**: 实际文本包含前后空格或换行符

**解决方案**:
```javascript
// 方案 1: 使用 assert_textContains（推荐）
await assert_textContains({
  refId,
  expected: "登录成功"
})

// 方案 2: 预期值也包含空格
await assert_text({
  refId,
  expected: " 登录成功 "
})

// 方案 3: 先获取文本，手动 trim 后对比
const result = await element_get_text({ refId })
const trimmedText = result.text.trim()
assert(trimmedText === "登录成功")
```

---

### 问题 3: 数据断言失败 - 类型不匹配

**错误**: `Assertion failed: Page data mismatch. Expected: "123", Actual: 123`

**原因**: 预期值类型与实际值类型不一致

**解决方案**:
```javascript
// ❌ 错误：类型不匹配
await assert_data({
  path: "productId",
  expected: "123"  // 字符串
})
// 实际 data: { productId: 123 }  // 数字

// ✅ 正确：类型匹配
await assert_data({
  path: "productId",
  expected: 123  // 数字
})

// ✅ 正确：布尔值
await assert_data({
  path: "isLoggedIn",
  expected: true  // 布尔
})
```

---

### 问题 4: 元素可见性断言失败

**错误**: `Assertion failed: Element is not visible. Size: {"width":0,"height":0}`

**原因**: 元素被 CSS 隐藏或未渲染

**解决方案**:
```javascript
// 检查 1: 元素是否存在
const exists = await assert_exists({ selector: ".product" })
console.log("元素存在:", exists.success)

// 检查 2: 获取元素尺寸
const sizeResult = await element_get_size({ refId })
console.log("元素尺寸:", sizeResult.size)

// 检查 3: 检查 CSS 样式
const displayResult = await element_get_property({
  refId,
  name: "style.display"
})
console.log("display 样式:", displayResult.value)

// 解决方案: 等待元素渲染
await page_wait_for({
  timeout: 2000,
  selector: ".product"
})
await assert_visible({ refId })
```

---

### 问题 5: 属性断言失败 - attribute vs property

**错误**: `Assertion failed: Attribute "value" mismatch. Expected: "new", Actual: "default"`

**原因**: 混淆了 attribute 和 property

**解决方案**:
```javascript
// HTML: <input value="default">
// 用户输入: "new"

// ❌ 错误：attribute 不会改变
await assert_attribute({
  refId,
  name: "value",
  expected: "new"  // 失败！attribute 仍是 "default"
})

// ✅ 正确：使用 assert_value（内部使用 property）
await assert_value({
  refId,
  expected: "new"  // 成功！
})

// ✅ 正确：直接使用 assert_property
await assert_property({
  refId,
  name: "value",
  expected: "new"  // 成功！
})

// 总结：
// - 静态属性用 assert_attribute（如 data-id, type, class）
// - 动态属性用 assert_property（如 value, checked, disabled）
// - 表单值用 assert_value（语义更清晰）
```

---

## 下一步

- 学习 [示例 04: 快照调试](./04-snapshot-debugging.md) - 使用快照功能诊断问题
- 学习 [示例 05: 录制回放](./05-recording-playback.md) - 录制测试流程并回放
- 查看 [Assert API 文档](../docs/api/assert.md) - 断言方法详细说明
- 查看 [Element API 文档](../docs/api/element.md) - 元素操作方法

---

**相关文档**:
- [Assert API](../docs/api/assert.md)
- [Element API](../docs/api/element.md)
- [Page API](../docs/api/page.md)
- [测试最佳实践](../docs/best-practices.md)
