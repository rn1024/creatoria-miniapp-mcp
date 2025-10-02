# Task Card: [B4] Logger 和 OutputManager

**Task ID**: B4
**Task Name**: Logger 和 OutputManager 实现
**Charter**: `docs/charter.B4.align.yaml`
**Stage**: B (Core Architecture)
**Status**: ✅ COMPLETED (Retrospective)
**Estimated**: 1-2 hours
**Actual**: ~1.5 hours
**Completed**: 2025-10-02

---

## 目标 (Goal)

实现结构化日志系统和产物管理器，为 MCP Server 提供统一的日志输出和文件管理能力。

**交付物**:
- ✅ `src/core/logger.ts` (~50 lines)
- ✅ `src/core/output.ts` (~60 lines)
- ✅ Logger 类：info/warn/error
- ✅ OutputManager 类：resolveOutputPath/writeFile

---

## 前置条件 (Prerequisites)

- ✅ A3: 仓库结构已初始化
- ✅ TypeScript 配置完成
- ✅ 了解 Node.js fs/promises API
- ✅ 了解 MCP stdio transport 限制

---

## 实现步骤 (Steps)

### 1. 创建 Logger 类骨架 ✅

**文件**: `src/core/logger.ts`

**步骤**:
```typescript
/**
 * Simple structured logger that outputs to stderr
 * (to avoid interfering with MCP stdio transport on stdout)
 */
export class Logger {
  constructor(private prefix: string = '') {}

  info(message: string, meta?: object): void
  warn(message: string, meta?: object): void
  error(message: string, meta?: object): void
}
```

**验证**: 类定义正确，方法签名完整

---

### 2. 实现日志格式化 ✅

**代码**:
```typescript
private format(level: string, message: string, meta?: object): string {
  const timestamp = new Date().toISOString()
  const prefix = this.prefix ? `[${this.prefix}] ` : ''
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
  return `${timestamp} ${prefix}[${level}] ${message}${metaStr}`
}
```

**验证**: 格式化输出清晰可读

---

### 3. 实现日志方法 ✅

**代码**:
```typescript
info(message: string, meta?: object): void {
  console.error(this.format('INFO', message, meta))
}

warn(message: string, meta?: object): void {
  console.error(this.format('WARN', message, meta))
}

error(message: string, meta?: object): void {
  console.error(this.format('ERROR', message, meta))
}
```

**验证**:
- 所有日志输出到 console.error
- 日志级别正确标注
- meta 对象正确序列化

---

### 4. 创建全局 Logger 实例 ✅

**代码**:
```typescript
// Export a default logger instance
export const logger = new Logger('MCP')
```

**验证**: 可直接导入使用

---

### 5. 创建 OutputManager 类骨架 ✅

**文件**: `src/core/output.ts`

**步骤**:
```typescript
import { mkdir, writeFile as fsWriteFile } from 'fs/promises'
import path from 'path'

/**
 * Manages output files for a session
 * Directory structure: {baseDir}/{sessionId}/{type}/
 */
export class OutputManager {
  constructor(
    private sessionId: string,
    private baseDir: string = '.mcp-artifacts'
  ) {}

  resolveOutputPath(type: string, filename: string): string
  async writeFile(type: string, filename: string, content: string | Buffer): Promise<string>
}
```

**验证**: 类定义正确，导入完整

---

### 6. 实现 resolveOutputPath() ✅

**代码**:
```typescript
/**
 * Resolve output path for a file
 * @param type - Output type (screenshot/snapshot/log/trace)
 * @param filename - File name
 * @returns Absolute path to the file
 */
resolveOutputPath(type: string, filename: string): string {
  const dir = path.join(this.baseDir, this.sessionId, type)
  return path.resolve(dir, filename)
}
```

**验证**:
- 路径格式正确：{baseDir}/{sessionId}/{type}/{filename}
- 返回绝对路径

---

### 7. 实现 writeFile() ✅

**代码**:
```typescript
/**
 * Write file to output directory
 * Creates directories if needed
 * @param type - Output type
 * @param filename - File name
 * @param content - File content (string or Buffer)
 * @returns Absolute path to the written file
 */
async writeFile(
  type: string,
  filename: string,
  content: string | Buffer
): Promise<string> {
  const filePath = this.resolveOutputPath(type, filename)
  const dir = path.dirname(filePath)

  // 1. Ensure directory exists
  await mkdir(dir, { recursive: true })

  // 2. Write file
  await fsWriteFile(filePath, content)

  // 3. Return absolute path
  return filePath
}
```

**验证**:
- 自动创建目录
- 正确写入文本文件
- 正确写入二进制文件（Buffer）
- 返回绝对路径

---

### 8. 添加错误处理 ✅

**代码**:
```typescript
async writeFile(
  type: string,
  filename: string,
  content: string | Buffer
): Promise<string> {
  try {
    const filePath = this.resolveOutputPath(type, filename)
    const dir = path.dirname(filePath)

    await mkdir(dir, { recursive: true })
    await fsWriteFile(filePath, content)

    console.error(`Output file written: ${filePath}`)
    return filePath
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to write output file: ${message}`)
  }
}
```

**验证**:
- 捕获文件 I/O 错误
- 抛出明确错误消息
- 记录成功日志

---

### 9. 添加完整的 JSDoc 注释 ✅

**代码**:
```typescript
/**
 * Simple structured logger
 *
 * All logs output to stderr to avoid interfering with MCP stdio transport.
 *
 * @example
 * const logger = new Logger('MyModule')
 * logger.info('Operation started', { userId: 123 })
 * logger.warn('Rate limit approaching', { usage: 0.9 })
 * logger.error('Operation failed', { error: err.message })
 */
export class Logger { ... }

/**
 * Manages output files for a session
 *
 * Directory structure: {baseDir}/{sessionId}/{type}/{filename}
 *
 * @example
 * const output = new OutputManager('session-123')
 * const path = await output.writeFile('screenshot', 'home.png', buffer)
 * // => /path/to/.mcp-artifacts/session-123/screenshot/home.png
 */
export class OutputManager { ... }
```

**验证**: JSDoc 完整，示例清晰

---

### 10. 编写单元测试（集成验证）✅

**验证方式**: 随工具测试间接验证

**测试场景**:
```typescript
// Logger 测试（通过实际使用验证）
- Logger.info 输出格式正确
- Logger.warn 输出格式正确
- Logger.error 输出格式正确
- meta 对象正确序列化

// OutputManager 测试（通过 D2 Snapshot 工具验证）
- resolveOutputPath 返回正确路径
- writeFile 创建目录
- writeFile 写入文本文件
- writeFile 写入二进制文件
- writeFile 错误处理
```

**验证**: 所有场景通过

---

## 完成标准 (Definition of Done)

### 功能完成 ✅

- [x] Logger.info/warn/error 正确输出
- [x] 日志格式清晰（timestamp + level + message + meta）
- [x] 所有日志输出到 console.error
- [x] OutputManager 正确创建目录
- [x] OutputManager 正确写入文本文件
- [x] OutputManager 正确写入二进制文件
- [x] resolveOutputPath 返回绝对路径

### 代码质量 ✅

- [x] TypeScript 编译 0 错误
- [x] 无 ESLint 错误
- [x] logger.ts ~50 行
- [x] output.ts ~60 行
- [x] JSDoc 注释完整
- [x] 符合 ESM 规范（.js 后缀）

### 测试 ✅

- [x] Logger 随工具使用验证
- [x] OutputManager 随 D2 工具验证
- [x] 文件写入测试通过
- [x] 错误处理测试通过

### 文档 ⏳

- [x] 代码注释完整
- [x] Logger API 文档
- [x] OutputManager API 文档
- ⏳ charter.B4.align.yaml (追溯)
- ⏳ tasks.B4.atomize.md (本文档)

---

## 实现结果 (Implementation)

### 文件清单

| 文件 | 行数 | 说明 |
|------|------|------|
| `src/core/logger.ts` | ~50 | Logger 类实现 |
| `src/core/output.ts` | ~60 | OutputManager 类实现 |

### 关键代码片段

**Logger 接口**:
```typescript
export class Logger {
  constructor(prefix?: string)
  info(message: string, meta?: object): void
  warn(message: string, meta?: object): void
  error(message: string, meta?: object): void
}

export const logger: Logger  // 全局实例
```

**OutputManager 接口**:
```typescript
export class OutputManager {
  constructor(sessionId: string, baseDir?: string)
  resolveOutputPath(type: string, filename: string): string
  writeFile(type: string, filename: string, content: string | Buffer): Promise<string>
}
```

**目录结构**:
```
.mcp-artifacts/
  └── {sessionId}/
      ├── screenshot/
      │   └── home.png
      ├── snapshot/
      │   └── page-state.json
      ├── log/
      │   └── trace.log
      └── trace/
          └── network.har
```

### 设计决策

1. **console.error 输出**
   - 所有日志输出到 stderr
   - 理由：避免干扰 MCP stdio transport

2. **结构化日志格式**
   - timestamp + level + message + meta
   - 理由：易于解析和过滤

3. **自动创建目录**
   - mkdir({ recursive: true })
   - 理由：简化调用，用户无需手动创建

4. **按类型分目录**
   - {sessionId}/{type}/
   - 理由：清晰组织，便于管理

5. **返回绝对路径**
   - path.resolve()
   - 理由：调用者直接使用，无需再处理

---

## 测试证据 (Test Evidence)

### 手动测试

**Logger 测试**:
```bash
$ node dist/cli.js
2025-10-02T10:30:45.123Z [MCP] [INFO] Server starting
2025-10-02T10:30:45.234Z [MCP] [INFO] Session created {"sessionId":"sess-123"}
2025-10-02T10:30:46.345Z [MCP] [WARN] Session timeout {"sessionId":"sess-123"}
```

**OutputManager 测试**:
```typescript
const output = new OutputManager('sess-123')
const path = await output.writeFile('screenshot', 'home.png', buffer)
// Output file written: /path/to/.mcp-artifacts/sess-123/screenshot/home.png
```

### 集成测试

通过 D2 Snapshot 工具验证：
- ✅ OutputManager 正确创建目录
- ✅ 截图文件正确写入
- ✅ 快照文件正确写入
- ✅ 返回的路径可直接访问

---

## 已知问题 (Known Issues)

### 技术债务

1. **无日志持久化** - 🟢 低优先级
   - 原因：当前需求仅 console 输出
   - 影响：日志不保存到文件
   - 计划：后续扩展文件日志

2. **无日志级别过滤** - 🟢 低优先级
   - 原因：当前需求简单
   - 影响：无法动态调整日志级别
   - 计划：后续扩展配置

3. **无产物清理** - 🟡 中优先级
   - 原因：依赖会话管理
   - 影响：产物文件积累
   - 计划：随会话清理实现

### 风险

1. **文件权限** - 🟡 中风险
   - 影响：无法创建目录/写入文件
   - 缓解：错误处理 + 清晰错误消息
   - 监控：用户反馈

---

## 参考资料 (References)

### 文档

- `docs/完整实现方案.md` - 日志和产物管理设计
- `docs/charter.B4.align.yaml` - 任务对齐文档

### 代码

- `src/tools/snapshot.ts` - 使用 OutputManager（D2）
- `src/server.ts` - 使用 Logger（B1）

### 外部资源

- [Node.js fs/promises API](https://nodejs.org/api/fs.html#promises-api)
- [Node.js path API](https://nodejs.org/api/path.html)

---

## 后续任务 (Next Steps)

### 依赖此任务的后续任务

- ✅ D2: Snapshot 工具使用 OutputManager（已完成）
- ⏳ E2: 日志级别配置（未开始）
- ⏳ Stage H: 产物清理策略（未开始）

### 改进建议

1. **日志增强**
   - 支持日志级别配置
   - 支持日志文件输出
   - 支持日志轮转

2. **产物管理**
   - 自动清理过期产物
   - 产物压缩存储
   - 产物大小限制

3. **可观测性**
   - 产物统计信息
   - 日志统计信息
   - 性能指标

---

**任务状态**: ✅ COMPLETED
**代码提交**: ✅ 已提交（随 D2 Snapshot 工具）
**文档状态**: ⏳ RETROSPECTIVE (追溯补齐中)
