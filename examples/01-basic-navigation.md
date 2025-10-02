# 示例 01: 基础页面导航

> 学习如何启动小程序并使用 5 种导航方法进行页面跳转

## 难度

⭐ 基础

## 学习目标

- 启动和连接微信开发者工具
- 使用 5 种导航方法（navigateTo, redirectTo, reLaunch, switchTab, navigateBack）
- 获取和验证页面栈信息
- 截图记录页面状态
- 正确关闭和清理资源

## 前置条件

- 已安装微信开发者工具
- 已配置 MCP 客户端（Claude Desktop）
- 准备好测试用小程序项目，包含以下页面：
  - `pages/index/index` (首页)
  - `pages/list/list` (列表页)
  - `pages/detail/detail` (详情页)
  - `pages/cart/cart` (购物车 - tabBar)
  - `pages/user/user` (我的 - tabBar)

---

## 完整代码

```javascript
/**
 * 基础页面导航示例
 * 演示 5 种导航方法的使用
 */
async function basicNavigationExample() {
  try {
    console.log("=== 开始页面导航测试 ===\n")

    // ============================================================================
    // 步骤 1: 启动小程序
    // ============================================================================
    console.log("步骤 1: 启动小程序...")
    const launchResult = await miniprogram_launch({
      projectPath: process.env.PROJECT_PATH || "/path/to/your/miniprogram"
    })
    console.log("✅", launchResult.message)
    console.log(`   项目路径: ${launchResult.projectPath}`)
    console.log(`   端口: ${launchResult.port}\n`)

    // 等待小程序加载完成
    await page_wait_for({ timeout: 2000 })

    // ============================================================================
    // 步骤 2: 获取初始页面栈
    // ============================================================================
    console.log("步骤 2: 获取初始页面栈...")
    let pageStack = await miniprogram_get_page_stack()
    console.log("✅ 当前页面栈:")
    pageStack.pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path}`)
    })
    console.log(`   页面栈深度: ${pageStack.pages.length}\n`)

    // ============================================================================
    // 步骤 3: navigateTo - 保留当前页面，跳转到新页面
    // ============================================================================
    console.log("步骤 3: navigateTo - 跳转到列表页...")
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/list/list?category=electronics"
    })
    await page_wait_for({ timeout: 1000 })

    // 验证页面栈增加
    pageStack = await miniprogram_get_page_stack()
    console.log("✅ 页面栈已更新:")
    pageStack.pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path}`, page.query)
    })
    console.log(`   页面栈深度: ${pageStack.pages.length} (+1)\n`)

    // 截图记录
    await miniprogram_screenshot({
      filename: "01-list-page.png"
    })
    console.log("📸 已截图: 01-list-page.png\n")

    // ============================================================================
    // 步骤 4: navigateTo - 再次跳转到详情页
    // ============================================================================
    console.log("步骤 4: navigateTo - 跳转到详情页...")
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/detail/detail?id=12345"
    })
    await page_wait_for({ timeout: 1000 })

    pageStack = await miniprogram_get_page_stack()
    console.log("✅ 页面栈已更新:")
    pageStack.pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path}`, page.query)
    })
    console.log(`   页面栈深度: ${pageStack.pages.length} (+1)\n`)

    await miniprogram_screenshot({
      filename: "02-detail-page.png"
    })
    console.log("📸 已截图: 02-detail-page.png\n")

    // ============================================================================
    // 步骤 5: navigateBack - 返回上一页
    // ============================================================================
    console.log("步骤 5: navigateBack - 返回上一页...")
    await miniprogram_navigate({
      method: "navigateBack",
      delta: 1  // 返回 1 层
    })
    await page_wait_for({ timeout: 500 })

    pageStack = await miniprogram_get_page_stack()
    console.log("✅ 页面栈已更新:")
    pageStack.pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path}`)
    })
    console.log(`   页面栈深度: ${pageStack.pages.length} (-1)`)
    console.log("   当前页面: 列表页\n")

    // ============================================================================
    // 步骤 6: redirectTo - 关闭当前页面并跳转
    // ============================================================================
    console.log("步骤 6: redirectTo - 关闭当前页并跳转到详情页...")
    await miniprogram_navigate({
      method: "redirectTo",
      url: "/pages/detail/detail?id=67890"
    })
    await page_wait_for({ timeout: 1000 })

    pageStack = await miniprogram_get_page_stack()
    console.log("✅ 页面栈已更新:")
    pageStack.pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path}`, page.query)
    })
    console.log(`   页面栈深度: ${pageStack.pages.length} (不变)`)
    console.log("   当前页面: 详情页 (列表页已被关闭)\n")

    await miniprogram_screenshot({
      filename: "03-redirected-detail.png"
    })
    console.log("📸 已截图: 03-redirected-detail.png\n")

    // ============================================================================
    // 步骤 7: switchTab - 跳转到 tabBar 页面
    // ============================================================================
    console.log("步骤 7: switchTab - 跳转到购物车页...")
    await miniprogram_navigate({
      method: "switchTab",
      url: "/pages/cart/cart"
    })
    await page_wait_for({ timeout: 1000 })

    pageStack = await miniprogram_get_page_stack()
    console.log("✅ 页面栈已更新:")
    pageStack.pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path}`)
    })
    console.log(`   页面栈深度: ${pageStack.pages.length}`)
    console.log("   当前页面: 购物车 (tabBar 页面)\n")

    await miniprogram_screenshot({
      filename: "04-cart-tab.png"
    })
    console.log("📸 已截图: 04-cart-tab.png\n")

    // ============================================================================
    // 步骤 8: reLaunch - 关闭所有页面并跳转
    // ============================================================================
    console.log("步骤 8: reLaunch - 关闭所有页面并重新启动首页...")
    await miniprogram_navigate({
      method: "reLaunch",
      url: "/pages/index/index?from=relaunch"
    })
    await page_wait_for({ timeout: 1000 })

    pageStack = await miniprogram_get_page_stack()
    console.log("✅ 页面栈已更新:")
    pageStack.pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path}`, page.query)
    })
    console.log(`   页面栈深度: ${pageStack.pages.length} (重置为 1)`)
    console.log("   当前页面: 首页 (所有其他页面已关闭)\n`)

    await miniprogram_screenshot({
      filename: "05-relaunched-index.png"
    })
    console.log("📸 已截图: 05-relaunched-index.png\n")

    // ============================================================================
    // 步骤 9: 验证最终状态
    // ============================================================================
    console.log("步骤 9: 验证最终状态...")
    const systemInfo = await miniprogram_get_system_info()
    console.log("✅ 系统信息:")
    console.log(`   平台: ${systemInfo.systemInfo.platform}`)
    console.log(`   设备: ${systemInfo.systemInfo.model}`)
    console.log(`   系统: ${systemInfo.systemInfo.system}`)
    console.log(`   SDK 版本: ${systemInfo.systemInfo.SDKVersion}\n`)

    console.log("=== 页面导航测试完成 ===\n")
    console.log("📊 测试总结:")
    console.log("   ✅ 5 种导航方法全部测试通过")
    console.log("   ✅ 页面栈管理正确")
    console.log("   ✅ 生成 5 张截图")
    console.log("   ✅ 系统信息获取成功\n")

  } catch (error) {
    console.error("\n❌ 测试失败:", error.message)

    // 错误时截图
    try {
      await miniprogram_screenshot({
        filename: "error-state.png"
      })
      console.log("📸 错误截图已保存: error-state.png")
    } catch (screenshotError) {
      console.error("截图失败:", screenshotError.message)
    }

    throw error

  } finally {
    // ============================================================================
    // 步骤 10: 清理资源
    // ============================================================================
    console.log("步骤 10: 清理资源...")
    try {
      await miniprogram_close()
      console.log("✅ 资源已清理，微信开发者工具已关闭\n")
    } catch (closeError) {
      console.error("关闭失败:", closeError.message)
    }
  }
}

// 运行示例
basicNavigationExample()
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
- `projectPath` 可以从环境变量读取或硬编码
- 返回值包含项目路径和端口号

**注意事项**:
- macOS 会自动检测 CLI 路径
- Windows/Linux 需要手动指定 `cliPath`
- 确保项目路径存在且是有效的小程序项目

---

### 步骤 2: 获取页面栈

```javascript
let pageStack = await miniprogram_get_page_stack()
console.log("当前页面栈:")
pageStack.pages.forEach((page, index) => {
  console.log(`   ${index + 1}. ${page.path}`, page.query)
})
```

**说明**:
- `miniprogram_get_page_stack` 返回当前页面栈信息
- `pages` 数组包含所有已打开的页面
- 每个页面包含 `path` 和 `query` 信息

**用途**:
- 验证导航是否成功
- 检查页面栈深度（最多 10 层）
- 调试页面跳转问题

---

### 步骤 3: navigateTo - 保留当前页面

```javascript
await miniprogram_navigate({
  method: "navigateTo",
  url: "/pages/list/list?category=electronics"
})
```

**说明**:
- 保留当前页面，跳转到新页面
- 页面栈深度 +1
- 最多可以打开 10 层页面

**使用场景**:
- 列表 → 详情
- 首页 → 搜索
- 任何需要返回的跳转

**限制**:
- 不能跳转到 tabBar 页面
- 页面栈超过 10 层会报错

---

### 步骤 4: navigateBack - 返回上一页

```javascript
await miniprogram_navigate({
  method: "navigateBack",
  delta: 1  // 返回 1 层，默认值
})
```

**说明**:
- 关闭当前页面，返回上一页
- `delta` 指定返回层数（默认 1）
- 页面栈深度 -delta

**使用场景**:
- 详情页返回列表
- 返回多级页面（`delta: 2`）

**注意**:
- `delta` 超过页面栈深度时返回到首页
- 首页无法再返回

---

### 步骤 5: redirectTo - 关闭当前页面

```javascript
await miniprogram_navigate({
  method: "redirectTo",
  url: "/pages/detail/detail?id=67890"
})
```

**说明**:
- 关闭当前页面，跳转到新页面
- 页面栈深度不变
- 无法返回到被关闭的页面

**使用场景**:
- 登录成功 → 首页（关闭登录页）
- 支付完成 → 订单列表（关闭支付页）

**限制**:
- 不能跳转到 tabBar 页面

---

### 步骤 6: switchTab - 跳转 tabBar

```javascript
await miniprogram_navigate({
  method: "switchTab",
  url: "/pages/cart/cart"
})
```

**说明**:
- 跳转到 tabBar 页面
- 关闭所有非 tabBar 页面
- 页面栈只保留 tabBar 页面

**使用场景**:
- 跳转到首页/我的/购物车等 tabBar
- 从任意页面返回主要入口

**限制**:
- 只能跳转到 app.json 中定义的 tabBar 页面
- URL 不能带参数

---

### 步骤 7: reLaunch - 重新启动

```javascript
await miniprogram_navigate({
  method: "reLaunch",
  url: "/pages/index/index?from=relaunch"
})
```

**说明**:
- 关闭所有页面，打开新页面
- 页面栈重置为 1
- 可以跳转到任意页面（包括 tabBar）

**使用场景**:
- 退出登录返回首页
- 重置应用状态
- 清空页面栈

**优点**:
- 可以跳转到 tabBar
- 可以带 URL 参数
- 完全重置页面栈

---

### 步骤 8: 截图记录

```javascript
await miniprogram_screenshot({
  filename: "01-list-page.png"
})
```

**说明**:
- 截取当前页面
- 保存到 `OUTPUT_DIR` 目录
- 文件名可自定义

**使用场景**:
- 记录测试过程
- 问题诊断
- 生成报告

---

### 步骤 9: 清理资源

```javascript
try {
  await miniprogram_close()
  console.log("✅ 资源已清理")
} catch (closeError) {
  console.error("关闭失败:", closeError.message)
}
```

**说明**:
- 使用 `finally` 确保资源清理
- `miniprogram_close` 关闭开发者工具
- 清理 Session 中的所有状态

**重要性**:
- 防止资源泄漏
- 确保下次测试干净启动
- 释放端口占用

---

## 预期输出

```
=== 开始页面导航测试 ===

步骤 1: 启动小程序...
✅ Successfully launched mini program
   项目路径: /Users/username/my-miniprogram
   端口: 9420

步骤 2: 获取初始页面栈...
✅ 当前页面栈:
   1. pages/index/index
   页面栈深度: 1

步骤 3: navigateTo - 跳转到列表页...
✅ 页面栈已更新:
   1. pages/index/index {}
   2. pages/list/list { category: 'electronics' }
   页面栈深度: 2 (+1)

📸 已截图: 01-list-page.png

步骤 4: navigateTo - 跳转到详情页...
✅ 页面栈已更新:
   1. pages/index/index {}
   2. pages/list/list { category: 'electronics' }
   3. pages/detail/detail { id: '12345' }
   页面栈深度: 3 (+1)

📸 已截图: 02-detail-page.png

步骤 5: navigateBack - 返回上一页...
✅ 页面栈已更新:
   1. pages/index/index {}
   2. pages/list/list { category: 'electronics' }
   页面栈深度: 2 (-1)
   当前页面: 列表页

步骤 6: redirectTo - 关闭当前页并跳转到详情页...
✅ 页面栈已更新:
   1. pages/index/index {}
   2. pages/detail/detail { id: '67890' }
   页面栈深度: 2 (不变)
   当前页面: 详情页 (列表页已被关闭)

📸 已截图: 03-redirected-detail.png

步骤 7: switchTab - 跳转到购物车页...
✅ 页面栈已更新:
   1. pages/cart/cart {}
   页面栈深度: 1
   当前页面: 购物车 (tabBar 页面)

📸 已截图: 04-cart-tab.png

步骤 8: reLaunch - 关闭所有页面并重新启动首页...
✅ 页面栈已更新:
   1. pages/index/index { from: 'relaunch' }
   页面栈深度: 1 (重置为 1)
   当前页面: 首页 (所有其他页面已关闭)

📸 已截图: 05-relaunched-index.png

步骤 9: 验证最终状态...
✅ 系统信息:
   平台: devtools
   设备: iPhone 15 Pro
   系统: iOS 17.2
   SDK 版本: 3.3.4

=== 页面导航测试完成 ===

📊 测试总结:
   ✅ 5 种导航方法全部测试通过
   ✅ 页面栈管理正确
   ✅ 生成 5 张截图
   ✅ 系统信息获取成功

步骤 10: 清理资源...
✅ 资源已清理，微信开发者工具已关闭
```

---

## 常见问题

### 问题 1: 启动失败 - 找不到 CLI

**错误**: `WeChat DevTools CLI not found`

**解决方案**:
```javascript
// macOS 手动指定 CLI 路径
await miniprogram_launch({
  projectPath: "/path/to/project",
  cliPath: "/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
})

// Windows 指定 CLI 路径
await miniprogram_launch({
  projectPath: "C:\\project",
  cliPath: "C:\\Program Files\\微信开发者工具\\cli.bat"
})
```

---

### 问题 2: 页面栈超过 10 层

**错误**: `Page stack overflow`

**解决方案**:
```javascript
// 使用 redirectTo 而非 navigateTo
await miniprogram_navigate({
  method: "redirectTo",  // 不增加页面栈
  url: "/pages/detail/detail"
})

// 或使用 reLaunch 重置页面栈
await miniprogram_navigate({
  method: "reLaunch",
  url: "/pages/index/index"
})
```

---

### 问题 3: switchTab 带参数失败

**错误**: `switchTab cannot accept query parameters`

**解决方案**:
```javascript
// ❌ 错误：switchTab 不能带参数
await miniprogram_navigate({
  method: "switchTab",
  url: "/pages/cart/cart?from=detail"  // 错误！
})

// ✅ 正确：使用全局数据或 storage
await page_set_data({
  data: { from: "detail" }
})
await miniprogram_navigate({
  method: "switchTab",
  url: "/pages/cart/cart"
})
```

---

## 下一步

- 学习 [示例 02: 元素查询与交互](./02-element-interaction.md) - 查询元素、填写表单、获取元素信息
- 学习 [示例 03: 断言测试](./03-assertion-testing.md) - 编写自动化测试
- 查看 [API 文档](../docs/api/miniprogram.md#miniprogram_navigate) - 导航方法详细说明

---

**相关文档**:
- [Automator API](../docs/api/automator.md)
- [MiniProgram API](../docs/api/miniprogram.md)
