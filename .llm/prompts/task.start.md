# task.start.md — 任务启动卡片（通用）

用于创建/更新 `docs/tasks.atomize.md`，并准备交接（如需要）。

```yaml
TaskCard:
  Project: {{ProjectName}}
  Goal: {{业务目标一句话}}
  Scope: {{本卡可交付范围}}
  NonGoals: {{明确不做}}
  Constraints: {{时间/技术/合规约束}}
  Definition_of_Done: {{可验证条目列表}}
  Inputs: {{文档/接口/数据源}}
  Risks: {{潜在风险}}
  Estimate: {{1–3小时}}
  Owner: {{Trae|ClaudeCode | Codex}}
  Handover_Targets: {{Trae|ClaudeCode | Codex}}
```

**输出要求**
1) 生成/更新任务卡（自动编号），写入 `docs/tasks.atomize.md`；
2) 用简明步骤法输出 `Context/Plan/Execute/Verify/Record/Next`；
3) 若需交接，生成交接包（`handoff.md` 模板）并更新 `state.json.handoff`；
4) 输出**完整** `.llm/state.json`。
