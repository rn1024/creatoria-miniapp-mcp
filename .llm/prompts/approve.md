# approve.md — 审批/门禁（人类指令通用）

- 通过：`APPROVED {{TASK-ID}}`
- 退回：`CHANGES_REQUESTED {{TASK-ID}}: <变更要求>`

**收到后必须**：
- `APPROVED` → 进入 **Automate**；
- `CHANGES_REQUESTED` → 回到 **Atomize** 拆解/修订；
- 同步 `.llm/state.json` 与 `docs/tasks.atomize.md` 状态。
