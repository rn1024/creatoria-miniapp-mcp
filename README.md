# WeChat Mini Program MCP Server

Model Context Protocol (MCP) server for WeChat Mini Program automation using the official `miniprogram-automator` SDK.

[![npm version](https://img.shields.io/npm/v/@creatoria/miniapp-mcp)](https://www.npmjs.com/package/@creatoria/miniapp-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- 🤖 **LLM-Friendly**: 65 AI-optimized tools for natural language automation
- 🎯 **Complete Coverage**: Automator, MiniProgram, Page, Element, Assert, Snapshot, Record, Network tools
- 🔧 **Zero Config**: Auto-detects project path from `project.config.json` or `app.json`
- 📦 **npx Ready**: No installation needed, just `npx -y @creatoria/miniapp-mcp`
- 🧪 **Test Automation**: Built-in assertion and recording capabilities
- 🎨 **TypeScript**: Full type definitions with 545 passing tests

## Quick Start

### Installation

Use with npx (recommended):
```bash
npx -y @creatoria/miniapp-mcp
```

Or install globally:
```bash
npm install -g @creatoria/miniapp-mcp
```

### Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "npx",
      "args": ["-y", "@creatoria/miniapp-mcp"]
    }
  }
}
```

**That's it!** The server will automatically detect your mini program project.

<details>
<summary>Advanced Configuration</summary>

#### Custom Project Path

```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "npx",
      "args": [
        "-y",
        "@creatoria/miniapp-mcp",
        "--project-path",
        "/path/to/your/miniprogram"
      ]
    }
  }
}
```

#### Using Config File

Create `.mcp.json` in your project root:

```json
{
  "projectPath": "/path/to/miniprogram",
  "cliPath": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
  "port": 9420,
  "capabilities": ["core", "assert", "snapshot", "record", "network"]
}
```

Then use:

```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "npx",
      "args": ["-y", "@creatoria/miniapp-mcp", "--config", ".mcp.json"]
    }
  }
}
```

#### Environment Variables

```bash
export MCP_PROJECT_PATH=/path/to/miniprogram
export MCP_PORT=9420
export MCP_CAPABILITIES=core,assert,snapshot
```

</details>

## How It Works

The server wraps WeChat's official `miniprogram-automator` SDK, exposing it through the Model Context Protocol. This allows AI assistants like Claude to:

1. **Connect** to WeChat DevTools automation interface
2. **Control** mini program UI through natural language
3. **Verify** behavior with built-in assertions
4. **Debug** with snapshots and recordings

### Auto-Detection

The server automatically searches for mini program projects:

- Current directory (checks for `project.config.json` or `app.json`)
- Common subdirectories: `dist/`, `build/`, `miniprogram/`, `src/`

## Available Tools

### Core Tools (65 total)

<details>
<summary><strong>Automator (4 tools)</strong> - Connection & Lifecycle</summary>

- `miniprogram_launch` - Launch WeChat Mini Program
- `miniprogram_connect` - Connect to running DevTools instance
- `miniprogram_disconnect` - Disconnect but keep IDE running
- `miniprogram_close` - Close session and cleanup resources

</details>

<details>
<summary><strong>MiniProgram (6 tools)</strong> - App-Level Operations</summary>

- `miniprogram_navigate` - Navigate using navigateTo/redirectTo/reLaunch/switchTab/navigateBack
- `miniprogram_call_wx` - Call WeChat API methods (wx.*)
- `miniprogram_evaluate` - Execute JavaScript in mini program context
- `miniprogram_screenshot` - Take screenshots
- `miniprogram_get_page_stack` - Get current page stack
- `miniprogram_get_system_info` - Get system information

</details>

<details>
<summary><strong>Page (8 tools)</strong> - Page-Level Operations</summary>

- `page_query` - Query single element
- `page_query_all` - Query all matching elements
- `page_wait_for` - Wait for condition or selector
- `page_get_data` - Get page data
- `page_set_data` - Set page data
- `page_call_method` - Call page methods
- `page_get_size` - Get page dimensions
- `page_get_scroll_top` - Get scroll position

</details>

<details>
<summary><strong>Element (23 tools)</strong> - Element-Level Operations</summary>

- `element_tap` - Tap/click element
- `element_longpress` - Long press element
- `element_input` - Input text (input/textarea)
- `element_get_text` - Get text content
- `element_get_attribute` - Get element attribute
- `element_get_property` - Get element property
- `element_get_value` - Get element value
- `element_trigger` - Trigger custom events
- Component-specific: ScrollView, Swiper, MovableView, Slider methods

</details>

<details>
<summary><strong>Assert (9 tools)</strong> - Testing & Verification</summary>

- `assert_exists` - Assert element exists
- `assert_not_exists` - Assert element doesn't exist
- `assert_text` - Assert text equals expected
- `assert_text_contains` - Assert text contains substring
- `assert_value` - Assert value equals expected
- `assert_attribute` - Assert attribute equals expected
- `assert_property` - Assert property equals expected
- `assert_data` - Assert page data equals expected
- `assert_visible` - Assert element is visible

</details>

<details>
<summary><strong>Snapshot (3 tools)</strong> - State Capture</summary>

- `snapshot_page` - Capture page snapshot (data + screenshot)
- `snapshot_full` - Capture full app snapshot (system + page stack)
- `snapshot_element` - Capture element snapshot

</details>

<details>
<summary><strong>Record (6 tools)</strong> - Action Recording</summary>

- `record_start` - Start recording actions
- `record_stop` - Stop and save recording
- `record_list` - List saved recordings
- `record_get` - Get recording details
- `record_delete` - Delete recording
- `record_replay` - Replay recorded actions

</details>

<details>
<summary><strong>Network (6 tools)</strong> - Mock & Testing</summary>

- `network_mock_wx_method` - Mock WeChat API methods
- `network_restore_wx_method` - Restore mocked methods
- `network_mock_request` - Mock wx.request responses
- `network_mock_request_failure` - Mock request failures
- `network_restore_request` - Restore wx.request
- `network_restore_all_mocks` - Restore all mocks

</details>

## Requirements

- **Node.js**: >= 18.0.0
- **WeChat DevTools**: [Download](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
  - Enable CLI/HTTP calls in Settings → Security
  - Default automation port: 9420
- **Mini Program Project**: Any WeChat mini program with `project.config.json` or `app.json`

## Examples

### Natural Language Testing

```
You: "Launch the mini program and navigate to the product list page"

Claude: [Calls miniprogram_connect + miniprogram_navigate]
✅ Connected to DevTools
✅ Navigated to pages/product/list

You: "Find the first product title and verify it contains 'iPhone'"

Claude: [Calls page_query + element_get_text + assert_text_contains]
✅ Found element with text: "iPhone 15 Pro"
✅ Assertion passed: text contains "iPhone"
```

### Programmatic Usage

See [examples/](./examples/) directory for complete workflows:

- [Basic Navigation](./examples/01-basic-navigation.md)
- [Element Interaction](./examples/02-element-interaction.md)
- [Assertion Testing](./examples/03-assertion-testing.md)
- [Snapshot Debugging](./examples/04-snapshot-debugging.md)
- [Action Recording](./examples/05-record-replay.md)

## Documentation

- [API Reference](./docs/api/) - Complete API docs for all 65 tools
- [Setup Guide](./docs/setup-guide.md) - Detailed setup instructions
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions
- [Architecture](./docs/architecture.md) - System design and technical decisions

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Links

- [npm Package](https://www.npmjs.com/package/@creatoria/miniapp-mcp)
- [GitHub Repository](https://github.com/rn1024/creatoria-miniapp-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [WeChat Mini Program Automator](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)
- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

---

Made with ❤️ for the WeChat Mini Program developer community
