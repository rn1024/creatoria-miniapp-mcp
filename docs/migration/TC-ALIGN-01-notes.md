# TC-ALIGN-01 · Migration Scope Alignment Notes

## Scope Focus (Cycle 1)
- 引入 `src/app`, `src/runtime`, `src/capabilities` 三层骨架，并通过 re-export 保持现有入口 (`src/server.ts`, `src/index.ts`, `dist/cli.js`) 行为不变。
- 先行整理 `runtime/session` 与 `runtime/logging` 的职责边界，拆分清理/产物逻辑，准备后续测试。
- 设计 schema 驱动的工具目录结构，但首轮仅输出目录与文档占位符，代码迁移留待后续任务。
- 建立 `docs/migration` 板块作为迁移期间的单一信息源，配套更新 `.llm/task_cards/` 进度。

## Stability Requirements
- **CLI 接口**：`pnpm build/start`, `dist/cli.js`, `bin.miniprogram-mcp` 与 `creatoria-miniapp-mcp` 命令、现有 CLI 参数必须保持兼容，帮助文本暂不调整。
- **配置加载**：`loadConfig` 行为与优先级（CLI > env > config > defaults）不能改变，`package.json` 中 `main` 和 `files` 字段保持当前路径。
- **工具清单**：`scripts/update-readme.ts` 与 smoke test 依赖 65 个工具计数，迁移前不得移除或重命名现有工具导出。
- **测试与脚本**：`pnpm lint|typecheck|test:unit|test:integration|smoke-test` 需要可执行，即使短期跳过某些校验，也必须在文档中说明原因。
- **发布资产**：`dist/` 结构、类型声明、NPM 发布配置不做变更；保留 `README.md`、`CHANGELOG.md` 与现有示例的可访问性。

## Immediate Priorities
1. 整理 `runtime` 与 `capabilities` 的目录映射表，为后续任务卡（TC-STRUCT-02）提供输入。
2. 与维护者确认 `.workflow/` 与历史文档删除是否属于旧进度清理，防止误删必需资产。
3. 建立迁移状态同步节奏：完成每张任务卡后更新 `.llm/state.json` 的 `open_tasks` 与 `stage`。

## Deferred Topics
- Schema 自动化脚本实现（归入 TC-SCHEMA-03）。
- 重命名或裁剪工具清单（待完成新架构后评估）。
- 引入新的依赖（如 `zod-to-json-schema`）需等到策略确认。

## Open Questions
| 编号 | 问题 | 建议负责人 | 备注 |
|------|------|------------|------|
| Q1 | `.workflow/` 目录是否属于后续自动化需求？ | Samuel / 项目 Owner | 当前仓库中出现为未跟踪文件，需要确认保留或清理。 |
| Q2 | 迁移阶段是否需要锁定 `pnpm` 版本或提供 npm/yarn 指南？ | Maintainers | Smoke test 与发布脚本依赖 pnpm@9，需确认团队环境。 |
| Q3 | 是否需要在迁移前建立快照（tag 或 release branch）以便回滚？ | Maintainers | 当前版本为 v0.1.3，建议在结构调整前做标记。 |

## Next Steps
- 将本笔记分享给相关干系人确认（完成 6A 中的 Approve）。
- 根据反馈更新任务卡或新增卡片，然后进入 TC-STRUCT-02 执行阶段。
