# TASK_CARD TASK-MIGRATION_RUNTIME-005 · ElementRef 迁移

## Scope
- 将 `src/core/element-ref.ts` 迁移到 `src/runtime/element/element-ref.ts`，保持现有 API。
- 更新工具与 session 对该模块的引用路径。
- 在迁移文档与状态文件中记录调整。

## NonGoals
- 不修改 ElementRef 行为或缓存策略。
- 不扩展新的定位能力。

## Constraints
- `pnpm typecheck`、`pnpm exec eslint src/runtime --ext .ts --max-warnings=0` 必须通过。
- `src/core/element-ref.ts` 最终仅保留再导出。

## DoD
- 新文件 `src/runtime/element/element-ref.ts` 提供原实现。
- 所有引用更新到 runtime 路径。
- `docs/migration/runtime-skeleton.md`、`.llm/state.json` 与任务卡状态更新。

## VerifyPlan
1. `pnpm typecheck`
2. `pnpm exec eslint src/runtime --ext .ts --max-warnings=0`

## Status
- DONE
