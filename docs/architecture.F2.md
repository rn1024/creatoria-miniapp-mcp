# Architecture: F2 - 失败时自动快照收集

## 文档信息
- **项目**: creatoria-miniapp-mcp
- **阶段**: F - 可观测性与产物输出
- **任务**: F2 - 失败时自动收集截图和数据快照
- **作者**: ClaudeCode
- **日期**: 2025-10-03
- **版本**: 1.0

## 目录
1. [系统概述](#1-系统概述)
2. [架构设计](#2-架构设计)
3. [详细设计](#3-详细设计)
4. [接口设计](#4-接口设计)
5. [数据模型](#5-数据模型)
6. [错误处理](#6-错误处理)
7. [性能考量](#7-性能考量)
8. [安全性](#8-安全性)
9. [测试策略](#9-测试策略)

---

## 1. 系统概述

### 1.1 背景
在自动化测试执行过程中，工具调用失败时开发者往往需要手动重现问题以获取失败现场。F2 任务旨在实现失败时的自动快照收集，保存失败瞬间的页面状态、截图和错误上下文，显著提升调试效率。

### 1.2 目标
- **自动化诊断收集**：工具失败时无需人工介入，自动保存现场
- **完整上下文**：包含错误信息、工具参数、页面数据、截图
- **可配置**：用户可选择启用/禁用，避免产生过多文件
- **无侵入**：快照收集失败不影响原始错误流程

### 1.3 关键约束
- 依赖 D2 快照工具（已实现）
- 依赖 F1 日志系统和 ToolLogger
- Fire-and-forget 模式，不阻塞错误抛出
- 默认关闭，显式启用

---

## 2. 架构设计

### 2.1 C4 模型

#### Level 1: 系统上下文图
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                       MCP Client (Claude)                         │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ MCP Protocol
                         │ (stdio transport)
                         v
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                  MCP Server (miniapp-mcp)                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           ToolLogger with Failure Snapshots             │   │
│  │  - Wraps tool handlers                                  │   │
│  │  - Captures failures automatically                      │   │
│  │  - Saves: screenshot + data + error context             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          v
              ┌───────────────────────┐
              │  File System          │
              │  .mcp-artifacts/      │
              │    failures/          │
              └───────────────────────┘
```

#### Level 2: 容器图
```
┌──────────────────────────────────────────────────────────────────────┐
│                        MCP Server Process                             │
│                                                                       │
│  ┌────────────────┐     ┌────────────────┐     ┌─────────────────┐ │
│  │   ToolLogger   │────>│  SnapshotTools │────>│ OutputManager   │ │
│  │                │     │  (D2)          │     │                 │ │
│  │ - wrap()       │     │ - snapshotPage │     │ - writeFile()   │ │
│  │ - capture...() │     │ - screenshot   │     │ - ensureDir()   │ │
│  └────────────────┘     └────────────────┘     └─────────────────┘ │
│         │                                                             │
│         v                                                             │
│  ┌────────────────┐                                                  │
│  │    Logger      │                                                  │
│  │  (F1)          │                                                  │
│  │ - info()       │                                                  │
│  │ - error()      │                                                  │
│  └────────────────┘                                                  │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            v
              ┌─────────────────────────────┐
              │  Artifacts Directory        │
              │                             │
              │  failures/                  │
              │    {tool}-{timestamp}/      │
              │      ├─ snapshot.json       │
              │      ├─ snapshot.png        │
              │      └─ error-context.json  │
              └─────────────────────────────┘
```

#### Level 3: 组件图
```
┌──────────────────────────────────────────────────────────────────────┐
│                          ToolLogger                                   │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  wrap<TArgs, TResult>(toolName, handler)                       │ │
│  │                                                                │ │
│  │  try {                                                         │ │
│  │    const result = await handler(session, args)                │ │
│  │    logger.info('Tool call completed')                         │ │
│  │    return result                                               │ │
│  │  } catch (error) {                                             │ │
│  │    logger.error('Tool call failed')                           │ │
│  │                                                                │ │
│  │    ┌────────────────────────────────────────────────────┐    │ │
│  │    │ if (config.enableFailureSnapshot) {                │    │ │
│  │    │   void this.captureFailureSnapshot({               │    │ │
│  │    │     session, toolName, args, error, duration       │    │ │
│  │    │   }).catch(e => {                                   │    │ │
│  │    │     logger.warn('Snapshot capture failed', e)      │    │ │
│  │    │   })                                                │    │ │
│  │    │ }                                                   │    │ │
│  │    └────────────────────────────────────────────────────┘    │ │
│  │                                                                │ │
│  │    throw error // Re-throw original error                     │ │
│  │  }                                                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  private async captureFailureSnapshot(context)                │ │
│  │                                                                │ │
│  │  1. Check prerequisites                                       │ │
│  │     - session.miniProgram exists?                             │ │
│  │     - session.outputManager exists?                           │ │
│  │     - config.enableFailureSnapshot === true?                  │ │
│  │                                                                │ │
│  │  2. Create failure directory                                  │ │
│  │     - Path: failures/{toolName}-{timestamp}/                  │ │
│  │                                                                │ │
│  │  3. Capture snapshot                                          │ │
│  │     - Call snapshotPage() → snapshot.json + snapshot.png      │ │
│  │                                                                │ │
│  │  4. Save error context                                        │ │
│  │     - File: error-context.json                                │ │
│  │     - Content: { toolName, timestamp, error, args, duration } │ │
│  │                                                                │ │
│  │  5. Log result                                                │ │
│  │     - logger.info('Failure snapshot captured', { path })      │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流图

```
┌───────────────┐
│  Tool Call    │
│  Execution    │
└───────┬───────┘
        │
        v
  ┌─────────────┐
  │   Success?  │
  └─────┬───┬───┘
        │   │
    YES │   │ NO
        │   v
        │  ┌───────────────────────┐
        │  │  ToolLogger.wrap()    │
        │  │  catch block          │
        │  └───────┬───────────────┘
        │          │
        │          v
        │  ┌────────────────────────────┐
        │  │ config.enableFailure       │
        │  │ Snapshot === true?         │
        │  └───────┬────────────────────┘
        │          │
        │      YES │
        │          v
        │  ┌────────────────────────────┐
        │  │ captureFailureSnapshot()   │
        │  │ (async, fire-and-forget)   │
        │  └───────┬────────────────────┘
        │          │
        │          │ ┌─ Check prerequisites
        │          │ │  (miniProgram, outputManager)
        │          │ │
        │          │ ├─ Create failure directory
        │          │ │  failures/{tool}-{timestamp}/
        │          │ │
        │          │ ├─ Call snapshotPage()
        │          │ │  → snapshot.json
        │          │ │  → snapshot.png
        │          │ │
        │          │ └─ Save error-context.json
        │          │    { toolName, timestamp, error, args }
        │          v
        │  ┌────────────────────────────┐
        │  │  Snapshot saved to:        │
        │  │  failures/{tool}-{ts}/     │
        │  └────────────────────────────┘
        │
        v
  ┌─────────────────┐
  │  Throw Error    │
  │  (original)     │
  └─────────────────┘
```

---

## 3. 详细设计

### 3.1 配置扩展

#### 3.1.1 类型定义 (src/types.ts)
```typescript
/**
 * Logger configuration
 */
export interface LoggerConfig {
  level?: LogLevel
  enableFileLog?: boolean
  outputDir?: string
  bufferSize?: number
  flushInterval?: number

  /**
   * Enable automatic failure snapshot capture
   * When a tool call fails, automatically save:
   * - Page screenshot (PNG)
   * - Page data snapshot (JSON)
   * - Error context (JSON)
   *
   * Output: {outputDir}/failures/{toolName}-{timestamp}/
   *
   * @default false
   */
  enableFailureSnapshot?: boolean
}
```

#### 3.1.2 默认配置 (src/config/defaults.ts)
```typescript
export const DEFAULT_LOGGER_CONFIG: Required<LoggerConfig> = {
  level: 'info',
  enableFileLog: false,
  outputDir: '.mcp-artifacts',
  bufferSize: 100,
  flushInterval: 5000,
  enableFailureSnapshot: false, // 🆕 默认关闭
}
```

### 3.2 ToolLogger 扩展

#### 3.2.1 构造函数修改
```typescript
export class ToolLogger {
  private config: LoggerConfig

  constructor(
    private logger: Logger,
    config?: LoggerConfig
  ) {
    this.config = config || {}
  }

  // ... existing wrap() method
}
```

#### 3.2.2 失败快照捕获方法
```typescript
/**
 * Capture failure snapshot when tool call fails
 *
 * Creates a failure directory with:
 * - snapshot.json: Page data
 * - snapshot.png: Screenshot
 * - error-context.json: Error details + tool context
 *
 * @param context Failure context
 * @returns Promise that resolves when snapshot is saved (or fails silently)
 */
private async captureFailureSnapshot(context: {
  session: SessionState
  toolName: string
  args: any
  error: Error
  duration: number
}): Promise<void> {
  const { session, toolName, args, error, duration } = context
  const logger = this.logger

  try {
    // 1. Check prerequisites
    if (!this.config.enableFailureSnapshot) {
      return // Feature disabled
    }

    if (!session.miniProgram) {
      logger?.debug('Skipping failure snapshot: miniProgram not connected')
      return
    }

    if (!session.outputManager) {
      logger?.debug('Skipping failure snapshot: outputManager not available')
      return
    }

    // 2. Create failure directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const failureDirName = `${toolName}-${timestamp}`
    const failureDir = `failures/${failureDirName}`

    const outputManager = session.outputManager
    await outputManager.ensureOutputDir()

    // Create failures subdirectory
    const { mkdir } = await import('fs/promises')
    const { join } = await import('path')
    const failurePath = join(outputManager.getOutputDir(), failureDir)
    await mkdir(failurePath, { recursive: true })

    logger?.info('Capturing failure snapshot', { path: failurePath })

    // 3. Capture page snapshot
    const snapshotFilename = join(failureDir, 'snapshot.json')
    const screenshotFilename = join(failureDir, 'snapshot.png')

    const snapshotTools = await import('../tools/snapshot.js')
    await snapshotTools.snapshotPage(session, {
      filename: snapshotFilename,
      includeScreenshot: true,
      fullPage: false,
    })

    // 4. Save error context
    const errorContext = {
      toolName,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      args: this.sanitizeArgs(args), // Reuse existing sanitization
      duration,
    }

    const contextFilename = join(failureDir, 'error-context.json')
    await outputManager.writeFile(
      contextFilename,
      Buffer.from(JSON.stringify(errorContext, null, 2))
    )

    logger?.info('Failure snapshot captured successfully', {
      path: failurePath,
      files: ['snapshot.json', 'snapshot.png', 'error-context.json'],
    })
  } catch (snapshotError) {
    // Snapshot capture failed - log but don't throw
    logger?.warn('Failed to capture failure snapshot', {
      error: snapshotError instanceof Error ? snapshotError.message : String(snapshotError),
    })
  }
}
```

#### 3.2.3 wrap() 方法集成
```typescript
wrap<TArgs, TResult>(
  toolName: string,
  handler: (session: SessionState, args: TArgs) => Promise<TResult>
): (session: SessionState, args: TArgs) => Promise<TResult> {
  return async (session: SessionState, args: TArgs): Promise<TResult> => {
    const startTime = Date.now()
    const childLogger = this.logger.child(toolName)

    // Log START
    childLogger.info('Tool call started', {
      phase: 'START',
      args: this.sanitizeArgs(args),
    })

    try {
      // Execute tool
      const result = await handler(session, args)
      const duration = Date.now() - startTime

      // Log END
      childLogger.info('Tool call completed', {
        phase: 'END',
        duration,
        result: this.sanitizeResult(result),
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // Log ERROR
      childLogger.error('Tool call failed', {
        phase: 'ERROR',
        duration,
        error: error instanceof Error ? error.message : String(error),
        stackTrace: error instanceof Error ? error.stack : undefined,
      })

      // 🆕 Capture failure snapshot (fire-and-forget)
      if (this.config.enableFailureSnapshot) {
        void this.captureFailureSnapshot({
          session,
          toolName,
          args,
          error: error instanceof Error ? error : new Error(String(error)),
          duration,
        }).catch((e) => {
          childLogger.warn('Snapshot capture failed', {
            error: e instanceof Error ? e.message : String(e),
          })
        })
      }

      throw error // Re-throw to preserve error handling
    }
  }
}
```

---

## 4. 接口设计

### 4.1 公共接口

#### 4.1.1 配置接口
```typescript
// 用户在 server.ts 或 .mcp.json 中配置
const server = await startServer({
  logLevel: 'info',
  enableFileLog: true,
  enableFailureSnapshot: true, // 🆕 启用失败快照
  outputDir: '.mcp-artifacts',
})
```

#### 4.1.2 输出目录结构
```
.mcp-artifacts/
└── session-{sessionId}-{timestamp}/
    ├── logs/
    │   └── session-{sessionId}.log
    └── failures/                              # 🆕 失败快照目录
        ├── element_click-20251003-123456/
        │   ├── snapshot.json                  # 页面数据
        │   ├── snapshot.png                   # 页面截图
        │   └── error-context.json             # 错误上下文
        └── page_navigate-20251003-123500/
            ├── snapshot.json
            ├── snapshot.png
            └── error-context.json
```

### 4.2 内部接口

#### 4.2.1 ToolLogger 构造函数
```typescript
class ToolLogger {
  constructor(logger: Logger, config?: LoggerConfig)
}
```

#### 4.2.2 失败快照捕获
```typescript
private async captureFailureSnapshot(context: {
  session: SessionState
  toolName: string
  args: any
  error: Error
  duration: number
}): Promise<void>
```

---

## 5. 数据模型

### 5.1 错误上下文文件 (error-context.json)

```json
{
  "toolName": "element_click",
  "timestamp": "2025-10-03T12:34:56.789Z",
  "error": {
    "message": "Element not found: .submit-btn",
    "stack": "Error: Element not found...\n    at element_click (...)",
    "code": "ELEMENT_NOT_FOUND"
  },
  "args": {
    "selector": ".submit-btn",
    "pagePath": "pages/checkout/checkout"
  },
  "duration": 1234
}
```

### 5.2 页面快照文件 (snapshot.json)

```json
{
  "timestamp": "2025-10-03T12:34:56.789Z",
  "pagePath": "pages/checkout/checkout",
  "pageData": {
    "items": [...],
    "total": 299.99,
    "userInfo": "[REDACTED]"
  },
  "pageQuery": {
    "from": "cart",
    "orderid": "123456"
  }
}
```

### 5.3 文件命名规范

| 文件类型 | 命名格式 | 示例 |
|---------|----------|------|
| 失败目录 | `{toolName}-{timestamp}/` | `element_click-20251003-123456/` |
| 页面数据 | `snapshot.json` | `snapshot.json` |
| 页面截图 | `snapshot.png` | `snapshot.png` |
| 错误上下文 | `error-context.json` | `error-context.json` |

**时间戳格式**: `YYYYMMDD-HHmmss` (ISO 8601 移除符号)

---

## 6. 错误处理

### 6.1 错误分级

| 错误类型 | 处理策略 | 日志级别 |
|---------|----------|---------|
| miniProgram 未连接 | 跳过快照，DEBUG 日志 | DEBUG |
| outputManager 不可用 | 跳过快照，DEBUG 日志 | DEBUG |
| 快照文件创建失败 | 捕获异常，WARN 日志 | WARN |
| 目录创建失败 | 捕获异常，WARN 日志 | WARN |
| 原始工具错误 | 正常抛出，不受影响 | ERROR |

### 6.2 错误处理原则

1. **非侵入性**: 快照收集失败不影响原始错误
2. **Fail Silently**: 快照失败仅记录警告日志
3. **Fire-and-Forget**: 不阻塞错误抛出流程
4. **详细日志**: 记录失败原因便于调试

### 6.3 错误处理示例

```typescript
try {
  await this.captureFailureSnapshot(context)
} catch (snapshotError) {
  // 🔴 不抛出，仅记录
  logger?.warn('Failed to capture failure snapshot', {
    error: snapshotError instanceof Error
      ? snapshotError.message
      : String(snapshotError),
  })
}
```

---

## 7. 性能考量

### 7.1 性能目标

| 指标 | 目标值 | 实际值 | 备注 |
|-----|--------|--------|------|
| 快照收集耗时 | < 500ms | TBD | 异步，不阻塞 |
| 额外内存占用 | < 10MB | TBD | 临时缓冲 |
| 磁盘空间占用 | ~100KB-5MB/次 | TBD | 取决于截图大小 |
| 错误抛出延迟 | 0ms | 0ms | Fire-and-forget |

### 7.2 性能优化策略

#### 7.2.1 异步非阻塞
```typescript
// ❌ 错误：阻塞错误抛出
await this.captureFailureSnapshot(context)
throw error

// ✅ 正确：Fire-and-forget
void this.captureFailureSnapshot(context).catch(...)
throw error // 立即抛出
```

#### 7.2.2 条件触发
```typescript
// 只在配置启用时执行
if (this.config.enableFailureSnapshot) {
  void this.captureFailureSnapshot(context)
}
```

#### 7.2.3 前提条件检查
```typescript
// 快速退出，避免不必要的操作
if (!session.miniProgram || !session.outputManager) {
  return
}
```

### 7.3 性能监控

```typescript
// 记录快照收集耗时
const snapshotStart = Date.now()
await snapshotTools.snapshotPage(...)
const snapshotDuration = Date.now() - snapshotStart

logger?.debug('Snapshot capture performance', {
  duration: snapshotDuration,
  size: fileSize,
})
```

---

## 8. 安全性

### 8.1 安全威胁模型

| 威胁 | 风险等级 | 缓解措施 |
|-----|----------|---------|
| 路径遍历攻击 | 🔴 高 | 使用 `join()` + 禁止 `..` |
| 敏感数据泄漏 | 🟡 中 | 复用 F1 脱敏逻辑 |
| 磁盘空间耗尽 | 🟢 低 | 默认关闭 + 文档提醒 |
| 恶意工具参数 | 🟡 中 | 参数脱敏 + 大小限制 |

### 8.2 安全措施

#### 8.2.1 路径验证
```typescript
// ✅ 安全：使用 join() 防止路径遍历
const failurePath = join(outputManager.getOutputDir(), failureDir)

// ❌ 危险：直接拼接
const failurePath = `${outputDir}/${failureDir}` // 可能被 ../攻击
```

#### 8.2.2 参数脱敏
```typescript
// 复用 F1 的 sanitizeArgs() 方法
args: this.sanitizeArgs(args) // 移除 password, token 等
```

#### 8.2.3 文件大小限制
```typescript
// 限制 error-context.json 大小
const contextJson = JSON.stringify(errorContext, null, 2)
if (contextJson.length > 100 * 1024) { // 100KB
  throw new Error('Error context too large')
}
```

### 8.3 安全最佳实践

1. **最小权限原则**: 快照文件权限 0644
2. **数据脱敏**: 所有用户数据必须脱敏
3. **输入验证**: 验证所有文件名和路径
4. **审计日志**: 记录快照创建事件

---

## 9. 测试策略

### 9.1 单元测试

#### 9.1.1 配置开关测试
```typescript
describe('ToolLogger Failure Snapshot', () => {
  it('should capture snapshot when enabled', async () => {
    const logger = new ToolLogger(mockLogger, {
      enableFailureSnapshot: true,
    })

    const handler = jest.fn().mockRejectedValue(new Error('Test error'))
    const wrappedHandler = logger.wrap('test_tool', handler)

    await expect(wrappedHandler(mockSession, {})).rejects.toThrow('Test error')

    // 验证快照文件创建
    expect(fs.existsSync('failures/test_tool-*/snapshot.json')).toBe(true)
    expect(fs.existsSync('failures/test_tool-*/snapshot.png')).toBe(true)
    expect(fs.existsSync('failures/test_tool-*/error-context.json')).toBe(true)
  })

  it('should NOT capture snapshot when disabled', async () => {
    const logger = new ToolLogger(mockLogger, {
      enableFailureSnapshot: false, // 关闭
    })

    const handler = jest.fn().mockRejectedValue(new Error('Test error'))
    const wrappedHandler = logger.wrap('test_tool', handler)

    await expect(wrappedHandler(mockSession, {})).rejects.toThrow('Test error')

    // 验证没有创建快照
    expect(fs.existsSync('failures/')).toBe(false)
  })
})
```

#### 9.1.2 错误不阻塞测试
```typescript
it('should not block error when snapshot fails', async () => {
  const logger = new ToolLogger(mockLogger, {
    enableFailureSnapshot: true,
  })

  // Mock snapshotPage to fail
  jest.spyOn(snapshotTools, 'snapshotPage').mockRejectedValue(
    new Error('Snapshot failed')
  )

  const handler = jest.fn().mockRejectedValue(new Error('Original error'))
  const wrappedHandler = logger.wrap('test_tool', handler)

  // 应该抛出原始错误，而非快照错误
  await expect(wrappedHandler(mockSession, {})).rejects.toThrow('Original error')
})
```

#### 9.1.3 前提条件测试
```typescript
it('should skip snapshot if miniProgram not connected', async () => {
  const sessionWithoutMP = { ...mockSession, miniProgram: undefined }
  const logger = new ToolLogger(mockLogger, {
    enableFailureSnapshot: true,
  })

  const handler = jest.fn().mockRejectedValue(new Error('Test error'))
  const wrappedHandler = logger.wrap('test_tool', handler)

  await expect(wrappedHandler(sessionWithoutMP, {})).rejects.toThrow('Test error')

  // 验证没有创建快照（因为前提条件不满足）
  expect(fs.existsSync('failures/')).toBe(false)
})
```

### 9.2 集成测试

```typescript
describe('Failure Snapshot Integration', () => {
  it('should capture real failure snapshot', async () => {
    // 启动真实 MCP 服务器
    const server = await startServer({
      enableFailureSnapshot: true,
    })

    // 连接到 miniProgram
    await server.call('miniprogram_connect', { port: 9420 })

    // 触发一个会失败的工具调用
    try {
      await server.call('element_click', {
        selector: '.nonexistent-element',
      })
    } catch (error) {
      // 验证快照已创建
      const files = fs.readdirSync('failures/')
      expect(files.length).toBeGreaterThan(0)

      const snapshotDir = files[0]
      expect(fs.existsSync(`failures/${snapshotDir}/snapshot.json`)).toBe(true)
      expect(fs.existsSync(`failures/${snapshotDir}/snapshot.png`)).toBe(true)
      expect(fs.existsSync(`failures/${snapshotDir}/error-context.json`)).toBe(true)

      // 验证 error-context.json 内容
      const errorContext = JSON.parse(
        fs.readFileSync(`failures/${snapshotDir}/error-context.json`, 'utf-8')
      )
      expect(errorContext.toolName).toBe('element_click')
      expect(errorContext.error.message).toContain('nonexistent-element')
    }
  })
})
```

### 9.3 性能测试

```typescript
describe('Failure Snapshot Performance', () => {
  it('should not block error throwing', async () => {
    const logger = new ToolLogger(mockLogger, {
      enableFailureSnapshot: true,
    })

    const handler = jest.fn().mockRejectedValue(new Error('Test error'))
    const wrappedHandler = logger.wrap('test_tool', handler)

    const start = Date.now()
    await expect(wrappedHandler(mockSession, {})).rejects.toThrow('Test error')
    const errorThrowTime = Date.now() - start

    // 错误抛出应该立即发生（< 10ms）
    expect(errorThrowTime).toBeLessThan(10)

    // 等待快照收集完成（异步）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 验证快照已创建
    expect(fs.existsSync('failures/')).toBe(true)
  })
})
```

---

## 10. 实现清单

### Phase 1: 核心实现
- [ ] 扩展 `LoggerConfig` 类型 (`src/types.ts`)
- [ ] 添加默认配置 (`src/config/defaults.ts`)
- [ ] 实现 `ToolLogger.captureFailureSnapshot()` 方法
- [ ] 修改 `ToolLogger.wrap()` 集成快照逻辑
- [ ] 传递 config 到 ToolLogger 构造函数

### Phase 2: 测试验证
- [ ] 单元测试：配置开关测试
- [ ] 单元测试：错误不阻塞测试
- [ ] 单元测试：前提条件测试
- [ ] 集成测试：端到端快照收集

### Phase 3: 文档完善
- [ ] 更新 README 配置示例
- [ ] 更新使用文档
- [ ] 添加故障排查文档

---

## 11. 附录

### 11.1 相关文档
- [Charter F2](./charter.F2.align.yaml)
- [Architecture F1](./architecture.F1.md) - 日志系统
- [Architecture D2](./architecture.D2.md) - 快照工具

### 11.2 参考资料
- MCP Protocol Specification
- miniprogram-automator SDK
- Node.js fs/promises API

### 11.3 版本历史
- v1.0 (2025-10-03): 初始设计
