# Architecture: F3 - 会话报告生成

## 文档信息
- **项目**: creatoria-miniapp-mcp
- **阶段**: F - 可观测性与产物输出
- **任务**: F3 - 会话报告生成（JSON/Markdown 汇总）
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
自动化测试执行后，开发者需要查看执行结果、成功率、失败原因等信息。F3 任务实现会话级别的报告生成，将所有工具调用汇总为结构化报告（JSON）和可读报告（Markdown），便于分析和分享。

### 1.2 目标
- **会话汇总**：自动收集所有工具调用记录
- **双格式输出**：JSON（机器可读）+ Markdown（人类可读）
- **失败追踪**：关联 F2 快照路径
- **性能分析**：提供耗时统计和性能指标

### 1.3 关键约束
- 依赖 F1 日志系统（ToolLogger）
- 依赖 F2 快照路径格式
- 默认禁用（显式启用）
- Fire-and-forget 模式（不阻塞关闭）

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
│  │            Session Report Generator (F3)                 │   │
│  │  - Collects tool call records                           │   │
│  │  - Generates JSON/Markdown reports on session close     │   │
│  │  - Links to F2 failure snapshots                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          v
              ┌───────────────────────┐
              │  File System          │
              │  .mcp-artifacts/      │
              │    report.json        │
              │    report.md          │
              └───────────────────────┘
```

#### Level 2: 容器图
```
┌──────────────────────────────────────────────────────────────────────┐
│                        MCP Server Process                             │
│                                                                       │
│  ┌────────────────┐     ┌────────────────┐     ┌─────────────────┐ │
│  │   ToolLogger   │────>│ ReportCollector│────>│ ReportGenerator │ │
│  │  (F1)          │     │                │     │                 │ │
│  │ - wrap()       │     │ - record()     │     │ - generateJSON()│ │
│  │ - log calls    │     │ - aggregate()  │     │ - generateMD()  │ │
│  └────────────────┘     └────────────────┘     └─────────────────┘ │
│         │                       │                       │             │
│         │                       │                       v             │
│         v                       v                ┌─────────────────┐ │
│  ┌────────────────┐     ┌────────────────┐     │ OutputManager   │ │
│  │ SessionState   │     │ SessionState   │     │                 │ │
│  │ - reportData   │<────│ - reportData   │     │ - writeFile()   │ │
│  │   .toolCalls[] │     │   .toolCalls[] │     └─────────────────┘ │
│  └────────────────┘     └────────────────┘                          │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            v
              ┌─────────────────────────────┐
              │  Artifacts Directory        │
              │                             │
              │  {sessionId}/               │
              │    ├─ report.json           │
              │    ├─ report.md             │
              │    └─ failures/             │
              └─────────────────────────────┘
```

#### Level 3: 组件图
```
┌──────────────────────────────────────────────────────────────────────┐
│                          ToolLogger (F1)                              │
│                                                                       │
│  wrap(toolName, handler) {                                           │
│    const startTime = Date.now()                                      │
│                                                                       │
│    try {                                                             │
│      const result = await handler(session, args)                    │
│      const duration = Date.now() - startTime                        │
│                                                                       │
│      // F3: Record successful call                                   │
│      if (session.reportData) {                                       │
│        session.reportData.toolCalls.push({                           │
│          timestamp, toolName, duration, success: true, result        │
│        })                                                            │
│      }                                                               │
│                                                                       │
│      return result                                                   │
│    } catch (error) {                                                 │
│      const duration = Date.now() - startTime                        │
│                                                                       │
│      // F3: Record failed call                                       │
│      if (session.reportData) {                                       │
│        session.reportData.toolCalls.push({                           │
│          timestamp, toolName, duration, success: false,              │
│          error: { message, snapshotPath }                            │
│        })                                                            │
│      }                                                               │
│                                                                       │
│      throw error                                                     │
│    }                                                                 │
│  }                                                                   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      SessionStore.dispose()                           │
│                                                                       │
│  async dispose() {                                                   │
│    // Close all sessions                                             │
│    for (const sessionId of this.sessions.keys()) {                   │
│      const session = this.sessions.get(sessionId)                    │
│                                                                       │
│      // F3: Generate report before cleanup                           │
│      if (session.reportData && config.enableSessionReport) {         │
│        void generateSessionReport(session).catch(err => {            │
│          logger.warn('Report generation failed', err)                │
│        })                                                            │
│      }                                                               │
│                                                                       │
│      await this.delete(sessionId)                                    │
│    }                                                                 │
│  }                                                                   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      ReportGenerator                                  │
│                                                                       │
│  async generateSessionReport(session: SessionState) {                │
│    const { reportData, sessionId, outputManager } = session          │
│                                                                       │
│    // 1. Calculate summary statistics                                │
│    const summary = calculateSummary(reportData.toolCalls)            │
│                                                                       │
│    // 2. Extract failures                                            │
│    const failures = reportData.toolCalls                             │
│      .filter(call => !call.success)                                  │
│      .map(call => ({                                                 │
│        toolName: call.toolName,                                      │
│        timestamp: call.timestamp,                                    │
│        error: call.error.message,                                    │
│        snapshotPath: call.error.snapshotPath                         │
│      }))                                                             │
│                                                                       │
│    // 3. Generate JSON report                                        │
│    const jsonReport = {                                              │
│      sessionId,                                                      │
│      startTime: reportData.startTime,                                │
│      endTime: reportData.endTime,                                    │
│      duration: reportData.endTime - reportData.startTime,            │
│      summary,                                                        │
│      toolCalls: reportData.toolCalls.map(sanitizeCall),              │
│      failures                                                        │
│    }                                                                 │
│                                                                       │
│    await outputManager.writeFile(                                    │
│      'report.json',                                                  │
│      JSON.stringify(jsonReport, null, 2)                             │
│    )                                                                 │
│                                                                       │
│    // 4. Generate Markdown report                                    │
│    const mdReport = generateMarkdown(jsonReport)                     │
│    await outputManager.writeFile('report.md', mdReport)              │
│                                                                       │
│    logger.info('Session report generated', {                         │
│      sessionId,                                                      │
│      totalCalls: summary.totalCalls,                                 │
│      successRate: summary.successRate                                │
│    })                                                                │
│  }                                                                   │
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
  │ ToolLogger  │
  │  .wrap()    │
  └─────┬───────┘
        │
        v
  ┌────────────────────────┐
  │ Record to              │
  │ session.reportData     │
  │   .toolCalls.push()    │
  └────────┬───────────────┘
           │
           │ (Continue accumulating)
           v
  ┌────────────────────────┐
  │ Session Close          │
  │ (dispose triggered)    │
  └────────┬───────────────┘
           │
           v
  ┌────────────────────────────┐
  │ config.enableSession       │
  │ Report === true?           │
  └───────┬────────────────────┘
          │
      YES │
          v
  ┌────────────────────────────┐
  │ generateSessionReport()    │
  │ (async, fire-and-forget)   │
  └───────┬────────────────────┘
          │
          │ ┌─ Calculate summary stats
          │ │  (total, success, fail, avg duration)
          │ │
          │ ├─ Extract failures with snapshot links
          │ │
          │ ├─ Generate JSON report
          │ │  └─ Write to report.json
          │ │
          │ └─ Generate Markdown report
          │    └─ Write to report.md
          │
          v
  ┌────────────────────────────┐
  │ Report files saved         │
  │ - report.json              │
  │ - report.md                │
  └────────────────────────────┘
```

---

## 3. 详细设计

### 3.1 数据收集流程

**初始化** (Session 创建时):
```typescript
// src/core/session.ts
session = {
  sessionId,
  // ... existing fields
  reportData: config.enableSessionReport ? {
    toolCalls: [],
    startTime: new Date(),
  } : undefined,
}
```

**记录工具调用** (ToolLogger.wrap):
```typescript
// src/core/tool-logger.ts
private recordToolCall(
  session: SessionState,
  toolName: string,
  duration: number,
  success: boolean,
  resultOrError: any
): void {
  if (!session.reportData) return // Feature disabled

  const record: ToolCallRecord = {
    timestamp: new Date(),
    toolName,
    duration,
    success,
  }

  if (success) {
    record.result = this.sanitizeResult(resultOrError)
  } else {
    const error = resultOrError as Error
    record.error = {
      message: error.message,
      snapshotPath: this.extractSnapshotPath(session, toolName),
    }
  }

  session.reportData.toolCalls.push(record)

  // Memory protection: limit to 1000 records
  if (session.reportData.toolCalls.length > 1000) {
    session.reportData.toolCalls.shift() // Remove oldest
    this.logger?.warn('Report data limit reached, oldest record dropped')
  }
}
```

**提取快照路径**:
```typescript
private extractSnapshotPath(
  session: SessionState,
  toolName: string
): string | undefined {
  // Check if F2 snapshot was created
  const sanitizedToolName = toolName.replace(/[^a-zA-Z0-9_-]/g, '_')
  const pattern = new RegExp(`failures/${sanitizedToolName}-.*`)

  // Search recent logger output for snapshot path
  // (Alternative: ToolLogger could cache last snapshot path)
  return undefined // Simplified for now
}
```

### 3.2 报告生成流程

**触发时机** (Session 关闭):
```typescript
// src/core/session.ts
async dispose(): Promise<void> {
  const sessions = Array.from(this.sessions.values())

  for (const session of sessions) {
    // F3: Generate report before cleanup
    if (session.reportData && this.config?.enableSessionReport) {
      session.reportData.endTime = new Date()

      void generateSessionReport(session, this.config).catch((error) => {
        console.error(`Failed to generate report for ${session.sessionId}:`, error)
      })
    }

    await this.delete(session.sessionId)
  }
}
```

**报告生成器**:
```typescript
// src/core/report-generator.ts
export async function generateSessionReport(
  session: SessionState,
  config: ServerConfig
): Promise<void> {
  const { sessionId, reportData, outputManager } = session

  if (!reportData || !outputManager) {
    throw new Error('Missing report data or output manager')
  }

  // 1. Calculate summary
  const summary = calculateSummary(reportData.toolCalls)

  // 2. Extract failures
  const failures = reportData.toolCalls
    .filter((call) => !call.success)
    .map((call) => ({
      toolName: call.toolName,
      timestamp: call.timestamp.toISOString(),
      error: call.error?.message || 'Unknown error',
      snapshotPath: call.error?.snapshotPath,
    }))

  // 3. Build JSON report
  const jsonReport: SessionReport = {
    sessionId,
    startTime: reportData.startTime.toISOString(),
    endTime: reportData.endTime!.toISOString(),
    duration: reportData.endTime!.getTime() - reportData.startTime.getTime(),
    summary,
    toolCalls: reportData.toolCalls,
    failures,
  }

  // 4. Write JSON
  await outputManager.writeFile(
    'report.json',
    Buffer.from(JSON.stringify(jsonReport, null, 2))
  )

  // 5. Generate and write Markdown
  const markdown = generateMarkdownReport(jsonReport)
  await outputManager.writeFile('report.md', Buffer.from(markdown))

  console.error(`Session report generated: ${sessionId}`)
}
```

### 3.3 Markdown 生成

```typescript
function generateMarkdownReport(report: SessionReport): string {
  const duration = formatDuration(report.duration)
  const successRate = ((report.summary.successRate * 100).toFixed(1))

  let md = `# Session Report: ${report.sessionId}\n\n`

  // Summary section
  md += `## Summary\n`
  md += `- **Duration**: ${duration}\n`
  md += `- **Total Calls**: ${report.summary.totalCalls}\n`
  md += `- **Success Rate**: ${successRate}% (${report.summary.successCount}/${report.summary.totalCalls})\n`
  md += `- **Average Duration**: ${formatDuration(report.summary.avgDuration)}\n\n`

  // Tool statistics table
  md += `## Tool Call Statistics\n`
  md += formatToolStatistics(report.toolCalls)
  md += `\n\n`

  // Failures section
  if (report.failures.length > 0) {
    md += `## Failures\n`
    report.failures.forEach((failure, index) => {
      md += `### ${index + 1}. ${failure.toolName}\n`
      md += `- **Time**: ${failure.timestamp}\n`
      md += `- **Error**: ${failure.error}\n`
      if (failure.snapshotPath) {
        md += `- **Snapshot**: [${failure.snapshotPath}](${failure.snapshotPath})\n`
      }
      md += `\n`
    })
  }

  // Timeline (last 20 calls)
  md += `## Timeline (Last 20 Calls)\n`
  md += formatTimeline(report.toolCalls.slice(-20))

  return md
}
```

---

## 4. 接口设计

### 4.1 类型定义

```typescript
// src/types.ts

/**
 * Tool call record for session report
 */
export interface ToolCallRecord {
  timestamp: Date
  toolName: string
  duration: number // milliseconds
  success: boolean
  result?: any // Sanitized result (success case)
  error?: {
    message: string
    snapshotPath?: string // Link to F2 failure snapshot
  }
}

/**
 * Report data collected during session
 */
export interface ReportData {
  toolCalls: ToolCallRecord[]
  startTime: Date
  endTime?: Date
}

/**
 * Session report (JSON format)
 */
export interface SessionReport {
  sessionId: string
  startTime: string // ISO 8601
  endTime: string // ISO 8601
  duration: number // milliseconds
  summary: {
    totalCalls: number
    successCount: number
    failureCount: number
    successRate: number // 0-1
    avgDuration: number // milliseconds
    maxDuration: number
    minDuration: number
  }
  toolCalls: ToolCallRecord[]
  failures: Array<{
    toolName: string
    timestamp: string
    error: string
    snapshotPath?: string
  }>
}

/**
 * Server config extension
 */
export interface ServerConfig {
  // ... existing fields
  enableSessionReport?: boolean // Enable session report generation (default: false)
}
```

### 4.2 公开 API

```typescript
// src/core/report-generator.ts

/**
 * Generate session report (JSON + Markdown)
 */
export async function generateSessionReport(
  session: SessionState,
  config: ServerConfig
): Promise<void>

/**
 * Calculate summary statistics
 */
export function calculateSummary(toolCalls: ToolCallRecord[]): SessionReport['summary']

/**
 * Generate Markdown report from JSON report
 */
export function generateMarkdownReport(report: SessionReport): string
```

---

## 5. 数据模型

### 5.1 SessionState 扩展

```typescript
export interface SessionState {
  sessionId: string
  // ... existing fields
  reportData?: ReportData // 🆕 Report collection
}
```

### 5.2 ToolCallRecord 结构

```typescript
interface ToolCallRecord {
  timestamp: Date           // When the tool was called
  toolName: string          // Tool identifier
  duration: number          // Execution time in ms
  success: boolean          // true = success, false = error
  result?: any              // Sanitized result (success)
  error?: {                 // Error details (failure)
    message: string         // Error message
    snapshotPath?: string   // Relative path to F2 snapshot
  }
}
```

**大小估算**:
- 每条记录约 200-500 bytes (含脱敏数据)
- 1000 条记录约 200-500 KB
- 内存限制：单会话最多 1000 条记录

### 5.3 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["sessionId", "startTime", "endTime", "duration", "summary", "toolCalls", "failures"],
  "properties": {
    "sessionId": { "type": "string" },
    "startTime": { "type": "string", "format": "date-time" },
    "endTime": { "type": "string", "format": "date-time" },
    "duration": { "type": "number", "minimum": 0 },
    "summary": {
      "type": "object",
      "required": ["totalCalls", "successCount", "failureCount", "successRate", "avgDuration", "maxDuration", "minDuration"],
      "properties": {
        "totalCalls": { "type": "integer", "minimum": 0 },
        "successCount": { "type": "integer", "minimum": 0 },
        "failureCount": { "type": "integer", "minimum": 0 },
        "successRate": { "type": "number", "minimum": 0, "maximum": 1 },
        "avgDuration": { "type": "number", "minimum": 0 },
        "maxDuration": { "type": "number", "minimum": 0 },
        "minDuration": { "type": "number", "minimum": 0 }
      }
    },
    "toolCalls": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["timestamp", "toolName", "duration", "success"],
        "properties": {
          "timestamp": { "type": "string", "format": "date-time" },
          "toolName": { "type": "string" },
          "duration": { "type": "number", "minimum": 0 },
          "success": { "type": "boolean" },
          "result": {},
          "error": {
            "type": "object",
            "properties": {
              "message": { "type": "string" },
              "snapshotPath": { "type": "string" }
            }
          }
        }
      }
    },
    "failures": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["toolName", "timestamp", "error"],
        "properties": {
          "toolName": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" },
          "error": { "type": "string" },
          "snapshotPath": { "type": "string" }
        }
      }
    }
  }
}
```

---

## 6. 错误处理

### 6.1 报告生成失败

```typescript
// Fire-and-forget pattern
void generateSessionReport(session, config).catch((error) => {
  console.error(`Failed to generate report: ${error.message}`)
  // Don't block session closure
})
```

**错误类型**:
1. **文件写入失败** (ENOSPC, EACCES)
   - 记录到日志
   - 继续会话关闭

2. **数据序列化失败** (循环引用)
   - 使用 try-catch 包裹 JSON.stringify
   - 返回错误占位符

3. **内存不足**
   - 限制 toolCalls 数组大小
   - 自动丢弃最早记录

### 6.2 数据收集失败

```typescript
// src/core/tool-logger.ts
try {
  this.recordToolCall(session, toolName, duration, success, result)
} catch (error) {
  // Don't fail the tool call due to reporting issues
  this.logger?.warn('Failed to record tool call', { error })
}
```

---

## 7. 性能考量

### 7.1 内存管理

**限制策略**:
```typescript
const MAX_TOOL_CALLS = 1000

if (session.reportData.toolCalls.length >= MAX_TOOL_CALLS) {
  session.reportData.toolCalls.shift() // FIFO
  logger.warn('Report data limit reached')
}
```

**内存占用估算**:
- 每条记录: 200-500 bytes
- 1000 条记录: 200-500 KB
- 可接受范围（相比会话其他数据）

### 7.2 生成性能

**优化措施**:
1. **Fire-and-forget**: 不阻塞会话关闭
2. **流式写入**: 对大型报告使用流式写入
3. **延迟序列化**: 仅在生成时序列化

**性能目标**:
- 报告生成耗时 < 200ms (1000 条记录)
- 不影响会话关闭速度

---

## 8. 安全性

### 8.1 数据脱敏

**复用 F1 逻辑**:
```typescript
record.result = this.sanitizeResult(result)
record.args = this.sanitizeArgs(args)
```

**脱敏规则**:
- 移除敏感字段 (password, token, apiKey, etc.)
- 截断大字符串 (>1KB)
- 处理循环引用

### 8.2 文件权限

**报告文件位置**:
```
.mcp-artifacts/{sessionId}/
  ├─ report.json (644)
  └─ report.md (644)
```

**注意事项**:
- 报告文件可能包含业务敏感信息
- 建议在 .gitignore 中排除 .mcp-artifacts/
- 文档提醒用户注意报告文件的访问控制

---

## 9. 测试策略

### 9.1 单元测试

**数据收集测试**:
```typescript
it('should record successful tool call', async () => {
  const session = createMockSession({ enableSessionReport: true })
  const toolLogger = new ToolLogger(mockLogger, config)
  const handler = jest.fn().mockResolvedValue({ success: true })

  const wrapped = toolLogger.wrap('test_tool', handler)
  await wrapped(session, { arg: 'value' })

  expect(session.reportData.toolCalls).toHaveLength(1)
  expect(session.reportData.toolCalls[0]).toMatchObject({
    toolName: 'test_tool',
    success: true,
    duration: expect.any(Number),
  })
})
```

**报告生成测试**:
```typescript
it('should generate valid JSON report', async () => {
  const session = createSessionWithMockData()
  await generateSessionReport(session, config)

  const reportPath = join(session.outputDir, 'report.json')
  const content = await readFile(reportPath, 'utf-8')
  const report = JSON.parse(content)

  expect(report).toMatchSchema(SessionReportSchema)
  expect(report.summary.totalCalls).toBe(10)
  expect(report.summary.successRate).toBeCloseTo(0.8)
})
```

### 9.2 集成测试

**端到端流程**:
```typescript
it('should generate report on session close', async () => {
  const sessionStore = new SessionStore({ enableSessionReport: true })
  const session = sessionStore.getOrCreate('test-session')

  // Execute some tools
  await executeMockToolCalls(session, 10) // 8 success, 2 fail

  // Close session
  await sessionStore.dispose()

  // Verify report files exist
  const reportJsonPath = join(session.outputDir, 'report.json')
  const reportMdPath = join(session.outputDir, 'report.md')

  expect(await fileExists(reportJsonPath)).toBe(true)
  expect(await fileExists(reportMdPath)).toBe(true)

  // Verify content
  const report = JSON.parse(await readFile(reportJsonPath, 'utf-8'))
  expect(report.summary.totalCalls).toBe(10)
  expect(report.summary.failureCount).toBe(2)
})
```

### 9.3 性能测试

```typescript
it('should handle 1000 tool calls efficiently', async () => {
  const session = createMockSession({ enableSessionReport: true })

  const startTime = Date.now()
  for (let i = 0; i < 1000; i++) {
    recordToolCall(session, 'test_tool', 100, true, {})
  }
  const duration = Date.now() - startTime

  expect(duration).toBeLessThan(100) // <100ms for 1000 records
  expect(session.reportData.toolCalls).toHaveLength(1000)
})
```

---

## 附录

### A. Markdown 示例输出

```markdown
# Session Report: test-session-abc123

## Summary
- **Duration**: 15m 30s
- **Total Calls**: 50
- **Success Rate**: 94.0% (47/50)
- **Average Duration**: 1.5s

## Tool Call Statistics
| Tool Name | Calls | Success | Failure | Avg Duration |
|-----------|-------|---------|---------|--------------|
| miniprogram_launch | 1 | 1 | 0 | 3.0s |
| page_navigate | 5 | 5 | 0 | 0.8s |
| element_click | 10 | 8 | 2 | 0.5s |
| element_input | 8 | 8 | 0 | 0.3s |
| assert_exists | 15 | 15 | 0 | 0.2s |
| snapshot_page | 3 | 3 | 0 | 1.2s |

## Failures
### 1. element_click
- **Time**: 2025-10-03T06:05:10.123Z
- **Error**: Element not found: #submit-button
- **Snapshot**: [failures/element_click-2025-10-03_06-05-10-123Z](failures/element_click-2025-10-03_06-05-10-123Z)

### 2. element_click
- **Time**: 2025-10-03T06:12:45.789Z
- **Error**: Element is not clickable
- **Snapshot**: [failures/element_click-2025-10-03_06-12-45-789Z](failures/element_click-2025-10-03_06-12-45-789Z)

## Timeline (Last 20 Calls)
| Time | Tool | Status | Duration |
|------|------|--------|----------|
| 06:00:05 | miniprogram_launch | ✅ | 3.0s |
| 06:00:08 | page_navigate | ✅ | 0.8s |
| 06:01:15 | element_input | ✅ | 0.3s |
| 06:05:10 | element_click | ❌ | 0.5s |
| ... | ... | ... | ... |
```

### B. 配置示例

```typescript
// Enable session report
const server = new Server({
  enableSessionReport: true, // 🆕 Generate report.json and report.md
  enableFailureSnapshot: true, // F2 integration
  logLevel: 'info',
})
```

---

**文档版本**: 1.0
**最后更新**: 2025-10-03
**作者**: ClaudeCode
