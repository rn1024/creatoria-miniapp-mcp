# Creatoria MiniApp MCP 迁移总览

本页汇总迁移阶段的关键资料、任务卡与协作规则，便于团队快速掌握当前进展。

## 当前分支与目标
- **分支**：`migration-structure-prep`
- **阶段**：迁移规划与骨架搭建
- **目标**：在保持现有 0.1.x 功能稳定的前提下，完成目录重组、schema 策略制定与文档对齐。

## 已完成迁移
- Session / Outputs / Logging / Timeout / Validation / ElementRef 实现已迁移至 `src/runtime` 对应目录。
- Automator 工具首批 Zod schema 与 `scripts/generate-tool-schemas.ts` 已落地，可通过 `pnpm generate:schemas` 产出 JSON Schema。
- `src/core` 目录目前仅保留再导出，未来阶段可清理或移除。

## 关键文档
- `docs/directory-structure-and-code-style-best-practices.md`：目录规划与代码规范建议
- `docs/migration/runtime-skeleton.md`：旧实现与新骨架的映射表
- `docs/migration/tool-schema-strategy.md`：工具 schema 驱动方案
- `.llm/task_cards/`：迁移阶段的 6A 任务卡集合

## 任务追踪
- `.llm/state.json`：记录当前阶段、待办任务、已完成卡片
- 建议流程：完成任务卡 → 更新对应文档 → 同步 `.llm/state.json` → 准备评审

## 协作守则（摘录）
1. **不破坏现有 CLI/工具行为**：所有代码迁移需先创建桥接层，再逐步替换实现。
2. **文档与代码同步**：新增或调整目录后必须更新映射表与任务卡。
3. **Schema 先行**：在实现新工具或改动入参前，优先补充 Zod schema 与自动化脚本。
4. **语言一致性**：中文文档保持术语一致（例如“能力”“工具”“会话”），英文文档聚焦使用指南。

## 下一步
- 审阅开放问题（详见 `tool-schema-strategy.md`），确认输出 schema 与 JSON Schema 的存放策略。
- 扩展剩余能力（MiniProgram/Page/Element 等）的 schema 与自动生成流程。
- 评估 `src/core` 再导出是否可以在下一阶段完全移除，并更新发布脚本。
