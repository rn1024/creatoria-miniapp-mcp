# API Reference - creatoria-miniapp-mcp

> Complete API documentation for all 65 tools across 8 categories

Enable AI assistants to orchestrate WeChat Mini Program testing through natural language. Each tool is designed for LLM consumption with clear parameters, return values, and usage examples.

---

## 📊 Tool Catalog

**Total**: 65 tools across 8 categories

| Category | Tools | Description |
|----------|-------|-------------|
| [Automator](#automator) | 4 | Connection & lifecycle management |
| [MiniProgram](#miniprogram) | 16 | App-level operations (navigation, screenshots, wx.* APIs) |
| [Page](#page) | 8 | Page-level queries and data manipulation |
| [Element](#element) | 23 | Element interactions, attributes, scrolling |
| [Assert](#assert) | 9 | Testing assertions and validation |
| [Snapshot](#snapshot) | 3 | State capture for debugging |
| [Record](#record) | 6 | Action recording and replay for regression testing |
| [Network](#network) | 6 | Network mocking and wx.* API testing |

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
| `miniprogram_call_wx` | Call WeChat APIs (wx.*) |
| `miniprogram_evaluate` | Execute JavaScript in mini program context |
| `miniprogram_screenshot` | Take screenshot (full page or custom region) |
| `miniprogram_current_page` | Get current page information |
| `miniprogram_get_system_info` | Get system info (platform, version, etc.) |

---

### <a name="page"></a>[Page](./page.md) - Page-Level Operations (8 tools)

Query elements, manipulate page data, and call page methods.

| Tool | Description |
|------|-------------|
| `page_query` | Query single element (returns ElementRef) |
| `page_query_all` | Query all matching elements |
| `page_wait_for` | Wait for element to appear/disappear |
| `page_get_data` | Get page data by path |
| `page_set_data` | Set page data by path |
| `page_call_method` | Call page method |
| `page_get_size` | Get page dimensions |
| `page_get_scroll_top` | Get page scroll position |

---

### <a name="element"></a>[Element](./element.md) - Element-Level Operations (23 tools)

Interact with elements, get attributes, and control scrolling.

**Tap & Input** (5 tools):
- `element_tap`, `element_long_press`, `element_input`
- `element_clear_input`, `element_trigger`

**Touch Events** (6 tools):
- `element_touch_start`, `element_touch_move`, `element_touch_end`
- `element_swipe`, `element_moveTo`, `element_slide`

**Getters** (7 tools):
- `element_get_text`, `element_get_value`
- `element_get_attribute`, `element_get_property`
- `element_get_size`, `element_get_offset`, `element_get_rect`

**Scrolling** (5 tools):
- `element_scroll`, `element_scroll_to`, `element_scroll_into_view`
- `element_scroll_x`, `element_scroll_y`

📖 **[Full Element API Documentation](./element.md)**

---

### <a name="assert"></a>[Assert](./assert.md) - Testing Assertions (9 tools)

Automated testing assertions for element validation.

| Tool | Description |
|------|-------------|
| `assert_exists` | Assert element exists |
| `assert_not_exists` | Assert element does not exist |
| `assert_text` | Assert exact text match |
| `assert_text_contains` | Assert text contains substring |
| `assert_attribute` | Assert attribute value |
| `assert_property` | Assert property value |
| `assert_data` | Assert page data value |
| `assert_visible` | Assert element is visible (non-zero size) |
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

### <a name="network"></a>[Network](./network.md) - Network Mocking & Testing (6 tools)

Mock WeChat APIs (wx.*) for testing without real network calls.

| Tool | Description |
|------|-------------|
| `network_mock_wx_method` | Mock any wx.* API method (success/fail) |
| `network_restore_wx_method` | Restore a mocked wx.* method |
| `network_mock_request` | Convenience wrapper for wx.request mock |
| `network_mock_request_failure` | Mock wx.request failure |
| `network_restore_request` | Restore wx.request to original behavior |
| `network_restore_all_mocks` | Restore all mocked methods at once |

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

---

## 🔑 工具命名说明

**MCP 工具名称格式**: 实际工具名称使用 `snake_case` 格式（如 `miniprogram_navigate`、`page_query`）。

**文档展示格式**: 为了提高可读性，文档中某些地方使用点号分隔（如 `miniprogram.navigate`、`page.query`），这仅是**展示格式**，调用时请使用下划线格式。

**示例对照**:
- 文档展示: `miniprogram.navigate` → 实际调用: `miniprogram_navigate`
- 文档展示: `page.getData` → 实际调用: `page_get_data`
- 文档展示: `element.tap` → 实际调用: `element_tap`

所有工具的**完整准确名称**请参考各分类页面的工具列表。

---

**最后更新**: 2025-10-03
