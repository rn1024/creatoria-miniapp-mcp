# F1 Architecture: Structured Logging Enhancement

**Task**: F1 - Structured Logging Enhancement
**Date**: 2025-10-03
**Status**: Architect
**Author**: ClaudeCode

---

## 1. Architecture Overview

### 1.1 System Context

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Server                              │
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │ Tool Handler │─────▶│  ToolLogger  │ (NEW)             │
│  │   (65 tools) │      │   Wrapper    │                   │
│  └──────────────┘      └──────┬───────┘                   │
│                               │                             │
│                               ▼                             │
│                    ┌──────────────────┐                    │
│                    │ Enhanced Logger  │                    │
│                    │  (ConsoleLogger) │                    │
│                    └────────┬─────────┘                    │
│                             │                               │
│              ┌──────────────┼──────────────┐               │
│              ▼              ▼              ▼               │
│         ┌─────────┐   ┌─────────┐   ┌──────────┐          │
│         │ Console │   │  File   │   │  Buffer  │          │
│         │ (stderr)│   │ Writer  │   │ (async)  │          │
│         └─────────┘   └─────────┘   └──────────┘          │
│                             │                               │
│                             ▼                               │
│                 outputDir/logs/session-{id}.log            │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Component Responsibilities

| Component | Responsibility | Location |
|-----------|---------------|----------|
| **ToolLogger** | 自动记录工具调用 START/END/ERROR | `src/core/tool-logger.ts` |
| **Enhanced ConsoleLogger** | 文件写入、批量缓冲、格式化 | `src/core/logger.ts` |
| **FileWriter** | 异步文件写入管理 | `src/core/logger.ts` (内部类) |
| **Tool Registration** | 集成 ToolLogger 到所有工具 | `src/tools/index.ts` |

---

## 2. Data Flow

### 2.1 Tool Call Flow (Enhanced)

```
1. User/LLM calls tool
   │
   ├─▶ Tool Handler registered with ToolLogger wrapper
   │
2. ToolLogger.wrap() intercepts call
   │
   ├─▶ Log START (tool name, args, sessionId)
   │   │
   │   └─▶ ConsoleLogger.info() + file write (if enabled)
   │
3. Execute actual tool handler
   │
   ├─▶ [SUCCESS] Log END (tool name, result, duration)
   │   │
   │   └─▶ ConsoleLogger.info() + file write
   │
   └─▶ [FAILURE] Log ERROR (tool name, error, duration)
       │
       └─▶ ConsoleLogger.error() + file write
```

### 2.2 File Writing Flow

```
Logger.info/warn/error()
   │
   ├─▶ Create LogEntry { timestamp, level, sessionId, toolName, message, context }
   │
   ├─▶ Format for console → stderr output
   │
   └─▶ If fileLogging enabled:
       │
       ├─▶ Add to write buffer (JSON Lines format)
       │
       └─▶ Flush when:
           ├─▶ Buffer size >= 100 entries
           ├─▶ 5 seconds elapsed since last flush
           └─▶ Logger dispose/cleanup
```

---

## 3. Interface Design

### 3.1 Enhanced Types

```typescript
// src/types.ts - New types

/**
 * Tool execution log entry with timing
 */
export interface ToolLogEntry extends LogEntry {
  toolName: string        // Tool name (e.g., "page_query")
  phase: 'START' | 'END' | 'ERROR'
  args?: any              // Tool input arguments (START phase)
  result?: any            // Tool output result (END phase)
  error?: string          // Error message (ERROR phase)
  duration?: number       // Execution time in ms (END/ERROR phase)
  stackTrace?: string     // Error stack trace (ERROR phase)
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level?: LogLevel                // Minimum log level (default: 'info')
  enableFileLog?: boolean         // Enable file logging (default: false)
  outputDir?: string              // Output directory for logs
  bufferSize?: number             // Buffer size for file writes (default: 100)
  flushInterval?: number          // Flush interval in ms (default: 5000)
}

/**
 * Extended Logger interface with file support
 */
export interface Logger {
  info(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, context?: Record<string, any>): void
  debug(message: string, context?: Record<string, any>): void
  child(toolName: string): Logger

  // New methods for F1
  dispose?(): Promise<void>       // Flush buffer and close file handles
  flush?(): Promise<void>         // Force flush buffer to disk
}
```

### 3.2 ToolLogger API

```typescript
// src/core/tool-logger.ts

export class ToolLogger {
  constructor(private logger: Logger) {}

  /**
   * Wrap a tool handler with automatic logging
   *
   * @param toolName - Name of the tool (e.g., "page_query")
   * @param handler - Original tool handler function
   * @returns Wrapped handler with automatic logging
   */
  wrap<TArgs, TResult>(
    toolName: string,
    handler: (session: SessionState, args: TArgs) => Promise<TResult>
  ): (session: SessionState, args: TArgs) => Promise<TResult> {
    return async (session: SessionState, args: TArgs): Promise<TResult> => {
      const startTime = Date.now()
      const childLogger = this.logger.child(toolName)

      // Log START
      childLogger.info(`Tool call started`, {
        phase: 'START',
        args: this.sanitizeArgs(args),
      })

      try {
        // Execute tool
        const result = await handler(session, args)
        const duration = Date.now() - startTime

        // Log END
        childLogger.info(`Tool call completed`, {
          phase: 'END',
          duration,
          result: this.sanitizeResult(result),
        })

        return result
      } catch (error) {
        const duration = Date.now() - startTime

        // Log ERROR
        childLogger.error(`Tool call failed`, {
          phase: 'ERROR',
          duration,
          error: error instanceof Error ? error.message : String(error),
          stackTrace: error instanceof Error ? error.stack : undefined,
        })

        throw error // Re-throw to preserve error handling
      }
    }
  }

  /**
   * Sanitize arguments for logging (remove sensitive data, limit size)
   */
  private sanitizeArgs(args: any): any {
    // Implementation details...
  }

  /**
   * Sanitize result for logging (limit size, remove large objects)
   */
  private sanitizeResult(result: any): any {
    // Implementation details...
  }
}
```

### 3.3 Enhanced ConsoleLogger

```typescript
// src/core/logger.ts - Enhanced implementation

export class ConsoleLogger implements Logger {
  private sessionId?: string
  private toolName?: string
  private config: Required<LoggerConfig>
  private fileWriter?: FileWriter // Internal file writer

  constructor(
    sessionId?: string,
    toolName?: string,
    config?: LoggerConfig
  ) {
    this.sessionId = sessionId
    this.toolName = toolName
    this.config = this.mergeConfig(config)

    // Initialize file writer if enabled
    if (this.config.enableFileLog && sessionId) {
      this.fileWriter = new FileWriter(
        sessionId,
        this.config.outputDir,
        this.config.bufferSize,
        this.config.flushInterval
      )
    }
  }

  info(message: string, context?: Record<string, any>): void {
    const entry = this.createEntry('info', message, context)
    this.log(entry)
  }

  // ... other methods ...

  private log(entry: LogEntry): void {
    // Console output (always)
    console.error(this.format(entry))

    // File output (if enabled)
    this.fileWriter?.write(entry)
  }

  async dispose(): Promise<void> {
    await this.fileWriter?.dispose()
  }

  async flush(): Promise<void> {
    await this.fileWriter?.flush()
  }
}

/**
 * Internal file writer with buffering
 */
class FileWriter {
  private buffer: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout
  private fileHandle?: FileHandle
  private disposed = false

  constructor(
    private sessionId: string,
    private outputDir: string,
    private bufferSize: number,
    private flushInterval: number
  ) {
    this.startFlushTimer()
  }

  write(entry: LogEntry): void {
    if (this.disposed) return

    this.buffer.push(entry)

    if (this.buffer.length >= this.bufferSize) {
      // Fire-and-forget flush (non-blocking)
      void this.flush().catch(err => {
        console.error('Failed to flush log buffer:', err)
      })
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0 || this.disposed) return

    const entries = this.buffer.splice(0, this.buffer.length)
    const lines = entries.map(e => JSON.stringify(e)).join('\n') + '\n'

    try {
      // Ensure file handle is open
      if (!this.fileHandle) {
        await this.ensureLogDirectory()
        const logPath = join(this.outputDir, 'logs', `session-${this.sessionId}.log`)
        this.fileHandle = await open(logPath, 'a')
      }

      // Write to file
      await this.fileHandle.write(lines)
    } catch (error) {
      console.error('Failed to write logs to file:', error)
      // Re-add entries to buffer for retry
      this.buffer.unshift(...entries)
    }
  }

  async dispose(): Promise<void> {
    this.disposed = true
    clearInterval(this.flushTimer)
    await this.flush()
    await this.fileHandle?.close()
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      void this.flush().catch(err => {
        console.error('Scheduled flush failed:', err)
      })
    }, this.flushInterval)
  }

  private async ensureLogDirectory(): Promise<void> {
    const logDir = join(this.outputDir, 'logs')
    await mkdir(logDir, { recursive: true })
  }
}
```

---

## 4. Integration Points

### 4.1 Tool Registration Integration

```typescript
// src/tools/index.ts - Modified registerTools()

export function registerTools(
  server: Server,
  options: ToolRegistrationOptions
): Tool[] {
  const { getSession, deleteSession, capabilities, sessionStore } = options

  // ... existing code ...

  // Create ToolLogger for session
  const createToolLogger = (sessionId: string): ToolLogger => {
    const session = sessionStore.get(sessionId)
    if (!session?.logger) {
      throw new Error('Session logger not initialized')
    }
    return new ToolLogger(session.logger)
  }

  // Register CallToolRequest handler with logging
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name
    const args = request.params.arguments || {}
    const sessionId = request.meta?.sessionId || 'default'

    // Get or create session
    const session = await getSession(sessionId)

    // Create tool logger
    const toolLogger = createToolLogger(sessionId)

    // Get handler
    const handler = handlers[toolName]
    if (!handler) {
      throw new Error(`Unknown tool: ${toolName}`)
    }

    // Wrap handler with logging
    const wrappedHandler = toolLogger.wrap(toolName, handler)

    // Execute wrapped handler
    const result = await wrappedHandler(session, args)

    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    }
  })

  return tools
}
```

### 4.2 Session Initialization

```typescript
// src/core/session.ts - Modified SessionStore.getOrCreate()

getOrCreate(sessionId: string, config?: SessionConfig): SessionState {
  let session = this.get(sessionId)

  if (!session) {
    // Create logger with config
    const loggerConfig: LoggerConfig = {
      level: 'info',
      enableFileLog: config?.enableFileLog || false,
      outputDir: config?.outputDir || this.outputDir,
      bufferSize: 100,
      flushInterval: 5000,
    }

    const logger = new ConsoleLogger(sessionId, undefined, loggerConfig)
    const outputManager = new OutputManager(sessionId, this.outputDir)

    session = {
      sessionId,
      pages: [],
      elements: new Map(),
      outputDir: this.outputDir,
      createdAt: new Date(),
      lastActivity: new Date(),
      config,
      logger,
      outputManager,
    }

    this.set(sessionId, session)
    logger.info('Session created', { sessionId })
  }

  return session
}
```

### 4.3 Configuration Extension

```typescript
// src/config/defaults.ts - Add logging defaults

export const DEFAULT_LOG_LEVEL: LogLevel = 'info'
export const DEFAULT_ENABLE_FILE_LOG = false
export const DEFAULT_LOG_BUFFER_SIZE = 100
export const DEFAULT_LOG_FLUSH_INTERVAL = 5000

export const DEFAULT_SERVER_CONFIG: Required<ServerConfig> = {
  // ... existing ...
  logLevel: DEFAULT_LOG_LEVEL,
  enableFileLog: DEFAULT_ENABLE_FILE_LOG,
  logBufferSize: DEFAULT_LOG_BUFFER_SIZE,
  logFlushInterval: DEFAULT_LOG_FLUSH_INTERVAL,
}
```

---

## 5. Data Structures

### 5.1 Log Entry Format

**Console Output** (Human-readable):
```
2025-10-03T10:30:45.123Z INFO  [session-abc] [page_query]: Tool call started {"phase":"START","args":{"selector":".btn"}}
2025-10-03T10:30:45.234Z INFO  [session-abc] [page_query]: Tool call completed {"phase":"END","duration":111,"result":{"refId":"elem-123"}}
```

**File Output** (JSON Lines):
```json
{"timestamp":"2025-10-03T10:30:45.123Z","level":"info","sessionId":"session-abc","toolName":"page_query","message":"Tool call started","context":{"phase":"START","args":{"selector":".btn"}}}
{"timestamp":"2025-10-03T10:30:45.234Z","level":"info","sessionId":"session-abc","toolName":"page_query","message":"Tool call completed","context":{"phase":"END","duration":111,"result":{"refId":"elem-123"}}}
```

### 5.2 Log File Structure

```
outputDir/
└── logs/
    ├── session-abc.log (JSON Lines format)
    ├── session-def.log
    └── session-xyz.log
```

---

## 6. Performance Considerations

### 6.1 Optimization Strategies

| Strategy | Implementation | Impact |
|----------|---------------|--------|
| **Async File I/O** | Non-blocking writes, buffered | Minimal tool latency |
| **Batch Writes** | Buffer 100 entries or 5s | Reduce syscall overhead |
| **Argument Sanitization** | Limit size to 1KB per arg | Prevent memory bloat |
| **Result Sanitization** | Truncate large results | Control log file size |

### 6.2 Expected Overhead

| Scenario | Overhead | Justification |
|----------|----------|---------------|
| Console logging only | <1% | Minimal string formatting |
| File logging enabled | 2-5% | Buffered async writes |
| High-frequency calls (>100/s) | <5% | Buffering prevents bottleneck |

---

## 7. Error Handling

### 7.1 Failure Modes

| Failure | Behavior | Recovery |
|---------|----------|----------|
| **File write fails** | Log error to stderr, continue execution | Retry on next flush |
| **Disk full** | Log warning, disable file logging | Continue with console only |
| **Buffer overflow** | Force flush, log warning | Temporary backpressure |
| **Dispose timeout** | Wait up to 5s, then warn | Logs may be incomplete |

### 7.2 Graceful Degradation

```typescript
// Example: File write failure handling
try {
  await this.fileHandle.write(lines)
} catch (error) {
  if (error.code === 'ENOSPC') {
    console.error('Disk full, disabling file logging')
    this.disposed = true
  } else {
    console.error('Failed to write logs:', error)
    // Re-buffer for retry
    this.buffer.unshift(...entries)
  }
}
```

---

## 8. Security Considerations

### 8.1 Sensitive Data Handling

**Sanitization Rules**:
- Passwords/tokens: Replace with `[REDACTED]`
- Large objects (>1KB): Truncate with `... (${bytes} bytes total)`
- Binary data: Convert to `<Buffer ${length} bytes>`

**Example**:
```typescript
private sanitizeArgs(args: any): any {
  const SENSITIVE_KEYS = ['password', 'token', 'secret', 'apiKey']
  const MAX_SIZE = 1024 // 1KB

  const sanitized = JSON.parse(JSON.stringify(args, (key, value) => {
    // Redact sensitive keys
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      return '[REDACTED]'
    }
    // Truncate large strings
    if (typeof value === 'string' && value.length > MAX_SIZE) {
      return value.substring(0, MAX_SIZE) + `... (${value.length} bytes total)`
    }
    return value
  }))

  return sanitized
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| `logger-enhanced.test.ts` | 15 | File writing, buffering, flush timing |
| `tool-logger.test.ts` | 10 | Wrapper behavior, START/END/ERROR logs |
| Integration (tools/index) | 5 | End-to-end tool call logging |

### 9.2 Test Scenarios

1. **File Logging**:
   - Enable/disable via config
   - Buffer flush on size limit
   - Buffer flush on time interval
   - Dispose triggers final flush

2. **Tool Wrapper**:
   - START log before execution
   - END log with duration on success
   - ERROR log with stack trace on failure
   - Re-throw original error

3. **Error Handling**:
   - File write failure doesn't break tool
   - Disk full disables file logging
   - Missing output directory created automatically

---

## 10. Migration Path

### 10.1 Backward Compatibility

- ✅ Existing `Logger` interface unchanged
- ✅ `ConsoleLogger` constructor backward compatible (new params optional)
- ✅ File logging disabled by default
- ✅ No breaking changes to tool handlers

### 10.2 Opt-in Enhancement

```json
// .mcp.json - Enable file logging
{
  "projectPath": "/path/to/project",
  "logLevel": "info",
  "enableFileLog": true,
  "outputDir": ".mcp-artifacts"
}
```

---

## 11. ADRs (Architecture Decision Records)

### ADR-F1-001: JSON Lines for File Format

**Decision**: Use JSON Lines (newline-delimited JSON) instead of single JSON array

**Rationale**:
- Streaming-friendly (can read line-by-line)
- Append-only (no need to rewrite entire file)
- Standard format (supported by jq, grep, etc.)

**Alternatives Considered**:
- Single JSON array: Requires rewriting entire file on each append
- CSV: Less structured, harder to parse complex objects

---

### ADR-F1-002: Async File I/O with Buffering

**Decision**: Use buffered async file writes (100 entries or 5s)

**Rationale**:
- Non-blocking: Tool execution not delayed by I/O
- Efficient: Batch writes reduce syscall overhead
- Acceptable latency: 5s max delay for log availability

**Alternatives Considered**:
- Sync writes: Would block tool execution
- Immediate async writes: High syscall overhead

---

### ADR-F1-003: Automatic Tool Wrapping

**Decision**: Wrap all tool handlers with ToolLogger automatically in `registerTools()`

**Rationale**:
- Zero boilerplate: Developers don't need to add logging manually
- Consistent: All tools logged uniformly
- Centralized: Easy to modify logging behavior globally

**Alternatives Considered**:
- Manual logging in each tool: High maintenance burden, inconsistent
- AOP/Decorators: Not well-supported in ESM, complex setup

---

## 12. Open Questions (Resolved)

| Question | Answer | Rationale |
|----------|--------|-----------|
| Buffer size? | 100 entries | Balance memory vs flush frequency |
| Flush interval? | 5 seconds | Acceptable latency for debugging |
| Max log file size? | No limit (warn at 10MB) | User-managed cleanup |
| Sensitive data handling? | Sanitize via allowlist | Prevent accidental logging |

---

## 13. Implementation Checklist

- [ ] Define new types in `src/types.ts`
- [ ] Implement `FileWriter` class in `src/core/logger.ts`
- [ ] Enhance `ConsoleLogger` with file support
- [ ] Create `ToolLogger` wrapper in `src/core/tool-logger.ts`
- [ ] Integrate into `src/tools/index.ts`
- [ ] Update `SessionStore` to use enhanced logger
- [ ] Extend configuration defaults
- [ ] Write unit tests (25 tests)
- [ ] Update documentation

---

**Architecture Sign-off**: Ready for Atomize phase

**Created**: 2025-10-03
**Author**: ClaudeCode
**Status**: Complete
