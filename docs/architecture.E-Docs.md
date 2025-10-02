# E1: Documentation Enhancement - Architecture Design

## Metadata
- **Task**: E1 - Documentation Enhancement
- **Stage**: E - Documentation & Examples
- **Status**: PLANNED
- **Created**: 2025-10-02
- **Author**: Claude Code

---

## 1. Overview

This document defines the architecture and organization of the project documentation system. The goal is to create a comprehensive, navigable, and maintainable documentation structure that serves multiple user personas (new users, integration developers, test engineers, troubleshooters, contributors).

### Key Design Principles
1. **Progressive Disclosure**: Start simple (README quickstart), go deep (API docs)
2. **Consistent Formatting**: Unified structure for all API docs and examples
3. **Cross-Referencing**: Internal links between related documentation
4. **Maintainability**: Clear update protocols, templates for new content
5. **Searchability**: Descriptive headings, keywords, categorization
6. **Bilingual Support**: Critical sections in English + Chinese for accessibility

---

## 2. Documentation Structure

```
creatoria-miniapp-mcp/
├── README.md                          # Entry point: quickstart + navigation
├── CONTRIBUTING.md                    # Enhanced: 6A workflow + development guide
├── LICENSE                            # MIT license (existing)
│
├── docs/
│   ├── architecture.md                # System architecture (NEW)
│   ├── setup-guide.md                 # Detailed environment setup (ENHANCE)
│   ├── troubleshooting.md             # FAQ + error reference + debugging (ENHANCE)
│   │
│   └── api/                           # API reference documentation
│       ├── README.md                  # Tool catalog + basic workflows (NEW)
│       ├── automator.md               # 4 tools: launch, connect, disconnect, close (NEW)
│       ├── miniprogram.md             # 6 tools: navigate, evaluate, screenshot, etc. (NEW)
│       ├── page.md                    # 8 tools: query, data, wait, scroll, etc. (NEW)
│       ├── element.md                 # 23 tools: attributes, interactions, components (NEW)
│       ├── assert.md                  # 9 tools: exists, text, attribute, data, etc. (NEW)
│       ├── snapshot.md                # 3 tools: capture, restore, compare (NEW)
│       └── record.md                  # 6 tools: start, stop, save, replay, etc. (NEW)
│
└── examples/                          # Usage scenarios and patterns
    ├── README.md                      # Example index (NEW)
    ├── 01-basic-navigation.md         # Basic: page navigation (EXISTING - enhance)
    ├── 02-element-interaction.md      # Basic: tap, input, swiper, picker (NEW)
    ├── 03-assertion-testing.md        # Advanced: automated testing workflow (NEW)
    ├── 04-snapshot-debugging.md       # Advanced: state capture and restore (NEW)
    ├── 05-record-replay.md            # Advanced: record flows, replay (NEW)
    └── (optional) 06-e2e-shopping.md  # Comprehensive: shopping cart flow (NEW)
```

**Design Rationale**:
- **Separation of Concerns**: `/docs` for reference, `/examples` for learning
- **Logical Grouping**: API docs categorized by tool level (Automator → Element)
- **Discoverability**: Each directory has README.md index
- **Version Control**: All docs in git, track changes alongside code

---

## 3. Component Specifications

### 3.1 README.md (Entry Point)

**Purpose**: 5-minute path to first successful automation command

**Target Audience**: New users, evaluators, quick reference

**Structure**:
```markdown
# WeChat Mini Program Automation MCP Server

[Badges: Tests Status, License, Version, MCP Protocol]

## What is this?

Brief value proposition (2-3 sentences):
- Expose WeChat Mini Program automation via MCP protocol
- 59 tools across 7 categories
- Seamless integration with Claude Desktop, Cline, and custom MCP clients

## Features

- 🚀 **59 Automation Tools**: Comprehensive coverage (Automator/MiniProgram/Page/Element/Assert/Snapshot/Record)
- 🎯 **ElementRef Protocol**: Reliable element resolution (refId/selector/xpath)
- 📦 **Session Management**: Isolated state per MCP session
- 🔄 **Snapshot & Replay**: Debug with state capture, automate with recording
- 🧪 **Built-in Assertions**: 9 assertion tools for testing workflows
- 🔌 **MCP Native**: First-class support for Claude Desktop and MCP ecosystem

## Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- WeChat DevTools with automation enabled
- MCP-compatible client (Claude Desktop, Cline, etc.)

### Installation

```bash
# Step 1: Clone and install
git clone git@github.com:rn1024/creatoria-miniapp-mcp.git
cd creatoria-miniapp-mcp
pnpm install

# Step 2: Build
pnpm build

# Step 3: Configure MCP client (e.g., Claude Desktop)
# Edit ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "wechat-automation": {
      "command": "node",
      "args": ["/absolute/path/to/creatoria-miniapp-mcp/dist/cli.js"]
    }
  }
}
```

### First Automation

```javascript
// 1. Launch WeChat DevTools
await automator_launch({
  projectPath: "/path/to/mini-program"
});

// 2. Navigate to a page
await miniprogram_navigateTo({
  url: "/pages/index/index"
});

// 3. Query and interact with element
const result = await element_tap({
  elementRef: { selector: ".btn-submit" }
});
```

## Documentation

- 📚 [Complete API Reference](docs/api/README.md) - All 59 tools documented
- 💡 [Usage Examples](examples/README.md) - 5+ real-world scenarios
- ⚙️ [Setup Guide](docs/setup-guide.md) - Detailed environment configuration
- 🔧 [Troubleshooting](docs/troubleshooting.md) - Common issues and debugging
- 🏗️ [System Architecture](docs/architecture.md) - Design decisions and structure
- 🤝 [Contributing Guide](CONTRIBUTING.md) - 6A workflow and development standards

## Usage Examples

### Navigate and Interact
```javascript
// Launch and navigate
await automator_launch({ projectPath: "/path/to/project" });
await miniprogram_navigateTo({ url: "/pages/list/list" });

// Query and tap element
await element_tap({
  elementRef: { selector: ".item-card", index: 0 }
});
```

### Run Assertions
```javascript
// Assert element exists
await assert_elementExists({
  elementRef: { selector: ".success-message" }
});

// Assert text content
await assert_elementText({
  elementRef: { selector: ".title" },
  expected: "Product Name"
});
```

### Capture Snapshots
```javascript
// Capture state before action
const before = await snapshot_capture({
  snapshotId: "before-submit"
});

// Perform action
await element_tap({ elementRef: { selector: ".btn-submit" } });

// Compare state changes
await snapshot_compare({
  snapshotId1: "before-submit",
  snapshotId2: "after-submit"
});
```

## Tool Categories (59 Total)

### Automator (4 tools)
Launch, connect, disconnect, close automation sessions

### MiniProgram (6 tools)
Navigate, evaluate, screenshot, mock, app-level operations

### Page (8 tools)
Query elements, manipulate data, wait for conditions, scroll

### Element (23 tools)
Get attributes, interact (tap/input/swipe), component-specific methods

### Assert (9 tools)
Validate existence, text, attributes, data, visibility

### Snapshot (3 tools)
Capture, restore, compare application state

### Record (6 tools)
Record user flows, save, replay, manage recordings

## Project Structure

```
src/
  ├── tools/          # 59 MCP tool implementations
  ├── core/           # SessionStore, ElementRef, OutputManager
  ├── config/         # Configuration resolution
  ├── server.ts       # MCP Server with stdio transport
  └── cli.ts          # CLI entry point

tests/
  └── unit/           # 290+ tests validating all tools

docs/
  ├── api/            # Complete API reference
  └── architecture.md # System design

examples/
  └── *.md            # Usage scenarios
```

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:
- 6A Workflow (Align → Architect → Atomize → Approve → Automate → Assess)
- Development environment setup
- Code standards and testing conventions
- How to add new tools
- Pull request process

## License

MIT License - see [LICENSE](LICENSE) for details

## Links

- **GitHub**: [rn1024/creatoria-miniapp-mcp](https://github.com/rn1024/creatoria-miniapp-mcp)
- **MCP Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- **WeChat DevTools**: [developers.weixin.qq.com](https://developers.weixin.qq.com/miniprogram/dev/devtools/)
```

**Update Protocol**:
- Update "Features" when tool categories added
- Update quickstart if MCP configuration changes
- Keep inline examples synchronized with examples/ directory
- Review quarterly for accuracy

---

### 3.2 API Documentation (docs/api/)

#### 3.2.1 docs/api/README.md (Tool Catalog)

**Purpose**: Comprehensive index of all 59 tools with navigation and basic workflows

**Structure**:
```markdown
# API Reference

## Overview

This MCP server provides **59 tools** across **7 categories** for WeChat Mini Program automation.

## Tool Categories

### Automator Level (4 tools)
Session lifecycle management for WeChat DevTools automation.

| Tool | Description |
|------|-------------|
| [automator_launch](automator.md#automator_launch) | Launch WeChat DevTools with a Mini Program project |
| [automator_connect](automator.md#automator_connect) | Connect to an already-running DevTools instance |
| [automator_disconnect](automator.md#automator_disconnect) | Disconnect from the current instance |
| [automator_close](automator.md#automator_close) | Close the DevTools instance |

### MiniProgram Level (6 tools)
Application-wide operations (navigation, evaluation, screenshots).

| Tool | Description |
|------|-------------|
| [miniprogram_navigateTo](miniprogram.md#miniprogram_navigateto) | Navigate to a new page |
| [miniprogram_navigateBack](miniprogram.md#miniprogram_navigateback) | Go back to previous page |
| [miniprogram_redirectTo](miniprogram.md#miniprogram_redirectto) | Redirect to page (replace current) |
| [miniprogram_evaluate](miniprogram.md#miniprogram_evaluate) | Execute JavaScript in Mini Program context |
| [miniprogram_screenshot](miniprogram.md#miniprogram_screenshot) | Capture screenshot of entire app |
| [miniprogram_currentPage](miniprogram.md#miniprogram_currentpage) | Get current page information |

### Page Level (8 tools)
Current page operations (query, data, wait, scroll).

| Tool | Description |
|------|-------------|
| [page_querySelector](page.md#page_queryselector) | Query single element by selector |
| [page_querySelectorAll](page.md#page_queryselectorall) | Query multiple elements by selector |
| [page_data](page.md#page_data) | Get or set page data |
| [page_setData](page.md#page_setdata) | Update page data |
| [page_waitFor](page.md#page_waitfor) | Wait for condition (selector, timeout, custom) |
| [page_scrollTo](page.md#page_scrollto) | Scroll to position |
| [page_callMethod](page.md#page_callmethod) | Call page instance method |
| [page_size](page.md#page_size) | Get page dimensions |

### Element Level (23 tools)
Element-specific interactions and attribute access.

**General Attributes (8 tools)**:
- [element_attribute](element.md#element_attribute), [element_boundingClientRect](element.md#element_boundingclientrect)
- [element_text](element.md#element_text), [element_value](element.md#element_value)
- [element_property](element.md#element_property), [element_style](element.md#element_style)
- [element_wxml](element.md#element_wxml), [element_outerWxml](element.md#element_outerwxml)

**Interactions (3 tools)**:
- [element_tap](element.md#element_tap), [element_longpress](element.md#element_longpress)
- [element_touchstart_touchend](element.md#element_touchstart_touchend)

**Input (1 tool)**:
- [element_input](element.md#element_input)

**Component-Specific Methods (11 tools)**:
- Swiper: [element_swipeTo](element.md#element_swipeto)
- Scroll View: [element_scrollIntoView](element.md#element_scrollintoview), [element_scrollTo_element](element.md#element_scrollto_element)
- Movable View: [element_moveTo](element.md#element_moveto)
- Picker: [element_callMethod](element.md#element_callmethod), [element_setPickerValue](element.md#element_setpickervalue)
- Video: [element_play](element.md#element_play), [element_pause](element.md#element_pause), [element_seek](element.md#element_seek)
- Textarea/Input: [element_trigger](element.md#element_trigger), [element_callMethod](element.md#element_callmethod)

### Assert Tools (9 tools)
Testing and validation assertions.

| Tool | Description |
|------|-------------|
| [assert_elementExists](assert.md#assert_elementexists) | Assert element exists in DOM |
| [assert_elementNotExists](assert.md#assert_elementnotexists) | Assert element does not exist |
| [assert_elementText](assert.md#assert_elementtext) | Assert element text content |
| [assert_elementAttribute](assert.md#assert_elementattribute) | Assert element attribute value |
| [assert_elementData](assert.md#assert_elementdata) | Assert page data value |
| [assert_elementVisible](assert.md#assert_elementvisible) | Assert element is visible |
| [assert_elementEnabled](assert.md#assert_elementenabled) | Assert element is enabled |
| [assert_pageUrl](assert.md#assert_pageurl) | Assert current page URL |
| [assert_screenshot](assert.md#assert_screenshot) | Visual regression testing |

### Snapshot Tools (3 tools)
State management for debugging and testing.

| Tool | Description |
|------|-------------|
| [snapshot_capture](snapshot.md#snapshot_capture) | Capture current page state |
| [snapshot_restore](snapshot.md#snapshot_restore) | Restore previously captured state |
| [snapshot_compare](snapshot.md#snapshot_compare) | Compare two snapshots |

### Record Tools (6 tools)
Record and replay user flows for automation.

| Tool | Description |
|------|-------------|
| [record_start](record.md#record_start) | Start recording user actions |
| [record_stop](record.md#record_stop) | Stop current recording |
| [record_save](record.md#record_save) | Save recording to file |
| [record_replay](record.md#record_replay) | Replay saved recording |
| [record_list](record.md#record_list) | List all saved recordings |
| [record_delete](record.md#record_delete) | Delete saved recording |

## Common Workflows

### Basic Navigation Flow
```javascript
// Launch → Navigate → Query → Interact → Screenshot
await automator_launch({ projectPath: "/path/to/project" });
await miniprogram_navigateTo({ url: "/pages/index/index" });
const element = await page_querySelector({ selector: ".btn" });
await element_tap({ elementRef: { refId: element.data.refId } });
await miniprogram_screenshot({ path: "./result.png" });
await automator_close();
```

### Testing Flow
```javascript
// Launch → Navigate → Assert → Close
await automator_launch({ projectPath: "/path/to/project" });
await miniprogram_navigateTo({ url: "/pages/detail/detail" });
await assert_elementExists({ elementRef: { selector: ".title" } });
await assert_elementText({
  elementRef: { selector: ".title" },
  expected: "Product Details"
});
await automator_close();
```

### Debugging Flow
```javascript
// Snapshot → Action → Compare
await snapshot_capture({ snapshotId: "before" });
await miniprogram_navigateTo({ url: "/pages/form/form" });
await element_tap({ elementRef: { selector: ".submit" } });
await snapshot_capture({ snapshotId: "after" });
const diff = await snapshot_compare({
  snapshotId1: "before",
  snapshotId2: "after"
});
```

### Record/Replay Flow
```javascript
// Record → Save → Replay
await record_start({ recordId: "checkout-flow" });
// ... perform actions manually in DevTools or via tools
await record_stop();
await record_save({ recordId: "checkout-flow", path: "./recordings/checkout.json" });

// Later: replay
await record_replay({ recordId: "checkout-flow" });
```

## ElementRef Protocol

All element-related tools accept an `elementRef` parameter for element resolution:

```typescript
type ElementRef = {
  refId?: string;      // Cached element handle (from previous save)
  selector?: string;   // CSS/WXML selector
  xpath?: string;      // XPath selector
  index?: number;      // Index for multi-element results (0-based)
  pagePath?: string;   // Target page path (optional)
  save?: boolean;      // Save handle for future reference
};
```

**Resolution Priority**: `refId` → `selector` → `xpath`

**Cache Invalidation**: Element handles (`refId`) are automatically invalidated on page navigation.

**Example**:
```javascript
// Method 1: Use selector (resolved every time)
await element_tap({ elementRef: { selector: ".btn-submit" } });

// Method 2: Save handle for reuse
const result = await element_tap({
  elementRef: { selector: ".btn-submit", save: true }
});
const refId = result.data.refId;

// Reuse handle (faster, no re-query)
await element_attribute({ elementRef: { refId }, name: "class" });

// Method 3: Query specific index
await element_tap({ elementRef: { selector: ".item", index: 2 } });

// Method 4: Use XPath
await element_tap({ elementRef: { xpath: "//button[@class='submit']" } });
```

## See Also

- [Setup Guide](../setup-guide.md) - Environment configuration
- [Examples](../../examples/) - Usage scenarios
- [Troubleshooting](../troubleshooting.md) - Common issues and debugging
- [System Architecture](../architecture.md) - Design decisions
```

#### 3.2.2 Tool Documentation Template

**File**: `docs/api/{category}.md` (e.g., `automator.md`, `element.md`)

**Per-Tool Format**:
```markdown
## tool_name

**Category**: Automator | MiniProgram | Page | Element | Assert | Snapshot | Record

**Description**:
Brief 1-2 sentence description of what the tool does and when to use it.

**Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| param1 | string | Yes | - | Parameter description with purpose and constraints |
| param2 | number | No | 5000 | Optional parameter description |
| elementRef | ElementRef | Yes | - | Element reference (see [ElementRef Protocol](#elementref-protocol)) |

**Return Value**:

```typescript
{
  success: boolean;        // Operation success status
  message: string;         // Human-readable result message
  data?: {                 // Tool-specific data (if success = true)
    refId?: string;        // Element handle (if save = true)
    value?: any;           // Tool-specific return value
    // ... other fields
  };
  error?: {                // Error details (if success = false)
    code: string;          // Error code (e.g., ERR_ELEMENT_NOT_FOUND)
    details: string;       // Detailed error message
  };
}
```

**Example**:

```javascript
// Example 1: Basic usage
const result = await tool_name({
  param1: "value",
  param2: 3000,
  elementRef: {
    selector: ".my-element",
    save: true
  }
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}

// Example 2: Error handling
try {
  await tool_name({ param1: "invalid" });
} catch (err) {
  console.error("Tool failed:", err.message);
}
```

**Usage Notes**:
- ⚠️ Important behavior, performance, or edge case notes
- 💡 Tips for optimal usage
- 🔗 Dependencies on other tools or session state requirements

**Common Errors**:

| Error Code | Cause | Solution |
|------------|-------|----------|
| ERR_NOT_LAUNCHED | MiniProgram not launched | Call `automator_launch` first |
| ERR_ELEMENT_NOT_FOUND | Element does not exist | Check selector, ensure page is loaded |
| ERR_TIMEOUT | Operation timeout | Increase timeout parameter, check element state |

**See Also**:
- [Related Tool 1](#{category}.md#related_tool_1)
- [Example: Scenario Name](../../examples/XX-scenario.md)
```

**Tool Count by Category**:
- `automator.md`: 4 tools
- `miniprogram.md`: 6 tools
- `page.md`: 8 tools
- `element.md`: 23 tools
- `assert.md`: 9 tools
- `snapshot.md`: 3 tools
- `record.md`: 6 tools
- **Total**: 59 tools

---

### 3.3 Usage Examples (examples/)

#### Example File Structure

**File**: `examples/XX-scenario-name.md`

**Template**:
```markdown
# Example: [Scenario Name]

> **Difficulty**: 🟢 Basic | 🟡 Intermediate | 🔴 Advanced

## Scenario Description

[1-2 paragraphs describing the use case, user goal, and expected outcome]

## Prerequisites

- [ ] WeChat DevTools installed and configured
- [ ] MCP server built (`pnpm build`)
- [ ] MCP client configured (Claude Desktop/Cline)
- [ ] Mini Program project at `/path/to/project`
- [ ] Specific page `/pages/[page-name]` exists in the project

## Tools Used

| Tool | Purpose |
|------|---------|
| `tool_1` | Description of usage in this scenario |
| `tool_2` | Description of usage in this scenario |

## Complete Code

```javascript
// Full runnable code combining all steps
async function runScenario() {
  // Step 1: Launch and navigate
  await automator_launch({ projectPath: "/path/to/project" });
  await miniprogram_navigateTo({ url: "/pages/target/target" });

  // Step 2: Interact with elements
  await element_tap({ elementRef: { selector: ".btn" } });

  // Step 3: Verify results
  await assert_elementExists({ elementRef: { selector: ".result" } });

  // Step 4: Cleanup
  await automator_close();
}

runScenario();
```

## Step-by-Step Walkthrough

### Step 1: [Action Name]

**Goal**: [What this step achieves]

**Code**:
```javascript
// [Code explanation]
const result = await tool_name({
  // parameters with inline comments
});
```

**Expected Result**:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Explanation**:
[Why this step is necessary, what it does, any important details]

---

### Step 2: [Action Name]

[Same structure as Step 1]

---

[Continue for all steps...]

## Expected Output

```
[Console output or screenshot description showing final result]
```

## Troubleshooting

### Issue: [Common Problem 1]
**Symptom**: [What user sees]
**Cause**: [Why it happens]
**Solution**: [How to fix]

### Issue: [Common Problem 2]
[Same structure]

## Variations

- **Variation 1**: [How to adapt this example for a different scenario]
- **Variation 2**: [Alternative approach or tool usage]

## See Also

- [API Documentation: tool_name](../docs/api/[category].md#tool_name)
- [Related Example: XX-other-example.md](XX-other-example.md)
- [Troubleshooting Guide](../docs/troubleshooting.md#specific-topic)
```

#### Planned Examples

1. **01-basic-navigation.md** (Existing - Review/Enhance)
   **Difficulty**: 🟢 Basic
   **Topics**: Launch, navigate between pages, query elements, basic interactions

2. **02-element-interaction.md** (New)
   **Difficulty**: 🟢 Basic
   **Topics**: Tap buttons, input text, swipe swiper, scroll views, select picker options

3. **03-assertion-testing.md** (New)
   **Difficulty**: 🟡 Intermediate
   **Topics**: Launch → navigate → assert existence → assert text → assert attributes → cleanup

4. **04-snapshot-debugging.md** (New)
   **Difficulty**: 🟡 Intermediate
   **Topics**: Capture initial state → perform actions → capture new state → compare snapshots → restore state

5. **05-record-replay.md** (New)
   **Difficulty**: 🔴 Advanced
   **Topics**: Start recording → perform multi-step flow → stop/save → list recordings → replay → delete

6. **06-e2e-shopping.md** (Optional)
   **Difficulty**: 🔴 Advanced
   **Topics**: Browse products → filter → add to cart → update quantity → checkout → validate → assert success

---

### 3.4 Troubleshooting Guide (docs/troubleshooting.md)

**Purpose**: Error resolution, debugging workflows, best practices

**Target Audience**: All users encountering issues

**Enhanced Structure** (from existing basic structure):
```markdown
# Troubleshooting Guide

## Table of Contents
1. [Frequently Asked Questions](#faq)
2. [Error Reference](#error-reference)
3. [Debugging Workflows](#debugging-workflows)
4. [Best Practices](#best-practices)
5. [Common Pitfalls](#common-pitfalls)

---

## FAQ

### Q1: How do I enable automation in WeChat DevTools?
**A**: Go to DevTools → Settings → Security → Enable "Service Port" and check "Allow CLI/HTTP calls to service port". Default port is 9420.

### Q2: Why does `automator_launch` fail with "Command not found"?
**A**: The WeChat CLI path is incorrect. On macOS, verify `/Applications/wechatwebdevtools.app/Contents/MacOS/cli` exists. See [Setup Guide](setup-guide.md#wechat-devtools-configuration).

### Q3: What's the difference between `refId`, `selector`, and `xpath`?
**A**:
- `refId`: Cached element handle (fastest, but invalidated on page change)
- `selector`: CSS/WXML selector (re-queries every time)
- `xpath`: XPath selector (most flexible, slowest)
See [ElementRef Protocol](api/README.md#elementref-protocol).

### Q4: Can I use this MCP server with clients other than Claude Desktop?
**A**: Yes! Any MCP-compatible client works (Cline, custom clients via `@modelcontextprotocol/sdk`). See [Setup Guide](setup-guide.md#mcp-client-configuration).

### Q5: How do I debug "Element not found" errors?
**A**: Follow the [Element Not Found Debugging Workflow](#workflow-1-element-not-found).

[... 5-10 more FAQs covering common user questions]

---

## Error Reference

### Automator Errors

#### ERR_LAUNCH_FAILED
**Cause**: WeChat DevTools failed to start or automation port unavailable

**Common Reasons**:
- WeChat DevTools not installed
- Automation port already in use (default 9420)
- Project path does not exist or invalid `project.config.json`
- Insufficient permissions (macOS/Linux)

**Solutions**:
1. Verify DevTools installation:
   ```bash
   ls /Applications/wechatwebdevtools.app
   ```

2. Check port availability:
   ```bash
   lsof -i :9420
   # Kill process if occupied
   kill -9 <PID>
   ```

3. Verify project path and `project.config.json`:
   ```bash
   ls /path/to/project/project.config.json
   ```

4. Kill existing DevTools processes:
   ```bash
   pkill -f wechatwebdevtools
   ```

**Example Error**:
```json
{
  "success": false,
  "error": {
    "code": "ERR_LAUNCH_FAILED",
    "details": "Port 9420 already in use"
  }
}
```

---

#### ERR_CONNECT_TIMEOUT
**Cause**: Connection to automation port timed out

**Solutions**:
- Ensure DevTools is running
- Verify automation port is enabled (Settings → Security)
- Check firewall settings
- Increase timeout in `.mcp.json` (default: 30000ms)

---

### MiniProgram Errors

#### ERR_NAVIGATION_FAILED
**Cause**: Page navigation failed

**Common Reasons**:
- Invalid page path (page doesn't exist in `app.json`)
- Page not registered in `pages` array
- Network issues (for web-view pages)

**Solutions**:
- Verify page path in `app.json`
- Use absolute path starting with `/pages/...`
- Check DevTools console for navigation errors

---

### Page Errors

#### ERR_ELEMENT_NOT_FOUND
**Cause**: Element query returned no results

**Common Reasons**:
- Selector syntax incorrect
- Element not yet rendered (timing issue)
- Element on different page
- Dynamic content not loaded

**Solutions**:
- Use `page_waitFor` before querying
- Verify selector in DevTools WXML inspector
- Try alternative selectors (class → id → xpath)
- Check if on correct page (`miniprogram_currentPage`)

---

### Element Errors

#### ERR_ELEMENT_INVALID
**Cause**: Element reference (`refId`) is invalid or stale

**Common Reasons**:
- Page navigation invalidated cached element
- Element removed from DOM
- Session expired

**Solutions**:
- Re-query element after page navigation
- Use `selector` instead of `refId` for stability
- Check element existence before interaction

---

#### ERR_INTERACTION_FAILED
**Cause**: Element interaction failed

**Common Reasons**:
- Element not interactable (disabled, hidden, covered)
- Element type doesn't support interaction (e.g., `tap` on `<text>`)
- Timing issue (animation in progress)

**Solutions**:
- Wait for element to be visible/enabled
- Use `element_attribute` to check `disabled` state
- Add delay before interaction

---

[... 15+ more error codes across all categories]

---

## Debugging Workflows

### Workflow 1: Element Not Found

**Symptom**: `page_querySelector` or `element_tap` returns `ERR_ELEMENT_NOT_FOUND`

**Step-by-Step Diagnosis**:

1. **Verify Page Load**
   ```javascript
   const pageInfo = await miniprogram_currentPage();
   console.log("Current page:", pageInfo.data.path);
   ```

2. **Inspect WXML Structure**
   - Open DevTools UI manually
   - Use "WXML Panel" to inspect actual element structure
   - Verify selector matches rendered markup

3. **Try Alternative Selectors**
   ```javascript
   // CSS class
   await page_querySelector({ selector: ".btn-submit" });

   // ID
   await page_querySelector({ selector: "#submit-btn" });

   // XPath
   await page_querySelector({ xpath: "//button[@class='btn-submit']" });

   // Tag + attribute
   await page_querySelector({ selector: "button[type='primary']" });
   ```

4. **Add Wait Condition**
   ```javascript
   // Wait for element to appear
   await page_waitFor({
     condition: "element",
     selector: ".btn-submit",
     timeout: 5000
   });

   // Then query
   const result = await page_querySelector({ selector: ".btn-submit" });
   ```

5. **Check Page Data**
   ```javascript
   // Verify page is in expected state
   const data = await page_data({ path: "" });
   console.log("Page data:", data);
   ```

**Expected Outcome**: Element query succeeds or root cause identified

---

### Workflow 2: Session State Issues

**Symptom**: Tools fail with "Session not initialized" or "MiniProgram not launched"

**Diagnosis**:
1. Check if `automator_launch` was called
2. Verify session hasn't expired
3. Check if client reconnected to MCP server

**Solution**:
```javascript
// Always start with launch
await automator_launch({ projectPath: "/path/to/project" });

// Perform operations
// ...

// Clean up
await automator_close();
```

---

### Workflow 3: Performance Degradation

**Symptom**: Tools becoming slower over time

**Diagnosis**:
1. Check element cache size (large caches slow down lookups)
2. Verify no memory leaks in DevTools
3. Check if too many snapshots/recordings stored

**Solution**:
- Clear element cache periodically (happens automatically on page navigation)
- Delete old snapshots/recordings
- Restart DevTools if memory usage high

---

## Best Practices

### Performance Optimization

1. **Reuse Element Handles**
   ```javascript
   // ❌ Bad: Query element multiple times
   await element_tap({ elementRef: { selector: ".btn" } });
   await element_attribute({ elementRef: { selector: ".btn" }, name: "class" });

   // ✅ Good: Save handle on first query
   const tap = await element_tap({
     elementRef: { selector: ".btn", save: true }
   });
   const refId = tap.data.refId;
   await element_attribute({ elementRef: { refId }, name: "class" });
   ```

2. **Batch Operations When Possible**
   ```javascript
   // Use page_data to get multiple values at once
   const data = await page_data({ path: "" });
   console.log(data.username, data.email, data.age);
   ```

3. **Use Appropriate Timeouts**
   - Short timeout (1-2s) for fast operations
   - Medium timeout (5s) for animations
   - Long timeout (10s+) for network requests

### Reliability Best Practices

1. **Wait for Page Transitions**
   ```javascript
   await miniprogram_navigateTo({ url: "/pages/detail/detail" });
   await page_waitFor({ condition: "idle", timeout: 3000 });
   ```

2. **Handle Errors Gracefully**
   ```javascript
   try {
     await element_tap({ elementRef: { selector: ".btn" } });
   } catch (err) {
     console.error("Tap failed, trying alternative:", err);
     await element_tap({ elementRef: { xpath: "//button" } });
   }
   ```

3. **Clean Up Sessions**
   ```javascript
   try {
     // Your automation code
   } finally {
     await automator_close(); // Always close
   }
   ```

### Maintainability Best Practices

1. **Use Snapshots for Complex State**
   ```javascript
   await snapshot_capture({ snapshotId: "clean-state" });
   // ... perform test
   await snapshot_restore({ snapshotId: "clean-state" }); // Reset for next test
   ```

2. **Record Flows for Regression Testing**
   ```javascript
   await record_start({ recordId: "checkout" });
   // ... manual or automated actions
   await record_save({ recordId: "checkout", path: "./regressions/checkout.json" });
   ```

3. **Document Custom Selectors**
   ```javascript
   // Good: Document why selector is complex
   // This selector targets the 3rd item card in the product list
   const selector = ".product-list .item-card:nth-child(3)";
   ```

---

## Common Pitfalls

### Pitfall 1: Stale Element References
**Problem**: Element `refId` becomes invalid after page navigation

**Why**: ElementRef cache is cleared on page transitions for memory management

**Solution**: Re-query elements after navigation, or use `selector` instead of `refId`

```javascript
// ❌ Bad
const tap = await element_tap({
  elementRef: { selector: ".btn", save: true }
});
const refId = tap.data.refId;

await miniprogram_navigateTo({ url: "/pages/other/other" });
await element_tap({ elementRef: { refId } }); // FAILS: refId invalid

// ✅ Good
await miniprogram_navigateTo({ url: "/pages/other/other" });
await element_tap({ elementRef: { selector: ".btn" } }); // Re-queries
```

---

### Pitfall 2: Incorrect Selector Syntax
**Problem**: WXML selector differs from web CSS

**Why**: WeChat uses custom components (`<view>`, `<button>`, `<picker>`)

**Solution**: Use DevTools WXML inspector to verify actual element structure

```javascript
// ❌ Bad (web CSS)
await page_querySelector({ selector: "div.container" });

// ✅ Good (WXML)
await page_querySelector({ selector: "view.container" });
```

---

### Pitfall 3: Timing Issues
**Problem**: Interaction fails because element not ready

**Why**: Async data loading, animations, network requests

**Solution**: Use `page_waitFor` with appropriate conditions

```javascript
// ❌ Bad
await miniprogram_navigateTo({ url: "/pages/list/list" });
await element_tap({ elementRef: { selector: ".item" } }); // May fail

// ✅ Good
await miniprogram_navigateTo({ url: "/pages/list/list" });
await page_waitFor({ condition: "idle", timeout: 3000 });
await element_tap({ elementRef: { selector: ".item" } });
```

---

[... 2-5 more common pitfalls]

---

## Getting Help

If you can't resolve your issue:
1. Check [Usage Examples](../examples/) for similar scenarios
2. Review [API Documentation](api/README.md) for tool details
3. Search [GitHub Issues](https://github.com/rn1024/creatoria-miniapp-mcp/issues)
4. Open a new issue with:
   - Minimal reproduction case
   - Error messages
   - Environment details (OS, Node version, WeChat DevTools version)
```

---

### 3.5 Setup Guide (docs/setup-guide.md)

**Enhancements to Existing File**:
- Add detailed WeChat DevTools configuration steps
- Expand MCP client configuration examples (Claude Desktop, Cline, custom)
- Add verification steps with expected output
- Document all `.mcp.json` configuration options
- Add troubleshooting for common setup issues

---

### 3.6 Architecture Document (docs/architecture.md)

**Purpose**: System design overview, component relationships, design decisions

**Structure** (see existing Chinese version for inspiration, enhance with):
- C4 diagrams (Context, Container, Component)
- Sequence diagrams for key flows (launch → navigate → interact)
- Design decisions (ADRs): SessionStore, ElementRef protocol, OutputManager
- Extension points (adding new tools, custom capabilities)

---

### 3.7 Contributing Guide (CONTRIBUTING.md)

**Enhancements to Existing File**:
- Add detailed 6A workflow explanation with examples
- Add tool development guide (step-by-step: create tool → register → test → document)
- Add commit message conventions with examples
- Add PR checklist template
- Add testing requirements and how to run tests

---

## 4. Technical Design Decisions

### 4.1 Documentation Format
**Decision**: Markdown
**Rationale**: Git-friendly, GitHub-native rendering, lightweight, convertible to HTML/PDF

### 4.2 API Documentation Organization
**Decision**: Separate file per category
**Rationale**: Manageable file sizes (200-500 lines), easier maintenance, clear navigation

### 4.3 Example Code Style
**Decision**: JavaScript + Comments (not TypeScript)
**Rationale**: Lower barrier to entry, focus on functionality not types (types in API docs)

### 4.4 Documentation Versioning
**Decision**: Docs tracked with code in git (no separate versioning)
**Rationale**: Simplicity, ensures doc-code synchronization, git tags serve as doc versions

### 4.5 Diagram Tool
**Decision**: Mermaid (Markdown-embedded)
**Rationale**: GitHub-native support, code-as-diagram (version control friendly), sufficient for needs

---

## 5. Documentation Plan

### 5.1 Writing Order (Priority)

**Phase 1: Core Docs** (2 hours)
1. README.md (quickstart, core entry point)
2. docs/architecture.md (system overview)
3. docs/api/README.md (tool catalog)

**Phase 2: API Reference** (3 hours)
1. docs/api/automator.md (foundation)
2. docs/api/miniprogram.md (common)
3. docs/api/page.md (common)
4. docs/api/element.md (most tools)
5. docs/api/assert.md (testing)
6. docs/api/snapshot.md (debugging)
7. docs/api/record.md (automation)

**Phase 3: Examples** (2 hours)
1. examples/01-basic-navigation.md (review/enhance)
2. examples/02-element-interaction.md
3. examples/03-assertion-testing.md
4. examples/04-snapshot-debugging.md
5. examples/05-record-replay.md
6. examples/README.md (index)

**Phase 4: Support Docs** (1.5 hours)
1. docs/troubleshooting.md (FAQ, errors, debugging)
2. docs/setup-guide.md (enhance existing)
3. CONTRIBUTING.md (enhance existing)

### 5.2 Content Sources

- **API Docs**: `src/tools/index.ts` (schemas), `src/tools/*.ts` (implementations), `tests/unit/*.test.ts` (examples)
- **Architecture**: `src/` directory structure, design docs in `docs/charter.*.yaml`, session logs
- **Examples**: `tests/unit/*.test.ts`, common usage patterns

### 5.3 Quality Checklist

**Content**:
- [ ] Technically accurate (matches code)
- [ ] Clear expression
- [ ] Complete (no gaps)
- [ ] Practical (actionable)

**Format**:
- [ ] Valid Markdown syntax
- [ ] Consistent heading levels (H1 → H2 → H3)
- [ ] Code blocks with language tags
- [ ] Tables aligned
- [ ] Links valid

**Consistency**:
- [ ] Terminology unified
- [ ] Formatting unified
- [ ] Style unified

---

## 6. Design Outputs

### 6.1 Deliverables

**Documentation Files** (15+ total):
- [ ] README.md (enhanced)
- [ ] CONTRIBUTING.md (enhanced)
- [ ] docs/architecture.md (new)
- [ ] docs/troubleshooting.md (enhanced)
- [ ] docs/setup-guide.md (enhanced)
- [ ] docs/api/README.md (new)
- [ ] docs/api/automator.md (new)
- [ ] docs/api/miniprogram.md (new)
- [ ] docs/api/page.md (new)
- [ ] docs/api/element.md (new)
- [ ] docs/api/assert.md (new)
- [ ] docs/api/snapshot.md (new)
- [ ] docs/api/record.md (new)
- [ ] examples/README.md (new)
- [ ] examples/01-basic-navigation.md (enhance)
- [ ] examples/02-element-interaction.md (new)
- [ ] examples/03-assertion-testing.md (new)
- [ ] examples/04-snapshot-debugging.md (new)
- [ ] examples/05-record-replay.md (new)

**Templates** (reusable):
- API documentation template (Section 3.2.2)
- Example documentation template (Section 3.3)

### 6.2 Effort Estimate

| Document Type | Count | Est. Words | Est. Time |
|--------------|-------|------------|-----------|
| README.md | 1 | 2000 | 30 min |
| architecture.md | 1 | 3000 | 45 min |
| API docs | 7 files | 500-2000/file | 3 hours |
| Examples | 5 files | 400-800/file | 2 hours |
| troubleshooting.md | 1 | 2000 | 1 hour |
| setup-guide.md | 1 (enhance) | +500 | 30 min |
| CONTRIBUTING.md | 1 (enhance) | +1000 | 30 min |
| Indexes | 2 | 300/file | 15 min |
| **Total** | **19** | **~15000** | **8-9 hours** |

---

## 7. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Docs out of sync with code | Medium | High | Manual protocol in CONTRIBUTING.md, PR checklist |
| Examples non-runnable | Medium | High | Extract from test files, manual verification |
| Work underestimated | Medium | Medium | Focus core content, avoid over-polishing |
| Broken links | Low | Medium | Relative paths, pre-commit validation |

---

## 8. Next Steps

### 8.1 Architect Stage Complete
- [x] Documentation structure designed
- [x] Component specifications defined
- [x] Templates created
- [x] Technical decisions documented
- [x] Effort estimated

### 8.2 Proceed to Atomize
Create `docs/tasks.E1.atomize.md` with granular tasks:
- E1-1: README + Setup Guide + Architecture (Phase 1)
- E1-2: API Documentation - Automator/MiniProgram/Page (Phase 2a)
- E1-3: API Documentation - Element/Assert/Snapshot/Record (Phase 2b)
- E1-4: Examples - Navigation/Interaction/Testing (Phase 3a)
- E1-5: Examples - Snapshot/Record + Indexes (Phase 3b)
- E1-6: Troubleshooting + CONTRIBUTING (Phase 4)
- E1-7: Review and cross-reference validation

Each task: <2 hours, clear inputs/outputs, DoD

---

**Status**: ✅ COMPLETED
**Author**: Claude Code
**Date**: 2025-10-02
**Next**: Await approval, then proceed to Atomize stage
