# policy.rotation.md — 轮换与接力策略（无固定分工）

## [触发条件]
- **TTL 接近**：距离平台限制 ≤ 30 分钟；
- **上下文接近上限**：> 80% 历史对话或 token 预算；
- **阶段门禁**：等待 `APPROVED <TaskID>`；
- **长任务超时**：单卡 > 90 分钟尚未达成 DoD；
- **异常/回滚**：实现失败或需要隔离验证。

## [交接动作]
1) 使用 `handoff.md` 模板生成交接包到 `.llm/handoff/TASK-*.md`；
2) 在 `state.json.handoff` 填写 `required=true`、`reason`、`to`、`package`；
3) 在 `.llm/session_log/{date}-{agent}.md` 记录摘要与变更文件；
4) 新接手的智能体以简明步骤法回显**接收确认**并继续。

## [指令（可粘贴在对话中）]
- `ROTATE NOW to=<Trae|ClaudeCode|Codex> reason=<ttl_near|context_full|...> task=<TASK-ID>`  
- `RESUME agent=<Trae|ClaudeCode|Codex> task=<TASK-ID>`
