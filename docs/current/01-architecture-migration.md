# 架构迁移计划：完全使用新架构

> 版本: 1.2.0
> 日期: 2025-12-27
> 状态: ✅ 完全完成 (Phase 1-7)

## 1. 迁移完成度

### 1.1 最终状态

| 层级 | 状态 | 完成度 |
|------|------|--------|
| 运行时服务 (runtime/) | ✅ 完成 | 100% |
| 能力框架 (capabilities/) | ✅ 完成 | 100% |
| Handler 独立实现 | ✅ 完成 | 100% (65/65) |
| 工具实现 (tools/) | ✅ 已删除 | 100% |
| **总计** | **✅ 完全完成** | **100%** |

### 1.2 完成的目录结构

```
src/
├── runtime/                     ✅ 运行时服务 (保持不变)
│   ├── session/                 会话管理
│   ├── logging/                 日志系统
│   ├── outputs/                 产物输出
│   ├── element/                 元素引用
│   ├── timeout/                 超时控制
│   ├── validation/              输入校验
│   └── retry/                   重试机制
│
├── capabilities/                ✅ 新能力架构 (完全独立实现)
│   ├── registry.ts              全局工具注册表
│   ├── loader.ts                动态工具加载器
│   ├── index.ts                 能力入口
│   │
│   ├── automator/               ✅ 4 tools (独立实现)
│   │   ├── schemas/
│   │   │   ├── launch.ts
│   │   │   ├── connect.ts
│   │   │   ├── disconnect.ts
│   │   │   ├── close.ts
│   │   │   └── index.ts
│   │   ├── handlers/
│   │   │   ├── launch.ts        独立处理器
│   │   │   ├── connect.ts       独立处理器
│   │   │   ├── disconnect.ts    独立处理器
│   │   │   ├── close.ts         独立处理器
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── miniprogram/             ✅ 6 tools (独立实现)
│   │   ├── schemas/
│   │   │   ├── navigate.ts
│   │   │   ├── call-wx.ts
│   │   │   ├── evaluate.ts
│   │   │   ├── screenshot.ts
│   │   │   ├── page-stack.ts
│   │   │   ├── system-info.ts
│   │   │   └── index.ts
│   │   ├── handlers/
│   │   │   ├── navigate.ts      独立处理器
│   │   │   ├── call-wx.ts       独立处理器
│   │   │   ├── evaluate.ts      独立处理器
│   │   │   ├── screenshot.ts    独立处理器
│   │   │   ├── page-stack.ts    独立处理器
│   │   │   ├── system-info.ts   独立处理器
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── page/                    ✅ 8 tools (独立实现)
│   │   ├── schemas/index.ts
│   │   ├── handlers/
│   │   │   ├── page-handlers.ts 8个独立处理器
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── element/                 ✅ 23 tools (独立实现)
│   │   ├── schemas/index.ts
│   │   ├── handlers/
│   │   │   ├── element-handlers.ts 23个独立处理器
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── assert/                  ✅ 9 tools (独立实现)
│   │   ├── schemas/index.ts
│   │   ├── handlers/
│   │   │   ├── assert-handlers.ts 9个独立处理器
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── snapshot/                ✅ 3 tools (独立实现)
│   │   ├── schemas/index.ts
│   │   ├── handlers/
│   │   │   ├── snapshot-handlers.ts 3个独立处理器
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── record/                  ✅ 6 tools (独立实现)
│   │   ├── schemas/index.ts
│   │   ├── handlers/
│   │   │   ├── record-handlers.ts 6个独立处理器
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── network/                 ✅ 6 tools (独立实现)
│       ├── schemas/index.ts
│       ├── handlers/
│       │   ├── network-handlers.ts 6个独立处理器
│       │   └── index.ts
│       └── index.ts
│
└── server.ts                    使用新 API (setupCapabilities)

# tools/ 目录已删除 (2025-12-27)
```

---

## 2. 新架构特性

### 2.1 ToolRegistry (工具注册表)

```typescript
// src/capabilities/registry.ts
export class ToolRegistry {
  // 注册单个工具
  register(definition: ToolDefinition): void

  // 注册完整能力模块
  registerCapability(module: CapabilityModule): void

  // 获取工具定义
  get(name: string): ToolDefinition | undefined

  // 转换为 MCP Tool 格式
  toMCPTools(): Tool[]

  // 按能力过滤
  toMCPToolsForCapabilities(names: string[]): Tool[]
}
```

### 2.2 CapabilityModule (能力模块)

```typescript
// 每个能力目录的 index.ts 导出
export const capability: CapabilityModule = {
  name: 'automator',
  description: 'Connection and lifecycle management (4 tools)',
  tools: [
    {
      name: 'miniprogram_launch',
      description: 'Launch WeChat Mini Program with automator',
      capability: 'automator',
      inputSchema: automatorLaunchSchema,  // Zod schema
      handler: launch,
    },
    // ...
  ],
}
```

### 2.3 动态加载

```typescript
// src/capabilities/loader.ts
import { setupCapabilities } from './capabilities/index.js'

const { registry, tools } = await setupCapabilities(server, {
  capabilities: ['core'],  // 或指定具体能力
  sessionId: 'session-123',
  getSession: (id) => sessionStore.getOrCreate(id),
  deleteSession: (id) => sessionStore.delete(id),
})
```

---

## 3. 迁移阶段完成情况

| 阶段 | 任务 | 状态 | 实际时间 |
|------|------|------|---------|
| Phase 1 | 基础设施 (loader.ts, registry.ts) | ✅ 完成 | ~1h |
| Phase 2 | Automator (4 tools) | ✅ 完成 | ~0.5h |
| Phase 3 | MiniProgram (6 tools) | ✅ 完成 | ~0.5h |
| Phase 4 | Page (8 tools) | ✅ 完成 | ~0.5h |
| Phase 5 | Element (23 tools) | ✅ 完成 | ~1h |
| Phase 6 | Assert/Snapshot/Record/Network (24 tools) | ✅ 完成 | ~1h |
| Phase 7 | Handler 独立实现迁移 | ✅ 完成 | ~2h |
| **总计** | **65 tools (全部独立实现)** | **✅ 完全完成** | **~7h** |

---

## 4. 新建文件清单

### 4.1 基础设施 (2 个)

- `src/capabilities/registry.ts` - 工具注册表
- `src/capabilities/loader.ts` - 能力加载器

### 4.2 Automator (5 个)

- `src/capabilities/automator/handlers/launch.ts`
- `src/capabilities/automator/handlers/connect.ts`
- `src/capabilities/automator/handlers/disconnect.ts`
- `src/capabilities/automator/handlers/close.ts`
- `src/capabilities/automator/handlers/index.ts`

### 4.3 MiniProgram (14 个)

**Schemas:**

- `src/capabilities/miniprogram/schemas/navigate.ts`
- `src/capabilities/miniprogram/schemas/call-wx.ts`
- `src/capabilities/miniprogram/schemas/evaluate.ts`
- `src/capabilities/miniprogram/schemas/screenshot.ts`
- `src/capabilities/miniprogram/schemas/page-stack.ts`
- `src/capabilities/miniprogram/schemas/system-info.ts`
- `src/capabilities/miniprogram/schemas/index.ts`

**Handlers (独立实现):**

- `src/capabilities/miniprogram/handlers/navigate.ts`
- `src/capabilities/miniprogram/handlers/call-wx.ts`
- `src/capabilities/miniprogram/handlers/evaluate.ts`
- `src/capabilities/miniprogram/handlers/screenshot.ts`
- `src/capabilities/miniprogram/handlers/page-stack.ts`
- `src/capabilities/miniprogram/handlers/system-info.ts`
- `src/capabilities/miniprogram/handlers/index.ts`

### 4.4 Page (3 个)

- `src/capabilities/page/schemas/index.ts`
- `src/capabilities/page/handlers/page-handlers.ts` (8 个独立处理器)
- `src/capabilities/page/handlers/index.ts`

### 4.5 Element (3 个)

- `src/capabilities/element/schemas/index.ts`
- `src/capabilities/element/handlers/element-handlers.ts` (23 个独立处理器)
- `src/capabilities/element/handlers/index.ts`

### 4.6 Assert (3 个)

- `src/capabilities/assert/schemas/index.ts`
- `src/capabilities/assert/handlers/assert-handlers.ts` (9 个独立处理器)
- `src/capabilities/assert/handlers/index.ts`

### 4.7 Snapshot (3 个)

- `src/capabilities/snapshot/schemas/index.ts`
- `src/capabilities/snapshot/handlers/snapshot-handlers.ts` (3 个独立处理器)
- `src/capabilities/snapshot/handlers/index.ts`

### 4.8 Record (3 个)

- `src/capabilities/record/schemas/index.ts`
- `src/capabilities/record/handlers/record-handlers.ts` (6 个独立处理器)
- `src/capabilities/record/handlers/index.ts`

### 4.9 Network (3 个)

- `src/capabilities/network/schemas/index.ts`
- `src/capabilities/network/handlers/network-handlers.ts` (6 个独立处理器)
- `src/capabilities/network/handlers/index.ts`

**总计: 39 个新文件**

---

## 5. 修改文件清单

- `src/capabilities/index.ts` - 重写为新入口 (支持新旧两种API)
- `src/capabilities/automator/index.ts` - 添加 CapabilityModule 导出
- `src/capabilities/miniprogram/index.ts` - 添加 CapabilityModule 导出
- `src/capabilities/page/index.ts` - 添加 CapabilityModule 导出
- `src/capabilities/element/index.ts` - 添加 CapabilityModule 导出
- `src/capabilities/assert/index.ts` - 添加 CapabilityModule 导出
- `src/capabilities/snapshot/index.ts` - 添加 CapabilityModule 导出
- `src/capabilities/record/index.ts` - 添加 CapabilityModule 导出
- `src/capabilities/network/index.ts` - 添加 CapabilityModule 导出
- `src/capabilities/automator/schemas/index.ts` - 添加 schema 导出

**总计: 10 个修改文件**

---

## 6. 验收结果

- [x] 所有 65 个工具迁移到 capabilities/ 目录
- [x] 所有 65 个 handler 有独立实现 (不再依赖 tools/)
- [x] tools/ 目录已删除 (2025-12-27)
- [x] 所有工具有对应的 Zod schema 定义
- [x] 单元测试通过率 100% (498 passed, 30 skipped)
- [x] TypeScript 编译无错误
- [x] Build 成功

---

## 7. 后续工作 (可选优化)

### 7.1 已完成任务

1. **✅ 切换 server.ts 到新 API**
   - 已将 `registerTools` 替换为 `setupCapabilities`
   - 所有功能验证正常

2. **✅ 迁移所有 Handler 独立实现**
   - Automator: 4 个 handler (launch, connect, disconnect, close)
   - MiniProgram: 6 个 handler (navigate, callWx, evaluate, screenshot, getPageStack, getSystemInfo)
   - Page: 8 个 handler (query, waitFor, getData, setData, getPath, getAll, size, callMethod)
   - Element: 23 个 handler (tap, longpress, input, getText, getValue, etc.)
   - Assert: 9 个 handler (assertExists, assertNotExists, assertText, etc.)
   - Snapshot: 3 个 handler (snapshotPage, snapshotFull, snapshotElement)
   - Record: 6 个 handler (startRecording, stopRecording, recordAction, etc.)
   - Network: 6 个 handler (mockWxMethod, restoreWxMethod, mockRequest, etc.)

### 7.2 已完成的清理任务

1. **✅ 删除 tools/ 目录** (已完成 2025-12-27)
   - 所有处理器已迁移到 capabilities/*/handlers/
   - 所有测试文件已更新使用新 handler 导入路径
   - tool-registration.test.ts 已删除 (测试旧 API)
   - 构建和测试全部通过

2. **删除 core/ 目录** (可选)
   - 确认所有引用已迁移到 runtime/

### 7.3 架构优势

新架构已完全实现模块化设计：

1. **独立性**: 每个能力模块完全自包含 (schema + handler + index)
2. **可测试性**: Handler 可独立单元测试
3. **可扩展性**: 新增能力只需添加新目录
4. **跨能力依赖**: 通过相对路径导入 (如 assert 导入 page/element handlers)
