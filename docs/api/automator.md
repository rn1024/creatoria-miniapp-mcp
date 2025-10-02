# Automator API

> Automator 工具提供微信开发者工具的启动、连接、断开和关闭功能，是使用 MCP Server 的第一步。

## 工具列表

| 工具名称 | 描述 | 必需参数 |
|---------|------|----------|
| `miniprogram_launch` | 启动微信开发者工具和小程序 | projectPath |
| `miniprogram_connect` | 连接到已运行的开发者工具 | 无 |
| `miniprogram_disconnect` | 断开连接但保持工具运行 | 无 |
| `miniprogram_close` | 关闭小程序并清理所有资源 | 无 |

---

## miniprogram_launch

启动微信开发者工具并加载小程序项目。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `projectPath` | string | ✅ | - | 小程序项目目录的绝对路径 |
| `cliPath` | string | ⭐ | 自动检测 | 微信开发者工具 CLI 路径（macOS 自动检测） |
| `port` | number | ⭐ | 9420 | 自动化端口号 |

### 返回值

```typescript
{
  success: true,
  message: "Successfully launched mini program",
  projectPath: "/path/to/project",
  port: 9420
}
```

### 错误处理

- **项目路径不存在**: `Error: Project path does not exist: {path}`
- **CLI 路径无效**: `Error: WeChat DevTools CLI not found at: {path}`
- **端口被占用**: `Error: Port {port} is already in use`
- **启动超时**: `Error: Failed to launch mini program: timeout`

### 使用示例

```javascript
// 示例 1: 基础用法（macOS 自动检测 CLI）
const result = await miniprogram_launch({
  projectPath: "/Users/username/my-miniprogram"
})
console.log(result.message) // "Successfully launched mini program"

// 示例 2: 指定 CLI 路径和端口
const result = await miniprogram_launch({
  projectPath: "/Users/username/my-miniprogram",
  cliPath: "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
  port: 9421
})

// 示例 3: 环境变量配置（推荐）
// 在 MCP 客户端配置中设置 PROJECT_PATH 和 CLI_PATH
const result = await miniprogram_launch({
  projectPath: process.env.PROJECT_PATH
})
```

### 注意事项

- ⚠️ **macOS 自动检测**: 仅支持默认安装路径 `/Applications/wechatwebdevtools.app`
- ⚠️ **Windows/Linux**: 必须手动指定 `cliPath`
- 💡 **推荐做法**: 使用环境变量 `PROJECT_PATH` 和 `CLI_PATH`，避免硬编码路径
- 💡 **端口冲突**: 如果 9420 被占用，可指定其他端口（如 9421）

### 相关工具

- [`miniprogram_connect`](#miniprogram_connect) - 连接到已运行的实例
- [`miniprogram_close`](#miniprogram_close) - 关闭开发者工具

---

## miniprogram_connect

连接到已经运行的微信开发者工具实例（需要工具已启动并开启自动化端口）。

### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `port` | number | ⭐ | 9420 | 自动化端口号 |

### 返回值

```typescript
{
  success: true,
  message: "Successfully connected to mini program",
  port: 9420
}
```

### 错误处理

- **连接失败**: `Error: Failed to connect to WeChat DevTools at port {port}`
- **工具未运行**: `Error: WeChat DevTools is not running`
- **端口未开启**: `Error: Automation port {port} is not enabled`

### 使用示例

```javascript
// 示例 1: 连接到默认端口
const result = await miniprogram_connect()
console.log(result.message) // "Successfully connected to mini program"

// 示例 2: 连接到自定义端口
const result = await miniprogram_connect({
  port: 9421
})

// 示例 3: 错误处理
try {
  await miniprogram_connect()
} catch (error) {
  console.error("连接失败:", error.message)
  // 解决方案：
  // 1. 检查微信开发者工具是否已启动
  // 2. 检查端口是否正确
  // 3. 检查是否已开启自动化端口（设置 → 安全 → 服务端口）
}
```

### 注意事项

- ⚠️ **前置条件**: 微信开发者工具必须已启动
- ⚠️ **端口配置**: 需要在开发者工具中开启自动化端口（设置 → 安全 → 服务端口）
- 💡 **使用场景**: 适合调试时手动启动工具，然后通过 MCP 连接
- 💡 **区别**: `launch` 会启动工具，`connect` 仅连接

### 相关工具

- [`miniprogram_launch`](#miniprogram_launch) - 启动开发者工具
- [`miniprogram_disconnect`](#miniprogram_disconnect) - 断开连接

---

## miniprogram_disconnect

断开与小程序的连接，但保持微信开发者工具继续运行。

### 参数

无参数。

### 返回值

```typescript
{
  success: true,
  message: "Successfully disconnected from mini program"
}
```

### 错误处理

- **未连接**: 如果没有活动连接，操作将被忽略（不报错）

### 使用示例

```javascript
// 示例 1: 基础用法
const result = await miniprogram_disconnect()
console.log(result.message) // "Successfully disconnected from mini program"

// 示例 2: 断开后重新连接
await miniprogram_disconnect()
// 手动在开发者工具中操作...
await miniprogram_connect() // 重新连接
```

### 注意事项

- 💡 **工具保持运行**: 断开后开发者工具仍在运行，可以手动操作
- 💡 **资源释放**: Session 中的 miniProgram 引用会被清除，但 pages 和 elements 缓存保留
- 💡 **使用场景**: 需要手动操作开发者工具时使用

### 相关工具

- [`miniprogram_connect`](#miniprogram_connect) - 重新连接
- [`miniprogram_close`](#miniprogram_close) - 完全关闭

---

## miniprogram_close

关闭当前小程序会话并清理所有资源，包括断开连接、关闭开发者工具进程（如果是通过 `launch` 启动的）。

### 参数

无参数。

### 返回值

```typescript
{
  success: true,
  message: "Session closed successfully"
}
```

### 错误处理

- **清理失败**: 即使部分清理失败，也会尝试完成所有清理步骤

### 使用示例

```javascript
// 示例 1: 基础用法
const result = await miniprogram_close()
console.log(result.message) // "Session closed successfully"

// 示例 2: 完整流程
await miniprogram_launch({ projectPath: "/path/to/project" })
// ... 执行自动化操作 ...
await miniprogram_close() // 清理资源

// 示例 3: 错误场景也应该关闭
try {
  await miniprogram_launch({ projectPath: "/path/to/project" })
  // ... 可能出错的操作 ...
} finally {
  await miniprogram_close() // 确保资源被释放
}
```

### 注意事项

- ⚠️ **完全清理**: 会清除 Session 中的所有状态（miniProgram、pages、elements）
- ⚠️ **进程关闭**: 如果是通过 `launch` 启动的，会关闭开发者工具进程
- ⚠️ **幂等操作**: 多次调用安全，不会报错
- 💡 **推荐做法**: 自动化脚本结束时务必调用 `close` 释放资源

### 相关工具

- [`miniprogram_disconnect`](#miniprogram_disconnect) - 仅断开连接，保持工具运行

---

## 完整示例：生命周期管理

```javascript
// 完整的自动化脚本示例
async function runAutomation() {
  try {
    // 1. 启动
    await miniprogram_launch({
      projectPath: "/Users/username/my-miniprogram"
    })
    console.log("✅ 小程序已启动")

    // 2. 执行自动化操作
    await miniprogram_navigate({
      method: "navigateTo",
      url: "/pages/index/index"
    })
    console.log("✅ 已导航到首页")

    // 3. 更多操作...
    const result = await page_query({ selector: ".btn" })
    await element_tap({ refId: result.refId })

  } catch (error) {
    console.error("❌ 自动化失败:", error.message)
  } finally {
    // 4. 清理资源（无论成功失败都执行）
    await miniprogram_close()
    console.log("✅ 资源已清理")
  }
}

runAutomation()
```

---

## 故障排除

### 问题 1: macOS 无法找到 CLI

**错误**: `WeChat DevTools CLI not found`

**解决方案**:
1. 检查开发者工具是否安装在默认路径 `/Applications/wechatwebdevtools.app`
2. 如果安装在其他位置，手动指定 `cliPath`
3. 使用环境变量 `CLI_PATH`

### 问题 2: 端口连接失败

**错误**: `Failed to connect to WeChat DevTools at port 9420`

**解决方案**:
1. 打开开发者工具 → 设置 → 安全 → 开启服务端口
2. 检查端口号是否正确（默认 9420）
3. 确保没有防火墙阻止连接
4. 尝试使用 `miniprogram_connect` 而非 `launch`（如果工具已手动启动）

### 问题 3: 启动超时

**错误**: `Failed to launch mini program: timeout`

**解决方案**:
1. 检查项目路径是否正确
2. 确保项目是有效的小程序项目（包含 app.json）
3. 尝试手动启动开发者工具，然后使用 `connect`
4. 检查系统资源（CPU、内存）

---

## 技术细节

### 连接方式

- **launch**: 使用 `automator.launch()` 启动新实例
- **connect**: 使用 `automator.connect()` 连接现有实例
- **协议**: WebSocket (ws://127.0.0.1:{port})

### 资源管理

- **Session**: 全局单例，管理连接状态
- **自动清理**: 30 分钟不活动自动清理
- **手动清理**: 调用 `miniprogram_close()` 立即清理

### 并发限制

- **单连接模型**: 一次只能连接一个小程序实例
- **串行操作**: 工具调用串行执行（MCP 协议特性）

---

**相关文档**:
- [MiniProgram API](./miniprogram.md) - 小程序操作
- [配置指南](../setup-guide.md) - 环境配置
- [故障排除](../troubleshooting.md) - 常见问题

**最后更新**: 2025-10-02
