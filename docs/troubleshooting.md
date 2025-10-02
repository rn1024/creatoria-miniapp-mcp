# 故障排除指南

本文档汇总了使用 creatoria-miniapp-mcp 过程中的常见问题及解决方案。

---

## 📋 目录

- [安装和配置问题](#安装和配置问题)
- [连接和启动问题](#连接和启动问题)
- [元素查询问题](#元素查询问题)
- [导航和页面问题](#导航和页面问题)
- [断言失败问题](#断言失败问题)
- [录制回放问题](#录制回放问题)
- [性能和超时问题](#性能和超时问题)
- [调试技巧](#调试技巧)

---

## 安装和配置问题

### 问题 1: pnpm install 失败

**症状**:
```bash
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/...
```

**原因**: 网络问题或 npm registry 配置错误

**解决方案**:
```bash
# 切换到淘宝镜像
pnpm config set registry https://registry.npmmirror.com

# 清除缓存后重试
pnpm store prune
pnpm install
```

---

### 问题 2: TypeScript 编译错误

**症状**:
```bash
error TS2304: Cannot find name 'MiniProgram'
```

**原因**: 类型定义缺失或 tsconfig 配置错误

**解决方案**:
```bash
# 重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 检查 tsconfig.json
cat tsconfig.json  # 确认 include 包含 src/**/*
```

---

### 问题 3: MCP 客户端无法识别服务器

**症状**: Claude Desktop 中看不到 miniprogram 工具

**原因**: 配置文件路径错误或格式错误

**解决方案**:
```json
// 检查 ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "miniprogram": {
      "command": "node",
      "args": ["/absolute/path/to/creatoria-miniapp-mcp/dist/cli.js"],
      "env": {
        "PROJECT_PATH": "/absolute/path/to/your/miniprogram"
      }
    }
  }
}
```

**注意**:
- 必须使用绝对路径
- Windows 路径使用反斜杠转义：`C:\\path\\to\\project`
- 重启 Claude Desktop 使配置生效

---

## 连接和启动问题

### 问题 4: macOS 找不到微信开发者工具 CLI

**症状**:
```
Error: WeChat DevTools CLI not found at: /Applications/wechatwebdevtools.app/Contents/MacOS/cli
```

**原因**: 开发者工具未安装或安装在非默认位置

**解决方案**:
```javascript
// 方案 1: 手动指定 CLI 路径
await miniprogram_launch({
  projectPath: "/path/to/project",
  cliPath: "/your/custom/path/to/cli"
})

// 方案 2: 配置环境变量
// 在 MCP 配置中添加 CLI_PATH
{
  "env": {
    "CLI_PATH": "/your/custom/path/to/cli",
    "PROJECT_PATH": "/path/to/project"
  }
}
```

**查找 CLI 路径**:
```bash
# macOS
ls -la "/Applications/wechatwebdevtools.app/Contents/MacOS/cli"

# 如果是稳定版
ls -la "/Applications/wechatwebdevtools.app/Contents/Resources/app.nw/bin/cli"
```

---

### 问题 5: 端口 9420 被占用

**症状**:
```
Error: Port 9420 is already in use
```

**原因**: 端口已被其他程序占用

**解决方案**:
```javascript
// 方案 1: 使用其他端口
await miniprogram_launch({
  projectPath: "/path/to/project",
  port: 9421  // 或其他可用端口
})

// 方案 2: 杀掉占用进程（谨慎使用）
// macOS/Linux
lsof -ti:9420 | xargs kill -9

// Windows
netstat -ano | findstr :9420
taskkill /PID <PID> /F
```

---

### 问题 6: 连接超时

**症状**:
```
Error: Failed to connect to WeChat DevTools at port 9420
```

**原因**: 开发者工具未开启自动化端口

**解决方案**:
1. 打开微信开发者工具
2. 设置 → 安全设置 → 服务端口
3. 勾选"开启"并确认端口号（默认 9420）
4. 重启开发者工具
5. 使用 `miniprogram_connect` 连接：

```javascript
await miniprogram_connect({ port: 9420 })
```

---

### 问题 7: 项目路径不存在

**症状**:
```
Error: Project path does not exist: /path/to/project
```

**解决方案**:
```bash
# 检查路径是否正确
ls -la "/path/to/project"

# 检查是否是有效的小程序项目
ls "/path/to/project/app.json"  # 必须存在

# 使用绝对路径
await miniprogram_launch({
  projectPath: "/Users/username/projects/my-miniprogram"  # 绝对路径
})
```

---

## 元素查询问题

### 问题 8: 元素查询失败

**症状**:
```
Error: Element not found with selector: .my-button
```

**原因**: 元素未渲染、选择器错误或在错误的页面

**解决方案**:
```javascript
// 1. 等待元素出现
await page_wait_for({
  selector: ".my-button",
  timeout: 3000
})
const btn = await page_query({
  selector: ".my-button",
  save: true
})

// 2. 检查选择器语法
// ✅ 正确
".my-button"
"#username"
".list .item:first-child"

// ❌ 错误
"my-button"  // 缺少类选择器符号
".my-button:hover"  // 不支持伪类

// 3. 验证页面路径
const pageStack = await miniprogram_get_page_stack()
console.log("当前页面:", pageStack.pages[pageStack.pages.length - 1].path)

// 4. 使用 snapshot_page 查看页面结构
const snapshot = await snapshot_page({
  includeScreenshot: true
})
console.log("页面数据:", snapshot.data)
```

---

### 问题 9: 元素引用失效

**症状**:
```
Error: Element not found with refId: elem_abc123
```

**原因**: 页面跳转后元素引用失效

**解决方案**:
```javascript
// ❌ 错误：页面跳转后引用失效
const btn = await page_query({ selector: ".btn", save: true })
await miniprogram_navigate({ method: "navigateTo", url: "/other" })
await element_tap({ refId: btn.refId })  // 错误！

// ✅ 正确：跳转后重新查询
await miniprogram_navigate({ method: "navigateTo", url: "/other" })
const newBtn = await page_query({ selector: ".btn", save: true })
await element_tap({ refId: newBtn.refId })
```

---

### 问题 10: 查询到多个元素但只返回第一个

**症状**: `page_query` 只返回第一个匹配的元素

**原因**: `page_query` 设计如此，需要使用 `page_query_all`

**解决方案**:
```javascript
// 查询所有匹配元素
const items = await page_query_all({
  selector: ".product-item",
  save: true
})
console.log(`找到 ${items.count} 个元素`)

// 操作特定索引的元素
await element_tap({ refId: items.elements[2].refId })  // 第 3 个
```

---

## 导航和页面问题

### 问题 11: 页面栈溢出

**症状**:
```
Error: Page stack overflow (maximum 10 pages)
```

**原因**: 连续使用 `navigateTo` 导致页面栈超过 10 层

**解决方案**:
```javascript
// 方案 1: 使用 redirectTo 代替 navigateTo
await miniprogram_navigate({
  method: "redirectTo",  // 不增加页面栈
  url: "/pages/detail/detail"
})

// 方案 2: 使用 reLaunch 重置页面栈
await miniprogram_navigate({
  method: "reLaunch",
  url: "/pages/index/index"
})

// 方案 3: 监控页面栈深度
const pageStack = await miniprogram_get_page_stack()
if (pageStack.pages.length > 8) {
  console.warn("页面栈接近上限，建议使用 redirectTo 或 reLaunch")
}
```

---

### 问题 12: switchTab 无法带参数

**症状**:
```
Error: switchTab cannot accept query parameters
```

**原因**: `switchTab` 是小程序的限制，不支持 URL 参数

**解决方案**:
```javascript
// ❌ 错误
await miniprogram_navigate({
  method: "switchTab",
  url: "/pages/cart/cart?from=detail"  // 错误！
})

// ✅ 正确：使用全局数据或 setData
await page_set_data({
  data: { from: "detail" }
})
await miniprogram_navigate({
  method: "switchTab",
  url: "/pages/cart/cart"
})

// 或使用 miniprogram_evaluate
await miniprogram_evaluate({
  expression: "getApp().globalData.from = 'detail'"
})
```

---

### 问题 13: navigateBack 返回失败

**症状**: 返回操作没有效果或报错

**原因**: 已经在首页或 `delta` 超过页面栈深度

**解决方案**:
```javascript
// 检查页面栈深度
const pageStack = await miniprogram_get_page_stack()
if (pageStack.pages.length > 1) {
  await miniprogram_navigate({
    method: "navigateBack",
    delta: 1
  })
} else {
  console.log("已在首页，无法返回")
}
```

---

## 断言失败问题

### 问题 14: 文本断言失败但看起来相同

**症状**:
```
Assertion failed: Text mismatch. Expected: "Hello", Actual: "Hello "
```

**原因**: 包含不可见的空白字符

**解决方案**:
```javascript
// 方案 1: 使用 assert_text_contains（更宽松）
await assert_text_contains({
  refId: el.refId,
  expected: "Hello"
})

// 方案 2: 先 trim 再比较
const text = await element_get_text({ refId: el.refId })
if (text.text.trim() === "Hello") {
  console.log("✅ 文本匹配")
}

// 方案 3: 获取实际文本查看
const result = await element_get_text({ refId: el.refId })
console.log("实际文本:", JSON.stringify(result.text))
// 输出: "实际文本: \"Hello \""（可以看到尾部空格）
```

---

### 问题 15: 数据断言类型不匹配

**症状**:
```
Assertion failed: Page data mismatch. Expected: 10, Actual: "10"
```

**原因**: 数据类型不一致（数字 vs 字符串）

**解决方案**:
```javascript
// 先获取实际数据类型
const data = await page_get_data({ path: "count" })
console.log("实际值:", data.data, "类型:", typeof data.data)

// 使用正确的类型进行断言
await assert_data({
  path: "count",
  expected: "10"  // 字符串类型
})

// 或者
await assert_data({
  path: "count",
  expected: 10  // 数字类型
})
```

---

### 问题 16: assert_visible 失败但元素明明可见

**症状**:
```
Assertion failed: Element is not visible. Size: {"width":0,"height":0}
```

**原因**: 元素正在动画中、display: none、或还未渲染完成

**解决方案**:
```javascript
// 1. 等待动画完成
await page_wait_for({ timeout: 500 })
await assert_visible({ refId: el.refId })

// 2. 检查元素实际尺寸
const size = await element_get_size({ refId: el.refId })
console.log("元素尺寸:", size.size)

// 3. 截图查看
await miniprogram_screenshot({ filename: "debug-visibility.png" })
```

---

## 录制回放问题

### 问题 20: 录制未记录任何动作

**症状**: 使用 record_stop 时显示 0 个动作

**原因**:
- 未正确启动录制
- 录制期间没有执行工具调用
- 意外停止或丢弃录制

**解决方案**:
```javascript
// 确认录制成功启动
const result = await record_start({ name: "Test" })
console.log(result.success) // 必须为 true

// 执行操作（这些会被自动记录）
await miniprogram_navigate({ method: "navigateTo", url: "/pages/test" })
await element_tap({ selector: ".btn" })

// 停止并保存
const stopResult = await record_stop()
console.log(`Recorded ${stopResult.actionCount} actions`) // 应该 > 0
```

---

### 问题 21: 回放失败率高

**症状**: record_replay 时大量动作失败

**原因**:
- 环境状态与录制时不一致
- RefId 已失效
- 页面路径变化
- 动态数据不匹配

**解决方案**:
```javascript
// 1. 确保初始状态一致
await automator_close()  // 清理旧会话
await automator_launch({ projectPath: PROJECT_PATH })

// 2. 使用 selector 而非 refId 录制
// ✅ 推荐
await element_tap({ selector: ".login-btn" })

// ❌ 避免（refId 可能失效）
await element_tap({ refId: "elem_xxx" })

// 3. 使用 continueOnError 模式查看所有失败
const result = await record_replay({
  sequenceId: "seq_xxx",
  continueOnError: true  // 继续执行，收集所有错误
})

console.log(`Failures: ${result.failureCount}`)
result.results.forEach((r, i) => {
  if (!r.success) {
    console.log(`Action ${i+1} (${r.toolName}): ${r.error}`)
  }
})
```

---

### 问题 22: 序列文件找不到或损坏

**症状**:
- `record_get`: `ENOENT: no such file`
- `record_replay`: `Unexpected token in JSON`

**原因**:
- 序列文件被删除或移动
- 录制时 stop 失败未完成写入
- 文件权限问题

**解决方案**:
```bash
# 1. 检查序列文件位置
ls -la .mcp-artifacts/*/sequences/

# 2. 查看序列列表
# 在 Claude Code 中运行
const { sequences } = await record_list()
console.log(sequences.map(s => s.id))

# 3. 如果文件损坏，删除并重新录制
rm .mcp-artifacts/session_xxx/sequences/seq_xxx.json
# 重新录制
```

---

### 问题 23: 回放速度过快导致失败

**症状**: 回放时元素未加载完成就执行下一步

**原因**: 回放不会等待录制时的时间间隔，连续执行所有动作

**解决方案**:
```javascript
// 在录制时添加明确的等待步骤
await record_start({ name: "Stable Test" })

await element_tap({ selector: ".submit-btn" })

// ✅ 添加等待
await page_waitFor({
  selector: ".result",
  timeout: 5000
})

await assert_exists({ selector: ".result" })

await record_stop()

// 回放时会重新执行 page_waitFor
await record_replay({ sequenceId: "seq_xxx" })
```

---

## 性能和超时问题

### 问题 17: page_wait_for 超时

**症状**:
```
Error: Timeout waiting for element: .loading-spinner
```

**原因**: 元素未在指定时间内出现

**解决方案**:
```javascript
// 方案 1: 增加超时时间
await page_wait_for({
  selector: ".result",
  timeout: 5000  // 5 秒
})

// 方案 2: 使用 try-catch 处理超时
try {
  await page_wait_for({
    selector: ".result",
    timeout: 2000
  })
} catch (error) {
  console.log("元素未出现，继续执行其他逻辑")
  // 或截图调试
  await miniprogram_screenshot({ filename: "timeout-debug.png" })
}

// 方案 3: 检查页面数据状态
const isLoading = await page_get_data({ path: "isLoading" })
if (!isLoading.data) {
  console.log("加载已完成")
}
```

---

### 问题 18: 操作执行缓慢

**症状**: 每个工具调用都很慢

**原因**:
- 未使用元素引用缓存
- 频繁截图
- 网络延迟

**解决方案**:
```javascript
// 1. 使用 save: true 缓存元素
const items = await page_query_all({
  selector: ".item",
  save: true  // ✅ 缓存所有元素引用
})
for (const item of items.elements) {
  await element_tap({ refId: item.refId })  // 直接使用 refId，无需重新查询
}

// 2. 减少截图频率
// ❌ 每步都截图
await element_tap({ refId: btn.refId })
await miniprogram_screenshot({ filename: "step1.png" })
await element_input({ refId: input.refId, value: "test" })
await miniprogram_screenshot({ filename: "step2.png" })

// ✅ 仅关键步骤截图
await element_tap({ refId: btn.refId })
await element_input({ refId: input.refId, value: "test" })
await miniprogram_screenshot({ filename: "form-filled.png" })  // 一次截图

// 3. 批量操作时使用 Promise.all（谨慎）
// 注意：并发操作可能导致竞态条件
```

---

### 问题 19: 会话超时

**症状**:
```
Error: Session expired. Please reconnect.
```

**原因**: 30 分钟无活动导致会话自动清理

**解决方案**:
```javascript
// 重新连接
await miniprogram_launch({
  projectPath: "/path/to/project"
})

// 或使用 connect（如果开发者工具仍在运行）
await miniprogram_connect({ port: 9420 })
```

---

## 调试技巧

### 技巧 1: 使用快照调试

```javascript
// 捕获完整应用状态
const snapshot = await snapshot_full({
  filename: "debug-state",
  includeScreenshot: true
})

console.log("系统信息:", snapshot.data.systemInfo)
console.log("页面栈:", snapshot.data.pageStack)
console.log("当前页面数据:", snapshot.data.currentPage.data)
console.log("快照文件:", snapshot.snapshotPath)
```

---

### 技巧 2: 查看页面 HTML 结构

```javascript
// 获取页面 HTML（通过 evaluate）
const html = await miniprogram_evaluate({
  expression: "document.body.innerHTML"
})
console.log("页面 HTML:", html.result)
```

---

### 技巧 3: 监控页面数据变化

```javascript
// 操作前
const before = await page_get_data()
console.log("操作前:", before.data)

// 执行操作
await element_tap({ refId: btn.refId })
await page_wait_for({ timeout: 500 })

// 操作后
const after = await page_get_data()
console.log("操作后:", after.data)

// 对比
console.log("变化:", JSON.stringify(after.data) !== JSON.stringify(before.data))
```

---

### 技巧 4: 错误时自动截图

```javascript
async function runTestWithAutoScreenshot(testFn, testName) {
  try {
    await testFn()
    console.log(`✅ ${testName} 通过`)
  } catch (error) {
    const filename = `error-${testName}-${Date.now()}.png`
    await miniprogram_screenshot({ filename })
    console.error(`❌ ${testName} 失败:`, error.message)
    console.log(`📸 错误截图: ${filename}`)
    throw error
  }
}

// 使用
await runTestWithAutoScreenshot(async () => {
  await element_tap({ refId: btn.refId })
  await assert_exists({ selector: ".result" })
}, "button-click-test")
```

---

### 技巧 5: 日志记录

```javascript
// 在关键步骤添加日志
console.log("=== 测试开始 ===")
console.log("步骤 1: 启动小程序")
await miniprogram_launch({ projectPath: "/path" })

console.log("步骤 2: 导航到列表页")
await miniprogram_navigate({ method: "navigateTo", url: "/pages/list/list" })

console.log("步骤 3: 查询元素")
const items = await page_query_all({ selector: ".item", save: true })
console.log(`找到 ${items.count} 个元素`)

console.log("=== 测试完成 ===")
```

---

### 技巧 6: 使用录制回放快速重现问题

**场景**: 需要快速重现复杂操作流程中的问题

```javascript
// 1. 录制问题重现步骤
await record_start({ name: "Bug Reproduction" })

// 执行导致问题的操作序列
await miniprogram_navigate(...)
await element_input(...)
await element_tap(...)
// ... 问题出现

await record_stop()

// 2. 修改代码后，快速回放验证
await record_replay({
  sequenceId: "seq_xxx",
  continueOnError: true
})

// 3. 如果问题依然存在，捕获快照对比
await record_start({ name: "Debug Session" })
await record_replay({ sequenceId: "seq_xxx" })
await snapshot_page({ includeScreenshot: true })
await record_stop()
```

**优点**:
- 无需手动重复操作
- 可在 CI/CD 中自动验证修复
- 保存为回归测试用例

---

## 获取帮助

如果以上方案无法解决您的问题，请：

1. **查看完整文档**:
   - [API 参考](./api/README.md)
   - [使用示例](../examples/README.md)
   - [系统架构](./architecture.md)

2. **提交 Issue**:
   - [GitHub Issues](https://github.com/your-org/creatoria-miniapp-mcp/issues)
   - 包含完整错误信息
   - 附上最小可复现代码

3. **参与讨论**:
   - [GitHub Discussions](https://github.com/your-org/creatoria-miniapp-mcp/discussions)

4. **查看源码**:
   - [src/tools/](../src/tools/) - 工具实现
   - [tests/](../tests/) - 测试用例

---

**最后更新**: 2025-10-02
