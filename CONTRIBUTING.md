# 贡献指南

感谢您对 creatoria-miniapp-mcp 的关注！本文档将帮助您了解如何为项目做出贡献。

---

## 📋 目录

- [开发环境设置](#开发环境设置)
- [6A 工作法流程](#6a-工作法流程)
- [代码规范](#代码规范)
- [测试要求](#测试要求)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [文档贡献](#文档贡献)
- [常见问题](#常见问题)

---

## 开发环境设置

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- 微信开发者工具
- Git

### 克隆仓库

```bash
git clone https://github.com/your-org/creatoria-miniapp-mcp.git
cd creatoria-miniapp-mcp
```

### 安装依赖

```bash
pnpm install
```

### 构建项目

```bash
pnpm build
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# Watch 模式
pnpm test:watch

# 覆盖率报告
pnpm test:coverage
```

### 开发模式

```bash
# TypeScript 编译（watch 模式）
pnpm dev
```

---

## 项目统计

**当前状态** (Updated: 2025-10-02):

- ✅ **59 tools** across 7 categories (Automator, MiniProgram, Page, Element, Assert, Snapshot, Record)
- ✅ **290+ tests** passing (100% pass rate)
- ✅ **Complete API documentation** for all tool categories
- ✅ **5 usage examples** covering basic to advanced scenarios
- ✅ **Code quality**: 9.1/10 rating from Stage D review

**Recent Additions**:

- Record & Replay tools (6 tools): record_start, record_stop, record_list, record_get, record_delete, record_replay
- Complete documentation suite (E1): README, Setup Guide, Architecture, API docs, Usage examples
- Troubleshooting guide and Contributing guide

---

## 6A 工作法流程

本项目采用 **6A 工作法** 进行开发，确保高质量交付。

### 6 个阶段

1. **Align (对齐)**: 明确需求和目标
2. **Architect (架构)**: 设计技术方案
3. **Atomize (原子化)**: 分解为可执行任务
4. **Approve (批准)**: 获得确认后开始
5. **Automate (自动化)**: 执行开发和测试
6. **Assess (评估)**: 验收和质量检查

### 工作流程示例

假设您要添加一个新工具 `element_double_tap`：

#### 1. Align Stage

创建 `docs/charter.feature-name.align.yaml`：

```yaml
Goal: 添加 element_double_tap 工具，支持双击元素操作
Background: 用户需要测试双击手势，当前仅支持单击和长按
Scope:
  In Scope:
    - element_double_tap 工具实现
    - 单元测试（至少 5 个）
    - API 文档更新
  Out of Scope:
    - 三击或多击支持
    - 自定义双击间隔
Success_Criteria:
  - 工具可以正确触发双击事件
  - 所有测试通过
  - 文档完整
Open_Questions:
  - 双击间隔时间？→ 决议: 使用小程序默认间隔
```

#### 2. Architect Stage

创建 `docs/architecture.feature-name.md`：

```markdown
## 技术方案

### 实现方式

使用 miniprogram-automator SDK 的 `element.tap()` 方法连续调用两次

### API 设计

\`\`\`typescript
async function doubleTap(
session: SessionState,
args: { refId: string }
): Promise<{ success: boolean; message: string }>
\`\`\`

### 测试计划

- 测试双击按钮
- 测试双击图片
- 测试双击列表项
- 测试元素不存在场景
- 测试会话未连接场景
```

#### 3. Atomize Stage

创建 `docs/tasks.feature-name.atomize.md`：

```yaml
TaskID: TASK-2025-001-FEATURE-1
Title: 实现 element_double_tap 工具
Acceptance_Criteria:
  - src/tools/element.ts 中添加 doubleTap 函数
  - src/tools/index.ts 中注册工具
  - tests/unit/element.test.ts 中添加测试
  - docs/api/element.md 更新文档
Estimated_Time: 30min
```

#### 4. Approve Stage

等待 Maintainer 审核通过后开始开发。

#### 5. Automate Stage

执行开发：

```bash
# 1. 创建功能分支
git checkout -b feature/element-double-tap

# 2. 实现功能
# 编辑 src/tools/element.ts
# 编辑 src/tools/index.ts
# 编辑 tests/unit/element.test.ts
# 编辑 docs/api/element.md

# 3. 运行测试
pnpm test

# 4. 提交代码
git add .
git commit -m "feat: add element_double_tap tool"
```

#### 6. Assess Stage

验收检查：

```bash
# 所有测试通过
pnpm test

# 类型检查通过
pnpm typecheck

# 代码格式正确
pnpm format:check

# 构建成功
pnpm build
```

---

## 代码规范

### TypeScript 规范

- 使用严格模式 (`strict: true`)
- 所有函数必须有类型注解
- 避免使用 `any`，使用 `unknown` 替代
- 使用接口（interface）定义对象类型

**示例**:

```typescript
// ✅ 推荐
export async function tap(
  session: SessionState,
  args: { refId: string }
): Promise<{ success: boolean; message: string }> {
  const { refId } = args
  const logger = session.logger
  // ...
}

// ❌ 不推荐
export async function tap(session, args) {
  // 缺少类型
  // ...
}
```

### 命名规范

- **文件名**: 小写 + 连字符（`element-ref.ts`）
- **函数名**: 驼峰命名（`doubleTap`）
- **常量**: 大写 + 下划线（`MAX_RETRIES`）
- **接口**: PascalCase + 描述性名称（`SessionState`）
- **工具名**: 小写 + 下划线（`element_double_tap`）

### 代码组织

```typescript
/**
 * 文件头部：简要说明文件用途
 */

import type { SessionState } from '../types.js'  // 类型导入
import * as pageTools from './page.js'           // 工具导入

// 常量定义
const DEFAULT_TIMEOUT = 2000

// 辅助函数（非导出）
function getElement(session: SessionState, refId: string) {
  // ...
}

// 导出函数（按字母顺序）
export async function doubleTap(...) {
  // ...
}

export async function tap(...) {
  // ...
}
```

### 错误处理

```typescript
// ✅ 推荐：统一错误处理模式
export async function tap(
  session: SessionState,
  args: { refId: string }
): Promise<{ success: boolean; message: string }> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Tapping element', { refId })

    const element = getElement(session, refId)
    await element.tap()

    logger?.info('Element tapped successfully', { refId })

    return {
      success: true,
      message: `Element tapped: ${refId}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Tap failed', { error: errorMessage, refId })

    throw new Error(`Tap failed: ${errorMessage}`)
  }
}
```

---

## 测试要求

### 测试覆盖率

- 所有新功能必须有单元测试
- 测试覆盖率 >= 80%
- 关键路径必须有测试

### 测试结构

```typescript
describe('element_double_tap', () => {
  let mockSession: SessionState
  let mockElement: any

  beforeEach(() => {
    // 设置 mock
    mockElement = {
      tap: jest.fn().mockResolvedValue(undefined),
    }
    mockSession = createMockSession()
    mockSession.elements.set('elem_test', mockElement)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should double tap element successfully', async () => {
    const result = await doubleTap(mockSession, {
      refId: 'elem_test',
    })

    expect(result.success).toBe(true)
    expect(result.message).toContain('elem_test')
    expect(mockElement.tap).toHaveBeenCalledTimes(2)
  })

  it('should throw error if element not found', async () => {
    await expect(doubleTap(mockSession, { refId: 'nonexistent' })).rejects.toThrow(
      'Element not found with refId: nonexistent'
    )
  })

  // 更多测试...
})
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定文件
pnpm test element.test.ts

# Watch 模式
pnpm test:watch

# 覆盖率报告
pnpm test:coverage
```

---

## 提交规范

### Commit Message 格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）**:

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链更改

**示例**:

```
feat(element): add element_double_tap tool

Implement double tap functionality using consecutive tap() calls.

- Add doubleTap function in element.ts
- Register tool in index.ts
- Add 5 unit tests
- Update element.md documentation

Closes #42
```

### Commit 最佳实践

```bash
# ✅ 推荐：清晰的提交信息
git commit -m "feat(element): add element_double_tap tool"

# ✅ 推荐：包含详细 body
git commit -m "feat(element): add element_double_tap tool

Implement double tap by calling tap() twice with 100ms interval.
Includes tests and documentation."

# ❌ 不推荐：信息不明确
git commit -m "update code"
git commit -m "fix bug"
```

---

## Pull Request 流程

### 1. Fork 和 Clone

```bash
# Fork 仓库（在 GitHub 网页上操作）

# Clone 你的 fork
git clone https://github.com/your-username/creatoria-miniapp-mcp.git
cd creatoria-miniapp-mcp

# 添加上游仓库
git remote add upstream https://github.com/original-org/creatoria-miniapp-mcp.git
```

### 2. 创建功能分支

```bash
# 更新 main 分支
git checkout main
git pull upstream main

# 创建功能分支
git checkout -b feature/your-feature-name
```

### 3. 开发和测试

```bash
# 编写代码
# ...

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 格式化代码
pnpm format

# 构建
pnpm build
```

### 4. 提交更改

```bash
git add .
git commit -m "feat: your feature description"
```

### 5. 推送到 Fork

```bash
git push origin feature/your-feature-name
```

### 6. 创建 Pull Request

1. 访问你的 Fork 仓库页面
2. 点击 "Compare & pull request"
3. 填写 PR 标题和描述
4. 提交 PR

### PR 描述模板

```markdown
## 描述

简要说明本 PR 的目的和内容。

## 更改类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 重构
- [ ] 测试

## 更改内容

- 添加了 `element_double_tap` 工具
- 新增 5 个单元测试
- 更新 API 文档

## 测试

- [x] 所有测试通过 (`pnpm test`)
- [x] 类型检查通过 (`pnpm typecheck`)
- [x] 代码格式正确 (`pnpm format:check`)
- [x] 构建成功 (`pnpm build`)

## 相关 Issue

Closes #42

## 截图（如有必要）

## 检查清单

- [x] 代码遵循项目规范
- [x] 添加了单元测试
- [x] 更新了文档
- [x] 所有测试通过
```

### 7. Code Review

- 响应 Reviewer 的反馈
- 及时修改代码
- 保持讨论专业和友好

### 8. 合并

- Maintainer 批准后会合并 PR
- 合并后可以删除功能分支

---

## 文档贡献

### 文档类型

- **API 文档**: `docs/api/*.md`
- **使用示例**: `examples/*.md`
- **架构文档**: `docs/architecture.md`
- **故障排除**: `docs/troubleshooting.md`

### 文档规范

- 使用 Markdown 格式
- 包含代码示例
- 保持简洁清晰
- 添加目录（如果较长）

### 示例文档模板

```markdown
# 工具名称

> 一句话描述

## 参数

| 参数名 | 类型   | 必需 | 默认值 | 描述        |
| ------ | ------ | ---- | ------ | ----------- |
| refId  | string | ✅   | -      | 元素引用 ID |

## 返回值

\`\`\`typescript
{
success: true,
message: "..."
}
\`\`\`

## 使用示例

\`\`\`javascript
const result = await element_double_tap({
refId: "elem_123"
})
\`\`\`

## 注意事项

- 注意事项 1
- 注意事项 2
```

### API 文档规范

When adding new tools, follow the established API documentation format:

**File Structure**: `docs/api/{category}.md`

**Required Sections**:

1. Tool list table with name, description, required parameters
2. For each tool:
   - Parameters table (name, type, required, default, description)
   - Return value with TypeScript type
   - Error handling (specific error messages)
   - Usage examples (3-5 scenarios)
   - Notes/warnings
   - Related tools (cross-references)

**Example Format**:

```markdown
## tool_name

Brief description.

### 参数

| 参数名   | 类型   | 必需 | 默认值 | 描述           |
| -------- | ------ | ---- | ------ | -------------- |
| `param1` | string | ✅   | -      | Description    |
| `param2` | number | ⭐   | 5000   | Optional param |

### 返回值

\`\`\`typescript
{
success: true,
message: "Operation completed",
data: { ... }
}
\`\`\`

### 使用示例

\`\`\`javascript
// Example 1: Basic usage
const result = await tool_name({ param1: "value" })

// Example 2: Advanced usage
const result = await tool_name({
param1: "value",
param2: 10000
})
\`\`\`
```

---

## 常见问题

### Q1: 如何运行单个测试文件？

```bash
pnpm test element.test.ts
```

### Q2: 如何调试测试？

```bash
# 使用 Node 调试器
node --inspect-brk node_modules/.bin/jest element.test.ts

# 或在 VS Code 中使用调试配置
```

### Q3: 如何添加新的依赖？

```bash
# 生产依赖
pnpm add package-name

# 开发依赖
pnpm add -D package-name
```

请在 PR 中说明为什么需要这个依赖。

### Q4: 提交时遇到格式检查失败？

```bash
# 自动格式化代码
pnpm format

# 检查格式
pnpm format:check
```

### Q5: TypeScript 类型错误？

```bash
# 运行类型检查
pnpm typecheck

# 查看详细错误
pnpm tsc --noEmit
```

---

## 获取帮助

- **问题讨论**: [GitHub Discussions](https://github.com/your-org/creatoria-miniapp-mcp/discussions)
- **Bug 报告**: [GitHub Issues](https://github.com/your-org/creatoria-miniapp-mcp/issues)
- **文档**: [项目文档](./docs/README.md)

---

## 行为准则

- 尊重所有贡献者
- 保持讨论专业和建设性
- 接受不同意见和反馈
- 帮助新贡献者

---

## 许可证

贡献的代码将采用项目的 [MIT License](./LICENSE)。

---

**感谢您的贡献！** 🎉

如有任何问题，欢迎在 [Discussions](https://github.com/your-org/creatoria-miniapp-mcp/discussions) 中提问。

---

**最后更新**: 2025-10-02
