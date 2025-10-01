# state.schema.md — state.json 字段说明（通用）

- `project/repo/branch`：工程标识
- `stage`：当前 6A 阶段
- `task_id`：当前聚焦任务
- `agent`：当前执行智能体信息（对等、可互换）
  - `session_ttl_minutes`：会话自我约束 TTL（建议 270 分钟），避免撞平台上限
  - `handoff_planned_at`：计划交接时间戳
- `context_digest`：一行摘要，便于快速恢复
- `open_questions/blocks`：阻塞项与待决问题
- `artifacts`：变更产物清单
- `next_actions`：下一步（可指向另一智能体）
- `handoff`：交接元数据（是否必需/原因/目标/包路径）
- `timestamp`：当前时间戳（ISO8601）
