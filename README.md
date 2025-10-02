# creatoria-miniapp-mcp

> 🤖 Enable AI assistants to orchestrate WeChat Mini Program testing through natural language

**creatoria-miniapp-mcp** is a production-ready MCP (Model Context Protocol) server that wraps WeChat's official `miniprogram-automator` SDK into 59 AI-friendly tools. Let LLMs like Claude control your Mini Program with simple natural language commands - from navigation and interaction to assertions and debugging.

**Why?** Traditional UI automation requires writing brittle scripts. With MCP, you describe what to test in plain English, and AI agents handle the implementation details - making test creation 10x faster and maintenance effortless.

[![Tests](https://img.shields.io/badge/tests-290%2B%20passed-success)](https://github.com/rn1024/creatoria-miniapp-mcp) [![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/) [![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE) [![MCP](https://img.shields.io/badge/MCP-1.0-purple)](https://modelcontextprotocol.io/)

---

## ✨ Core Features

- 🎯 **59 AI-Friendly Tools**: Complete coverage across 7 categories (Automator, MiniProgram, Page, Element, Assert, Snapshot, Record)
- 🤖 **Natural Language Testing**: Describe tests in plain English, let AI write automation code
- 🔧 **MCP Native**: Seamlessly integrates with Claude Desktop, Cline, and any MCP client
- 🧪 **Test Automation**: 9 assertion tools + 6 recording tools for robust test workflows
- 📸 **Debug Snapshots**: Capture page/app/element state for troubleshooting
- 🎨 **TypeScript First**: Full type definitions, 290+ tests, 100% pass rate
- 🔄 **Session Isolation**: Multi-session support with automatic 30-min cleanup
- ⚙️ **Flexible Config**: Environment variables, config files, or CLI arguments

---

## 📋 前置要求

- **Node.js**: >= 18.0.0
- **微信开发者工具**: 已安装并启用 CLI（[下载地址](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)）
- **小程序项目**: 用于测试的微信小程序项目目录
- **pnpm**: 推荐使用 pnpm 作为包管理器（`npm install -g pnpm`）

---

## 🚀 Quickstart (< 5 minutes)

### 1. Install & Build

```bash
git clone https://github.com/rn1024/creatoria-miniapp-mcp.git
cd creatoria-miniapp-mcp
pnpm install && pnpm build
```

### 2. Configure MCP Client

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "node",
      "args": ["/absolute/path/to/creatoria-miniapp-mcp/dist/cli.js"],
      "env": {
        "PROJECT_PATH": "/path/to/your/miniprogram"
      }
    }
  }
}
```

**That's it!** Restart Claude Desktop and you're ready to go. See [Setup Guide](./docs/setup-guide.md) for advanced configuration.

### 3. First Automation

Talk to Claude in natural language:

```
You: Launch my mini program and navigate to the product list page

Claude: [Calls automator.launch + miniprogram.navigate]
✅ Mini program launched
✅ Navigated to pages/product/list

You: Find the first product title and verify it contains "iPhone"

Claude: [Calls page.query + element.getText + assert.text]
✅ Found element with text: "iPhone 15 Pro"
✅ Assertion passed: text contains "iPhone"
```

### Quick Examples

**Example 1: Navigation**
```javascript
// Launch and navigate to a page
await automator.launch({ projectPath: "/path/to/project" })
await miniprogram.navigate({ url: "/pages/home/home" })
```

**Example 2: Element Interaction**
```javascript
// Find element, tap it, and input text
const btn = await page.query({ selector: ".search-btn" })
await element.tap({ refId: btn.refId })
await element.input({ selector: ".search-input", value: "iPhone" })
```

**Example 3: Assertions**
```javascript
// Verify element exists and has correct text
await assert.exists({ selector: ".product-title" })
await assert.text({ selector: ".product-title", expected: "iPhone 15" })
```

📚 **Next Steps**: Check out [Usage Examples](./examples/) for complete workflows including form submission, snapshot debugging, and test recording.

---

## 🛠️ Tool Catalog (59 Tools across 7 Categories)

### Automator (4 tools) - Connection & Lifecycle

| Tool | Description |
|------|-------------|
| `automator.launch` | Launch WeChat DevTools and load mini program |
| `automator.connect` | Connect to running DevTools instance |
| `automator.disconnect` | Disconnect but keep DevTools running |
| `automator.close` | Close mini program and cleanup resources |

### MiniProgram (6 tools) - App-Level Operations

| Tool | Description |
|------|-------------|
| `miniprogram.navigate` | Navigate between pages (navigateTo, redirectTo, reLaunch, switchTab, navigateBack) |
| `miniprogram.callWx` | Call WeChat APIs (wx.*) |
| `miniprogram.evaluate` | Execute JavaScript in mini program context |
| `miniprogram.screenshot` | Take screenshot (full page or custom region) |
| `miniprogram.getPageStack` | Get current page stack info |
| `miniprogram.getSystemInfo` | Get system info (platform, version, etc.) |

### Page (8 tools) - Page-Level Operations

| Tool | Description |
|------|-------------|
| `page.query` | Query single element (CSS selector) |
| `page.queryAll` | Query all matching elements |
| `page.waitFor` | Wait for element to appear/disappear |
| `page.getData` | Get page data |
| `page.setData` | Set page data |
| `page.callMethod` | Call page method |
| `page.getSize` | Get page dimensions |
| `page.getScrollTop` | Get page scroll position |

### Element (23 tools) - Element-Level Operations

**Tap & Input** (5 tools):
- `element.tap`, `element.longPress`, `element.doubleTap`
- `element.input`, `element.clearInput`

**Touch Events** (8 tools):
- `element.touchStart/Move/End` - Single-touch
- `element.multiTouchStart/Move/End` - Multi-touch
- `element.swipe`, `element.pinch` - Gestures

**Getters** (7 tools):
- `element.getText`, `element.getValue`
- `element.getAttribute`, `element.getProperty`
- `element.getSize`, `element.getOffset`, `element.getBoundingClientRect`

**Scrolling** (3 tools):
- `element.scroll`, `element.scrollTo`, `element.scrollIntoView`

📖 See [API Reference](./docs/api/) for detailed documentation.

### Assert (9 tools) - Testing & Validation

| Tool | Description |
|------|-------------|
| `assert.exists` | Assert element exists |
| `assert.notExists` | Assert element does not exist |
| `assert.text` | Assert exact text match |
| `assert.notText` | Assert text does not match |
| `assert.attribute` | Assert attribute value |
| `assert.notAttribute` | Assert attribute absence/mismatch |
| `assert.data` | Assert page data value |
| `assert.displayed` | Assert element is visible (non-zero size) |
| `assert.count` | Assert element count |

### Snapshot (3 tools) - State Capture & Debug

| Tool | Description |
|------|-------------|
| `snapshot.capture` | Capture current state (page data + optional screenshot) |
| `snapshot.restore` | Restore previously captured state |
| `snapshot.compare` | Compare two snapshots and report differences |

### Record (6 tools) - Test Recording & Replay

| Tool | Description |
|------|-------------|
| `record.start` | Start recording user actions |
| `record.stop` | Stop recording and save sequence |
| `record.list` | List all saved sequences |
| `record.get` | Get specific sequence details |
| `record.delete` | Delete a saved sequence |
| `record.replay` | Replay recorded sequence for regression testing |

---

## 🏗️ 项目结构

```
creatoria-miniapp-mcp/
├── src/                           # 源代码
│   ├── server.ts                  # MCP 服务器入口
│   ├── cli.ts                     # CLI 入口
│   ├── types.ts                   # TypeScript 类型定义
│   ├── config/                    # 配置管理
│   │   └── index.ts               # 配置加载和验证
│   ├── core/                      # 核心模块
│   │   ├── session.ts             # 会话管理器
│   │   ├── output.ts              # 输出管理器（截图、快照）
│   │   └── element-ref.ts         # 元素引用解析器
│   └── tools/                     # MCP 工具实现
│       ├── index.ts               # 工具注册器（59 个工具）
│       ├── automator.ts           # Automator 工具（4 个）
│       ├── miniprogram.ts         # MiniProgram 工具（6 个）
│       ├── page.ts                # Page 工具（8 个）
│       ├── element.ts             # Element 工具（23 个）
│       ├── assert.ts              # Assert 工具（9 个）
│       ├── snapshot.ts            # Snapshot 工具（3 个）
│       └── record.ts              # Record 工具（6 个）
│
├── tests/                         # 测试文件
│   └── unit/                      # 单元测试（290+ 个测试）
│       ├── session.test.ts
│       ├── output.test.ts
│       ├── element-ref.test.ts
│       ├── automator.test.ts
│       ├── miniprogram.test.ts
│       ├── page.test.ts
│       ├── element.test.ts
│       ├── assert.test.ts
│       ├── snapshot.test.ts
│       ├── record.test.ts
│       └── tool-registration.test.ts
│
├── docs/                          # 文档
│   ├── setup-guide.md             # 配置指南
│   ├── architecture.md            # 系统架构（待创建）
│   ├── troubleshooting.md         # 故障排除（待创建）
│   ├── charter.*.yaml             # 任务对齐文档
│   ├── tasks.*.atomize.md         # 任务分解文档
│   └── api/                       # API 参考文档（待创建）
│       ├── README.md              # API 文档索引
│       ├── automator.md
│       ├── miniprogram.md
│       ├── page.md
│       ├── element.md
│       ├── assert.md
│       └── snapshot.md
│
├── examples/                      # 使用示例（待创建）
│   ├── README.md                  # 示例索引
│   ├── 01-basic-navigation.md
│   ├── 02-form-interaction.md
│   ├── 03-assertion-testing.md
│   ├── 04-snapshot-debugging.md
│   └── 05-advanced-automation.md
│
├── scripts/                       # 脚本
│   ├── launch-wx-devtools.sh      # 启动微信开发者工具
│   └── setup-devtools-port.sh     # 配置自动化端口
│
├── .llm/                          # LLM 工作流程文档（6A 工作法）
│   ├── state.json                 # 项目状态（SSOT）
│   ├── prompts/                   # 工作流程规范
│   ├── session_log/               # 会话日志
│   └── qa/                        # 验收文档
│
├── dist/                          # 构建输出
├── package.json                   # 项目配置
├── tsconfig.json                  # TypeScript 配置
├── jest.config.js                 # Jest 测试配置
└── README.md                      # 本文件
```

---

## 📚 Documentation

### User Documentation
- [**Setup Guide**](./docs/setup-guide.md) - Environment setup and configuration
- [**API Reference**](./docs/api/) - Complete API docs for all 59 tools (E1 in progress)
- [**Usage Examples**](./examples/) - Real-world automation scenarios
- [**Troubleshooting**](./docs/troubleshooting.md) - Common issues and solutions

### Developer Documentation
- [**Architecture**](./docs/architecture.md) - System design and technical decisions (E1 in progress)
- [**Contributing Guide**](./CONTRIBUTING.md) - How to contribute to the project (E1 in progress)
- [**Task Breakdown**](./docs/) - Development tasks and progress tracking (35 charter + task docs)

### 6A Workflow Documentation (Internal)
- [`.llm/state.json`](./.llm/state.json) - Project state (Single Source of Truth)
- [`.llm/prompts/`](./.llm/prompts/) - 6A workflow specifications
- [`.llm/session_log/`](./.llm/session_log/) - Development session logs
- [`.llm/qa/`](./.llm/qa/) - Acceptance documentation

---

## 🧪 开发

### 常用命令

```bash
# 构建
pnpm build

# 开发模式（watch）
pnpm dev

# 运行测试
pnpm test

# 运行测试（watch 模式）
pnpm test:watch

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 格式检查
pnpm format:check
```

### 测试状态

```bash
$ pnpm test

Test Suites: 9 passed, 9 total
Tests:       290 passed, 290 total
Snapshots:   0 total
Time:        ~6s

✅ 100% 测试通过率
```

**Test Coverage**:
- Core modules: 93 tests (session, output, element-ref)
- Automator tools: 20 tests
- MiniProgram tools: 25 tests
- Page tools: 27 tests
- Element tools: 72 tests
- Assert tools: 27 tests
- Snapshot tools: 10 tests
- Record tools: 18 tests
- Tool registration: 55 tests

### 添加新工具

查看 [贡献指南](./CONTRIBUTING.md) 了解如何添加新工具。

---

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解：

- 6A 工作法开发流程
- 代码规范和测试要求
- Pull Request 流程
- 常见问题

### 贡献者

感谢所有贡献者！

---

## 📄 许可证

本项目采用 [MIT License](./LICENSE) 开源协议。

---

## 🔗 相关链接

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [miniprogram-automator 官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)
- [微信小程序开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- [Claude Desktop](https://claude.ai/download)

---

## 📮 联系方式

- **Issues**: [GitHub Issues](https://github.com/your-org/creatoria-miniapp-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/creatoria-miniapp-mcp/discussions)

---

**Project Status**: ✅ Stage A-D Complete (59 tools, 290+ tests passing, 9.1/10 code review), 🔄 Stage E1 Documentation in progress

**Last Updated**: 2025-10-02

---

Made with ❤️ using the [6A Workflow](./docs/charter.E1.align.yaml) (Align → Architect → Atomize → Approve → Automate → Assess)
