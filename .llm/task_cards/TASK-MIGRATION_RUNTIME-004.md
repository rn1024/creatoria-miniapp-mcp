# TASK_CARD TASK-MIGRATION_RUNTIME-004 · Timeout & Validation 迁移

## Scope
- 将 `src/core/timeout.ts`、`src/core/validation.ts` 实现迁移到 `src/runtime/timeout/` 与 `src/runtime/validation/`。
- 更新运行时代码与工具引用，统一从 runtime 层获取超时与校验工具。
- 调整 `docs/migration/runtime-skeleton.md`，记录迁移结果。

## NonGoals
- 不修改超时策略或新增重试机制。
- 不扩展 Validation 功能（仅迁移现有方法）。
- 不触碰其他 `core` 模块。

## Constraints
- 迁移后 `src/core/timeout.ts`、`src/core/validation.ts` 仅保留再导出。
- `pnpm typecheck`、`pnpm exec eslint src/runtime --ext .ts --max-warnings=0` 必须通过。
- 保持工具与 Session 行为不变。

## DoD
- `src/runtime/timeout/timeout.ts`、`src/runtime/validation/validation.ts` 提供实际实现。
- 所有引用（例如工具、session、schema）改用 runtime 路径。
- `docs/migration/runtime-skeleton.md` 更新条目；`.llm/state.json` 同步任务状态。

## Inputs
- `src/core/timeout.ts`
- `src/core/validation.ts`
- `docs/migration/runtime-skeleton.md`

## Risks
- 引用遗漏导致构建失败。
- Validation 迁移可能暴露新的循环依赖，需要注意导入顺序。

## VerifyPlan
1. `pnpm typecheck`
2. `pnpm exec eslint src/runtime --ext .ts --max-warnings=0`

## CoverageCheck
- 维持现有测试；本任务不新增测试。

## Owner
- 通用 AI 代理

## Estimate
- 1 小时

## Status
- APPROVED

## HandoverTargets
- `src/runtime/timeout/*`
- `src/runtime/validation/*`
- 更新后的 `docs/migration/runtime-skeleton.md`
- `.llm/state.json`
