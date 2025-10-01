# Playwright MCP 调研

## 仓库定位与分发形态
- `microsoft/playwright-mcp` 提供的是一个 **薄封装**，入口文件 `index.js` 只导出 `createConnection`，实际逻辑来自 Playwright 主仓库内的 `playwright/lib/mcp/index`。
- CLI (`cli.js`) 调用 `playwright/lib/mcp/program`，负责解析命令行并挂接 Playwright 提供的标准命令体系。
- `src/README.md` 明确说明源码已经迁移至 Playwright monorepo；当前仓库主要承载 NPM 包装、文档与发行物。
- NPM 包通过 `bin.mcp-server-playwright` 暴露命令行，同时支持 `exports`（默认 CommonJS、类型定义 `index.d.ts`）。
- `package.json` 指向 Playwright alpha 版本依赖（`playwright` 与 `playwright-core` 一致版本），并依赖 `@modelcontextprotocol/sdk`、`zod-to-json-schema` 等生成工具。

## Playwright 实现概览（位于 Playwright monorepo）
### 服务器入口 (`lib/mcp/index.js`)
- `createConnection(config, contextGetter?)` 解析配置后创建 `BrowserServerBackend`，并通过 `createServer("Playwright", version, backend)` 生成 MCP Server。
- 支持自定义 `contextGetter`，默认使用 `contextFactory` 根据配置创建浏览器上下文。

### 浏览器上下文工厂 (`lib/mcp/browser/browserContextFactory.js`)
- 根据配置选择不同工厂：
  - `PersistentContextFactory`：持久化 profile，默认模式。
  - `IsolatedContextFactory`：每次会话全新 profile，适合测试。
  - `RemoteContextFactory` 与 `CdpContextFactory`：分别连接 Playwright 远程服务或已有浏览器（CDP）。
  - `SharedContextFactory`：多个客户端复用同一个浏览器上下文。
- 负责注入初始化脚本、管理 userDataDir、处理追踪（trace/video）保存、CDP 端口注入等。

### 服务后端 (`lib/mcp/browser/browserServerBackend.js`)
- 在 `initialize` 中创建 `Context`（见下），并构建工具清单。
- `callTool`：根据工具名称查找定义、校验参数（Zod schema），执行并收集响应（日志、输出、错误）。

### 会话上下文 (`lib/mcp/browser/context.js`)
- 管理 Playwright `BrowserContext` 生命周期：
  - 懒加载创建（含网络拦截、init script、trace、session log）。
  - 维护标签页 `Tab` 列表、当前标签切换、关闭逻辑。
  - `InputRecorder` 记录用户操作（避免工具执行时干扰）。
  - `outputFile` / `lookupSecret` 等辅助能力。
- 根据配置启用网络白名单/黑名单、trace/live 截图等。

### 工具体系 (`lib/mcp/browser/tools/*`)
- 工具根据能力分组：核心自动化（导航、选择、点击、输入、截图）、标签管理、安装浏览器、坐标点击（vision 能力）、PDF、Tracing、Verify 等。
- 文档 (`README.md`) 中的工具清单由 `update-readme.js` 读取工具 schema 自动生成，确保与实现同步。

## 配置与运行模式
- CLI 支持丰富参数：浏览器选择、CDP/Remote 连接、白/黑名单、持久化目录、init script、权限、storage state、trace/video 输出、capabilities（`vision`/`pdf`/`tracing`/`verify`）等。
- 可作为本地 MCP (`stdio`)、HTTP 服务（`--port`）或通过浏览器扩展桥接现有浏览器会话。
- Profile 模式：持久化（默认）/隔离/扩展（Chrome 扩展 `extension/README.md` 说明）。

## 构建与发布
- `scripts.roll` 会同步 Playwright 主仓库的 `config.d.ts` 到当前包，确保类型定义一致。
- 使用 Playwright Test (`playwright test`) 做端到端验证，并提供 Docker 构建脚本与 CI 工作流。

## 对小程序 MCP 项目的启发
1. **工具粒度与文档生成**：Playwright 通过中心化 schema（Zod）定义工具，自动生成 README 与客户端说明；我们也可以复用这一思路，为小程序工具集提供机器可解析的描述与自动文档。
2. **上下文管理模式**：`Context` 统一管理会话状态、标签与资源回收，适合迁移到 miniprogram-automator（例如管理 IDE 进程、页面栈、元素引用缓存）。
3. **配置分层**：支持 CLI 参数、配置文件、环境变量三层合并（`resolveConfig`），可借鉴用于管理小程序项目路径、端口、Mock 配置等。
4. **扩展能力开关**：通过 `capabilities` 控制额外工具（vision/pdf/tracing），小程序侧可类比启用录制、网络桩、真机远程等特性。
5. **会话产物输出**：Playwright MCP 自动保存 trace/video/session log；我们可将截图、页面数据、断言结果统一输出，便于调试与 CI。
