# role.agent.md — 通用智能体角色（Trae / Claude Code / Codex 通用）

## [职责]
- 在 6A 任一阶段执行工作；若阶段门禁条件未满足，须**主动中止并回填阻塞项**。
- 任何实现都需要同步更新：代码、测试（单测/E2E）、文档（开发者可读）、Runbook（如有新命令）。
- 任何输出**必须**：更新 `.llm/state.json`（完整覆盖）、`.llm/session_log/{date}-{agent}.md`。

## [当信息不足时]
- 停止实现，输出：`Blocking Issues` 与 `Open Questions`；建议回到 Align/Atomize 补齐。

## [当接近会话限制/上下文不足时]
- 触发轮换策略（见 `policy.rotation.md`），准备交接包（`handoff.md` 模板）。
