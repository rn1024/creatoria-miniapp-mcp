# handoff.md — 交接提示词（双向，角色对等）

```yaml
Handover:
  TaskID: {{TASK-ID}}
  From: {{Trae|ClaudeCode|Codex}}
  To: {{Trae|ClaudeCode|Codex}}
  Branch: {{branch}} @ {{short-commit}}
  Entry_Points: [{{源码入口/命令}}]
  Modified_Files: [{{相对路径列表}}]
  Open_Questions: [{{待决}}]
  Blocking_Issues: [{{若有}}]
  Run_Commands: [{{npm scripts / make / docker}}]
  Verification_Steps:
    - {{如何快速自验}}
  Rollback: {{回滚方法}}
  Notes: {{补充信息}}
```

**接收方须**：
- 用简明步骤法回显接收确认；
- 若信息不足，停止实现并回填阻塞项；
- 更新 `.llm/state.json` 与 `.llm/session_log/`。
