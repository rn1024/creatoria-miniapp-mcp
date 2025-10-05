# TASK_CARD TASK-MIGRATION_RUNTIME-003 · Logging Runtime 迁移

## Scope
- 将 `src/core/logger.ts`、`src/core/tool-logger.ts` 迁移至 `src/runtime/logging/`，保留现有 API。
- 更新运行时与工具模块引用，使其依赖 `src/runtime/logging`。
- 清理 `src/runtime/logging/` 现有占位再导出，并在 `docs/migration/runtime-skeleton.md` 同步映射。

## NonGoals
- 不调整日志格式、级别或输出行为。
- 不引入新的日志后端或配置策略。
- 不处理 timeout/validation 等其他 core 模块。

## Constraints
- `pnpm typecheck` 必须通过。
- ESLint 针对 `src/runtime` 无警告：`pnpm exec eslint src/runtime --ext .ts --max-warnings=0`。
- 迁移后 `src/core/logger.ts` 与 `src/core/tool-logger.ts` 仅保留再导出，待后续统一清理。

## DoD
- `src/runtime/logging/logger.ts`、`src/runtime/logging/tool-logger.ts` 提供完整实现。
- `src/runtime/logging/index.ts` 暴露新的实现；调用方改用 runtime 路径。
- 文档 `docs/migration/runtime-skeleton.md` 记录 logging 模块迁移情况。
- `.llm/state.json` 更新任务状态与验证记录。

## Inputs
- `src/core/logger.ts`
- `src/core/tool-logger.ts`
- `docs/migration/runtime-skeleton.md`

## Risks
- 引用路径遗漏导致工具无法记录日志。
- 循环依赖（logging 依赖 runtime session）需确认不存在。

## VerifyPlan
1. `pnpm typecheck`
2. `pnpm exec eslint src/runtime --ext .ts --max-warnings=0`

## CoverageCheck
- 维持现有测试；本任务不新增测试。

## Owner
- 通用 AI 代理

## Estimate
- 1.5 小时

## Status
- APPROVED

## HandoverTargets
- `src/runtime/logging/*`
- 更新后的 `docs/migration/runtime-skeleton.md`
- `.llm/state.json`
