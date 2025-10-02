# Setup Guide

## Prerequisites

### A1: Install Runtime Environment

**Required:**
- Node.js 18.0.0 or later
- pnpm 9.0.0 (enforced by package manager)
- WeChat Developer Tools (微信开发者工具)

**Installation:**

1. **Node.js**
   ```bash
   # Check version
   node --version  # Should be >= 18.0.0

   # Install via nvm (recommended)
   nvm install 18
   nvm use 18
   ```

2. **pnpm**
   ```bash
   # Install pnpm
   npm install -g pnpm@9.0.0

   # Verify
   pnpm --version  # Should be 9.0.0
   ```

3. **WeChat Developer Tools**
   - Download from: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - Install to default location (macOS: `/Applications/wechatwebdevtools.app`)

---

## A2: Configure Automation Port

WeChat Developer Tools must be configured to enable automation API access.

### Automated Setup (Recommended)

```bash
# Use default port (9420)
./scripts/setup-devtools-port.sh

# Or specify custom port
./scripts/setup-devtools-port.sh 9421
```

### Manual Setup

1. Launch WeChat Developer Tools
2. Open Settings (设置) → Security (安全设置)
3. Enable "Service Port" (服务端口)
4. Set port to `9420` (or your preferred port)
5. Click "OK" to save

### Verify Configuration

```bash
# Test connection
node -e "const automator = require('miniprogram-automator'); \
  automator.connect({wsEndpoint: 'ws://localhost:9420'}) \
  .then(() => console.log('✅ Connected')) \
  .catch(console.error)"
```

Expected output: `✅ Connected`

---

## A3: Initialize Project

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Run tests
pnpm test
```

---

## A4: Development Tools

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

## Quick Start

### 1. Launch Mini Program

```typescript
// Using MCP tool
miniprogram_launch({
  projectPath: '/path/to/miniprogram',
  port: 9420  // Optional, defaults to 9420
})
```

### 2. Connect to Existing Instance

```typescript
// Using MCP tool
miniprogram_connect({
  port: 9420  // Optional, defaults to 9420
})
```

### 3. Interact with Mini Program

```typescript
// Navigate to page
miniprogram_navigate({
  path: '/pages/index/index'
})

// Query element
element_query({
  selector: '.btn-submit'
})

// Tap element
element_tap({
  selector: '.btn-submit'
})
```

### 4. Close Session

```typescript
// Disconnect but keep IDE running
miniprogram_disconnect()

// Or completely close and cleanup
miniprogram_close()
```

---

## Troubleshooting

### "CLI not found" Error

**Symptom:** `Failed to launch miniprogram: CLI not found`

**Solution:**
```typescript
// Specify custom CLI path
miniprogram_launch({
  projectPath: '/path/to/project',
  cliPath: '/custom/path/to/cli'
})
```

### "Connection refused" Error

**Symptom:** `Failed to connect to DevTools: Connection refused`

**Solutions:**
1. Ensure WeChat DevTools is running
2. Check automation port is enabled (Settings → Security → Service Port)
3. Verify port number matches (default: 9420)
4. Try restarting WeChat DevTools

### "Port already in use" Error

**Symptom:** `EADDRINUSE: address already in use`

**Solutions:**
1. Use a different port: `miniprogram_launch({ projectPath: '...', port: 9421 })`
2. Or kill existing process: `lsof -ti:9420 | xargs kill`

---

## Environment Variables

```bash
# Optional: Customize output directory
MCP_OUTPUT_DIR=./custom-output

# Optional: Customize session timeout (milliseconds)
MCP_SESSION_TIMEOUT=1800000  # 30 minutes
```

---

## Next Steps

- Read [API Documentation](./api-reference.md)
- Check [Examples](../examples/)
- Review [Task Cards](../.llm/task.cards.md) for development roadmap
