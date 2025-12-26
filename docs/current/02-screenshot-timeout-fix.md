# 截图超时问题修复方案

> 版本: 1.0.0
> 日期: 2025-12-27
> 状态: ✅ 已完成

## 1. 问题概述

### 1.1 问题现象

调用截图工具 (`miniprogram_screenshot`) 时经常出现超时卡住，导致：
- MCP 工具调用无响应
- 后续工具调用被阻塞
- 集成测试超时失败

### 1.2 影响范围

| 工具 | 受影响 | 原因 |
|------|--------|------|
| miniprogram_screenshot | ✅ 直接受影响 | 无超时保护 |
| snapshot_page | ✅ 级联受影响 | 调用 screenshot |
| snapshot_full | ✅ 级联受影响 | 调用 screenshot |
| snapshot_element | ✅ 级联受影响 | 调用 screenshot |

---

## 2. 根本原因分析

### 2.1 核心问题：缺少超时保护

**位置**：`src/tools/miniprogram.ts` 第 250-253 行

```typescript
// ❌ 当前代码 - 无超时保护
const screenshotBuffer = await session.miniProgram.screenshot({
  path: fullPath,
  fullPage,
})
```

**对比**：`evaluate()` 函数正确使用了超时保护

```typescript
// ✅ evaluate 的正确做法 (第 174-177 行)
const result = await withTimeout(
  session.miniProgram.evaluate(expression, ...evalArgs),
  timeoutMs,
  'Evaluate expression'
)
```

### 2.2 超时保护对比

| 操作 | 超时保护 | 代码位置 |
|------|---------|---------|
| evaluate | ✅ 有 | miniprogram.ts:174-177 |
| navigate | ❌ 无 | miniprogram.ts:46,50 |
| callWx | ❌ 无 | miniprogram.ts:107 |
| **screenshot** | ❌ **无** | miniprogram.ts:250-253 |
| pageStack | ❌ 无 | miniprogram.ts:297 |
| systemInfo | ❌ 无 | miniprogram.ts:341 |

### 2.3 功能退化：base64 返回被删除

**历史**：commit `e8599ed` 添加了 base64 返回功能
**当前**：HEAD 版本删除了所有 base64 相关代码

```typescript
// e8599ed 版本 - 有快速路径
if (!filename) {
  const base64String = await session.miniProgram.screenshot()
  return { success: true, message: '...', base64: base64String }
}

// 当前版本 - 强制必须有 OutputManager
if (!outputManager) {
  throw new Error('OutputManager not available')
}
```

### 2.4 可能导致长时间卡顿的原因

1. **fullPage 模式**：需要多次截图拼接，非常耗时
2. **WebSocket 连接中断**：DevTools 连接丢失
3. **图片编码**：大分辨率下编码耗时
4. **UI 线程阻塞**：开发者工具 UI 冻结
5. **内存压力**：大型 fullPage 截图导致 GC 暂停

---

## 3. 修复方案

### 3.1 P0：添加超时保护（必须）

**文件**：`src/tools/miniprogram.ts`

```typescript
// 修改后的 screenshot 函数
export async function screenshot(
  session: SessionState,
  args: {
    filename?: string
    fullPage?: boolean
    returnBase64?: boolean  // 恢复 base64 选项
  }
): Promise<{
  success: boolean
  message: string
  path?: string
  base64?: string
}> {
  const { filename, fullPage = false, returnBase64 = false } = args

  // 导入超时工具
  const { withTimeout, getTimeout, DEFAULT_TIMEOUTS } = await import('../runtime/timeout/timeout.js')

  // fullPage 模式使用更长的超时
  const baseTimeout = getTimeout(
    session.loggerConfig?.screenshotTimeout,
    DEFAULT_TIMEOUTS.screenshot
  )
  const timeoutMs = fullPage ? baseTimeout * 2 : baseTimeout

  session.logger?.info('Taking screenshot', { filename, fullPage, timeoutMs })

  // 如果只需要 base64，走快速路径
  if (returnBase64 && !filename) {
    const buffer = await withTimeout(
      session.miniProgram.screenshot({ fullPage }),
      timeoutMs,
      'Screenshot capture (base64)'
    )
    return {
      success: true,
      message: 'Screenshot captured successfully',
      base64: buffer.toString('base64'),
    }
  }

  // 文件保存路径
  const outputManager = session.outputManager
  if (!outputManager) {
    throw new Error('OutputManager not available')
  }

  const resolvedFilename = filename || outputManager.generateFilename('screenshot', 'png')
  const fullPath = join(outputManager.getOutputDir(), resolvedFilename)

  await outputManager.ensureOutputDir()

  // 🔧 关键修复：添加超时保护
  const screenshotBuffer = await withTimeout(
    session.miniProgram.screenshot({
      path: fullPath,
      fullPage,
    }),
    timeoutMs,
    'Screenshot capture'
  )

  if (screenshotBuffer) {
    await outputManager.writeFile(resolvedFilename, screenshotBuffer)
  }

  session.logger?.info('Screenshot saved', { path: fullPath })

  return {
    success: true,
    message: `Screenshot saved to ${resolvedFilename}`,
    path: fullPath,
  }
}
```

### 3.2 P0：恢复 base64 返回能力

**修改 schema**：`src/tools/index.ts` 中 screenshot 工具定义

```typescript
// 添加 returnBase64 参数
{
  name: 'miniprogram_screenshot',
  description: 'Take a screenshot of the Mini Program',
  inputSchema: {
    type: 'object',
    properties: {
      filename: {
        type: 'string',
        description: 'Filename for screenshot (optional, auto-generated if not provided)',
      },
      fullPage: {
        type: 'boolean',
        description: 'Capture full page including scroll area',
        default: false,
      },
      returnBase64: {              // 🆕 新增
        type: 'boolean',
        description: 'Return screenshot as base64 string instead of saving to file',
        default: false,
      },
    },
  },
}
```

**修改返回类型**：

```typescript
// 更新 ScreenshotResult 类型
interface ScreenshotResult {
  success: boolean
  message: string
  path?: string      // 文件路径（保存时）
  base64?: string    // Base64 数据（returnBase64=true 时）
}
```

### 3.3 P1：为其他操作添加超时保护

需要添加超时保护的函数：

| 函数 | 位置 | 超时值 |
|------|------|--------|
| navigate | miniprogram.ts:46 | 30s |
| callWx | miniprogram.ts:107 | 10s |
| getPageStack | miniprogram.ts:297 | 5s |
| getSystemInfo | miniprogram.ts:341 | 5s |

**示例：navigate 修复**

```typescript
export async function navigate(
  session: SessionState,
  args: { url: string }
): Promise<{ success: boolean; message: string }> {
  const { withTimeout, getTimeout, DEFAULT_TIMEOUTS } = await import('../runtime/timeout/timeout.js')

  const timeoutMs = getTimeout(
    session.loggerConfig?.navigationTimeout,
    DEFAULT_TIMEOUTS.navigation
  )

  await withTimeout(
    session.miniProgram.navigateTo({ url: args.url }),
    timeoutMs,
    'Page navigation'
  )

  return { success: true, message: `Navigated to ${args.url}` }
}
```

### 3.4 P1：添加重试机制

**新建**：`src/runtime/retry/retry.ts`

```typescript
export interface RetryOptions {
  maxRetries: number
  delayMs: number
  backoffMultiplier?: number
  shouldRetry?: (error: Error) => boolean
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxRetries,
    delayMs,
    backoffMultiplier = 1.5,
    shouldRetry = () => true,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError
      }

      const delay = delayMs * Math.pow(backoffMultiplier, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
```

**使用示例**：

```typescript
const screenshotBuffer = await withRetry(
  () => withTimeout(
    session.miniProgram.screenshot({ fullPage }),
    timeoutMs,
    'Screenshot capture'
  ),
  {
    maxRetries: 2,
    delayMs: 1000,
    shouldRetry: (error) => error.message.includes('timeout'),
  }
)
```

### 3.5 P2：优化 fullPage 超时

**配置更新**：`src/config/defaults.ts`

```typescript
export const DEFAULT_TIMEOUTS = {
  screenshot: 10 * 1000,           // 10s 普通截图
  screenshotFullPage: 30 * 1000,   // 30s 全页截图
  navigation: 30 * 1000,           // 30s 导航
  evaluate: 5 * 1000,              // 5s 脚本执行
  callWx: 10 * 1000,               // 10s wx API
  pageStack: 5 * 1000,             // 5s 页面栈
  systemInfo: 5 * 1000,            // 5s 系统信息
}
```

### 3.6 P2：添加性能日志

```typescript
export async function screenshot(session: SessionState, args: ScreenshotArgs) {
  const startTime = Date.now()

  try {
    // ... 截图逻辑 ...

    const duration = Date.now() - startTime
    session.logger?.info('Screenshot performance', {
      duration,
      fullPage,
      size: screenshotBuffer?.length,
    })

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    session.logger?.error('Screenshot failed', {
      duration,
      fullPage,
      error: (error as Error).message,
    })
    throw error
  }
}
```

---

## 4. 改动文件清单

### 4.1 修改文件

| 文件 | 改动描述 |
|------|---------|
| src/tools/miniprogram.ts | 添加超时保护、恢复 base64 |
| src/tools/index.ts | 更新 schema 定义 |
| src/config/defaults.ts | 添加新的超时配置 |
| src/types.ts | 更新返回类型定义 |

### 4.2 新建文件

| 文件 | 描述 |
|------|------|
| src/runtime/retry/retry.ts | 重试机制 |
| src/runtime/retry/index.ts | 导出入口 |

### 4.3 测试文件

| 文件 | 描述 |
|------|------|
| tests/unit/screenshot.test.ts | 截图超时测试 |
| tests/unit/retry.test.ts | 重试机制测试 |

---

## 5. 代码改动示例

### 5.1 miniprogram.ts 完整修改

```diff
// src/tools/miniprogram.ts

+ import { withTimeout, getTimeout, DEFAULT_TIMEOUTS } from '../runtime/timeout/timeout.js'

  export async function screenshot(
    session: SessionState,
    args: {
      filename?: string
      fullPage?: boolean
+     returnBase64?: boolean
    }
  ): Promise<{
    success: boolean
    message: string
    path?: string
+   base64?: string
  }> {
-   const { filename, fullPage = false } = args
+   const { filename, fullPage = false, returnBase64 = false } = args

+   // 计算超时时间
+   const baseTimeout = getTimeout(
+     session.loggerConfig?.screenshotTimeout,
+     DEFAULT_TIMEOUTS.screenshot
+   )
+   const timeoutMs = fullPage ? baseTimeout * 2 : baseTimeout

+   session.logger?.info('Taking screenshot', { filename, fullPage, timeoutMs })

+   // base64 快速路径
+   if (returnBase64 && !filename) {
+     const buffer = await withTimeout(
+       session.miniProgram.screenshot({ fullPage }),
+       timeoutMs,
+       'Screenshot capture (base64)'
+     )
+     return {
+       success: true,
+       message: 'Screenshot captured successfully',
+       base64: buffer.toString('base64'),
+     }
+   }

    const outputManager = session.outputManager
    if (!outputManager) {
      throw new Error('OutputManager not available')
    }

    const resolvedFilename = filename || outputManager.generateFilename('screenshot', 'png')
    const fullPath = join(outputManager.getOutputDir(), resolvedFilename)

    await outputManager.ensureOutputDir()

-   const screenshotBuffer = await session.miniProgram.screenshot({
-     path: fullPath,
-     fullPage,
-   })
+   const screenshotBuffer = await withTimeout(
+     session.miniProgram.screenshot({
+       path: fullPath,
+       fullPage,
+     }),
+     timeoutMs,
+     'Screenshot capture'
+   )

    if (screenshotBuffer) {
      await outputManager.writeFile(resolvedFilename, screenshotBuffer)
    }

    session.logger?.info('Screenshot saved', { path: fullPath })

    return {
      success: true,
      message: `Screenshot saved to ${resolvedFilename}`,
      path: fullPath,
    }
  }
```

### 5.2 defaults.ts 修改

```diff
// src/config/defaults.ts

  export const DEFAULT_TIMEOUTS = {
    screenshot: 10 * 1000,
+   screenshotFullPage: 30 * 1000,
    evaluate: 5 * 1000,
    launch: 60 * 1000,
+   navigation: 30 * 1000,
+   callWx: 10 * 1000,
+   pageStack: 5 * 1000,
+   systemInfo: 5 * 1000,
  }
```

---

## 6. 测试计划

### 6.1 单元测试

```typescript
// tests/unit/screenshot.test.ts
describe('screenshot', () => {
  it('should timeout after configured duration', async () => {
    // Mock miniProgram.screenshot to never resolve
    const mockScreenshot = jest.fn(() => new Promise(() => {}))
    session.miniProgram = { screenshot: mockScreenshot }

    await expect(screenshot(session, {}))
      .rejects.toThrow('Screenshot capture timed out')
  })

  it('should return base64 when returnBase64 is true', async () => {
    const mockBuffer = Buffer.from('test-image')
    session.miniProgram = {
      screenshot: jest.fn().mockResolvedValue(mockBuffer)
    }

    const result = await screenshot(session, { returnBase64: true })

    expect(result.base64).toBe(mockBuffer.toString('base64'))
    expect(result.path).toBeUndefined()
  })

  it('should use longer timeout for fullPage', async () => {
    // Verify timeout is doubled for fullPage
  })
})
```

### 6.2 集成测试

```typescript
// tests/integration/screenshot.test.ts
describe('screenshot integration', () => {
  it('should capture and return screenshot', async () => {
    const result = await client.callTool('miniprogram_screenshot', {
      returnBase64: true,
    })

    expect(result.success).toBe(true)
    expect(result.base64).toMatch(/^[A-Za-z0-9+/=]+$/)
  })

  it('should not hang on fullPage screenshot', async () => {
    const startTime = Date.now()

    const result = await client.callTool('miniprogram_screenshot', {
      fullPage: true,
    })

    const duration = Date.now() - startTime
    expect(duration).toBeLessThan(35000) // 30s timeout + buffer
  })
})
```

---

## 7. 时间估算

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| 添加 screenshot 超时保护 | 1h | P0 |
| 恢复 base64 返回能力 | 1h | P0 |
| 其他操作添加超时保护 | 2h | P1 |
| 添加重试机制 | 1.5h | P1 |
| 优化 fullPage 超时配置 | 0.5h | P2 |
| 添加性能日志 | 0.5h | P2 |
| 编写测试 | 2h | P1 |
| **总计** | **8-9h** | - |

---

## 8. 验收标准

- [ ] 截图工具在 10 秒内必须返回结果或超时错误
- [ ] fullPage 截图在 30 秒内必须返回结果或超时错误
- [ ] returnBase64=true 时正确返回 base64 数据
- [ ] 超时错误信息清晰，包含操作名称和超时时长
- [ ] 所有 miniprogram 操作都有超时保护
- [ ] 单元测试覆盖超时场景
- [ ] 集成测试验证不会卡住

---

## 9. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 超时时间设置过短 | 正常截图被误杀 | 添加配置项，允许用户调整 |
| fullPage 页面过长 | 30s 仍不够 | 添加进度回调，支持分段截图 |
| 重试导致更长等待 | 用户体验差 | 重试次数可配置，默认 2 次 |
| SDK 本身有 bug | 无法根本解决 | 添加详细日志，便于排查 |
