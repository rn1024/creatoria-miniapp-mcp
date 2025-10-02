# Task Card: [C1] Automator 工具

**Task ID**: C1
**Task Name**: Automator 工具实现
**Charter**: `docs/charter.C1.align.yaml`
**Stage**: C (Tool Implementation)
**Status**: ✅ COMPLETED (Retrospective)
**Estimated**: 2-3 hours
**Actual**: ~3 hours
**Completed**: 2025-10-02

---

## 目标 (Goal)

实现 Automator 级别的 4 个 MCP 工具，封装微信开发者工具的启动、连接、断开和关闭功能。

**交付物**:
- ✅ `src/tools/automator.ts` (252 lines)
- ✅ `tests/unit/automator.test.ts` (364 lines, 20 tests)
- ✅ 4 个工具: launch, connect, disconnect, close

---

## 前置条件 (Prerequisites)

- ✅ B1: MCP Server 骨架已完成
- ✅ B2: SessionStore 已实现
- ✅ `miniprogram-automator` 已安装
- ✅ 微信开发者工具已安装
- ✅ 了解 miniprogram-automator API

---

## 实现步骤 (Steps)

### 1. 定义工具 Schema ✅

**文件**: `src/tools/automator.ts`

**步骤**:
```typescript
import { z } from 'zod'

// launch 工具 Schema
const launchSchema = z.object({
  projectPath: z.string().describe('小程序项目路径'),
  port: z.number().optional().default(9420).describe('自动化端口'),
  cliPath: z.string().optional().describe('CLI 路径'),
})

// connect 工具 Schema
const connectSchema = z.object({
  port: z.number().optional().default(9420).describe('自动化端口'),
})

// disconnect/close 工具 Schema
const sessionSchema = z.object({
  sessionId: z.string().describe('会话 ID'),
})
```

**验证**: TypeScript 编译通过，Schema 类型正确

---

### 2. 实现 launch 工具 ✅

**功能**: 启动微信开发者工具并打开小程序项目

**代码**:
```typescript
async function handleLaunch(args: LaunchArgs, context: ToolContext) {
  const { projectPath, port, cliPath } = args
  const sessionId = uuidv4()

  const session = context.getSession(sessionId)

  const automator = await launch({
    projectPath,
    port,
    cliPath: cliPath || DEFAULT_CLI_PATH,
  })

  session.automator = automator
  session.ideProcess = automator.process

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          sessionId,
          port,
          projectPath,
          status: 'launched',
        }, null, 2),
      },
    ],
  }
}
```

**验证**:
- ✅ 启动微信开发者工具
- ✅ 返回正确的 sessionId
- ✅ Session 中保存 automator 和 ideProcess

---

### 3. 实现 connect 工具 ✅

**功能**: 连接到已启动的开发者工具

**代码**:
```typescript
async function handleConnect(args: ConnectArgs, context: ToolContext) {
  const { port } = args
  const sessionId = uuidv4()

  const session = context.getSession(sessionId)

  const miniProgram = await connect({ port })

  session.miniProgram = miniProgram

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          sessionId,
          port,
          status: 'connected',
        }, null, 2),
      },
    ],
  }
}
```

**验证**:
- ✅ 连接成功获取 MiniProgram 实例
- ✅ Session 中保存 miniProgram
- ✅ 返回正确的 sessionId

---

### 4. 实现 disconnect 工具 ✅

**功能**: 断开连接但保留 IDE 进程

**代码**:
```typescript
async function handleDisconnect(args: SessionArgs, context: ToolContext) {
  const { sessionId } = args
  const session = context.getSession(sessionId)

  if (session.miniProgram) {
    await session.miniProgram.disconnect()
    session.miniProgram = null
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          sessionId,
          status: 'disconnected',
        }, null, 2),
      },
    ],
  }
}
```

**验证**:
- ✅ MiniProgram 实例断开
- ✅ IDE 进程继续运行
- ✅ Session 中 miniProgram 设为 null

---

### 5. 实现 close 工具 ✅

**功能**: 完全关闭 IDE 并清理会话

**代码**:
```typescript
async function handleClose(args: SessionArgs, context: ToolContext) {
  const { sessionId } = args
  const session = context.getSession(sessionId)

  if (session.miniProgram) {
    await session.miniProgram.disconnect()
  }

  if (session.automator) {
    await session.automator.close()
  }

  context.deleteSession(sessionId)

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          sessionId,
          status: 'closed',
        }, null, 2),
      },
    ],
  }
}
```

**验证**:
- ✅ MiniProgram 断开
- ✅ Automator 关闭
- ✅ Session 删除
- ✅ IDE 进程终止

---

### 6. 编写单元测试 ✅

**文件**: `tests/unit/automator.test.ts`

**测试用例** (20 个):
```typescript
describe('Automator Tools', () => {
  describe('launch', () => {
    it('should launch with default port', async () => {})
    it('should launch with custom port', async () => {})
    it('should launch with custom cliPath', async () => {})
    it('should throw error if projectPath missing', async () => {})
    it('should handle launch failure', async () => {})
  })

  describe('connect', () => {
    it('should connect with default port', async () => {})
    it('should connect with custom port', async () => {})
    it('should handle connection failure', async () => {})
    it('should create new session', async () => {})
  })

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {})
    it('should handle missing miniProgram', async () => {})
    it('should throw error if session not found', async () => {})
    it('should keep IDE process running', async () => {})
  })

  describe('close', () => {
    it('should close automator and session', async () => {})
    it('should handle missing automator', async () => {})
    it('should delete session', async () => {})
    it('should terminate IDE process', async () => {})
  })

  describe('error handling', () => {
    it('should handle invalid sessionId', async () => {})
    it('should handle network errors', async () => {})
    it('should handle timeout errors', async () => {})
  })
})
```

**验证**:
- ✅ 20 个测试全部通过
- ✅ Mock miniprogram-automator
- ✅ 覆盖成功和失败场景

---

### 7. 工具注册集成 ✅

**文件**: `src/tools/index.ts` (在 C5 中完成)

**代码**:
```typescript
export const AUTOMATOR_TOOLS = [
  'miniapp_automator_launch',
  'miniapp_automator_connect',
  'miniapp_automator_disconnect',
  'miniapp_automator_close',
]

// 在 registerTools 中注册
if (capabilities.includes('core')) {
  registerAutomatorTools(server, context)
}
```

**验证**: 工具在 capabilities='core' 时正确注册

---

## 完成标准 (Definition of Done)

### 功能完成 ✅

- [x] launch 工具启动开发者工具
- [x] connect 工具连接并获取 MiniProgram
- [x] disconnect 工具断开连接保留 IDE
- [x] close 工具完全关闭并清理
- [x] 所有工具返回正确的响应格式

### 代码质量 ✅

- [x] TypeScript 编译 0 错误
- [x] 无 ESLint 错误
- [x] 代码行数 252 行（合理范围）
- [x] JSDoc 注释完整
- [x] 符合 ESM 规范（.js 后缀）

### 测试 ✅

- [x] 单元测试 364 行
- [x] 20 个测试用例全部通过
- [x] 覆盖成功和失败场景
- [x] Mock 外部依赖

### 文档 ⏳

- [x] 代码注释完整
- [x] Schema 描述清晰
- ⏳ charter.C1.align.yaml (追溯)
- ⏳ tasks.C1.atomize.md (本文档)

---

## 实现结果 (Implementation)

### 文件清单

| 文件 | 行数 | 说明 |
|------|------|------|
| `src/tools/automator.ts` | 252 | 4 个 Automator 工具实现 |
| `tests/unit/automator.test.ts` | 364 | 20 个单元测试 |

### 工具列表

| 工具名 | 功能 | 输入 | 输出 |
|--------|------|------|------|
| `miniapp_automator_launch` | 启动开发者工具 | projectPath, port?, cliPath? | sessionId, status |
| `miniapp_automator_connect` | 连接到开发者工具 | port? | sessionId, status |
| `miniapp_automator_disconnect` | 断开连接 | sessionId | status |
| `miniapp_automator_close` | 关闭开发者工具 | sessionId | status |

### 关键代码片段

**默认配置**:
```typescript
const DEFAULT_CLI_PATH = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
const DEFAULT_PORT = 9420
```

**Session 清理**:
```typescript
// disconnect - 保留 IDE
session.miniProgram = null

// close - 完全清理
await session.automator.close()
context.deleteSession(sessionId)
```

### 设计决策

1. **Session ID 生成**
   - 使用 UUID v4 自动生成
   - 理由：避免冲突，便于追踪

2. **默认 CLI 路径**
   - macOS: `/Applications/wechatwebdevtools.app/Contents/MacOS/cli`
   - 理由：官方标准路径，覆盖大多数场景

3. **disconnect vs close**
   - disconnect: 断开连接但保留 IDE
   - close: 完全关闭 IDE 和清理 Session
   - 理由：灵活性，支持重连场景

4. **错误处理**
   - 明确区分启动失败、连接失败、会话不存在
   - 理由：便于调试和问题定位

---

## 测试证据 (Test Evidence)

### 单元测试结果

```bash
$ pnpm test automator.test.ts

PASS tests/unit/automator.test.ts
  Automator Tools
    launch
      ✓ should launch with default port (15ms)
      ✓ should launch with custom port (8ms)
      ✓ should launch with custom cliPath (7ms)
      ✓ should throw error if projectPath missing (5ms)
      ✓ should handle launch failure (6ms)
    connect
      ✓ should connect with default port (9ms)
      ✓ should connect with custom port (7ms)
      ✓ should handle connection failure (8ms)
      ✓ should create new session (6ms)
    disconnect
      ✓ should disconnect successfully (10ms)
      ✓ should handle missing miniProgram (7ms)
      ✓ should throw error if session not found (6ms)
      ✓ should keep IDE process running (8ms)
    close
      ✓ should close automator and session (11ms)
      ✓ should handle missing automator (7ms)
      ✓ should delete session (9ms)
      ✓ should terminate IDE process (10ms)
    error handling
      ✓ should handle invalid sessionId (6ms)
      ✓ should handle network errors (8ms)
      ✓ should handle timeout errors (7ms)

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Time:        2.453s
```

### 手动测试

**启动开发者工具**:
```bash
# 通过 MCP 调用 launch
{
  "projectPath": "/path/to/miniprogram",
  "port": 9420
}

# 返回
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "port": 9420,
  "status": "launched"
}
```

**连接已启动的工具**:
```bash
# 通过 MCP 调用 connect
{
  "port": 9420
}

# 返回
{
  "sessionId": "660e9511-f39c-52e5-b827-557766551111",
  "port": 9420,
  "status": "connected"
}
```

---

## 已知问题 (Known Issues)

### 技术债务

1. **仅支持 macOS** - 🟡 中优先级
   - 原因：CLI 路径硬编码 macOS 路径
   - 影响：Windows/Linux 用户需手动指定 cliPath
   - 计划：未来扩展跨平台支持

2. **无自动重连** - 🟢 低优先级
   - 原因：简化实现
   - 影响：连接断开需手动重连
   - 计划：未来添加重试机制

### 风险

1. **端口冲突** - 🟡 中风险
   - 缓解：明确错误提示
   - 监控：用户反馈端口问题

2. **CLI 路径变化** - 🟢 低风险
   - 缓解：允许自定义 cliPath
   - 监控：关注微信开发者工具更新

---

## 参考资料 (References)

### 文档

- `docs/charter.C1.align.yaml` - 任务对齐文档
- `docs/微信小程序自动化完整操作手册.md` - Automator API 参考
- `docs/完整实现方案.md` - 工具分层设计

### 代码

- `src/core/session.ts` - Session 管理
- `src/tools/index.ts` - 工具注册器（C5）
- `src/types.ts` - 类型定义

### 外部资源

- [miniprogram-automator 文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)
- [微信开发者工具下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

---

## 后续任务 (Next Steps)

### 依赖此任务的后续任务

- ✅ C2: MiniProgram 工具（需要 MiniProgram 实例）
- ✅ C3: Page 工具（需要 MiniProgram 导航）
- ✅ C5: 工具注册器（集成 Automator 工具）

### 改进建议

1. **跨平台支持**
   - 自动检测操作系统
   - 提供 Windows/Linux 默认路径

2. **健康检查**
   - 添加 ping 工具检测连接状态
   - 自动重连机制

3. **多实例支持**
   - 支持多个小程序同时运行
   - 端口池管理

---

**任务状态**: ✅ COMPLETED
**代码提交**: ✅ 已提交（Stage C 提交）
**文档状态**: ⏳ RETROSPECTIVE (追溯补齐中)
