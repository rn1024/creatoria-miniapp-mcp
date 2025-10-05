# Creatoria MiniApp MCP 目录结构与代码规范建议

本文档总结 Creatoria MiniApp MCP 迁移阶段的目录与代码规范建议，帮助团队在重构过程中保持一致的工程节奏。

## 目标与原则
- **分层清晰**：运行时（runtime）、应用入口（app）、能力工具（capabilities）各自独立，减少跨层耦合。
- **能力可扩展**：工具数量超过 60 个，必须按能力分组并支持自动生成文档与类型。
- **交付可验证**：每一步都应有脚本化校验（lint、typecheck、tests、smoke）。
- **文档同步**：代码、schema、使用手册保持同源，避免漂移。

## 推荐目录蓝图
```
.
├── docs/
│   ├── migration/                  迁移策略与阶段总结
│   └── playbook/                   操作手册、调试指南
├── examples/
│   └── scenarios/                  可复用的自动化脚本示例
├── scripts/
│   ├── generate-tools-docs.ts      根据 schema 生成工具文档
│   └── verify-release.ts           发布前巡检脚本（lint/typecheck/tests）
├── src/
│   ├── app/
│   │   ├── cli/                    CLI 解析、日志初始化
│   │   └── server/                 MCP server 入口
│   ├── runtime/
│   │   ├── session/                会话存储、清理、钩子
│   │   ├── logging/                统一日志接口与实现
│   │   ├── outputs/                会话产物（截图、报告）管理
│   │   ├── timeout/                超时与重试策略
│   │   ├── validation/             输入校验工具
│   │   └── element/                ElementRef 解析与缓存
│   ├── capabilities/
│   │   ├── automator/
│   │   ├── miniprogram/
│   │   ├── page/
│   │   ├── element/
│   │   ├── assert/
│   │   ├── snapshot/
│   │   ├── record/
│   │   └── network/
│   │       └── schemas/            Zod 输入输出 schema
│   ├── adapters/
│   │   ├── wechat-devtools/        IDE 进程、端口管理
│   │   └── storage/                产物持久化策略
│   ├── config/                     默认配置、加载器、环境变量映射
│   ├── types/                      公共类型与错误定义
│   └── index.ts                    项目主导出
├── tests/
│   ├── unit/
│   ├── integration/
│   └── smoke/                      CLI+会话生命周期巡检
└── tools.json                      自动生成的工具清单
```

## 代码规范要点
- **Schema 驱动**：
  - 使用 `zod` 描述每个工具的输入/输出，导出 `z.infer` 类型给实现复用。
  - 借助 `zod-to-json-schema` 生成 MCP `inputSchema`，统一由脚本写回文档。
- **Session 管理**：
  - Session 日志统一走 `runtime/logging`，避免直接使用 `console.*`。
  - 在 `runtime/session` 内新增 `SessionHooks`（beforeCleanup/afterCleanup）便于扩展 trace、性能采集。
- **错误处理**：
  - 定义 `McpError` 树（配置错误、执行错误、底层自动化错误），在 server 层统一序列化。
  - 提供 `wrapToolError(handler)` 高阶函数约束日志格式。
- **产物输出**：
  - 将截图、DOM dump、网络日志统一放在 `~/.creatoria-miniapp-mcp/<session-id>`。
  - OutputManager 负责命名策略与元数据回写。
- **Runtime 实现**：
  - `src/runtime/**` 已承载 session/logging/timeout/validation/element 等核心实现；`src/core/**` 仅保留兼容性再导出，后续可逐步清理。
- **TypeScript 设定**：
  - 保持 `strict`，启用 `exactOptionalPropertyTypes`、`moduleDetection: "force"`。
  - 为测试单独维护 `tsconfig.test.json`，保持编译边界干净。
- **Lint & Format**：
  - 使用 `@typescript-eslint` 严格模式（`plugin:@typescript-eslint/recommended-type-checked`）。
  - Markdown 文档执行 `prettier --check` 或 markdownlint，保证 changelog、指南格式一致。
- **测试策略**：
  - Unit：覆盖 `runtime`、`config`、`adapters` 等纯逻辑模块。
  - Integration：基于 `test-miniapp/` 执行真实 automator 流程。
  - Smoke：`scripts/smoke-test.sh` 验证 CLI、session 生命周期。
  - 推荐在 CI 中分段执行：`lint → typecheck → unit → integration → smoke`。
- **发布前检查**：
  - `verify-release.ts` 聚合 build、工具文档生成、smoke test。
  - `package.json` 中 `files` 字段保留 `dist/*.d.ts` 与 `tools.json`，确保发布包自带类型与元数据。

## 文档协同
- 迁移相关资料统一放入 `docs/migration/`，并通过 `docs/migration/README.md` 汇总索引。
- 各能力目录可在 `docs/playbook/` 内补充操作示例或故障排查手册。
- 更新文档时与 `.llm/task_cards/` 对应任务保持同步，确保任务状态可追踪。

以上规范为迁移阶段的基线，可在任务卡执行过程中持续补充细节。
