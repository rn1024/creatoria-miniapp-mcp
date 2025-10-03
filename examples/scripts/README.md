# Example Scripts

This directory contains runnable TypeScript examples demonstrating how to use the MCP server to automate WeChat Mini Programs.

## Prerequisites

1. **WeChat DevTools** installed with CLI enabled
   - macOS: `/Applications/wechatwebdevtools.app/Contents/MacOS/cli`
   - Windows: `C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat`

2. **Test Mini Program Project**
   - Set environment variable: `TEST_PROJECT_PATH=/path/to/your/miniprogram`
   - Or pass as command-line argument

3. **Dependencies Installed**
   ```bash
   pnpm install
   pnpm build
   ```

## Running Examples

All examples can be run directly with `tsx` or compiled TypeScript:

```bash
# Using tsx (recommended for quick testing)
npx tsx examples/scripts/01-basic-navigation.ts

# Or compile and run
pnpm build
node dist/examples/scripts/01-basic-navigation.js
```

### Environment Variables

- `TEST_PROJECT_PATH` - Path to your Mini Program project (required)
- `TEST_AUTO_PORT` - WeChat DevTools automation port (default: 9420)

Example:
```bash
export TEST_PROJECT_PATH="/Users/you/my-miniprogram"
npx tsx examples/scripts/01-basic-navigation.ts
```

## Available Examples

### 1. Basic Navigation (`01-basic-navigation.ts`)
Demonstrates the fundamental flow:
- Launch Mini Program
- Navigate between pages
- Take screenshots
- Disconnect

**Use Case**: First-time setup verification, smoke testing

### 2. Element Interaction (`02-element-interaction.ts`)
Shows how to interact with UI elements:
- Query elements by selector
- Click buttons
- Input text into fields
- Get element properties

**Use Case**: Form filling, button automation, UI testing

### 3. Assertion Testing (`03-assertion-testing.ts`)
Demonstrates assertion capabilities:
- Assert element existence
- Assert visibility
- Assert text content
- Assert element attributes

**Use Case**: Automated testing, validation workflows

### 4. Snapshot Debugging (`04-snapshot-debugging.ts`)
Shows snapshot and debugging features:
- Capture page snapshots
- Save screenshots
- Debug page state
- Export test evidence

**Use Case**: Debugging failed tests, creating test documentation

### 5. Record & Replay (`05-record-replay.ts`)
Advanced recording and playback:
- Record user interactions
- Save recording files
- Replay recorded sessions
- Verify replay results

**Use Case**: Creating test scripts from manual testing, regression testing

## Helper Functions

A shared `helpers.ts` module provides utilities for robust example scripts:

### Selector Validation

```typescript
import { validateSelector, callToolWithValidation } from './helpers.js'

// Validate selector exists before using
const exists = await validateSelector(server, '.my-button', 'Step 1')
if (!exists) {
  console.error('Selector not found, please update selector')
  return
}

// Or use automatic validation
const result = await callToolWithValidation(
  server,
  'element_tap',
  { selector: '.my-button' },
  'Step 1: Click submit button'
)
```

### Error Handling

```typescript
import { assertSuccess, callTool } from './helpers.js'

// Call tool with full stack trace on errors
const result = await callTool(server, 'automator_launch', { projectPath })

// Assert success with detailed context
assertSuccess(result, 'Launch automator')
```

### Available Helpers

- `validateSelector(server, selector, context?)` - Check if selector exists
- `callToolWithValidation(server, tool, args, context?)` - Call tool with validation
- `callTool(server, tool, args)` - Call tool with stack trace preservation
- `assertSuccess(result, context?)` - Assert tool success with context
- `extractText(result)` - Extract text from tool result
- `sleep(ms)` - Wait for specified duration

## Script Structure

All examples follow this pattern:

```typescript
import { startServer } from '../../src/server.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

async function main() {
  // 1. Get project path
  const projectPath = process.env.TEST_PROJECT_PATH || process.argv[2]
  if (!projectPath) {
    console.error('❌ TEST_PROJECT_PATH not set')
    process.exit(1)
  }

  // 2. Start MCP server
  const server = await startServer({
    projectPath,
    autoPort: parseInt(process.env.TEST_AUTO_PORT || '9420'),
    sessionTimeout: 30 * 60 * 1000,
  })

  // 3. Call tools directly
  try {
    const result = await server.callTool({
      params: {
        name: 'automator_launch',
        arguments: { projectPath },
      },
      meta: { progressToken: undefined },
    })
    console.log('✅ Launch result:', result)
  } catch (error) {
    console.error('❌ Error:', error)
  }

  // 4. Cleanup
  await server.callTool({
    params: { name: 'automator_disconnect', arguments: {} },
    meta: { progressToken: undefined },
  })
}

main().catch(console.error)
```

## Tips

1. **Start Simple**: Begin with `01-basic-navigation.ts` to verify your setup
2. **Check Logs**: Scripts output detailed logs to help debug issues
3. **Use Snapshots**: When debugging, use `04-snapshot-debugging.ts` to capture state
4. **Environment**: Make sure WeChat DevTools is running before executing scripts

## Troubleshooting

### "Connection refused" Error
- Verify WeChat DevTools is running
- Check automation port matches (default: 9420)
- Enable automation in DevTools Settings → Security

### "Project not found" Error
- Verify `TEST_PROJECT_PATH` points to a valid Mini Program project
- Check project has `project.config.json`

### "Element not found" Error
- Your Mini Program UI may differ from examples
- Modify selectors to match your project's WXML structure
- Use `page_query` to inspect available elements first

## Next Steps

After trying these examples:
1. Modify scripts to fit your Mini Program
2. Create custom automation workflows
3. Integrate with CI/CD pipelines
4. Build MCP clients that use this server

## Documentation

- [Tool Reference](../../README.md#tools) - Complete list of available tools
- [Integration Tests](../../tests/integration/) - More complex examples
- [Architecture](../../docs/architecture.md) - System design overview
