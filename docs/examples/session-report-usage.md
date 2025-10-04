# Session Report Usage Guide

This guide explains how to enable and use the session report feature (F3) in creatoria-miniapp-mcp.

---

## Overview

Session reports provide comprehensive execution summaries for your MCP sessions, including:
- **Tool call statistics**: Success rates, durations, and per-tool metrics
- **Failure tracking**: Links to failure snapshots (F2 integration)
- **Dual format output**: JSON (machine-readable) and Markdown (human-readable)

---

## Enable Session Reports

### Configuration

Add to your server configuration:

```json
{
  "enableSessionReport": true,
  "outputDir": ".mcp-artifacts"
}
```

**Configuration options**:
- `enableSessionReport`: Enable/disable report generation (default: `false`)
- `outputDir`: Base directory for all artifacts (default: `.mcp-artifacts`)

### Via Code

```typescript
import { startServer } from 'creatoria-miniapp-mcp'

await startServer({
  enableSessionReport: true,
  outputDir: './my-artifacts',
})
```

### Via Environment Variables

```bash
export MCP_ENABLE_SESSION_REPORT=true
export MCP_OUTPUT_DIR=.mcp-artifacts
```

---

## Output Location

Reports are saved to session-specific directories:

```
{outputDir}/{sessionId}-{timestamp}/
├── report.json       # JSON format (machine-readable)
├── report.md         # Markdown format (human-readable)
└── failures/         # F2 failure snapshots (if any)
    └── {toolName}-{timestamp}/
        ├── snapshot.json
        ├── snapshot.png
        └── error-context.json
```

**Example path**:
```
.mcp-artifacts/session-12345-2025-10-03_06-00-00-000Z/
├── report.json
└── report.md
```

---

## JSON Report Format

### Full Example

```json
{
  "sessionId": "session-12345",
  "startTime": "2025-10-03T06:00:00.000Z",
  "endTime": "2025-10-03T06:15:30.000Z",
  "duration": 930000,
  "summary": {
    "totalCalls": 50,
    "successCount": 47,
    "failureCount": 3,
    "successRate": 0.94,
    "avgDuration": 1500,
    "maxDuration": 5000,
    "minDuration": 100
  },
  "toolCalls": [
    {
      "timestamp": "2025-10-03T06:00:05.000Z",
      "toolName": "miniprogram_launch",
      "duration": 3000,
      "success": true,
      "result": {
        "connected": true
      }
    },
    {
      "timestamp": "2025-10-03T06:05:10.000Z",
      "toolName": "element_tap",
      "duration": 500,
      "success": false,
      "error": {
        "message": "Element not found",
        "snapshotPath": "failures/element_tap-2025-10-03_06-05-10-123Z"
      }
    }
  ],
  "failures": [
    {
      "toolName": "element_tap",
      "timestamp": "2025-10-03T06:05:10.000Z",
      "error": "Element not found",
      "snapshotPath": "failures/element_tap-2025-10-03_06-05-10-123Z"
    }
  ]
}
```

### Schema

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | `string` | Unique session identifier |
| `startTime` | `string` | Session start time (ISO 8601) |
| `endTime` | `string` | Session end time (ISO 8601) |
| `duration` | `number` | Total session duration (milliseconds) |
| `summary.totalCalls` | `number` | Total number of tool calls |
| `summary.successCount` | `number` | Number of successful calls |
| `summary.failureCount` | `number` | Number of failed calls |
| `summary.successRate` | `number` | Success rate (0-1) |
| `summary.avgDuration` | `number` | Average call duration (ms) |
| `summary.maxDuration` | `number` | Maximum call duration (ms) |
| `summary.minDuration` | `number` | Minimum call duration (ms) |
| `toolCalls` | `ToolCallRecord[]` | Array of all tool calls |
| `failures` | `object[]` | Array of failed tool calls with snapshot links |

---

## Markdown Report Format

### Full Example

```markdown
# Session Report: session-12345

## Summary
- **Duration**: 15m 30s
- **Total Calls**: 50
- **Success Rate**: 94% (47/50)
- **Average Duration**: 1.5s

## Tool Call Statistics
| Tool Name | Calls | Success | Failure | Avg Duration |
|-----------|-------|---------|---------|--------------|
| miniprogram_launch | 1 | 1 | 0 | 3.0s |
| miniprogram_navigate | 5 | 5 | 0 | 0.8s |
| element_tap | 10 | 8 | 2 | 0.5s |
| element_input | 8 | 8 | 0 | 0.3s |
| miniprogram_screenshot | 3 | 3 | 0 | 2.1s |

## Failures
### 1. element_tap
- **Time**: 2025-10-03 06:05:10
- **Error**: Element not found
- **Snapshot**: [failures/element_tap-2025-10-03_06-05-10-123Z](failures/element_tap-2025-10-03_06-05-10-123Z)

### 2. element_tap
- **Time**: 2025-10-03 06:10:45
- **Error**: Element is not interactable
- **Snapshot**: [failures/element_tap-2025-10-03_06-10-45-789Z](failures/element_tap-2025-10-03_06-10-45-789Z)

## Timeline
| Time | Tool | Status | Duration |
|------|------|--------|----------|
| 06:00:05 | miniprogram_launch | ✅ | 3.0s |
| 06:00:08 | miniprogram_navigate | ✅ | 0.8s |
| 06:00:12 | element_tap | ✅ | 0.5s |
| 06:05:10 | element_tap | ❌ | 0.5s |
| 06:10:45 | element_tap | ❌ | 0.6s |
| 06:15:30 | miniprogram_screenshot | ✅ | 2.1s |
```

### Rendered Preview

The Markdown report renders beautifully in GitHub, GitLab, and other Markdown viewers.

---

## Usage Examples

### Automated Testing

```typescript
import { startServer } from 'creatoria-miniapp-mcp'

// Enable reports for CI/CD
await startServer({
  enableSessionReport: true,
  outputDir: './test-reports',
})

// Run your tests...
// Reports are automatically generated when session closes
```

### Local Development

```typescript
import { startServer } from 'creatoria-miniapp-mcp'

// Enable reports for debugging
await startServer({
  enableSessionReport: true,
  enableFileLog: true, // Also enable file logging
  outputDir: './.mcp-dev',
})

// Develop and test...
// Check reports in .mcp-dev/ directory
```

### Programmatic Access

```typescript
import { readFile } from 'fs/promises'
import { join } from 'path'

// Read JSON report for analysis
const reportPath = join(
  '.mcp-artifacts',
  'session-12345-2025-10-03_06-00-00-000Z',
  'report.json'
)

const report = JSON.parse(await readFile(reportPath, 'utf-8'))

console.log(`Session success rate: ${report.summary.successRate * 100}%`)
console.log(`Total failures: ${report.summary.failureCount}`)

// Analyze failures
for (const failure of report.failures) {
  console.log(`Failed tool: ${failure.toolName}`)
  console.log(`Error: ${failure.error}`)
  if (failure.snapshotPath) {
    console.log(`Snapshot: ${failure.snapshotPath}`)
  }
}
```

---

## Integration with F2 (Failure Snapshots)

Session reports automatically link to failure snapshots when both features are enabled:

```json
{
  "enableSessionReport": true,
  "enableFailureSnapshot": true
}
```

**Benefits**:
- Click snapshot links in Markdown reports to view failure details
- JSON reports include `snapshotPath` for programmatic access
- One-stop debugging: report + snapshots in same directory

**Example workflow**:
1. Test fails → F2 captures snapshot
2. Session ends → F3 generates report with snapshot link
3. Review `report.md` → Click snapshot link → View failure context

---

## Memory Management

Session reports are subject to memory limits to prevent unbounded growth:

- **Maximum tool calls**: 1000 records per session
- **Eviction policy**: FIFO (First In, First Out)
- **Memory usage**: ~500KB per 1000 records

When the limit is reached:
- Oldest records are evicted first
- A debug log is emitted: `Tool call record evicted (memory limit)`
- Reports will only contain the most recent 1000 calls

**Recommendation**: For long-running sessions, periodically create new sessions to ensure complete reporting.

---

## Performance Impact

Session report generation is designed to be lightweight:

| Operation | Time | Notes |
|-----------|------|-------|
| Record tool call | < 1ms | Per-call overhead |
| Generate report | < 200ms | 1000 records |
| Save files (parallel) | < 150ms | JSON + Markdown |
| **Total overhead** | **< 350ms** | Per session |

**Fire-and-forget pattern**: Report generation runs asynchronously during session cleanup and never blocks tool execution.

---

## Troubleshooting

### Reports not generated

**Check 1**: Is the feature enabled?
```typescript
// Ensure enableSessionReport is true
{
  "enableSessionReport": true
}
```

**Check 2**: Does the output directory exist and is writable?
```bash
ls -ld .mcp-artifacts
# Should show drwxr-xr-x permissions
```

**Check 3**: Check logs for errors
```bash
# Look for "Failed to generate session reports"
grep "Failed to generate session reports" .mcp-artifacts/*/logs/*.log
```

### Empty reports

**Cause**: No tool calls were made during the session.

**Solution**: Ensure tools are actually being invoked. Check:
- Tool registration is correct
- Session is properly initialized
- Tools are being called via the MCP protocol

### Missing failure snapshots

**Cause**: F2 (failure snapshots) is not enabled.

**Solution**: Enable both features:
```json
{
  "enableSessionReport": true,
  "enableFailureSnapshot": true
}
```

---

## Best Practices

### 1. Enable in CI/CD

```yaml
# .github/workflows/test.yml
- name: Run MCP tests
  env:
    MCP_ENABLE_SESSION_REPORT: true
    MCP_OUTPUT_DIR: ./test-reports
  run: npm test

- name: Upload reports
  uses: actions/upload-artifact@v3
  with:
    name: session-reports
    path: test-reports/**/*.md
```

### 2. Analyze Trends

```bash
# Extract success rates from all sessions
for report in .mcp-artifacts/*/report.json; do
  jq -r '"\(.sessionId): \(.summary.successRate * 100)%"' "$report"
done
```

### 3. Alert on Failures

```typescript
// Check report after session
const report = JSON.parse(await readFile('report.json', 'utf-8'))

if (report.summary.successRate < 0.95) {
  console.error(`⚠️  Low success rate: ${report.summary.successRate * 100}%`)
  process.exit(1)
}
```

### 4. Clean Old Reports

```bash
# Keep only last 7 days of reports
find .mcp-artifacts -type d -mtime +7 -exec rm -rf {} +
```

---

## FAQ

### Q: Does report generation impact performance?

**A**: Minimal impact (< 1ms per tool call, < 200ms report generation). Reports are generated asynchronously during session cleanup.

### Q: Are sensitive data sanitized in reports?

**A**: Yes! All error messages, arguments, and results are sanitized using the same logic as F1 logging:
- File paths → `/Users/<user>/`
- API keys → `<REDACTED>`
- Stack traces → `at <path>:<line>:<col>`

### Q: Can I customize the report format?

**A**: Currently, JSON and Markdown formats are fixed. For custom formats, read the JSON report and transform it programmatically.

### Q: What happens if report generation fails?

**A**: Errors are logged but don't block session cleanup. The session will still close normally.

### Q: Can I disable reports for specific sessions?

**A**: Yes, set `enableSessionReport: false` in the session-specific config (if supported by your MCP server implementation).

---

## See Also

- [F1: Structured Logging](../architecture.F1.md)
- [F2: Failure Snapshots](../architecture.F2.md)
- [F3: Session Reports Architecture](../architecture.F3.md)
- [Charter: F3 Task Definition](../charter.F3.align.yaml)

---

**Last updated**: 2025-10-03
**Version**: 1.0.0
