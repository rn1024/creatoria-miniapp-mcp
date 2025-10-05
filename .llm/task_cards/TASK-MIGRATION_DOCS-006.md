# TASK_CARD TASK-MIGRATION_DOCS-006 · Runtime 文档同步

## Scope
- 更新 `docs/directory-structure-and-code-style-best-practices.md`，说明 runtime 层现持有实际实现（session/logging/timeout/validation/element）。
- 在 `docs/migration/README.md` 与 `docs/migration/runtime-skeleton.md` 增加迁移完成记录与下一步提示。
- 核对 README 是否需补充 runtime 说明，必要时追加一行。

## NonGoals
- 不新增新功能或修改代码行为。
- 不对发布流程或其他文档做无关改动。

## Constraints
- 文档保持中英文语境一致。
- 修改后 `pnpm lint` 不需要运行（仅文档），但需自查拼写与引用路径。

## DoD
- 以上文档完成更新并通过人工检查。
- `.llm/state.json` 记录任务完成情况。

## VerifyPlan
- 手动审阅文档，确认描述准确、链接有效。

## Status
- DONE
