# Runtime Skeleton Mapping

本文件用于跟踪迁移阶段的新目录骨架与现有实现之间的对应关系，确保在逐步搬迁代码时不会破坏对外接口。

## 应用层 (src/app)
| 新路径 | 现有实现 | 说明 |
|--------|----------|------|
| `src/app/server/index.ts` | `src/server.ts` | 暂时对外导出 `startServer` 与 `ServerConfig` 类型，后续将 server 启动逻辑迁移至该目录。 |
| `src/app/cli/index.ts` | `src/cli.ts` | 占位导出，保持 CLI 入口仍由 legacy 文件提供。 |
| `src/app/index.ts` | 组合 `app/server` 与 `app/cli` | 为未来统一应用入口做准备。 |

## 运行时层 (src/runtime)
| 新路径 | 现有实现 | 说明 |
|--------|----------|------|
| `src/runtime/session/index.ts` | `src/runtime/session/store.ts` | 暴露 SessionStore 及清理工具函数。 |
| `src/runtime/session/store.ts` | `src/core/session.ts` | SessionStore 实现迁移至 runtime。 |
| `src/runtime/session/utils/cleanup.ts` | `src/core/session.ts` | 会话资源清理逻辑独立封装。 |
| `src/runtime/element/element-ref.ts` | `src/core/element-ref.ts` | 元素定位与缓存逻辑迁移至 runtime。 |
| `src/runtime/logging/index.ts` | `src/runtime/logging/*` | 汇总日志接口，指向新的 runtime 实现。 |
| `src/runtime/logging/logger.ts` | `src/core/logger.ts` | 结构化日志实现迁移至 runtime。 |
| `src/runtime/logging/tool-logger.ts` | `src/core/tool-logger.ts` | ToolLogger 封装迁移至 runtime。 |
| `src/runtime/outputs/index.ts` | `src/runtime/outputs/*` | 聚合产物与报告逻辑。 |
| `src/runtime/outputs/output-manager.ts` | `src/core/output.ts` | 输出管理器实现迁移至 runtime。 |
| `src/runtime/outputs/report-generator.ts` | `src/core/report-generator.ts` | 会话报告生成迁移至 runtime。 |
| `src/runtime/timeout/index.ts` | `src/runtime/timeout/timeout.ts` | 暴露超时工具。 |
| `src/runtime/timeout/timeout.ts` | `src/core/timeout.ts` | 超时实现迁移至 runtime。 |
| `src/runtime/validation/index.ts` | `src/runtime/validation/validation.ts` | 暴露校验工具。 |
| `src/runtime/validation/validation.ts` | `src/core/validation.ts` | 校验工具实现迁移至 runtime。 |
| `src/runtime/index.ts` | 聚合上述模块 | 统一导出 runtime 功能，为后续模块化做准备。 |

## 能力层 (src/capabilities)
| 新路径 | 现有实现 | 说明 |
|--------|----------|------|
| `src/capabilities/automator/index.ts` | `src/tools/automator.ts` | 直接 re-export。 |
| `src/capabilities/automator/schemas/*.ts` | 新增 | Automator 工具 Zod schema 定义（launch/connect/disconnect/close）。 |
| `src/capabilities/miniprogram/index.ts` | `src/tools/miniprogram.ts` | 直接 re-export。 |
| `src/capabilities/page/index.ts` | `src/tools/page.ts` | 直接 re-export。 |
| `src/capabilities/element/index.ts` | `src/tools/element.ts` | 直接 re-export。 |
| `src/capabilities/assert/index.ts` | `src/tools/assert.ts` | 直接 re-export。 |
| `src/capabilities/snapshot/index.ts` | `src/tools/snapshot.ts` | 直接 re-export。 |
| `src/capabilities/record/index.ts` | `src/tools/record.ts` | 直接 re-export。 |
| `src/capabilities/network/index.ts` | `src/tools/network.ts` | 直接 re-export。 |
| `src/capabilities/index.ts` | `src/tools/index.ts` | 暂时继续导出全部工具注册逻辑，后续将拆分能力开关。 |

## 后续动作提示
1. 当实际逻辑迁移至新目录时，更新本表，确保每个功能模块都有明确归属。
2. 在 TC-SCHEMA-03 中补充 schema 目录 (`src/capabilities/*/schemas`) 与自动生成脚本。
3. 使用 `pnpm generate:schemas` 从注册表导出 JSON Schema，保持 MCP 契约同步。
4. Session/输出模块迁移后，旧 `src/core/*` 文件仅保留再导出，后续可以清理。
5. 完成迁移后，逐步让现有模块引用新路径，最终删除 legacy 文件。
