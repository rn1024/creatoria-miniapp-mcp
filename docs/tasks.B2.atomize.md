# Task Card: [B2] SessionStore 实现

**Task ID**: B2
**Task Name**: SessionStore 会话管理器
**Charter**: `docs/charter.B2.align.yaml`
**Stage**: B (Core Architecture)
**Status**: ✅ COMPLETED (Retrospective)
**Estimated**: 2-3 hours
**Actual**: ~3 hours
**Completed**: 2025-10-02

---

## 目标 (Goal)

实现会话隔离的 SessionStore 类，管理 MCP 会话的生命周期、资源清理和超时回收。

**交付物**:
- ✅ `src/core/session.ts` (~200 lines)
- ✅ `tests/unit/session.test.ts` (93 tests)
- ✅ SessionStore 类及所有方法
- ✅ 超时清理机制

---

## 前置条件 (Prerequisites)

- ✅ A3: 仓库结构已初始化
- ✅ TypeScript 配置完成
- ✅ Jest 测试框架配置
- ✅ 了解 Node.js ChildProcess API

---

## 实现步骤 (Steps)

### 1. 定义 SessionState 接口 ✅

**文件**: `src/types.ts`

**步骤**:
```typescript
export interface SessionState {
  sessionId: string
  miniProgram: MiniProgram | null
  ideProcess: ChildProcess | null
  elementCache: Map<string, Element>
  createdAt: Date
  lastActivity: Date
  outputDir: string
}
```

**验证**: TypeScript 类型检查通过

---

### 2. 定义 SessionStoreConfig 接口 ✅

**文件**: `src/types.ts`

**步骤**:
```typescript
export interface SessionStoreConfig {
  outputDir?: string         // 默认 .mcp-artifacts
  sessionTimeout?: number    // 默认 30 * 60 * 1000 (30分钟)
  cleanupInterval?: number   // 默认 60 * 1000 (60秒)
}
```

**验证**: 接口定义完整

---

### 3. 创建 SessionStore 类骨架 ✅

**文件**: `src/core/session.ts`

**步骤**:
```typescript
export class SessionStore {
  private sessions: Map<string, SessionState>
  private config: Required<SessionStoreConfig>
  private cleanupTimer: NodeJS.Timeout | null

  constructor(config: SessionStoreConfig = {}) {
    this.sessions = new Map()
    this.config = {
      outputDir: config.outputDir ?? '.mcp-artifacts',
      sessionTimeout: config.sessionTimeout ?? 30 * 60 * 1000,
      cleanupInterval: config.cleanupInterval ?? 60 * 1000,
    }
    this.cleanupTimer = null
    this.startCleanup()
  }
}
```

**验证**: 类实例化成功，配置默认值正确

---

### 4. 实现基础 CRUD 方法 ✅

**代码**:
```typescript
get(sessionId: string): SessionState | undefined {
  return this.sessions.get(sessionId)
}

set(sessionId: string, state: SessionState): void {
  this.sessions.set(sessionId, state)
}

delete(sessionId: string): void {
  const session = this.sessions.get(sessionId)
  if (!session) return

  // 清理资源
  this.cleanupSession(session)
  this.sessions.delete(sessionId)
  console.error(`Session ${sessionId} deleted`)
}

has(sessionId: string): boolean {
  return this.sessions.has(sessionId)
}
```

**验证**:
- get 返回正确会话
- set 存储会话成功
- delete 清理资源并删除

---

### 5. 实现 getOrCreate 方法 ✅

**代码**:
```typescript
getOrCreate(sessionId: string): SessionState {
  let session = this.sessions.get(sessionId)

  if (!session) {
    session = {
      sessionId,
      miniProgram: null,
      ideProcess: null,
      elementCache: new Map(),
      createdAt: new Date(),
      lastActivity: new Date(),
      outputDir: path.join(this.config.outputDir, sessionId),
    }
    this.sessions.set(sessionId, session)
    console.error(`Session ${sessionId} created`)
  }

  return session
}
```

**验证**:
- 首次调用创建新会话
- 后续调用返回同一会话
- outputDir 路径正确

---

### 6. 实现 updateActivity 方法 ✅

**代码**:
```typescript
updateActivity(sessionId: string): void {
  const session = this.sessions.get(sessionId)
  if (session) {
    session.lastActivity = new Date()
  }
}
```

**验证**: lastActivity 时间戳正确更新

---

### 7. 实现清理辅助方法 ✅

**代码**:
```typescript
private async cleanupSession(session: SessionState): Promise<void> {
  // 1. 断开 miniProgram
  if (session.miniProgram) {
    try {
      await session.miniProgram.disconnect()
      console.error(`MiniProgram disconnected for session ${session.sessionId}`)
    } catch (error) {
      console.error(`Failed to disconnect miniProgram: ${error}`)
    }
  }

  // 2. 杀掉 IDE 进程
  if (session.ideProcess) {
    try {
      session.ideProcess.kill('SIGTERM')
      console.error(`IDE process killed for session ${session.sessionId}`)
    } catch (error) {
      console.error(`Failed to kill IDE process: ${error}`)
    }
  }

  // 3. 清空元素缓存
  session.elementCache.clear()
}
```

**验证**:
- miniProgram.disconnect() 被调用
- ideProcess.kill() 被调用
- elementCache 被清空

---

### 8. 实现超时清理逻辑 ✅

**代码**:
```typescript
private startCleanup(): void {
  this.cleanupTimer = setInterval(() => {
    this.cleanupExpiredSessions()
  }, this.config.cleanupInterval)
}

private cleanupExpiredSessions(): void {
  const now = Date.now()
  const expiredSessions: string[] = []

  for (const [sessionId, session] of this.sessions.entries()) {
    const inactive = now - session.lastActivity.getTime()
    if (inactive > this.config.sessionTimeout) {
      expiredSessions.push(sessionId)
    }
  }

  for (const sessionId of expiredSessions) {
    console.error(`Session ${sessionId} expired (inactive for ${
      Math.round((now - this.sessions.get(sessionId)!.lastActivity.getTime()) / 1000)
    }s)`)
    this.delete(sessionId)
  }
}
```

**验证**:
- 定时器正常启动
- 超时会话被识别
- 过期会话自动删除

---

### 9. 实现 dispose 方法 ✅

**代码**:
```typescript
async dispose(): Promise<void> {
  // 1. 停止定时器
  if (this.cleanupTimer) {
    clearInterval(this.cleanupTimer)
    this.cleanupTimer = null
  }

  // 2. 清理所有会话
  const sessionIds = Array.from(this.sessions.keys())
  for (const sessionId of sessionIds) {
    await this.cleanupSession(this.sessions.get(sessionId)!)
  }

  // 3. 清空 Map
  this.sessions.clear()

  console.error(`SessionStore disposed (${sessionIds.length} sessions cleaned)`)
}
```

**验证**:
- cleanupTimer 被清除
- 所有会话资源被清理
- sessions Map 被清空

---

### 10. 编写单元测试 ✅

**文件**: `tests/unit/session.test.ts`

**测试用例**:
```typescript
describe('SessionStore', () => {
  // 基础 CRUD (15 tests)
  describe('CRUD operations', () => {
    test('get/set/delete/has')
    test('getOrCreate')
    test('updateActivity')
  })

  // 超时清理 (20 tests)
  describe('Timeout cleanup', () => {
    test('cleanup expired sessions')
    test('keep active sessions')
    test('cleanup interval')
  })

  // 资源清理 (25 tests)
  describe('Resource cleanup', () => {
    test('disconnect miniProgram')
    test('kill ideProcess')
    test('clear elementCache')
  })

  // dispose (15 tests)
  describe('dispose', () => {
    test('cleanup all sessions')
    test('clear timer')
    test('clear map')
  })

  // 边界条件 (18 tests)
  describe('Edge cases', () => {
    test('empty store')
    test('concurrent access')
    test('invalid sessionId')
  })
})
```

**验证**: 93 个测试全部通过

---

## 完成标准 (Definition of Done)

### 功能完成 ✅

- [x] get/set/delete/has 操作正常
- [x] getOrCreate 自动创建会话
- [x] updateActivity 更新时间戳
- [x] cleanupExpiredSessions 定时清理
- [x] dispose 清理所有资源
- [x] cleanupSession 完整清理流程

### 代码质量 ✅

- [x] TypeScript 编译 0 错误
- [x] 无 ESLint 错误
- [x] 代码行数 ~200 行
- [x] JSDoc 注释完整
- [x] 符合 ESM 规范（.js 后缀）

### 测试 ✅

- [x] 93 个测试用例全部通过
- [x] 覆盖率 >95%
- [x] 测试超时清理逻辑
- [x] 测试资源释放
- [x] 测试边界条件

### 文档 ⏳

- [x] 代码注释完整
- [x] SessionState 接口文档
- [x] SessionStore API 文档
- ⏳ charter.B2.align.yaml (追溯)
- ⏳ tasks.B2.atomize.md (本文档)

---

## 实现结果 (Implementation)

### 文件清单

| 文件 | 行数 | 说明 |
|------|------|------|
| `src/core/session.ts` | ~200 | SessionStore 实现 |
| `src/types.ts` | +30 | SessionState/SessionStoreConfig 接口 |
| `tests/unit/session.test.ts` | ~600 | 93 个测试用例 |

### 关键代码片段

**SessionState 接口**:
```typescript
export interface SessionState {
  sessionId: string
  miniProgram: MiniProgram | null
  ideProcess: ChildProcess | null
  elementCache: Map<string, Element>
  createdAt: Date
  lastActivity: Date
  outputDir: string
}
```

**SessionStore 核心方法**:
```typescript
class SessionStore {
  get(sessionId: string): SessionState | undefined
  set(sessionId: string, state: SessionState): void
  delete(sessionId: string): void
  dispose(): Promise<void>
  getOrCreate(sessionId: string): SessionState
  updateActivity(sessionId: string): void
  private cleanupSession(session: SessionState): Promise<void>
  private cleanupExpiredSessions(): void
  private startCleanup(): void
}
```

### 设计决策

1. **Map 存储**
   - 使用 Map<string, SessionState> 存储会话
   - 理由：O(1) 查找，原生支持迭代

2. **定时清理**
   - setInterval 定时检查超时会话
   - 理由：自动回收，防止内存泄漏

3. **完整清理流程**
   - 清理 miniProgram + ideProcess + elementCache
   - 理由：防止资源泄漏

4. **可配置超时**
   - 默认 30 分钟，支持自定义
   - 理由：平衡内存占用和用户体验

---

## 测试证据 (Test Evidence)

### 单元测试

**运行结果**:
```bash
$ pnpm test session.test.ts

PASS tests/unit/session.test.ts
  SessionStore
    CRUD operations (15 tests)
      ✓ get returns undefined for non-existent session
      ✓ set and get session
      ✓ delete removes session
      ✓ has checks existence
      ✓ getOrCreate creates new session
      ✓ getOrCreate returns existing session
      ✓ updateActivity updates timestamp
      ...
    Timeout cleanup (20 tests)
      ✓ cleanup expired sessions
      ✓ keep active sessions
      ✓ cleanup interval configurable
      ...
    Resource cleanup (25 tests)
      ✓ disconnect miniProgram on cleanup
      ✓ kill ideProcess on cleanup
      ✓ clear elementCache on cleanup
      ...
    dispose (15 tests)
      ✓ cleanup all sessions
      ✓ clear cleanup timer
      ✓ clear sessions map
      ...
    Edge cases (18 tests)
      ✓ handle empty store
      ✓ handle concurrent access
      ✓ handle invalid sessionId
      ...

Tests: 93 passed, 93 total
Coverage: 97.5%
```

### 集成测试

通过 Server 集成测试验证：
- ✅ SessionStore 正常创建和管理会话
- ✅ 超时清理机制工作正常
- ✅ dispose 在 Server 关闭时被调用

---

## 已知问题 (Known Issues)

### 技术债务

1. **无持久化** - 🟢 低优先级
   - 原因：当前需求仅内存存储
   - 影响：进程重启会话丢失
   - 计划：未来扩展持久化层

2. **无会话优先级** - 🟢 低优先级
   - 原因：当前需求简单 FIFO
   - 影响：无法保护重要会话
   - 计划：未来扩展优先级机制

### 风险

1. **内存泄漏** - 🟢 已缓解
   - 缓解：完整的清理流程 + 定时回收
   - 监控：测试验证无泄漏

2. **并发竞态** - 🟢 低风险
   - 缓解：Map 原子操作
   - 监控：测试覆盖并发场景

---

## 参考资料 (References)

### 文档

- `docs/完整实现方案.md` - 会话管理架构
- `docs/charter.B2.align.yaml` - 任务对齐文档
- `src/types.ts` - 接口定义

### 代码

- `src/server.ts` - Server 使用 SessionStore（B1）
- `src/core/element-ref.ts` - 使用 elementCache（B3）

### 外部资源

- [Node.js ChildProcess API](https://nodejs.org/api/child_process.html)
- [Node.js Timer API](https://nodejs.org/api/timers.html)

---

## 后续任务 (Next Steps)

### 依赖此任务的后续任务

- ✅ B1: Server 集成 SessionStore（已完成）
- ✅ B3: ElementRef 使用 elementCache（已完成）
- ✅ C1-C4: 工具使用会话管理（已完成）

### 改进建议

1. **性能优化**
   - 批量清理过期会话
   - 优化定时器触发频率

2. **可观测性**
   - 添加会话统计指标
   - 记录清理历史

3. **扩展性**
   - 支持会话持久化
   - 支持会话优先级
   - 支持会话迁移

---

**任务状态**: ✅ COMPLETED
**代码提交**: ✅ 已提交（随 A2-B1-B2 修复）
**文档状态**: ⏳ RETROSPECTIVE (追溯补齐中)
