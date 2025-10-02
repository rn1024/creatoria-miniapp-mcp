# MiniProgram API

> MiniProgram 工具提供小程序级别的操作，包括页面导航、微信 API 调用、JavaScript 执行、截图和系统信息获取。

## 工具列表

| 工具名称 | 描述 | 必需参数 |
|---------|------|----------|
| `miniprogram_navigate` | 页面导航（5 种方法） | method |
| `miniprogram_call_wx` | 调用微信 API（wx.*） | method |
| `miniprogram_evaluate` | 执行 JavaScript 代码 | expression |
| `miniprogram_screenshot` | 截图（支持全屏） | 无 |
| `miniprogram_get_page_stack` | 获取页面栈信息 | 无 |
| `miniprogram_get_system_info` | 获取系统信息 | 无 |

---

## miniprogram_navigate

在小程序中进行页面导航，支持 5 种导航方法。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `method` | string | ✅ | - | 导航方法：`navigateTo`、`redirectTo`、`reLaunch`、`switchTab`、`navigateBack` |
| `url` | string | ⭐ | - | 目标页面路径（`navigateBack` 不需要） |
| `delta` | number | ⭐ | 1 | 返回的页面数（仅 `navigateBack` 使用） |

**导航方法说明**:
- **navigateTo**: 保留当前页面，跳转到应用内的某个页面（最多 10 层）
- **redirectTo**: 关闭当前页面，跳转到应用内的某个页面
- **reLaunch**: 关闭所有页面，打开到应用内的某个页面
- **switchTab**: 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
- **navigateBack**: 关闭当前页面，返回上一页面或多级页面

### 返回值

```typescript
{
  success: true,
  message: "Successfully navigated using {method}",
  currentPage: "pages/index/index" // 导航后的当前页面路径
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **URL 缺失**: `Error: URL is required for {method}`
- **未知方法**: `Error: Unknown navigation method: {method}`
- **导航失败**: `Error: Navigation failed: {reason}`

### 使用示例

```javascript
// 示例 1: navigateTo - 跳转到详情页
await miniprogram_navigate({
  method: "navigateTo",
  url: "/pages/detail/detail?id=123"
})

// 示例 2: redirectTo - 替换当前页
await miniprogram_navigate({
  method: "redirectTo",
  url: "/pages/result/success"
})

// 示例 3: reLaunch - 重新启动到首页
await miniprogram_navigate({
  method: "reLaunch",
  url: "/pages/index/index"
})

// 示例 4: switchTab - 切换 Tab
await miniprogram_navigate({
  method: "switchTab",
  url: "/pages/profile/profile"
})

// 示例 5: navigateBack - 返回上一页
await miniprogram_navigate({
  method: "navigateBack"
})

// 示例 6: navigateBack - 返回多级页面
await miniprogram_navigate({
  method: "navigateBack",
  delta: 2 // 返回 2 层
})
```

### 注意事项

- ⚠️ **页面栈限制**: `navigateTo` 最多 10 层，超出会失败
- ⚠️ **Tab 页面**: `switchTab` 只能跳转到 `app.json` 中配置的 tabBar 页面
- 💡 **查询参数**: 使用 `?key=value&key2=value2` 格式传递参数
- 💡 **相对路径**: URL 必须是绝对路径，以 `/` 开头

### 相关工具

- [`miniprogram_get_page_stack`](#miniprogram_get_page_stack) - 查看当前页面栈
- [`page_query`](./page.md#page_query) - 导航后查询页面元素

---

## miniprogram_call_wx

调用微信小程序的 wx.* API 方法。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `method` | string | ✅ | - | 微信 API 方法名（不含 `wx.` 前缀） |
| `args` | any[] | ⭐ | [] | 方法参数数组 |

### 返回值

```typescript
{
  success: true,
  message: "Successfully called wx.{method}",
  result: any // API 调用结果
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **调用失败**: `Error: wx.{method} call failed: {reason}`

### 使用示例

```javascript
// 示例 1: 调用 wx.showToast
await miniprogram_call_wx({
  method: "showToast",
  args: [{
    title: "操作成功",
    icon: "success",
    duration: 2000
  }]
})

// 示例 2: 调用 wx.setStorage
await miniprogram_call_wx({
  method: "setStorage",
  args: [{
    key: "userInfo",
    data: { name: "张三", age: 25 }
  }]
})

// 示例 3: 调用 wx.getLocation
const result = await miniprogram_call_wx({
  method: "getLocation",
  args: [{ type: "wgs84" }]
})
console.log(result.result) // { latitude: 39.9, longitude: 116.4 }

// 示例 4: 调用无参数的 API
await miniprogram_call_wx({
  method: "hideLoading"
})
```

### 注意事项

- ⚠️ **权限要求**: 某些 API 需要在 `app.json` 中配置权限
- ⚠️ **异步 API**: 大部分 wx API 是异步的，返回 Promise
- 💡 **参数格式**: args 是数组，每个元素对应一个参数
- 💡 **结果获取**: API 返回值在 `result` 字段中

### 相关工具

- [`miniprogram_evaluate`](#miniprogram_evaluate) - 执行自定义 JS 代码

---

## miniprogram_evaluate

在小程序上下文中执行 JavaScript 代码。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `expression` | string | ✅ | - | 要执行的 JavaScript 表达式或代码块 |
| `args` | any[] | ⭐ | [] | 传递给表达式的参数 |

### 返回值

```typescript
{
  success: true,
  message: "Expression evaluated successfully",
  result: any // 表达式执行结果
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **执行失败**: `Error: Evaluation failed: {reason}`

### 使用示例

```javascript
// 示例 1: 获取全局变量
const result = await miniprogram_evaluate({
  expression: "getApp().globalData.userInfo"
})
console.log(result.result) // { name: "...", ... }

// 示例 2: 执行函数
await miniprogram_evaluate({
  expression: "getApp().login()"
})

// 示例 3: 计算表达式
const result = await miniprogram_evaluate({
  expression: "1 + 2 + 3"
})
console.log(result.result) // 6

// 示例 4: 访问页面数据
const result = await miniprogram_evaluate({
  expression: "getCurrentPages()[0].data.userList.length"
})
console.log(result.result) // 数组长度

// 示例 5: 带参数的表达式
const result = await miniprogram_evaluate({
  expression: "(a, b) => a + b",
  args: [10, 20]
})
console.log(result.result) // 30
```

### 注意事项

- ⚠️ **作用域**: 代码在小程序全局作用域中执行
- ⚠️ **安全性**: 避免执行不可信的代码
- 💡 **调试**: 适合获取运行时状态和调试
- 💡 **getApp()**: 可以通过 `getApp()` 访问全局数据
- 💡 **getCurrentPages()**: 可以通过 `getCurrentPages()` 访问页面栈

### 相关工具

- [`miniprogram_call_wx`](#miniprogram_call_wx) - 调用微信 API
- [`page_get_data`](./page.md#page_get_data) - 获取页面数据（推荐）

---

## miniprogram_screenshot

截取小程序当前屏幕内容。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `filename` | string | ⭐ | 自动生成 | 截图文件名（如 `my-screenshot.png`） |
| `fullPage` | boolean | ⭐ | false | 是否截取整个页面（包括滚动区域） |

### 返回值

```typescript
{
  success: true,
  message: "Screenshot captured successfully",
  path: "/absolute/path/to/screenshot-001-20251002-100000.png"
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **OutputManager 不可用**: `Error: OutputManager not available`
- **截图失败**: `Error: Screenshot failed: {reason}`

### 使用示例

```javascript
// 示例 1: 基础截图（当前视口）
const result = await miniprogram_screenshot()
console.log(result.path) // "/path/to/screenshot-001-....png"

// 示例 2: 全页面截图
const result = await miniprogram_screenshot({
  fullPage: true
})

// 示例 3: 自定义文件名
const result = await miniprogram_screenshot({
  filename: "login-page.png"
})

// 示例 4: 捕获失败场景
try {
  await some_operation()
} catch (error) {
  // 失败时截图保存现场
  const screenshot = await miniprogram_screenshot({
    filename: "error-screenshot.png"
  })
  console.log("错误截图已保存:", screenshot.path)
  throw error
}
```

### 注意事项

- ⚠️ **输出目录**: 截图保存到配置的输出目录（默认 `.mcp-artifacts/`）
- ⚠️ **fullPage 性能**: 全页面截图可能较慢，取决于页面高度
- 💡 **自动命名**: 不指定 filename 时自动生成 `screenshot-{counter}-{timestamp}.png`
- 💡 **调试工具**: 适合捕获失败场景用于调试

### 相关工具

- [`snapshot_page`](./snapshot.md#snapshot_page) - 页面快照（数据 + 截图）

---

## miniprogram_get_page_stack

获取当前小程序的页面栈信息。

### 参数

无参数。

### 返回值

```typescript
{
  success: true,
  message: "Page stack retrieved successfully",
  pages: [
    {
      path: "pages/index/index",
      query: {}
    },
    {
      path: "pages/detail/detail",
      query: { id: "123", from: "search" }
    }
  ]
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **获取失败**: `Error: Failed to get page stack: {reason}`

### 使用示例

```javascript
// 示例 1: 获取页面栈
const result = await miniprogram_get_page_stack()
console.log(`当前页面栈深度: ${result.pages.length}`)
result.pages.forEach((page, index) => {
  console.log(`[${index}] ${page.path}`, page.query)
})

// 示例 2: 获取当前页面信息
const result = await miniprogram_get_page_stack()
const currentPage = result.pages[result.pages.length - 1]
console.log("当前页面:", currentPage.path)
console.log("查询参数:", currentPage.query)

// 示例 3: 检查页面栈深度
const result = await miniprogram_get_page_stack()
if (result.pages.length >= 10) {
  console.warn("页面栈已满，无法再使用 navigateTo")
}
```

### 注意事项

- 💡 **页面顺序**: 数组从栈底到栈顶排列，最后一个元素是当前页面
- 💡 **查询参数**: `query` 包含页面 URL 的查询参数对象
- 💡 **栈深度限制**: 小程序页面栈最多 10 层
- 💡 **Session 更新**: 调用此工具会更新 `session.pages` 缓存

### 相关工具

- [`miniprogram_navigate`](#miniprogram_navigate) - 页面导航

---

## miniprogram_get_system_info

获取小程序运行环境的系统信息。

### 参数

无参数。

### 返回值

```typescript
{
  success: true,
  message: "System information retrieved successfully",
  systemInfo: {
    platform: "devtools",      // 平台：ios/android/devtools
    version: "8.0.0",           // 微信版本号
    SDKVersion: "2.0.0",        // 基础库版本
    system: "macOS 10.15.7",    // 操作系统信息
    model: "iPhone 12",         // 设备型号
    pixelRatio: 2,              // 设备像素比
    screenWidth: 375,           // 屏幕宽度（px）
    screenHeight: 667,          // 屏幕高度（px）
    windowWidth: 375,           // 可使用窗口宽度（px）
    windowHeight: 667,          // 可使用窗口高度（px）
    language: "zh_CN",          // 语言
    // ... 更多字段
  }
}
```

### 错误处理

- **未连接**: `Error: MiniProgram not connected`
- **获取失败**: `Error: Failed to get system info: {reason}`

### 使用示例

```javascript
// 示例 1: 获取系统信息
const result = await miniprogram_get_system_info()
console.log("平台:", result.systemInfo.platform)
console.log("微信版本:", result.systemInfo.version)
console.log("基础库版本:", result.systemInfo.SDKVersion)

// 示例 2: 检查运行环境
const result = await miniprogram_get_system_info()
if (result.systemInfo.platform === "devtools") {
  console.log("当前在开发者工具中运行")
} else {
  console.log("当前在真机/模拟器中运行")
}

// 示例 3: 获取设备信息
const result = await miniprogram_get_system_info()
console.log("设备型号:", result.systemInfo.model)
console.log("屏幕尺寸:", `${result.systemInfo.screenWidth}x${result.systemInfo.screenHeight}`)
console.log("像素比:", result.systemInfo.pixelRatio)

// 示例 4: 检查基础库版本
const result = await miniprogram_get_system_info()
const version = result.systemInfo.SDKVersion
if (compareVersion(version, "2.10.0") >= 0) {
  console.log("支持新特性")
}
```

### 注意事项

- 💡 **devtools 环境**: 开发者工具中 platform 为 `"devtools"`
- 💡 **版本兼容**: 使用 SDKVersion 判断基础库功能支持
- 💡 **设备适配**: 使用屏幕尺寸和像素比进行响应式适配
- 💡 **环境检测**: 通过 platform 区分真机和开发者工具

### 相关工具

- [`snapshot_full`](./snapshot.md#snapshot_full) - 完整应用快照（包含系统信息）

---

## 完整示例：页面导航和验证

```javascript
// 完整的导航和验证流程
async function navigateAndVerify() {
  try {
    // 1. 获取当前页面栈
    const stackBefore = await miniprogram_get_page_stack()
    console.log("导航前页面栈深度:", stackBefore.pages.length)

    // 2. 导航到商品列表页
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/product/list?category=electronics"
    })
    console.log("✅ 已导航到商品列表页")

    // 3. 等待页面加载完成
    await page_wait_for({ condition: ".product-item" })
    console.log("✅ 页面加载完成")

    // 4. 验证页面栈
    const stackAfter = await miniprogram_get_page_stack()
    console.log("导航后页面栈深度:", stackAfter.pages.length)

    const currentPage = stackAfter.pages[stackAfter.pages.length - 1]
    console.log("当前页面:", currentPage.path)
    console.log("查询参数:", currentPage.query)

    // 5. 截图保存
    await miniprogram_screenshot({
      filename: "product-list.png"
    })
    console.log("✅ 截图已保存")

  } catch (error) {
    console.error("❌ 操作失败:", error.message)
    // 失败时也截图
    await miniprogram_screenshot({ filename: "error-screenshot.png" })
  }
}
```

---

## 故障排除

### 问题 1: 导航失败

**错误**: `Navigation failed: ...`

**解决方案**:
1. 检查页面路径是否正确（必须以 `/` 开头）
2. 检查页面是否在 `app.json` 中注册
3. switchTab 只能跳转到 tabBar 页面
4. navigateTo 页面栈最多 10 层

### 问题 2: wx API 调用失败

**错误**: `wx.{method} call failed: ...`

**解决方案**:
1. 检查 API 名称是否正确（不含 `wx.` 前缀）
2. 检查权限配置（`app.json` 中的 `permission`）
3. 检查参数格式是否正确
4. 某些 API 只能在真机运行

### 问题 3: 截图为空或失败

**错误**: `Screenshot failed: ...`

**解决方案**:
1. 检查 OutputManager 是否配置
2. 检查输出目录权限
3. 等待页面渲染完成后再截图
4. fullPage 模式可能在某些情况下不可用

---

**相关文档**:
- [Automator API](./automator.md) - 连接管理
- [Page API](./page.md) - 页面操作
- [Snapshot API](./snapshot.md) - 状态快照

**最后更新**: 2025-10-02
