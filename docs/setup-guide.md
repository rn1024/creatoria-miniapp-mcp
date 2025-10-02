# Setup Guide - Complete Environment Configuration

> ⏱️ **Estimated Time**: 15 minutes from zero to running

This guide walks you through setting up `creatoria-miniapp-mcp` for automated WeChat Mini Program testing via MCP.

---

## System Requirements

### Operating Systems
- **macOS**: 12.0+ (Monterey or later)
- **Windows**: 10/11 (64-bit)
- **Linux**: Ubuntu 20.04+, Debian 11+, or equivalent

### Required Software
- **Node.js**: 18.0.0 or later (LTS recommended)
- **pnpm**: 9.0.0+ (package manager)
- **WeChat Developer Tools**: Latest stable version
- **MCP Client**: Claude Desktop, Cline, or custom implementation

---

## Step 1: Install Runtime Environment

### 1.1 Node.js

**Check Current Version:**
```bash
node --version  # Should output v18.0.0 or higher
```

**Installation (if needed):**

**Option A: Using nvm (Recommended)**
```bash
# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18
```

**Option B: Official Installer**
- Download from [nodejs.org](https://nodejs.org/)
- Choose LTS version (18.x or 20.x)
- Follow installation wizard

**Verification:**
```bash
node --version   # v18.x.x or v20.x.x
npm --version    # Should come with Node
```

---

### 1.2 pnpm Package Manager

**Why pnpm?** This project enforces `pnpm@9.0.0` via `packageManager` field in `package.json`. Using npm or yarn will fail.

**Installation:**
```bash
# Install pnpm globally
npm install -g pnpm@9.0.0

# Verify installation
pnpm --version  # 9.0.0
```

**Alternative (using Corepack - Node 16.13+):**
```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

---

### 1.3 WeChat Developer Tools (微信开发者工具)

**Download:**
- Official page: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
- Choose version for your OS (macOS/Windows/Linux)

**Installation Paths:**
- **macOS**: `/Applications/wechatwebdevtools.app`
- **Windows**: `C:\Program Files (x86)\Tencent\微信web开发者工具`
- **Linux**: `/opt/wechatwebdevtools` (or custom path)

**Version Compatibility:**
- Minimum: 1.02.1904090 (supports `miniprogram-automator`)
- Recommended: Latest stable (1.06.x or newer)

**Post-Install:**
1. Launch WeChat DevTools
2. Log in with WeChat account
3. Create or open a Mini Program project (needed for testing)

---

## Step 2: Configure WeChat DevTools Automation

WeChat Developer Tools must enable automation API access via WebSocket.

### 2.1 Enable Automation Port

**Option A: Automated Setup (Recommended)**
```bash
cd creatoria-miniapp-mcp

# Use default port (9420)
./scripts/setup-devtools-port.sh

# Or specify custom port
./scripts/setup-devtools-port.sh 9421
```

**Option B: Manual Setup**
1. Launch WeChat Developer Tools
2. Click **Settings** (设置) in top menu
3. Navigate to **Security** (安全设置) tab
4. Find **Service Port** (服务端口) section
5. **Check** "Enable Service Port" checkbox
6. Enter port number: `9420` (default) or custom port
7. Click **OK** to save

**Security Note**: The automation port only accepts connections from `localhost`. No external access is allowed.

---

### 2.2 Configure CLI Access (Optional but Recommended)

Enable CLI control for programmatic launching:

**macOS/Linux:**
1. Open Settings → Security
2. Enable "Allow CLI/HTTP calls" (允许 CLI/HTTP 调用)
3. Save and restart DevTools

**CLI Path Detection:**
- macOS: Auto-detected at `/Applications/wechatwebdevtools.app/Contents/MacOS/cli`
- Windows: Usually at `C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat`
- Linux: Custom path (you'll need to specify via config)

**Test CLI:**
```bash
# macOS
/Applications/wechatwebdevtools.app/Contents/MacOS/cli --version

# Windows
"C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat" --version
```

---

## Step 3: Install & Build MCP Server

### 3.1 Clone and Install

```bash
# Clone repository
git clone https://github.com/rn1024/creatoria-miniapp-mcp.git
cd creatoria-miniapp-mcp

# Install dependencies (uses pnpm)
pnpm install

# Build TypeScript to JavaScript
pnpm build
```

**Build Output**: Compiled files will be in `dist/` directory.

---

### 3.2 Run Tests (Optional)

Verify installation by running the test suite:

```bash
pnpm test
```

**Expected Output:**
```
Test Suites: 9 passed, 9 total
Tests:       290 passed, 290 total
Time:        ~6s

✅ 100% test pass rate
```

If tests fail, check:
- Node version (`node --version` >= 18.0.0)
- pnpm version (`pnpm --version` = 9.0.0)
- No missing dependencies

---

## Step 4: Configure MCP Client

Choose one of the following MCP clients to connect to the server.

### 4.1 Claude Desktop (Recommended)

**Installation:**
- Download from: https://claude.ai/download
- Available for macOS, Windows, Linux

**Configuration:**

1. Locate Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add MCP server configuration:
   ```json
   {
     "mcpServers": {
       "miniprogram": {
         "command": "node",
         "args": ["/absolute/path/to/creatoria-miniapp-mcp/dist/cli.js"],
         "env": {
           "PROJECT_PATH": "/absolute/path/to/your/miniprogram"
         }
       }
     }
   }
   ```

3. **Replace paths**:
   - First path: Absolute path to `dist/cli.js` (e.g., `/Users/you/creatoria-miniapp-mcp/dist/cli.js`)
   - `PROJECT_PATH`: Absolute path to your Mini Program project folder

4. **Restart Claude Desktop** to load the server

**Verification:**
- Open Claude Desktop
- Type: "List available MCP servers"
- You should see `miniprogram` server with 65 tools

---

### 4.2 Cline (VS Code Extension)

**Installation:**
1. Open VS Code
2. Install "Cline" extension from marketplace
3. Reload VS Code

**Configuration:**

1. Open VS Code settings (`Cmd/Ctrl + ,`)
2. Search for "Cline: MCP Servers"
3. Click "Edit in settings.json"
4. Add configuration:
   ```json
   {
     "cline.mcpServers": {
       "miniprogram": {
         "command": "node",
         "args": ["/absolute/path/to/creatoria-miniapp-mcp/dist/cli.js"],
         "env": {
           "PROJECT_PATH": "/absolute/path/to/your/miniprogram"
         }
       }
     }
   }
   ```

5. Restart VS Code

---

### 4.3 Custom MCP Client

For custom integrations, use MCP SDK:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/creatoria-miniapp-mcp/dist/cli.js'],
  env: {
    PROJECT_PATH: '/path/to/miniprogram'
  }
})

const client = new Client({
  name: 'my-custom-client',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
})

await client.connect(transport)

// List available tools
const tools = await client.request({ method: 'tools/list' }, {})
console.log(tools) // 65 tools
```

---

## Step 5: Configuration Options

All configuration can be provided via:
1. **Environment variables** (in MCP client config)
2. **Config file** (`.mcp.json` in project root - optional)
3. **CLI arguments** (if invoking directly)

### 5.1 Environment Variables

Add to your MCP client's `env` section:

```json
{
  "env": {
    "PROJECT_PATH": "/path/to/miniprogram",
    "CLI_PATH": "/custom/path/to/cli",
    "OUTPUT_DIR": "/custom/output/dir",
    "SESSION_TIMEOUT": "1800000",
    "CAPABILITIES": "core,assert,snapshot,record"
  }
}
```

**Available Variables:**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PROJECT_PATH` | Mini Program project directory | - | ❌ (can be set per-session) |
| `CLI_PATH` | WeChat DevTools CLI path | Auto-detected (macOS) | ❌ |
| `OUTPUT_DIR` | Output directory for screenshots/snapshots | `.mcp-artifacts` | ❌ |
| `SESSION_TIMEOUT` | Session auto-cleanup timeout (ms) | `1800000` (30 min) | ❌ |
| `CAPABILITIES` | Comma-separated tool capabilities | `core,assert,snapshot,record` | ❌ |

---

### 5.2 Configuration File (.mcp.json)

Create `.mcp.json` in project root (optional, for advanced users).

**Configuration Templates**: See `examples/config/` for ready-to-use templates:
- `basic.json`: Complete configuration with all options
- `minimal.json`: Only required `projectPath`
- `custom-capabilities.json`: Selective tool registration
- `macos.json`: macOS-specific with CLI path
- `testing.json`: Testing-focused configuration
- `multi-project.json`: Multi-project setup with different ports
- `ci-cd.json`: CI/CD configuration with environment variables

**Configuration Priority**: CLI Arguments > Environment Variables > Config File > Defaults

**Example (.mcp.json)**:

```json
{
  "projectPath": "/path/to/miniprogram",
  "cliPath": "/custom/path/to/cli",
  "outputDir": ".mcp-artifacts",
  "sessionTimeout": 1800000,
  "capabilities": ["core", "assert", "snapshot", "record"]
}
```

**Note**: Environment variables override config file values.

---

### 5.3 Capabilities System

Control which tool categories are loaded:

**Available Capabilities:**
- `core`: All 65 tools (default, includes all categories below)
- `automator`: Connection & lifecycle (4 tools)
- `miniprogram`: App-level operations (16 tools)
- `page`: Page-level operations (8 tools)
- `element`: Element interactions (23 tools)
- `assert`: Assertion tools (9 tools)
- `snapshot`: Snapshot tools (3 tools)
- `record`: Recording/replay tools (6 tools)
- `network`: Network mocking tools (6 tools)

**Examples:**
```json
// Load all 65 tools (default)
"capabilities": ["core"]

// Load specific categories (selective registration)
"capabilities": ["automator", "miniprogram", "page", "element"]

// Load only testing tools
"capabilities": ["automator", "assert", "network"]
```

---

## Step 6: Verification & First Run

### 6.1 Verify WeChat DevTools Connection

Test automation port before using MCP:

```bash
# Test port (replace 9420 with your port)
curl http://localhost:9420
# Should return JSON with automation info
```

Or use Node.js:
```bash
node -e "const automator = require('miniprogram-automator'); \
  automator.connect({wsEndpoint: 'ws://localhost:9420'}) \
  .then(() => console.log('✅ Connected')) \
  .catch(e => console.error('❌ Failed:', e.message))"
```

**Expected**: `✅ Connected`

---

### 6.2 Test MCP Server Manually

Run server directly (without MCP client):

```bash
cd creatoria-miniapp-mcp
PROJECT_PATH=/path/to/miniprogram node dist/cli.js
```

**Expected Output:**
```
WeChat Mini Program MCP Server running on stdio
Capabilities: core,assert,snapshot,record
Tools registered: 59
```

Press `Ctrl+C` to stop.

---

### 6.3 First Automation via MCP Client

Open your MCP client (Claude Desktop or Cline) and try:

**Test 1: List Tools**
```
You: List all available Mini Program tools

Claude: [Calls tools/list]
I found 65 tools across 8 categories:
- Automator (4): launch, connect, disconnect, close
- MiniProgram (6): navigate, callWx, evaluate, ...
- Page (8): query, queryAll, waitFor, ...
- Element (23): tap, input, getText, ...
- Assert (9): exists, text, attribute, ...
- Snapshot (3): capture, restore, compare
- Record (6): start, stop, list, replay, ...
```

**Test 2: Launch Mini Program**
```
You: Launch my mini program at /path/to/project

Claude: [Calls automator.launch]
✅ WeChat DevTools launched successfully
✅ Mini Program loaded: /path/to/project
```

**Test 3: Simple Automation**
```
You: Navigate to /pages/index/index and query for element with selector ".title"

Claude: [Calls miniprogram.navigate + page.query]
✅ Navigated to /pages/index/index
✅ Found element: { refId: "elem_abc123", selector: ".title" }
```

---

## Development Tools (Optional)

If you plan to contribute or modify the server:

### Linting and Formatting

```bash
# Check code style
pnpm lint
pnpm format:check

# Auto-fix issues
pnpm format
```

### Git Hooks

Pre-commit hooks are automatically installed via Husky:
- Code formatting check
- TypeScript type checking
- Linting

---

## Common Setup Issues & Troubleshooting

### Issue 1: "CLI not found" Error

**Symptom:**
```
Error: Failed to launch miniprogram: CLI not found at /Applications/wechatwebdevtools.app/...
```

**Cause:** WeChat DevTools CLI path not auto-detected or installed in non-standard location.

**Solutions:**

**Option A: Specify CLI path via environment variable**
```json
{
  "env": {
    "CLI_PATH": "/custom/path/to/cli"
  }
}
```

**Option B: Per-tool call (via MCP client)**
```
You: Launch mini program at /path/to/project with custom CLI at /opt/wx-devtools/cli

Claude: [Calls automator.launch with cliPath parameter]
```

**Common CLI Paths:**
- macOS: `/Applications/wechatwebdevtools.app/Contents/MacOS/cli`
- Windows: `C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat`
- Linux: `/opt/wechatwebdevtools/bin/cli`

---

### Issue 2: "Connection refused" Error

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:9420
```

**Cause:** WeChat DevTools automation port not enabled or not accessible.

**Solutions:**

1. **Verify DevTools is running:**
   ```bash
   # Check if DevTools process exists
   ps aux | grep wechat  # macOS/Linux
   tasklist | findstr wechat  # Windows
   ```

2. **Check automation port is enabled:**
   - Open WeChat DevTools
   - Settings → Security → Service Port
   - Ensure "Enable Service Port" is checked
   - Port number matches your config (default: 9420)

3. **Test port manually:**
   ```bash
   curl http://localhost:9420
   # Should return JSON if port is accessible
   ```

4. **Restart DevTools:**
   - Close WeChat DevTools completely
   - Re-launch and re-enable automation port

---

### Issue 3: "Port already in use" Error

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::9420
```

**Cause:** Another process (or previous DevTools instance) is using port 9420.

**Solutions:**

**Option A: Use different port**
```json
{
  "env": {
    "PROJECT_PATH": "/path/to/project",
    "PORT": "9421"
  }
}
```

**Option B: Kill process using the port**
```bash
# macOS/Linux
lsof -ti:9420 | xargs kill

# Windows
netstat -ano | findstr :9420
taskkill /PID <PID> /F
```

---

### Issue 4: MCP Server Not Showing in Claude Desktop

**Symptom:** Claude Desktop doesn't recognize the miniprogram server.

**Checks:**

1. **Verify config file path:**
   ```bash
   # macOS
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Windows
   type %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Check JSON syntax:**
   - Use JSON validator: https://jsonlint.com/
   - Ensure no trailing commas
   - Paths must use `/` even on Windows (or `\\` for escaped backslashes)

3. **Verify paths are absolute:**
   ```json
   {
     "args": ["/Users/you/creatoria-miniapp-mcp/dist/cli.js"]  // ✅ Absolute
     // NOT: ["./dist/cli.js"]  // ❌ Relative won't work
   }
   ```

4. **Restart Claude Desktop:**
   - Quit Claude Desktop completely
   - Relaunch (config is loaded on startup)

5. **Check server logs** (if available):
   - Claude Desktop may show MCP server stderr output
   - Look for startup messages or errors

---

### Issue 5: "Project path not found" Error

**Symptom:**
```
Error: Project path does not exist: /path/to/project
```

**Cause:** Invalid or non-existent Mini Program project path.

**Solutions:**

1. **Verify path exists:**
   ```bash
   ls -la /path/to/miniprogram  # macOS/Linux
   dir "C:\path\to\miniprogram"  # Windows
   ```

2. **Check for project.config.json:**
   ```bash
   # Valid Mini Program project should have:
   # - project.config.json
   # - app.json
   # - pages/ directory
   ```

3. **Use absolute path:**
   ```json
   {
     "PROJECT_PATH": "/Users/you/miniprogram-demo"  // ✅ Absolute
     // NOT: "~/miniprogram-demo"  // ❌ Shell expansion may not work
   }
   ```

---

### Issue 6: Permission Errors (macOS/Linux)

**Symptom:**
```
Error: EACCES: permission denied
```

**Solutions:**

1. **Check file permissions:**
   ```bash
   ls -l /path/to/creatoria-miniapp-mcp/dist/cli.js
   # Should be readable: -rw-r--r-- or -rwxr-xr-x
   ```

2. **Fix permissions:**
   ```bash
   chmod +r /path/to/creatoria-miniapp-mcp/dist/cli.js
   ```

3. **Check output directory:**
   ```bash
   # Ensure MCP server can write to output directory
   mkdir -p .mcp-artifacts
   chmod 755 .mcp-artifacts
   ```

---

### Issue 7: Node Version Incompatibility

**Symptom:**
```
SyntaxError: Unexpected token '?.'
```

**Cause:** Using Node.js <18.0.0 (project requires >=18).

**Solution:**
```bash
# Check version
node --version

# Upgrade if needed (using nvm)
nvm install 18
nvm use 18
nvm alias default 18
```

---

### Issue 8: pnpm Not Found

**Symptom:**
```
Error: pnpm: command not found
```

**Solution:**
```bash
# Install pnpm globally
npm install -g pnpm@9.0.0

# Or use corepack (Node 16.13+)
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

---

## Next Steps

### For Users
- 📖 Read [API Documentation](./api/) for complete tool reference
- 💡 Check [Usage Examples](../examples/) for real-world scenarios
- ❓ Review [Troubleshooting Guide](./troubleshooting.md) for common errors

### For Contributors
- 🏗️ Review [Architecture](./architecture.md) to understand system design
- 🤝 Read [Contributing Guide](../CONTRIBUTING.md) for development workflow
- 📋 Check [Task Breakdown](../docs/) for development roadmap (35 charter + task docs)

---

**Setup Complete!** 🎉 You're ready to automate WeChat Mini Program testing with AI assistants.
