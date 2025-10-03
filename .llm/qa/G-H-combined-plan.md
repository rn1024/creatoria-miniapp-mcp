# Stage G 遗留问题 + Stage H 任务 - 综合实施方案

**创建时间**: 2025-10-03
**目标**: 完成 Stage G 质量改进 + Stage H 发布准备，达成 M5 里程碑

---

## 📊 问题与任务汇总

### Stage G 遗留问题 (来自 Code Review)

#### 🔴 Critical - 阻塞级
| ID | 问题 | 当前状态 | 优先级 | 工作量 |
|----|------|----------|--------|--------|
| **G-C1** | 集成测试未实际执行 | ❌ 只写未跑 | P0 | 2-3h |
| **G-C2** | 工具清单脚本解析脆弱 | ⚠️ 能用但不稳定 | P1 | 1-2h |

#### 🟡 High Priority - 高优先级
| ID | 问题 | 当前状态 | 优先级 | 工作量 |
|----|------|----------|--------|--------|
| **G-H1** | 缺少 G2 执行文档 | ❌ 无记录 | P0 | 0.5h |
| **G-H2** | 测试辅助类错误上下文不足 | ⚠️ 丢失 stack trace | P2 | 0.5h |
| **G-H3** | 示例脚本硬编码选择器 | ⚠️ 项目不匹配会失败 | P2 | 1h |

#### 🟢 Medium/Low - 中低优先级
| ID | 问题 | 当前状态 | 优先级 | 工作量 |
|----|------|----------|--------|--------|
| **G-M1** | 集成测试未验证文件输出 | ⚠️ 只验证调用成功 | P3 | 1h |
| **G-M2** | 缺少 record/replay 集成测试 | ❌ README 提到但未实现 | P3 | 1.5h |
| **G-M3** | 示例脚本未演示错误恢复 | 📝 可改进 | P4 | 0.5h |
| **G-L1** | 超时值不一致 | 📝 可改进 | P4 | 0.5h |
| **G-L3** | 缺少 smoke test 脚本 | ❌ 无快速验证方式 | P3 | 1h |

### Stage H 新任务 (来自开发计划)

| ID | 任务 | 产出 | 优先级 | 工作量 |
|----|------|------|--------|--------|
| **H1** | CI/CD 流程 | `.github/workflows/*.yml` | P0 | 2-3h |
| **H2** | 版本管理与发布 | `scripts/release.ts` | P1 | 1-2h |
| **H3** | 维护计划 | `docs/roadmap.md`, issue 模板 | P2 | 1-2h |

---

## 🎯 综合实施方案

### 方案 A: 完整质量保证路径 (推荐)
**目标**: 修复所有 Critical/High 问题 + 完成 Stage H
**总工作量**: 10-14 小时
**风险**: 低 - 质量有保障

#### 阶段 1: Stage G Critical 修复 (4-5.5h)
```markdown
1. [G-C1] 执行集成测试 (2-3h)
   - 创建最小测试小程序项目
   - 运行所有集成测试并修复失败
   - 截图和日志收集

2. [G-H1] 创建 G2 执行文档 (0.5h)
   - 记录执行结果到 .llm/qa/G2-integration-test-execution.md
   - 包含截图、日志、通过率

3. [G-C2] 重构工具清单脚本 (1-2h)
   - 改用 TypeScript AST 解析
   - 添加单元测试验证

4. [G-L3] 添加 smoke test (1h)
   - 快速验证核心功能
   - 集成到 CI 流程
```

#### 阶段 2: Stage G High Priority (2h)
```markdown
5. [G-H2] 改进测试辅助类 (0.5h)
   - 保留 error stack trace
   - 添加调试模式

6. [G-H3] 优化示例脚本 (1h)
   - 添加选择器验证和 fallback
   - 改进错误提示

7. [G-M1] 集成测试文件验证 (0.5h)
   - F2/F3 测试验证快照文件存在
```

#### 阶段 3: Stage H 核心任务 (4-7h)
```markdown
8. [H1] CI/CD 流程 (2-3h)
   - GitHub Actions workflow
   - 单元测试 + 类型检查 + lint
   - 可选: 集成测试（需要 IDE 环境）

9. [H2] 版本管理 (1-2h)
   - 发布脚本 (changelog, version bump, git tag)
   - package.json 版本策略

10. [H3] 维护计划 (1-2h)
    - Issue/PR 模板
    - Roadmap 文档
    - Contributing 指南
```

#### 阶段 4: Optional 优化 (如有时间)
```markdown
11. [G-M2] Record/Replay 集成测试 (1.5h)
12. [G-M3] 错误恢复示例 (0.5h)
13. [G-L1] 提取超时常量 (0.5h)
```

---

### 方案 B: 快速发布路径 (不推荐)
**目标**: 最小化改动，快速进入 Stage H
**总工作量**: 6-9 小时
**风险**: 中 - 集成测试未验证

```markdown
阶段 1: 最小 Stage G 修复 (2-3h)
  ✅ [G-H1] 创建 G2 文档（标注"未实际执行"）
  ✅ [G-C2] 重构工具清单脚本
  ✅ [G-L3] Smoke test

阶段 2: Stage H 核心 (4-6h)
  ✅ [H1] CI/CD（仅单元测试）
  ✅ [H2] 版本管理
  ✅ [H3] 维护计划

❌ 跳过: 集成测试实际执行、文件验证等
⚠️  风险: 生产环境可能暴露问题
```

---

## 🚀 推荐执行计划: 方案 A

### Day 1: Stage G Critical 修复 (4-5.5h)

#### Task 1: 创建测试小程序项目 (0.5h)
```bash
# 创建最小测试项目
mkdir test-miniprogram
cd test-miniprogram

# 初始化项目结构
cat > project.config.json <<EOF
{
  "appid": "test",
  "projectname": "mcp-test-project",
  "miniprogramRoot": "./",
  "compileType": "miniprogram"
}
EOF

# 创建测试页面
mkdir -p pages/index
cat > pages/index/index.wxml <<EOF
<view class="container">
  <text>MCP Test Page</text>
  <button>Test Button</button>
  <input placeholder="Test Input" />
</view>
EOF

cat > pages/index/index.js <<EOF
Page({
  data: {
    message: 'Hello MCP'
  }
})
EOF
```

#### Task 2: 执行集成测试 (2h)
```bash
# 设置环境变量
export TEST_PROJECT_PATH="/path/to/test-miniprogram"
export TEST_AUTO_PORT=9420

# 启动微信开发者工具（手动或脚本）
# /Applications/wechatwebdevtools.app/Contents/MacOS/cli --auto $TEST_PROJECT_PATH --auto-port 9420

# 运行集成测试
pnpm test:integration

# 收集结果
- 截图所有测试通过
- 保存失败日志（如有）
- 验证产物文件（snapshots, screenshots）
```

#### Task 3: 创建执行文档 (0.5h)
创建 `.llm/qa/G2-integration-test-execution.md`:
```markdown
# G2: Integration Test Execution Report

## Environment
- OS: macOS 14.5
- Node: v18.x
- WeChat DevTools: v1.06.x
- Test Project: test-miniprogram

## Test Results

### 01-basic-navigation.test.ts
✅ All 5 tests passed
- Launch: 2.3s
- Navigate: 0.8s
- Screenshot: 1.2s
[截图]

### 02-element-interaction.test.ts
✅ 7/7 tests passed
[详细结果]

### 03-assertion-snapshot.test.ts
✅ 9/9 tests passed
[详细结果]

### 04-observability.test.ts
⚠️  2/8 tests skipped (no button element)
✅ 6/8 tests passed
[详细结果]

## Artifacts Verified
✅ Snapshots saved: 5 files
✅ Screenshots saved: 8 files
✅ Session reports: 1 file

## Issues Found & Fixed
1. [描述发现的问题]
2. [描述修复方案]
```

#### Task 4: 重构 update-readme.ts (1.5h)
```typescript
// 使用 TypeScript Compiler API
import * as ts from 'typescript'

function extractToolsFromAST(sourceFile: ts.SourceFile): ToolCategory[] {
  const categories: ToolCategory[] = []

  // 遍历 AST 节点
  ts.forEachChild(sourceFile, node => {
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0]

      // 查找 AUTOMATOR_TOOLS 等导出
      if (ts.isIdentifier(declaration.name)) {
        const varName = declaration.name.text

        if (varName.endsWith('_TOOLS')) {
          // 解析工具数组
          const tools = parseToolArray(declaration.initializer)
          categories.push({
            name: varName.replace('_TOOLS', ''),
            tools
          })
        }
      }
    }
  })

  return categories
}
```

#### Task 5: Smoke Test 脚本 (1h)
```bash
#!/bin/bash
# scripts/smoke-test.sh

set -e
echo "🧪 Running smoke tests..."

# 1. Build check
echo "📦 Building..."
pnpm build

# 2. Type check
echo "🔍 Type checking..."
pnpm typecheck

# 3. Unit tests
echo "🧪 Running unit tests..."
pnpm test:unit

# 4. Tool count verification
echo "🔧 Verifying tool count..."
TOOLS=$(pnpm update-readme --dry-run | grep "Total:" | awk '{print $2}')
if [ "$TOOLS" != "65" ]; then
  echo "❌ Tool count mismatch: expected 65, got $TOOLS"
  exit 1
fi

# 5. Lint check
echo "📋 Running lint..."
pnpm lint

# 6. Format check
echo "💅 Checking format..."
pnpm format:check

echo "✅ All smoke tests passed!"
```

### Day 2: Stage G High + Stage H (6-9.5h)

#### Task 6-7: Stage G High Priority (1.5h)
见上述阶段 2

#### Task 8: CI/CD Workflow (2-3h)
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

      - name: Unit tests
        run: pnpm test:unit

      - name: Build
        run: pnpm build

      - name: Smoke test
        run: bash scripts/smoke-test.sh
```

#### Task 9: Release Script (1-2h)
```typescript
// scripts/release.ts
#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { readFile, writeFile } from 'fs/promises'

async function release(type: 'major' | 'minor' | 'patch') {
  console.log(`🚀 Starting ${type} release...`)

  // 1. Run tests
  console.log('🧪 Running tests...')
  execSync('pnpm test', { stdio: 'inherit' })

  // 2. Build
  console.log('📦 Building...')
  execSync('pnpm build', { stdio: 'inherit' })

  // 3. Update version
  console.log('📝 Updating version...')
  execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'inherit' })

  // 4. Read new version
  const pkg = JSON.parse(await readFile('package.json', 'utf-8'))
  const version = pkg.version

  // 5. Update changelog
  console.log('📋 Updating CHANGELOG.md...')
  // TODO: Auto-generate from commits

  // 6. Git commit
  console.log('📌 Creating commit...')
  execSync(`git add package.json CHANGELOG.md`, { stdio: 'inherit' })
  execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' })

  // 7. Git tag
  console.log('🏷️  Creating tag...')
  execSync(`git tag v${version}`, { stdio: 'inherit' })

  console.log(`✅ Release v${version} ready!`)
  console.log('   Run: git push && git push --tags')
}

const type = process.argv[2] as 'major' | 'minor' | 'patch'
if (!['major', 'minor', 'patch'].includes(type)) {
  console.error('Usage: pnpm release <major|minor|patch>')
  process.exit(1)
}

release(type)
```

#### Task 10: 维护计划文档 (1-2h)
- Issue templates
- PR template
- Roadmap
- Contributing guide

---

## 📋 验收标准

### Stage G 完成标准
- ✅ 集成测试实际执行并通过 (>90% pass rate)
- ✅ 执行文档完整 (G2-integration-test-execution.md)
- ✅ 工具清单脚本稳定 (基于 AST)
- ✅ Smoke test 可快速验证核心功能
- ✅ 测试辅助类完善 (保留 stack trace)

### Stage H 完成标准
- ✅ GitHub Actions CI 运行通过
- ✅ Release 脚本可用 (version, tag, changelog)
- ✅ Issue/PR 模板完整
- ✅ Roadmap 和 Contributing 文档清晰
- ✅ 可执行首次发布 (v0.1.0)

### M5 里程碑达成
- ✅ 所有 Stage A-H 完成
- ✅ 65 tools 全部实现并测试
- ✅ 440+ 单元测试 + 集成测试通过
- ✅ CI/CD 流水线就绪
- ✅ 文档完整 (README, API, Examples, Contributing)
- ✅ 可发布首个生产版本

---

## 🎯 决策点

**请选择执行方案:**

### 选项 1: 完整质量保证 (方案 A) - 推荐
- 工作量: 10-14h
- 质量: 高
- 风险: 低
- 适合: 生产就绪发布

### 选项 2: 快速发布 (方案 B)
- 工作量: 6-9h
- 质量: 中
- 风险: 中
- 适合: 快速迭代

### 选项 3: 自定义组合
- 可以选择方案 A 的部分任务
- 例如: Critical + H1/H2，跳过其他

**你的选择**: ___________

**理由**: ___________
