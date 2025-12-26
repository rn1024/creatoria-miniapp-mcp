# 架构迁移计划：完全使用新架构

> 版本: 1.0.0
> 日期: 2025-12-27
> 状态: 待实施

## 1. 当前状态分析

### 1.1 迁移完成度

| 层级 | 状态 | 代码行数 | 完成度 |
|------|------|---------|--------|
| 运行时服务 (runtime/) | ✅ 完成 | 1,968 | 100% |
| 能力框架 (capabilities/) | ⚠️ 部分 | 16 (代理) | 50% |
| 工具实现 (tools/) | ❌ 未迁移 | 5,244 | 0% |
| **总计** | **⚠️ 部分完成** | **7,212** | **27%** |

### 1.2 当前目录状态

```
src/
├── runtime/          ✅ 新架构 - 运行时服务 (1,968行)
│   ├── session/      会话管理
│   ├── logging/      日志系统
│   ├── outputs/      产物输出
│   ├── element/      元素引用
│   ├── timeout/      超时控制
│   └── validation/   输入校验
│
├── capabilities/     ⚠️ 新架构 - 仅代理层
│   ├── automator/    → 代理到 tools/automator.ts
│   ├── miniprogram/  → 代理到 tools/miniprogram.ts
│   └── ...           (8个能力目录全部是代理)
│
├── tools/            ❌ 旧架构 - 工具实现 (5,244行)
│   ├── index.ts      1,645行 (工具注册中心)
│   ├── automator.ts  247行
│   ├── miniprogram.ts 356行
│   ├── page.ts       466行
│   ├── element.ts    959行
│   ├── assert.ts     452行
│   ├── snapshot.ts   381行
│   ├── record.ts     438行
│   └── network.ts    300行
│
└── core/             ⚠️ 兼容层 - 纯代理 (8个文件)
    └── *.ts          → 全部代理到 runtime/
```

### 1.3 核心问题

1. **工具实现完全未迁移**：5,244行代码仍在旧位置
2. **工具注册高度集中**：tools/index.ts 单文件 1,645行，可维护性差
3. **Schema 定义零散**：仅 automator 有 schemas/，其他能力没有
4. **无动态工具加载**：所有工具启动时静态注册，无法插件化

---

## 2. 目标架构

### 2.1 目标目录结构

```
src/
├── runtime/                     ✅ 保持不变
│   ├── session/
│   ├── logging/
│   ├── outputs/
│   ├── element/
│   ├── timeout/
│   └── validation/
│
├── capabilities/                🆕 重构为完整实现
│   ├── automator/
│   │   ├── schemas/
│   │   │   ├── launch.ts
│   │   │   ├── connect.ts
│   │   │   ├── disconnect.ts
│   │   │   ├── close.ts
│   │   │   └── index.ts
│   │   ├── handlers/           🆕 工具处理器
│   │   │   ├── launch.ts
│   │   │   ├── connect.ts
│   │   │   ├── disconnect.ts
│   │   │   └── close.ts
│   │   └── index.ts            🆕 能力注册入口
│   │
│   ├── miniprogram/
│   │   ├── schemas/
│   │   └── handlers/
│   │
│   ├── page/
│   ├── element/
│   ├── assert/
│   ├── snapshot/
│   ├── record/
│   ├── network/
│   │
│   ├── loader.ts               🆕 动态工具加载器
│   ├── registry.ts             🆕 全局工具注册表
│   └── index.ts                🆕 能力入口
│
├── server.ts                    ✏️ 修改导入路径
├── cli.ts                       保持不变
└── types.ts                     保持不变

🗑️ 删除:
├── tools/                       全部删除
└── core/                        全部删除
```

### 2.2 新架构设计原则

1. **模块化**：每个能力独立目录，包含 schemas + handlers
2. **Schema 驱动**：使用 Zod 定义输入验证，自动生成文档
3. **动态加载**：通过 loader.ts 按需加载能力
4. **单一职责**：每个 handler 文件只处理一个工具

---

## 3. 迁移任务清单

### 3.1 Phase 1: 基础设施（预计 3-4h）

| ID | 任务 | 文件 | 预计时间 |
|----|------|------|---------|
| P1-1 | 创建 capabilities/loader.ts | 新建 | 1h |
| P1-2 | 创建 capabilities/registry.ts | 新建 | 1h |
| P1-3 | 创建标准 handler 模板 | 新建 | 0.5h |
| P1-4 | 更新 capabilities/index.ts | 修改 | 0.5h |

#### P1-1: loader.ts 设计

```typescript
// src/capabilities/loader.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SessionStore } from '../runtime/session/store.js'

export interface CapabilityModule {
  name: string
  tools: ToolDefinition[]
  handlers: Record<string, ToolHandler>
}

export async function loadCapabilities(
  enabledCapabilities: string[]
): Promise<CapabilityModule[]> {
  const modules: CapabilityModule[] = []

  for (const cap of enabledCapabilities) {
    const module = await import(`./${cap}/index.js`)
    modules.push(module.default)
  }

  return modules
}

export function registerCapabilities(
  server: Server,
  modules: CapabilityModule[],
  sessionStore: SessionStore
): void {
  // 注册所有工具和处理器
}
```

#### P1-2: registry.ts 设计

```typescript
// src/capabilities/registry.ts
import { z } from 'zod'

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: z.ZodSchema
}

export interface ToolHandler {
  (session: SessionState, args: unknown): Promise<unknown>
}

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>()
  private handlers = new Map<string, ToolHandler>()

  register(name: string, def: ToolDefinition, handler: ToolHandler): void
  getTools(): ToolDefinition[]
  getHandler(name: string): ToolHandler | undefined
}
```

### 3.2 Phase 2: Automator 迁移（预计 2-3h）

| ID | 任务 | 源文件 | 目标文件 |
|----|------|--------|---------|
| P2-1 | 迁移 launch | tools/automator.ts | capabilities/automator/handlers/launch.ts |
| P2-2 | 迁移 connect | tools/automator.ts | capabilities/automator/handlers/connect.ts |
| P2-3 | 迁移 disconnect | tools/automator.ts | capabilities/automator/handlers/disconnect.ts |
| P2-4 | 迁移 close | tools/automator.ts | capabilities/automator/handlers/close.ts |
| P2-5 | 更新 schemas | 已有 schemas/ | 补充缺失字段 |
| P2-6 | 创建能力入口 | - | capabilities/automator/index.ts |

### 3.3 Phase 3: MiniProgram 迁移（预计 2-3h）

| ID | 任务 | 工具数 | 目标 |
|----|------|--------|------|
| P3-1 | 创建 schemas/ | 6 | navigate/callWx/evaluate/screenshot/pageStack/systemInfo |
| P3-2 | 迁移 handlers/ | 6 | 同上 |
| P3-3 | 创建能力入口 | 1 | capabilities/miniprogram/index.ts |

### 3.4 Phase 4: Page 迁移（预计 2-3h）

| ID | 任务 | 工具数 | 目标 |
|----|------|--------|------|
| P4-1 | 创建 schemas/ | 8 | query/queryAll/getData/setData/waitForElement/callMethod 等 |
| P4-2 | 迁移 handlers/ | 8 | 同上 |
| P4-3 | 创建能力入口 | 1 | capabilities/page/index.ts |

### 3.5 Phase 5: Element 迁移（预计 3-4h）

| ID | 任务 | 工具数 | 目标 |
|----|------|--------|------|
| P5-1 | 创建 schemas/ | 23 | tap/longpress/input/getText/getAttribute... |
| P5-2 | 迁移 handlers/ | 23 | 同上 |
| P5-3 | 创建能力入口 | 1 | capabilities/element/index.ts |

### 3.6 Phase 6: Assert/Snapshot/Record/Network（预计 4-5h）

| ID | 能力 | 工具数 | 预计时间 |
|----|------|--------|---------|
| P6-1 | assert | 9 | 1h |
| P6-2 | snapshot | 3 | 1h |
| P6-3 | record | 6 | 1.5h |
| P6-4 | network | 6 | 1.5h |

### 3.7 Phase 7: 清理与测试（预计 2-3h）

| ID | 任务 | 描述 |
|----|------|------|
| P7-1 | 更新 server.ts | 使用新的 capabilities 入口 |
| P7-2 | 删除 tools/ | 移除旧的工具目录 |
| P7-3 | 删除 core/ | 移除兼容层（不再需要） |
| P7-4 | 更新测试 | 修改导入路径 |
| P7-5 | 运行全量测试 | 确保无回归 |

---

## 4. 改动文件清单

### 4.1 新建文件（约 35 个）

```
capabilities/
├── loader.ts                    🆕
├── registry.ts                  🆕
├── automator/
│   ├── handlers/
│   │   ├── launch.ts           🆕
│   │   ├── connect.ts          🆕
│   │   ├── disconnect.ts       🆕
│   │   └── close.ts            🆕
│   └── index.ts                🆕 (重写)
├── miniprogram/
│   ├── schemas/
│   │   ├── navigate.ts         🆕
│   │   ├── call-wx.ts          🆕
│   │   ├── evaluate.ts         🆕
│   │   ├── screenshot.ts       🆕
│   │   ├── page-stack.ts       🆕
│   │   ├── system-info.ts      🆕
│   │   └── index.ts            🆕
│   ├── handlers/
│   │   ├── navigate.ts         🆕
│   │   ├── call-wx.ts          🆕
│   │   ├── evaluate.ts         🆕
│   │   ├── screenshot.ts       🆕
│   │   ├── page-stack.ts       🆕
│   │   └── system-info.ts      🆕
│   └── index.ts                🆕
... (page/element/assert/snapshot/record/network 同理)
```

### 4.2 修改文件（约 5 个）

```
├── server.ts                   ✏️ 修改工具注册逻辑
├── capabilities/index.ts       ✏️ 重写为新入口
├── package.json                ✏️ 可能需要更新依赖
├── tsconfig.json               ✏️ 可能需要调整路径
└── tests/**/*.test.ts          ✏️ 更新导入路径
```

### 4.3 删除文件（约 17 个）

```
tools/                          🗑️ 全部删除
├── index.ts
├── automator.ts
├── miniprogram.ts
├── page.ts
├── element.ts
├── assert.ts
├── snapshot.ts
├── record.ts
└── network.ts

core/                           🗑️ 全部删除
├── element-ref.ts
├── logger.ts
├── output.ts
├── report-generator.ts
├── session.ts
├── tool-logger.ts
├── timeout.ts
└── validation.ts
```

---

## 5. 时间估算

| 阶段 | 任务 | 预计时间 | 风险 |
|------|------|---------|------|
| Phase 1 | 基础设施 | 3-4h | 低 |
| Phase 2 | Automator | 2-3h | 低 |
| Phase 3 | MiniProgram | 2-3h | 中 |
| Phase 4 | Page | 2-3h | 低 |
| Phase 5 | Element | 3-4h | 中 |
| Phase 6 | Assert/Snapshot/Record/Network | 4-5h | 中 |
| Phase 7 | 清理与测试 | 2-3h | 低 |
| **总计** | - | **18-25h** | - |

---

## 6. 回滚策略

1. **保持 Git 分支**：创建 `feat/full-migration` 分支进行开发
2. **阶段性提交**：每个 Phase 完成后提交一次
3. **测试覆盖**：每个阶段完成后运行测试确保无回归
4. **快速回滚**：如遇问题可直接 `git checkout main`

---

## 7. 验收标准

- [ ] 所有 65 个工具迁移到 capabilities/ 目录
- [ ] tools/ 和 core/ 目录完全删除
- [ ] 所有工具有对应的 Zod schema 定义
- [ ] 单元测试通过率 100%
- [ ] 集成测试通过
- [ ] 无 ESLint 错误
- [ ] TypeScript 编译无错误
