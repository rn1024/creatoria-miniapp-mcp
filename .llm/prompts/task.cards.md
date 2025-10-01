# Miniapp MCP Minimal Task Cards

> 依据 `docs/开发任务计划.md`，将每个子任务拆解为可独立执行的最小单元。遵循统一格式，便于 LLM 或成员直接领取。

格式约定：
- `### [Task ID] 任务名称`
- **目标**：清晰的交付物描述。
- **前置**：任务依赖（若无写“无”）。
- **步骤**：按顺序列出具体动作，可逐条勾选。
- **完成标准**：验证条件。
- **参考**：必读文档或文件。

---

### [A1] 安装运行环境
- **目标**：本地具备 Node 18+、微信开发者工具 CLI、示例小程序。
- **前置**：无。
- **步骤**：
  1. 安装或升级 Node.js 至 18 或以上版本。
  2. 安装微信开发者工具，并记录 CLI 路径（macOS `/Applications/.../cli`）。
  3. 克隆/准备示例小程序项目，确认可在 IDE 中打开。
- **完成标准**：`node -v`≥18，CLI 可执行 `cli --version`，示例项目可在 IDE 预览。
- **参考**：`docs/第一版本方案.md`、`docs/开发任务计划.md`。

### [A2] 配置自动化端口
- **目标**：使 IDE 可通过 CLI 自动化端口接受连接。
- **前置**：A1。
- **步骤**：
  1. 在开发者工具里开启 “允许 CLI/HTTP 调用”。
  2. 编写并保存 `scripts/launch-wx-devtool.sh`（或 `.bat`）以 `--auto` 启动项目。
  3. 运行脚本，验证端口（默认 9420）可被 `ws://` 访问。
- **完成标准**：执行脚本后，可通过 `miniprogram-automator.connect` 成功返回 `MiniProgram`。
- **参考**：`docs/微信小程序自动化完整操作手册.md`、`docs/开发任务计划.md`。

### [A3] 初始化仓库结构
- **目标**：建立 TypeScript 工程骨架与基础目录。
- **前置**：A1。
- **步骤**：
  1. 运行 `npm init -y`，设置 `type: module`。
  2. 添加 `tsconfig.json`（ESNext + moduleResolution node）和 `src/`、`tests/`、`docs/` 目录。
  3. 安装 `typescript`、`ts-node`、`@modelcontextprotocol/sdk`、`miniprogram-automator`。
- **完成标准**：`npm run build` (或 `tsc --noEmit`) 通过，项目结构符合方案要求。
- **参考**：`docs/完整实现方案.md`。

### [A4] 配置代码质量工具
- **目标**：提供 lint/format/commit hook（可选但推荐）。
- **前置**：A3。
- **步骤**：
  1. 安装 ESLint + Prettier + Husky（如需要）。
  2. 创建 `.eslintrc.cjs`、`.prettierrc`，设置基本规则。
  3. 配置 Husky 钩子执行 `npm run lint`。
- **完成标准**：`npm run lint`、`npm run format` 可用，提交前自动检查。
- **参考**：`docs/开发任务计划.md`。

### [B1] 实现 MCP Server 骨架
- **目标**：提供 `src/server.ts`，可通过 stdio 启动 MCP。
- **前置**：A3。
- **步骤**：
  1. 在 `src/server.ts` 中实例化 `McpServer`，注册服务名称版本。
  2. 创建 `StdioServerTransport` 并连接。
  3. 提供入口脚本（`bin/miniprogram-mcp`）。
- **完成标准**：运行 `node dist/server.js` 后，MCP 客户端可连接并收到空工具列表。
- **参考**：`docs/第一版本方案.md`、`docs/完整实现方案.md`。

### [B2] Session 管理器
- **目标**：实现 `SessionStore`，管理每个 MCP 会话的 miniProgram/IDE 状态。
- **前置**：B1。
- **步骤**：
  1. 定义 `SessionState` 接口（miniProgram、ideProcess、elements map 等）。
  2. 实现 `get(sessionId)` / `set` / `delete` / `dispose`。
  3. 在 Server 中挂载 store，确保会话断开时自动清理。
- **完成标准**：多会话模拟时不会互相干扰，关闭连接后资源释放。
- **参考**：`docs/接口方案.md`、`docs/playwright-mcp调研.md`。

### [B3] ElementRef 解析器
- **目标**：实现可复用的元素定位逻辑。
- **前置**：B2。
- **步骤**：
  1. 定义 `ElementRefInput` 类型，支持 `refId`/`selector`/`xpath`/`index`/`pagePath`。
  2. 编写解析函数：根据输入寻找页面、定位元素，必要时保存新 refId。
  3. 处理异常（元素不存在、SDK 不支持 xpath）、提供清晰报错。
- **完成标准**：单元测试覆盖常见定位场景；页面切换后能检测句柄失效。
- **参考**：`docs/接口方案.md`。

### [B4] 日志与输出接口设计
- **目标**：制定日志格式与产物写入 API（供后续阶段使用）。
- **前置**：B2。
- **步骤**：
  1. 定义 `Logger` 接口（info/warn/error）及结构化日志字段。
  2. 定义 `OutputManager`（resolve output dir、生成文件名、写入快照）。
  3. 将其注入 Session 或上下文对象。
- **完成标准**：后续任务调用日志/输出 API 无需修改核心逻辑；包含基本单测。
- **参考**：`docs/完整实现方案.md`。

### [C1] Automator 工具实现
- **目标**：实现 `launch`、`connect`、`disconnect`、`close` 工具。
- **前置**：B1–B3。
- **步骤**：
  1. 编写 `tools/automator.ts`，定义 zod schema、实现各工具。
  2. `launch`：启动 CLI、调用 `automator.launch`，存储 `miniProgram`。
  3. `connect`：连接已有端口，记录 session。
  4. `disconnect/close`：清理 miniProgram 与 IDE 进程。
- **完成标准**：通过 MCP 调用可成功打开/关闭示例项目；资源无泄漏。
- **参考**：`docs/微信小程序自动化完整操作手册.md`。

### [C2] MiniProgram 工具实现
- **目标**：覆盖导航、callWx、evaluate、screenshot 等。
- **前置**：C1。
- **步骤**：
  1. 实现 `navigate_to` / `redirect_to` / `switch_tab` / `relaunch` 等函数。
  2. 添加 `call_wx_method`、`mock_wx_method`、`restore_wx_method`。
  3. 实现 `evaluate`、`screenshot`、`page_scroll_to`、`system_info`。
- **完成标准**：可编排“启动 → 进入页面 → 调用 wx.login → 截屏”流程。
- **参考**：`docs/微信小程序自动化 API 完整文档.md`。

### [C3] Page 工具实现
- **目标**：支持 page 查询、数据读写、方法调用。
- **前置**：C2。
- **步骤**：
  1. 实现 `wait_for`、`query`、`query_all`、`xpath` 系列。
  2. 实现 `data`、`set_data`、`call_method`、`size`、`scroll_top`。
  3. 接入 ElementRef 解析以获取页面对象。
- **完成标准**：可通过 MCP 完成页面数据断言与元素查询。
- **参考**：`docs/接口方案.md`。

### [C4] Element 工具实现
- **目标**：支持元素属性读取与交互（含子类能力）。
- **前置**：C3。
- **步骤**：
  1. 实现 `text`、`attribute`、`value`、`property`、`style`。
  2. 实现 `tap`、`longpress`、`trigger`、`touchstart/move/end`。
  3. 针对子类（input/scroll-view/swiper/movable等）实现专属方法。
- **完成标准**：可执行完整交互用例，例如输入手机号、滑动卡片。
- **参考**：`docs/微信小程序自动化 API 完整文档.md`。

### [C5] 工具注册器
- **目标**：统一注册所有工具并导出给 Server。
- **前置**：C1–C4。
- **步骤**：
  1. 创建 `tools/index.ts`，导出 `registerTools(server, capabilities)` 函数。
  2. 按能力分组工具列表，便于后续 capabilities 控制。
  3. 在 `server.ts` 中调用注册函数。
- **完成标准**：Server 启动后列出所有基础工具；调用顺利。
- **参考**：`docs/playwright-mcp调研.md`。

### [D1] 断言工具集
- **目标**：实现 `assert.exists/text/dataEquals` 等。
- **前置**：C2–C4。
- **步骤**：
  1. 定义断言输入 schema（目标类型、预期值、容差等）。
  2. 执行页面/元素读取，比较结果，返回结构化 diff。
  3. 失败时调用 OutputManager 记录快照。
- **完成标准**：断言失败会附带实际值与快照，成功返回 `pass: true`。
- **参考**：`docs/完整实现方案.md`。

### [D2] 快照工具
- **目标**：提供页面结构化快照、统一截图功能。
- **前置**：B4、C2。
- **步骤**：
  1. 实现 `snapshot_page` 返回 DOM-like 树（tag/class/text）。
  2. 封装 `capture_artifacts`，同时生成截图与数据文件。
  3. 将产物写入 `artifacts/{session}/...`，记录在日志中。
- **完成标准**：调用快照工具后可在产物目录找到 JSON + PNG 文件。
- **参考**：`docs/playwright-mcp调研.md`。

### [D3] 录制/回放
- **目标**：记录工具调用或 IDE 行为并复现。
- **前置**：B4、C2。
- **步骤**：
  1. 设计记录格式（action 数组，时间戳、工具参数）。
  2. 实现 `record_actions`（start/stop）缓存调用序列。
  3. 实现 `replay_actions` 将序列重放到 MCP 工具。
- **完成标准**：能录制一次操作并在回放时得到相同结果。
- **参考**：`docs/第一版本方案.md`。

### [D4] 网络 Mock 工具
- **目标**：通过 `mock_wx_method` 或注入脚本实现请求桩。
- **前置**：C2。
- **步骤**：
  1. 封装 `miniProgram.mock_wx_method`、`restore_wx_method`。
  2. 支持对特定 URL/方法设置固定响应。
  3. 提供工具入参校验与日志记录。
- **完成标准**：在测试中可对 `wx.request` 返回值进行 mock 并验证。
- **参考**：`docs/接口方案.md`。

### [D5] 能力开关 (Capabilities)
- **目标**：实现 `capabilities` 管理，按 `--caps` 注册工具。
- **前置**：C5。
- **步骤**：
  1. 定义能力枚举（core/assert/snapshot/record/network/...）。
  2. 在工具注册器中依据传入 capabilities 过滤。
  3. CLI 与配置加载（Stage E）可传递能力列表。
- **完成标准**：命令 `--caps snapshot,assert` 仅加载对应工具组。
- **参考**：`docs/playwright-mcp调研.md`。

### [E1] 默认配置定义
- **目标**：建立配置结构及默认值。
- **前置**：B2。
- **步骤**：
  1. 定义 TypeScript 接口（项目路径、timeouts、outputDir 等）。
  2. 给出默认配置对象。
  3. 编写 zod schema 供校验。
- **完成标准**：加载空配置时使用默认值，类型校验通过。
- **参考**：`docs/完整实现方案.md`。

### [E2] 配置解析器
- **目标**：实现 `resolveConfig`（默认 ← 文件 ← env ← CLI）。
- **前置**：E1。
- **步骤**：
  1. 解析 CLI options（使用 commander/yargs）。
  2. 读取配置文件（JSON/TS），支持多项目。
  3. 合并环境变量，最终生成标准配置对象。
- **完成标准**：提供单测覆盖常见组合，输出稳定。
- **参考**：`docs/playwright-mcp调研.md`。

### [E3] CLI 集成
- **目标**：提供 `miniprogram-mcp` 命令行入口。
- **前置**：E2。
- **步骤**：
  1. 在 `src/cli.ts` 注册参数（项目路径、caps、outputDir 等）。
  2. 调用 `resolveConfig` 并启动 Server。
  3. 支持 `--help` 输出说明，列出核心参数。
- **完成标准**：`npx miniprogram-mcp --help` 输出完整帮助；可通过命令启动服务。
- **参考**：`docs/开发任务计划.md`。

### [E4] 配置模板与示例
- **目标**：提供可复用的配置样例。
- **前置**：E2。
- **步骤**：
  1. 在 `examples/config/` 目录创建 `basic.json`、`multi-project.json` 等。
  2. 在 README 或 docs 中说明使用方式。
  3. 确认示例可被 CLI 加载并运行。
- **完成标准**：文档中的示例命令可直接运行。
- **参考**：`docs/完整实现方案.md`。

### [F1] 结构化日志
- **目标**：实现统一的日志输出。
- **前置**：B4。
- **步骤**：
  1. 定义日志格式（tool、sessionId、start/end、status、message）。
  2. 在工具执行前后写日志；捕捉异常。
  3. 提供控制台输出与文件写入两种模式。
- **完成标准**：运行一次流程可看到结构化日志（jsonlines）。
- **参考**：`docs/开发任务计划.md`。

### [F2] 失败产物收集
- **目标**：失败时自动生成截图与数据快照。
- **前置**：D2。
- **步骤**：
  1. 在工具执行 catch 块调用 OutputManager 保存截图/快照。
  2. 将产物路径写入日志与响应。
  3. 确认产物目录按 session/时间戳归档。
- **完成标准**：断言失败后返回中包含产物路径，目录存在文件。
- **参考**：`docs/完整实现方案.md`。

### [F3] 会话报告
- **目标**：生成汇总报告（JSON/Markdown）。
- **前置**：F1、F2。
- **步骤**：
  1. 汇总本次执行的日志、断言结果、产物路径。
  2. 输出 `artifacts/{session}/report.json`（或 `.md`）。
  3. 提供 CLI 选项控制生成与否。
- **完成标准**：报告包含起止时间、工具调用列表、结果统计。
- **参考**：`docs/开发任务计划.md`。

### [G1] 单元测试
- **目标**：覆盖配置解析、ElementRef、工具 schema。
- **前置**：B3、E2、C5。
- **步骤**：
  1. 使用 Jest / Vitest 编写测试用例。
  2. 覆盖错误场景（缺失参数、无效 refId）。
  3. 在 CI 中运行 `npm test`。
- **完成标准**：测试通过，代码覆盖率达成预期阈值（可选）。
- **参考**：`docs/开发任务计划.md`。

### [G2] 集成测试
- **目标**：对示例小程序执行端到端流程。
- **前置**：C1–C4、D1。
- **步骤**：
  1. 准备测试脚本（启动、登录、加购物车等）。
  2. 使用实际 MCP 工具运行，观察结果。
  3. 在失败时收集日志和产物用于诊断。
- **完成标准**：关键业务流程脚本运行成功，无异常。
- **参考**：`docs/第一版本方案.md`。

### [G3] 示例脚本与文档
- **目标**：提供用户上手示例与指南。
- **前置**：C5、E4。
- **步骤**：
  1. 在 `examples/` 提供若干 JSON/TS 脚本演示常见操作。
  2. 更新 `docs/使用指南.md`（或 README）说明如何连接 MCP。
  3. 验证文档命令可执行成功。
- **完成标准**：新人按文档可搭建环境并执行示例脚本。
- **参考**：`docs/完整实现方案.md`。

### [G4] 自动化文档生成
- **目标**：实现工具列表自动生成 README。
- **前置**：C5、D5。
- **步骤**：
  1. 编写 `scripts/update-readme.ts`，遍历工具 schema 生成 Markdown。
  2. 在发布前运行脚本更新 README 中的工具表。
  3. 将脚本加入 CI 检查。
- **完成标准**：`npm run update-readme` 更新后的 README 与实际工具保持一致。
- **参考**：`docs/playwright-mcp调研.md`。

### [H1] CI/CD 流水线
- **目标**：在 GitHub Actions（或其他平台）跑通测试与构建。
- **前置**：G1、G2。
- **步骤**：
  1. 编写工作流：安装依赖、安装微信 IDE（或下载 CLI）、拉起虚拟 display。
  2. 执行单元测试与集成脚本，收集产物。
  3. 配置缓存与并行策略。
- **完成标准**：提交 PR 时 Actions 自动运行并全部通过。
- **参考**：`docs/开发任务计划.md`。

### [H2] 发布流程
- **目标**：定义版本发布与 npm 发布脚本。
- **前置**：H1。
- **步骤**：
  1. 编写 `npm run release` 脚本，执行测试、生成 README、版本号 bump。
  2. 创建 `CHANGELOG.md`，说明版本规范。
  3. 文档化 npm 发布步骤与权限要求。
- **完成标准**：可从主分支执行发布脚本并生成新版本标签。
- **参考**：`docs/完整实现方案.md`。

### [H3] 维护计划与治理
- **目标**：建立 issue 模板、路线图、风险登记。
- **前置**：H1。
- **步骤**：
  1. 添加 `.github/ISSUE_TEMPLATE`（bug/feature）。
  2. 创建 `docs/roadmap.md`，列出未来迭代计划与风险对应措施。
  3. 设定变更流程（PR 模板、代码评审要求）。
- **完成标准**：仓库支持规范的 issue/PR 管理，路线图可供参考。
- **参考**：`docs/开发任务计划.md`。

---

> 选取任务时，请确认前置任务已完成；执行步骤时可逐条记录状态，完成后在成果中附带日志/PR/文档链接。
