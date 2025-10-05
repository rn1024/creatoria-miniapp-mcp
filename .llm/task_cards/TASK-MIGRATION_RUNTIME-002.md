# TASK_CARD TASK-MIGRATION_RUNTIME-002 · Session Runtime 迁移

## Scope
- 将 `src/core/session.ts` 拆分到 `src/runtime/session/` 目录下的实现文件，保留既有 API。
- 将 `src/core/output.ts`、`src/core/report-generator.ts` 迁移到 `src/runtime/outputs/`。
- 更新引用路径，使调用方通过 `src/runtime/*` 模块访问，不再直接依赖 `src/core/*`。
- 更新迁移文档（`docs/migration/runtime-skeleton.md`）同步映射与后续提示。

## NonGoals
- 不调整 SessionStore 行为或日志策略。
- 不改动工具 handler 逻辑（仅更新导入路径）。
- 不处理其他 `core/*` 模块（如 logger、timeout）。

## Constraints
- 保证 `pnpm build`、`pnpm typecheck` 继续通过。
- 避免循环依赖；若发现冲突，需记录并回退到安全点。
- 迁移后 `src/core/` 中仅保留必要模块，Session 相关文件应移除或改为 re-export。

## DoD
- `src/runtime/session/` 下包含 SessionStore 实现及相关辅助（拆分为 `store.ts` / `cleanup.ts` 等）。
- `src/runtime/outputs/` 持有输出管理与报告逻辑。
- 所有引用 `../core/session`、`../core/output`、`../core/report-generator` 的文件均改为新路径。
- `docs/migration/runtime-skeleton.md` 更新映射；`.llm/state.json`、本 TaskCard 状态同步。
- 验证命令：`pnpm typecheck`、`pnpm exec eslint src/runtime --ext .ts --max-warnings=0`。

## Inputs
- `src/core/session.ts`
- `src/core/output.ts`
- `src/core/report-generator.ts`
- `docs/migration/runtime-skeleton.md`

## Risks
- 引用路径遗漏导致构建失败。
- SessionStore 拆分后若未正确导出可能影响工具执行。

## VerifyPlan
1. `pnpm typecheck`
2. `pnpm exec eslint src/runtime --ext .ts --max-warnings=0`

## CoverageCheck
- 保持现有测试；暂不新增。

## Owner
- 通用 AI 代理

## Estimate
- 2 小时

## Status
- DONE

## HandoverTargets
- `src/runtime/session/*`
- `src/runtime/outputs/*`
- `docs/migration/runtime-skeleton.md`
- `.llm/state.json`
