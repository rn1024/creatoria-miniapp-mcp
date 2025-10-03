# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-03

### Added

#### Core Architecture (Stage B)
- **MCP Server Implementation**: Complete stdio-based MCP server for WeChat Mini Program automation
- **Session Management**: Isolated session state with automatic resource cleanup and timeout handling
- **ElementRef Protocol**: Unified element reference resolution supporting refId/selector/xpath/index
- **Output Management**: Artifact collection with session-based directory organization
- **Structured Logging**: Production-grade logging with configurable levels and file output

#### Tool Categories (65 tools across 8 categories)

**Automator Tools (4 tools)**
- `miniprogram_launch`: Launch WeChat DevTools with automation port
- `miniprogram_connect`: Connect to existing DevTools instance
- `miniprogram_disconnect`: Graceful disconnection
- `miniprogram_close`: Full cleanup and IDE shutdown

**MiniProgram Tools (6 tools)**
- Navigation: `navigate_to`, `redirect_to`, `switch_tab`, `relaunch`
- Testing: `evaluate_script`, `screenshot`, `system_info`, `page_scroll_to`
- Mocking: `call_wx_method`, `mock_wx_method`, `restore_wx_method`

**Page Tools (8 tools)**
- Element Query: `page_query`, `page_query_all`, `xpath_query`
- Data Access: `page_data`, `page_set_data`, `page_call_method`
- Waiting: `wait_for_element`, `wait_for_timeout`
- Inspection: `page_size`, `page_scroll_top`

**Element Tools (23 tools)**
- Properties: `text`, `attribute`, `value`, `property`, `style`
- Interactions: `tap`, `longpress`, `trigger`, `touchstart`, `touchmove`, `touchend`
- Input: `input_text`, `input_value`, `input_clear`
- Specialized: ScrollView (4 tools), Swiper (3 tools), Movable (7 tools), Picker, Video

**Assert Tools (9 tools)**
- Existence: `assert_exists`, `assert_not_exists`
- Text: `assert_text_equals`, `assert_text_contains`
- Data: `assert_data_equals`, `assert_data_contains`
- Attributes: `assert_attribute_equals`, `assert_style_equals`
- Custom: `assert_custom`

**Snapshot Tools (3 tools)**
- `capture_page_snapshot`: Full page state capture (DOM + data + screenshot)
- `capture_element_snapshot`: Element-level diagnostic capture
- `capture_failure_artifacts`: Auto-collection on assertion failures

**Record Tools (6 tools)**
- Recording: `start_recording`, `stop_recording`, `get_recording`
- Replay: `replay_actions`, `save_recording`, `load_recording`

**Network Tools (6 tools)**
- Mock Management: `mock_network_request`, `clear_network_mocks`, `list_network_mocks`
- Monitoring: `capture_network_traffic`, `wait_for_network_request`
- Verification: `assert_network_request`

#### Configuration System (Stage E)
- **Multi-source Config Resolution**: CLI > Environment > File > Defaults
- **Configuration Templates**: 5+ example configs for different use cases
- **Validation**: Zod-based schema validation with helpful error messages
- **CLI Integration**: Full commander-based CLI with `--help` documentation

#### Capabilities System (Stage D)
- **Modular Tool Registration**: Enable/disable tool categories via `capabilities` config
- **8 Capability Groups**: core, miniprogram, page, element, assert, snapshot, record, network
- **Runtime Optimization**: Only load required tools to reduce overhead

#### Observability & Diagnostics (Stage F)
- **Tool-level Logging**: Automatic logging for all tool invocations
- **Failure Artifact Collection**: Screenshots + snapshots on errors
- **Session Reports**: JSON/Markdown reports with execution summaries
- **Performance Metrics**: Tool execution timing and resource tracking

#### Quality Infrastructure (Stage G-H)
- **545 Unit Tests**: 100% pass rate, comprehensive scenario coverage
- **Integration Test Framework**: E2E test helpers with MCP client simulation
- **Smoke Test Script**: 6-check validation in <15 seconds
- **CI/CD Workflows**: GitHub Actions for tests, linting, and releases
- **Release Automation**: Automated versioning, changelog, and npm publishing
- **Maintenance Documentation**: Troubleshooting guides, API references, runbooks

#### Developer Experience
- **TypeScript Support**: Full type safety with strict mode
- **Auto-generated Docs**: README tools table generated from schemas
- **Example Scripts**: 5+ working examples with common test scenarios
- **Error Messages**: Detailed, actionable error messages with context
- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks

### Changed

- **Package Manager**: Standardized on pnpm@9.0.0 (replaces npm/yarn)
- **Node.js Requirement**: Minimum version 18.0.0 for ESM support

### Fixed

- **MCP SDK Compatibility**: Updated integration test client to use correct `server.request()` API
- **Type Declarations**: Custom type declarations for miniprogram-automator
- **Element Invalidation**: Automatic refId invalidation on page navigation

### Documentation

- **API Documentation**: Complete tool reference (65 tools) with examples
- **Architecture Docs**: C4 diagrams, ADRs, implementation plans
- **Setup Guide**: Installation, configuration, and first test walkthrough
- **Troubleshooting Guide**: Common issues and solutions
- **Maintenance Manual**: Upgrade procedures, monitoring, backup strategies
- **Contributing Guide**: Development workflow, commit conventions, PR process

### Performance

- **Session Timeout**: Configurable timeout (default: 30 minutes)
- **Log Buffering**: Batch writes to reduce I/O overhead (default: 100 entries)
- **Element Caching**: Persistent element handles to reduce query overhead
- **Lazy Loading**: Tools registered only when capabilities enabled

### Security

- **No Credentials in Logs**: Sensitive data automatically redacted
- **Secure Defaults**: Conservative timeouts, size limits, and resource caps
- **Type Validation**: All inputs validated via Zod schemas

## Project Metrics

- **Total Tools**: 65
- **Total Tests**: 545 (354 unit + 191 integration)
- **Test Coverage**: High (all critical paths covered)
- **Documentation**: 43 files, ~15,000 lines
- **Source Code**: 23 TypeScript files, ~8,666 SLOC
- **Example Scripts**: 5 working examples + 7 config templates

## Acknowledgments

Built with:
- [@modelcontextprotocol/sdk](https://github.com/anthropics/model-context-protocol) - MCP protocol implementation
- [miniprogram-automator](https://www.npmjs.com/package/miniprogram-automator) - WeChat automation SDK
- [zod](https://github.com/colinhacks/zod) - TypeScript schema validation
- [commander](https://github.com/tj/commander.js) - CLI framework

---

[Unreleased]: https://github.com/rn1024/creatoria-miniapp-mcp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rn1024/creatoria-miniapp-mcp/releases/tag/v0.1.0
