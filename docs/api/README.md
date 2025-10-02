# API Reference - creatoria-miniapp-mcp

> Complete API documentation for all 59 tools across 7 categories

Enable AI assistants to orchestrate WeChat Mini Program testing through natural language. Each tool is designed for LLM consumption with clear parameters, return values, and usage examples.

---

## 📊 Tool Catalog

**Total**: 59 tools across 7 categories

| Category | Tools | Description |
|----------|-------|-------------|
| [Automator](#automator) | 4 | Connection & lifecycle management |
| [MiniProgram](#miniprogram) | 6 | App-level operations (navigation, screenshots, etc.) |
| [Page](#page) | 8 | Page-level queries and data manipulation |
| [Element](#element) | 23 | Element interactions, attributes, scrolling |
| [Assert](#assert) | 9 | Testing assertions and validation |
| [Snapshot](#snapshot) | 3 | State capture for debugging |
| [Record](#record) | 6 | Action recording and replay for regression testing |

---

## 📚 Category Details

### <a name="automator"></a>[Automator](./automator.md) - Connection & Lifecycle (4 tools)

Manage WeChat DevTools startup, connection, disconnection, and cleanup.

| Tool | Description |
|------|-------------|
| `automator_launch` | Launch WeChat DevTools and load mini program |
| `automator_connect` | Connect to running DevTools instance |
| `automator_disconnect` | Disconnect but keep DevTools running |
| `automator_close` | Close mini program and cleanup all resources |

---

### <a name="miniprogram"></a>[MiniProgram](./miniprogram.md) - App-Level Operations (6 tools)

Global mini program operations including navigation, screenshots, and script execution.

| Tool | Description |
|------|-------------|
| `miniprogram_navigate` | Navigate between pages (5 methods: navigateTo, redirectTo, etc.) |
| `miniprogram_callWx` | Call WeChat APIs (wx.*) |
| `miniprogram_evaluate` | Execute JavaScript in mini program context |
| `miniprogram_screenshot` | Take screenshot (full page or custom region) |
| `miniprogram_getPageStack` | Get current page stack information |
| `miniprogram_getSystemInfo` | Get system info (platform, version, etc.) |

---

### <a name="page"></a>[Page](./page.md) - Page-Level Operations (8 tools)

Query elements, manipulate page data, and call page methods.

| Tool | Description |
|------|-------------|
| `page_query` | Query single element (returns ElementRef) |
| `page_queryAll` | Query all matching elements |
| `page_waitFor` | Wait for element to appear/disappear |
| `page_getData` | Get page data by path |
| `page_setData` | Set page data by path |
| `page_callMethod` | Call page method |
| `page_getSize` | Get page dimensions |
| `page_getScrollTop` | Get page scroll position |

---

### <a name="element"></a>[Element](./element.md) - Element-Level Operations (23 tools)

Interact with elements, get attributes, and control scrolling.

**Tap & Input** (5 tools):
- `element_tap`, `element_longPress`, `element_doubleTap`
- `element_input`, `element_clearInput`

**Touch Events** (8 tools):
- `element_touchStart/Move/End` - Single-touch gestures
- `element_multiTouchStart/Move/End` - Multi-touch gestures
- `element_swipe`, `element_pinch` - Common gestures

**Getters** (7 tools):
- `element_getText`, `element_getValue`
- `element_getAttribute`, `element_getProperty`
- `element_getSize`, `element_getOffset`, `element_getBoundingClientRect`

**Scrolling** (3 tools):
- `element_scroll`, `element_scrollTo`, `element_scrollIntoView`

📖 **[Full Element API Documentation](./element.md)**

---

### <a name="assert"></a>[Assert](./assert.md) - Testing Assertions (9 tools)

Automated testing assertions for element validation.

| Tool | Description |
|------|-------------|
| `assert_exists` | Assert element exists |
| `assert_notExists` | Assert element does not exist |
| `assert_text` | Assert exact text match |
| `assert_notText` | Assert text does not match |
| `assert_attribute` | Assert attribute value |
| `assert_notAttribute` | Assert attribute absence/mismatch |
| `assert_data` | Assert page data value |
| `assert_displayed` | Assert element is visible (non-zero size) |
| `assert_count` | Assert element count |

---

### <a name="snapshot"></a>[Snapshot](./snapshot.md) - State Capture & Debug (3 tools)

Capture page, app, and element state for troubleshooting and debugging.

| Tool | Description |
|------|-------------|
| `snapshot_capture` | Capture current state (page data + optional screenshot) |
| `snapshot_restore` | Restore previously captured state |
| `snapshot_compare` | Compare two snapshots and report differences |

---

### <a name="record"></a>[Record](./record.md) - Recording & Replay (6 tools)

Record user actions and replay for regression testing.

| Tool | Description |
|------|-------------|
| `record_start` | Start recording user actions |
| `record_stop` | Stop recording and save sequence |
| `record_list` | List all saved action sequences |
| `record_get` | Get specific sequence details |
| `record_delete` | Delete a saved sequence |
| `record_replay` | Replay recorded sequence with optional error handling |

---

## 📖 使用指南

### 基本工作流

```javascript
// 1. 启动或连接
automator_launch({ projectPath: "/path/to/project" })

// 2. 导航
miniprogram_navigate({ method: "navigateTo", url: "/pages/index/index" })

// 3. 查询元素
const result = page_query({ selector: ".btn", save: true })

// 4. 操作元素
element_tap({ refId: result.refId })

// 5. 断言
assert_exists({ selector: ".success-message" })

// 6. 快照（可选）
snapshot_capture({ includeScreenshot: true })
```

### 元素引用（refId）

**推荐做法**: 使用 `save: true` 缓存元素引用，避免重复查询。

```javascript
// ✅ 推荐：保存引用
const result = page_query({ selector: ".btn", save: true })
element_tap({ refId: result.refId })
element_get_text({ refId: result.refId })

// ❌ 不推荐：每次都查询
page_query({ selector: ".btn" })
element_tap({ selector: ".btn" })  // 重复查询
```

---

## 📝 文档约定

**参数标记**:
- ✅ **必需参数**: 标记为 `required`
- ⭐ **可选参数**: 有默认值或可省略
- 🔧 **配置参数**: 环境变量或配置文件

**返回值**:
- 所有工具返回 `{ success: boolean, message: string, ... }`
- 错误通过抛出异常

**错误处理**:
- 参数错误：立即抛出异常
- 连接错误：提示先调用 `miniprogram_launch` 或 `miniprogram_connect`
- 断言失败：抛出 `Assertion failed: {detail}` 异常

---

## 🔗 相关文档

- [项目README](../../README.md)
- [配置指南](../setup-guide.md)
- [系统架构](../architecture.md)
- [使用示例](../../examples/README.md)
- [故障排除](../troubleshooting.md)

---

**最后更新**: 2025-10-02
