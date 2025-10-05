# TASK_CARD TASK-MIGRATION_SCHEMA-001 · Automator Schema 引入

## Scope
- 为 Automator 能力（launch/connect/disconnect/close）定义首批 Zod schema，输出 JSON Schema 供 MCP 使用。
- 搭建 `src/capabilities/*/schemas` 目录与 schema registry，保持现有工具逻辑不变。
- 编写 `scripts/generate-tool-schemas.ts` 雏形，根据 schema 生成 JSON 文件（暂存于 `dist/schemas/`）。

## NonGoals
- 不重写工具 handler 逻辑，仍使用 `src/tools/automator.ts`。
- 不在本任务中处理其他能力的 schema。
- 不变更客户端文档生成脚本（保留 `scripts/update-readme.ts`）。

## Constraints
- 维持 TypeScript 构建与 `pnpm typecheck` 通过。
- 新增依赖仅限 `zod-to-json-schema` 等 schema 相关包。
- 输出目录不得破坏现有发行产物结构（使用 `dist/schemas/automator/*.json` 暂存）。

## DoD
- `src/capabilities/automator/schemas/*.ts` 定义 Zod schema，并导出 `AutomatorSchemaRegistry`。
- `src/capabilities/schema-registry.ts` 聚合 automator schema，提供 `getToolSchema(toolName)`。
- `scripts/generate-tool-schemas.ts` 可运行，生成 automator 工具 JSON Schema。
- README 或迁移文档更新，说明 schema 入口与生成脚本。
- `pnpm typecheck`、`pnpm lint -- --max-warnings=0`（仅新文件）通过。
- `.llm/state.json` 与本 TaskCard 状态更新。

## Inputs
- `docs/migration/tool-schema-strategy.md`
- `src/tools/automator.ts`
- 现有 `scripts/update-readme.ts`

## Risks
- JSON Schema 生成与 MCP `inputSchema` 结构不一致 → 在脚本中加入基础格式化。
- TypeScript 模块解析冲突 → 使用明确路径导出避免循环引用。

## VerifyPlan
1. `pnpm typecheck`
2. `pnpm lint src/capabilities src/tools --max-warnings=0`
3. 手动检查 `dist/schemas/automator/*.json`

## CoverageCheck
- 无新增测试（后续任务补充），验证依赖 `pnpm typecheck` 和产出检查。

## Owner
- 通用 AI 代理

## Estimate
- 2 小时

## Status
- DONE

## HandoverTargets
- docs/migration/tool-schema-strategy.md
- 新增 schema 与脚本
- `.llm/state.json`
