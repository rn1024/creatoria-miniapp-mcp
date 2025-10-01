# Creatoria Mini Program MCP

MCP (Model Context Protocol) server for WeChat Mini Program automation using `miniprogram-automator`.

## Features

- 🤖 **Full Automation API**: Complete wrapper for miniprogram-automator
- 🔧 **MCP Integration**: Seamless integration with Claude and other MCP clients
- 🎯 **Element Operations**: Query, interact, and assert on mini program elements
- 📸 **Snapshots & Artifacts**: Automatic screenshot and data collection on failures
- 🎭 **Mock & Test**: Network mocking, data injection, and test capabilities
- 🔄 **Record & Replay**: Record user interactions and replay them
- ⚙️ **Configurable**: Flexible configuration with CLI, file, and environment variables

## Prerequisites

- Node.js 18+
- WeChat DevTools with CLI enabled
- Mini Program project for testing

## Installation

```bash
pnpm install
```

## Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "miniprogram": {
      "command": "node",
      "args": ["/path/to/creatoria-miniapp-mcp/dist/cli.js"],
      "env": {
        "PROJECT_PATH": "/path/to/your/miniprogram",
        "CLI_PATH": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
      }
    }
  }
}
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck

# Lint & format
pnpm lint
pnpm format

# Test
pnpm test
```

## Documentation

See `docs/` directory for complete documentation:

- [完整实现方案.md](docs/完整实现方案.md) - Complete implementation plan
- [微信小程序自动化完整操作手册.md](docs/微信小程序自动化完整操作手册.md) - Full API reference
- [开发任务计划.md](docs/开发任务计划.md) - Development task breakdown

## Project Structure

```
.
├── src/
│   ├── tools/          # MCP tool implementations
│   ├── config/         # Configuration management
│   ├── core/           # Core session & element management
│   ├── server.ts       # MCP server
│   ├── cli.ts          # CLI entry point
│   └── types.ts        # Type definitions
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── examples/           # Example scripts and configs
├── docs/               # Documentation
└── scripts/            # Build and utility scripts
```

## License

MIT
