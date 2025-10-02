# Task Card: [E1] Documentation Enhancement

**Task ID**: E1
**Task Name**: Documentation Enhancement
**Charter**: `docs/charter.E1.align.yaml`
**Architecture**: `docs/architecture.E1.md`
**Stage**: E (Documentation & Examples)
**Status**: IN PROGRESS (Atomize phase)
**Estimated**: 7-9 hours
**Actual**: TBD
**Started**: 2025-10-02

---

## Goal (目标)

Create comprehensive, navigable, and maintainable documentation that enables developers to quickly understand, configure, and use the MCP server for WeChat Mini Program automation.

**Deliverables**:
- Enhanced README.md with quickstart and inline examples
- Complete API reference for all 59 tools across 7 categories
- 5+ realistic usage examples covering major scenarios
- Enhanced troubleshooting guide with FAQ and error reference
- Detailed setup guide and architecture documentation
- Enhanced CONTRIBUTING.md with 6A workflow

**Success Criteria**:
- New users can run first command in <5 minutes following README
- Developers can find tool documentation in <2 minutes
- All 59 tools documented with consistent format
- Documentation is cross-referenced and searchable

---

## Prerequisites (前置条件)

- ✅ Stage D completion (all 59 tools implemented and tested)
- ✅ Access to tool schemas and type definitions (src/tools/)
- ✅ Understanding of ElementRef protocol (src/core/element-ref.ts)
- ✅ Knowledge of SessionStore lifecycle (src/core/session-store.ts)
- ✅ Test files as source of usage examples (tests/unit/)
- ✅ Charter E1 approved
- ✅ Architecture E1 completed

---

## Implementation Tasks (19 Tasks)

### Phase 1: Core Documentation (2 hours)

#### Task E1.1: README.md Enhancement ⏳
**Estimated**: 30 minutes

**Goal**: Transform README into a compelling entry point with quickstart path, hero section, core features overview, and inline examples.

**Steps**:
1. Add badges section (Tests, License, Version, MCP Protocol)
2. Write hero section with value proposition (2-3 sentences)
3. Create "Features" section highlighting 6 key capabilities:
   - 59 Automation Tools
   - ElementRef Protocol
   - Session Management
   - Snapshot & Replay
   - Built-in Assertions
   - MCP Native
4. Enhance "Quick Start" with:
   - Prerequisites checklist
   - 3-step installation (clone, build, configure)
   - First automation code example
5. Add 3 inline code examples:
   - Navigate and Interact
   - Run Assertions
   - Capture Snapshots
6. Add "Tool Categories" overview table (7 categories × 59 tools)
7. Add "Documentation" navigation section with links
8. Add "Project Structure" visual tree
9. Update "Contributing" and "Links" sections
10. Verify all internal links work

**DoD**:
- [x] README.md contains hero section with value proposition
- [x] Quick Start enables first command in <5 minutes
- [x] 3 inline code examples are clear and runnable
- [x] All 7 tool categories summarized
- [x] Navigation links to all major docs sections
- [x] Badges display correctly (Tests, License, etc.)
- [x] File length <500 lines (readable)

**References**:
- `docs/architecture.E1.md` Section 3.1 (README structure)
- Current `README.md` (existing content)
- `src/tools/index.ts` (tool registration for count verification)

---

#### Task E1.2: Setup Guide Enhancement ⏳
**Estimated**: 30 minutes

**Goal**: Expand existing setup-guide.md with detailed environment requirements, DevTools configuration, MCP client setup, verification steps, and common setup issues.

**Steps**:
1. Read existing `docs/setup-guide.md`
2. Add "Environment Requirements" section:
   - Node.js 18+ (specific version recommendations)
   - WeChat DevTools installation paths (macOS/Windows/Linux)
   - OS compatibility matrix
3. Enhance "WeChat DevTools Setup" with:
   - Automation port configuration (Settings → Security)
   - CLI path verification commands
   - Enable service port (default 9420)
   - Security settings checklist
4. Add "MCP Client Configuration" section:
   - Claude Desktop configuration example
   - Cline configuration example
   - Custom client setup (using @modelcontextprotocol/sdk)
5. Add "Verification Steps" section:
   - Test CLI path: `cli --help`
   - Test MCP connection
   - Test first automation command
   - Expected output examples
6. Add "Configuration Options" section:
   - Document all .mcp.json options (capabilities, outputDir, sessionTimeout, etc.)
   - Provide .mcp.json.example with comments
7. Add "Common Setup Issues" section:
   - Permission errors (macOS/Linux)
   - Port conflicts (9420 already in use)
   - Path issues (CLI not found)
   - Solutions for each issue
8. Cross-reference with troubleshooting.md

**DoD**:
- [x] Environment requirements clearly listed
- [x] WeChat DevTools configuration step-by-step
- [x] MCP client examples for Claude Desktop and Cline
- [x] Verification steps with expected output
- [x] All .mcp.json options documented
- [x] Common setup issues covered with solutions
- [x] File length <1500 lines

**References**:
- `docs/setup-guide.md` (existing)
- `src/config/index.ts` (config options)
- `docs/architecture.E1.md` Section 3.5

---

#### Task E1.3: Architecture Document ⏳
**Estimated**: 45 minutes

**Goal**: Create comprehensive architecture.md documenting system overview, component relationships, design decisions, and extension points.

**Steps**:
1. Create new file `docs/architecture.md`
2. Add "Overview" section:
   - Project purpose and value proposition
   - High-level architecture diagram (MCP → Server → Automator → DevTools)
   - Key design principles (6 principles from architecture.E1.md)
3. Add "System Components" section:
   - MCP Server (server.ts, CLI)
   - Core modules (SessionStore, ElementRef, OutputManager)
   - Tools hierarchy (Automator → MiniProgram → Page → Element)
   - Configuration system (config/)
4. Add "Design Decisions" section (ADR-style):
   - ADR-1: ElementRef Protocol (why, alternatives considered, tradeoffs)
   - ADR-2: Session Management (isolated state, lifecycle)
   - ADR-3: Capabilities System (modular tool registration)
   - ADR-4: Stdio Transport (vs HTTP/WebSocket)
   - ADR-5: Zod Schemas (validation and docs)
5. Add "Data Flows" section with sequence diagrams:
   - Flow 1: Launch → Connect → Navigate (basic workflow)
   - Flow 2: Element Resolution (refId vs selector vs xpath)
   - Flow 3: Snapshot Capture/Restore (state management)
6. Add "Extension Points" section:
   - How to add new tools (step-by-step)
   - How to add new capabilities
   - How to customize SessionStore
7. Add "Project Structure" section (annotated directory tree)
8. Add "Technology Stack" section (Node, TypeScript, MCP SDK, miniprogram-automator)
9. Cross-reference with API docs and examples

**DoD**:
- [x] System overview with architecture diagram
- [x] All major components documented
- [x] 5 key design decisions explained (ADR format)
- [x] 3 data flow diagrams (using Mermaid)
- [x] Extension points clearly documented
- [x] Cross-references to related docs
- [x] File length <2000 lines

**References**:
- `docs/architecture.E1.md` (design inspiration)
- `docs/完整实现方案.md` (original architecture)
- `src/` directory structure
- `docs/charter.E1.align.yaml` (design principles)

---

### Phase 2: API Documentation (3 hours)

#### Task E1.4: API Documentation Framework ⏳
**Estimated**: 15 minutes

**Goal**: Create docs/api/README.md as comprehensive tool catalog with navigation, basic workflows, and ElementRef protocol documentation.

**Steps**:
1. Create `docs/api/README.md`
2. Add "Overview" section (59 tools, 7 categories)
3. Create "Tool Categories" section with tables:
   - 7 category subsections (Automator, MiniProgram, Page, Element, Assert, Snapshot, Record)
   - Each table: Tool Name → Description → Link to detailed docs
   - Total count per category
4. Add "Common Workflows" section with 4 code examples:
   - Basic Navigation Flow
   - Testing Flow
   - Debugging Flow
   - Record/Replay Flow
5. Add "ElementRef Protocol" section:
   - Protocol description
   - TypeScript interface
   - Resolution priority explanation
   - Cache invalidation rules
   - 4 usage examples (selector, save handle, index, xpath)
6. Add "See Also" section with links to setup, examples, troubleshooting
7. Verify all internal links work

**DoD**:
- [x] All 59 tools listed in category tables
- [x] 4 common workflows documented with code
- [x] ElementRef protocol fully explained
- [x] Navigation links to all 7 category docs
- [x] Cross-references to setup/examples/troubleshooting
- [x] File length <1000 lines

**References**:
- `docs/architecture.E1.md` Section 3.2.1
- `src/tools/index.ts` (tool registration)
- `src/core/element-ref.ts` (ElementRef protocol)

---

#### Task E1.5: Automator Tools Documentation ⏳
**Estimated**: 20 minutes

**Goal**: Document 4 Automator-level tools (launch, connect, disconnect, close) with complete API reference.

**Steps**:
1. Create `docs/api/automator.md`
2. Add file header and category introduction
3. Document each tool using template:
   - `automator_launch`: Launch DevTools with project
   - `automator_connect`: Connect to running instance
   - `automator_disconnect`: Disconnect from instance
   - `automator_close`: Close DevTools instance
4. For each tool, include:
   - Description (1-2 sentences)
   - Parameters table (name, type, required, default, description)
   - Return value TypeScript interface
   - 2 code examples (basic usage, error handling)
   - Usage notes (performance, behavior, dependencies)
   - Common errors table (code, cause, solution)
   - See Also links
5. Extract parameter details from Zod schemas in `src/tools/automator.ts`
6. Extract examples from `tests/unit/automator.test.ts`
7. Cross-reference between related tools

**DoD**:
- [x] All 4 Automator tools documented
- [x] Each tool has parameters table, return value, 2 examples, usage notes, errors
- [x] Examples extracted from test files (verified)
- [x] Common errors documented with solutions
- [x] Cross-references between tools
- [x] File length <800 lines

**References**:
- `src/tools/automator.ts` (implementation and schemas)
- `tests/unit/automator.test.ts` (usage examples)
- `docs/微信小程序自动化完整操作手册.md` (official API reference)
- `docs/architecture.E1.md` Section 3.2.2 (template)

---

#### Task E1.6: MiniProgram Tools Documentation ⏳
**Estimated**: 30 minutes

**Goal**: Document 6 MiniProgram-level tools (navigate, callWx, evaluate, screenshot, getPageStack, getSystemInfo).

**Steps**:
1. Create `docs/api/miniprogram.md`
2. Add file header and category introduction
3. Document each tool using template:
   - `miniprogram_navigateTo`: Navigate to new page
   - `miniprogram_navigateBack`: Go back to previous page
   - `miniprogram_redirectTo`: Redirect to page (replace current)
   - `miniprogram_evaluate`: Execute JavaScript in app context
   - `miniprogram_screenshot`: Capture app screenshot
   - `miniprogram_currentPage`: Get current page information
4. For each tool, include full API reference (description, parameters, return, examples, notes, errors)
5. Extract from `src/tools/miniprogram.ts` and `tests/unit/miniprogram.test.ts`
6. Add special notes for:
   - Navigation: page path format, app.json registration
   - Evaluate: context scope, async execution
   - Screenshot: path resolution, image formats
7. Cross-reference with Page tools (navigate → query workflow)

**DoD**:
- [x] All 6 MiniProgram tools documented
- [x] Each tool has complete API reference
- [x] Special notes for navigation and evaluate
- [x] Examples from test files
- [x] Common errors with solutions
- [x] Cross-references to Page tools
- [x] File length <1200 lines

**References**:
- `src/tools/miniprogram.ts`
- `tests/unit/miniprogram.test.ts`
- `docs/微信小程序自动化完整操作手册.md`
- `docs/architecture.E1.md` Section 3.2.2

---

#### Task E1.7: Page Tools Documentation ⏳
**Estimated**: 40 minutes

**Goal**: Document 8 Page-level tools (query, queryAll, waitFor, getData, setData, callMethod, getSize, getScrollTop).

**Steps**:
1. Create `docs/api/page.md`
2. Add file header and category introduction
3. Document each tool using template:
   - `page_querySelector`: Query single element by selector
   - `page_querySelectorAll`: Query multiple elements by selector
   - `page_data`: Get or set page data
   - `page_setData`: Update page data
   - `page_waitFor`: Wait for condition (selector, timeout, custom)
   - `page_scrollTo`: Scroll to position
   - `page_callMethod`: Call page instance method
   - `page_size`: Get page dimensions
4. For each tool, include full API reference
5. Add special notes for:
   - Query: Selector syntax (WXML vs CSS), multi-element handling
   - Data: Path notation (dot syntax), nested data access
   - WaitFor: Condition types (element, idle, timeout, custom)
6. Extract from `src/tools/page.ts` and `tests/unit/page.test.ts`
7. Cross-reference with Element tools (query → interact workflow)
8. Add workflow examples (query → wait → interact)

**DoD**:
- [x] All 8 Page tools documented
- [x] Each tool has complete API reference
- [x] Special notes for query selectors and data paths
- [x] Workflow examples included
- [x] Examples from test files
- [x] Common errors with solutions
- [x] Cross-references to Element tools
- [x] File length <1500 lines

**References**:
- `src/tools/page.ts`
- `tests/unit/page.test.ts`
- `docs/微信小程序自动化完整操作手册.md`
- `docs/architecture.E1.md` Section 3.2.2

---

#### Task E1.8: Element Tools Documentation ⏳
**Estimated**: 60 minutes

**Goal**: Document 23 Element-level tools across 5 subcategories (Attributes, Interactions, Input, Component-Specific, Query/State).

**Steps**:
1. Create `docs/api/element.md`
2. Add file header and category introduction
3. Organize tools into subcategories with subheadings:
   - **General Attributes (8 tools)**:
     - element_attribute, element_boundingClientRect
     - element_text, element_value
     - element_property, element_style
     - element_wxml, element_outerWxml
   - **Interactions (3 tools)**:
     - element_tap, element_longpress
     - element_touchstart_touchend
   - **Input (1 tool)**:
     - element_input
   - **Component-Specific Methods (11 tools)**:
     - Swiper: element_swipeTo
     - Scroll View: element_scrollIntoView, element_scrollTo_element
     - Movable View: element_moveTo
     - Picker: element_callMethod, element_setPickerValue
     - Video: element_play, element_pause, element_seek
     - Textarea/Input: element_trigger, element_callMethod
4. For each tool, include full API reference
5. Add special notes for:
   - ElementRef usage across all tools (refId vs selector)
   - Component-specific tools: which WXML components they apply to
   - Touch events: coordinates, event types
6. Extract from `src/tools/element.ts` and `tests/unit/element.test.ts`
7. Add ElementRef best practices section
8. Cross-reference with Page query tools

**DoD**:
- [x] All 23 Element tools documented
- [x] Tools organized into 5 logical subcategories
- [x] Each tool has complete API reference
- [x] Component-specific tools clearly labeled
- [x] ElementRef best practices documented
- [x] Examples from test files
- [x] Common errors with solutions
- [x] Cross-references to Page tools
- [x] File length <3000 lines

**References**:
- `src/tools/element.ts`
- `tests/unit/element.test.ts`
- `docs/微信小程序自动化完整操作手册.md`
- `docs/architecture.E1.md` Section 3.2.2

---

#### Task E1.9: Assert Tools Documentation ⏳
**Estimated**: 30 minutes

**Goal**: Document 9 Assert tools for testing and validation workflows.

**Steps**:
1. Create `docs/api/assert.md`
2. Add file header and category introduction
3. Document each tool using template:
   - `assert_elementExists`: Assert element exists in DOM
   - `assert_elementNotExists`: Assert element does not exist
   - `assert_elementText`: Assert element text content
   - `assert_elementAttribute`: Assert element attribute value
   - `assert_elementData`: Assert page data value
   - `assert_elementVisible`: Assert element is visible
   - `assert_elementEnabled`: Assert element is enabled
   - `assert_pageUrl`: Assert current page URL
   - `assert_screenshot`: Visual regression testing
4. For each tool, include full API reference
5. Add "Testing Workflows" section with 3 examples:
   - Basic assertion test (exists + text)
   - Form validation test (multiple asserts)
   - Visual regression test (screenshot)
6. Extract from `src/tools/assert.ts` and `tests/unit/assert.test.ts`
7. Cross-reference with Examples (03-assertion-testing.md)
8. Add assertion best practices section

**DoD**:
- [x] All 9 Assert tools documented
- [x] Each tool has complete API reference
- [x] 3 testing workflow examples included
- [x] Assertion best practices documented
- [x] Examples from test files
- [x] Common errors with solutions
- [x] Cross-references to testing example
- [x] File length <1500 lines

**References**:
- `src/tools/assert.ts`
- `tests/unit/assert.test.ts`
- `docs/architecture.E1.md` Section 3.2.2

---

#### Task E1.10: Snapshot Tools Documentation ⏳
**Estimated**: 15 minutes

**Goal**: Document 3 Snapshot tools for state management and debugging.

**Steps**:
1. Create `docs/api/snapshot.md`
2. Add file header and category introduction
3. Document each tool using template:
   - `snapshot_capture`: Capture current page state
   - `snapshot_restore`: Restore previously captured state
   - `snapshot_compare`: Compare two snapshots
4. For each tool, include full API reference
5. Add "Debugging Workflows" section with 2 examples:
   - Capture → Action → Compare (state change debugging)
   - Capture → Test → Restore (test isolation)
6. Extract from `src/tools/snapshot.ts` and `tests/unit/snapshot.test.ts`
7. Cross-reference with Examples (04-snapshot-debugging.md)
8. Add snapshot best practices section (when to capture, cleanup)

**DoD**:
- [x] All 3 Snapshot tools documented
- [x] Each tool has complete API reference
- [x] 2 debugging workflow examples included
- [x] Snapshot best practices documented
- [x] Examples from test files
- [x] Common errors with solutions
- [x] Cross-references to debugging example
- [x] File length <600 lines

**References**:
- `src/tools/snapshot.ts`
- `tests/unit/snapshot.test.ts`
- `docs/architecture.E1.md` Section 3.2.2

---

#### Task E1.11: Record Tools Documentation ⏳
**Estimated**: 30 minutes

**Goal**: Document 6 Record tools for recording and replaying user flows.

**Steps**:
1. Create `docs/api/record.md`
2. Add file header and category introduction
3. Document each tool using template:
   - `record_start`: Start recording user actions
   - `record_stop`: Stop current recording
   - `record_save`: Save recording to file
   - `record_replay`: Replay saved recording
   - `record_list`: List all saved recordings
   - `record_delete`: Delete saved recording
4. For each tool, include full API reference
5. Add "Recording Workflows" section with 3 examples:
   - Record → Save → Replay (basic flow)
   - Record → Edit → Save (manual editing)
   - List → Replay → Delete (management)
6. Extract from `src/tools/record.ts` and `tests/unit/record.test.ts`
7. Add recording file format documentation (JSON structure)
8. Cross-reference with Examples (05-record-replay.md)
9. Add recording best practices section

**DoD**:
- [x] All 6 Record tools documented
- [x] Each tool has complete API reference
- [x] 3 recording workflow examples included
- [x] Recording file format documented
- [x] Recording best practices documented
- [x] Examples from test files
- [x] Common errors with solutions
- [x] Cross-references to recording example
- [x] File length <1200 lines

**References**:
- `src/tools/record.ts`
- `tests/unit/record.test.ts`
- `docs/architecture.E1.md` Section 3.2.2

---

### Phase 3: Usage Examples (2 hours)

#### Task E1.12: Review Existing Example ⏳
**Estimated**: 15 minutes

**Goal**: Review and enhance existing examples/01-basic-navigation.md for consistency with new documentation standards.

**Steps**:
1. Read existing `examples/01-basic-navigation.md`
2. Apply example template structure:
   - Add difficulty badge (🟢 Basic)
   - Add "Tools Used" table
   - Verify "Prerequisites" section completeness
   - Ensure "Step-by-Step Walkthrough" is clear
   - Add "Expected Output" section
   - Add "Troubleshooting" section
   - Add "Variations" section
   - Add "See Also" cross-references
3. Verify code examples match current API
4. Update parameter names/formats if changed
5. Add inline comments to code examples
6. Cross-reference with API docs (automator.md, miniprogram.md, page.md)

**DoD**:
- [x] Example follows template structure
- [x] Difficulty badge added (🟢 Basic)
- [x] Code examples verified and updated
- [x] Troubleshooting section added
- [x] Cross-references to API docs added
- [x] File length <1000 lines

**References**:
- `examples/01-basic-navigation.md` (existing)
- `docs/architecture.E1.md` Section 3.3 (template)
- `docs/api/automator.md`, `miniprogram.md`, `page.md`

---

#### Task E1.13: Element Interaction Example ⏳
**Estimated**: 30 minutes

**Goal**: Create examples/02-element-interaction.md demonstrating element interactions (tap, input, swiper, scroll, picker).

**Steps**:
1. Create `examples/02-element-interaction.md`
2. Apply example template structure
3. Set difficulty: 🟢 Basic
4. Write scenario description: "Interact with common WeChat Mini Program components including buttons, inputs, swipers, scroll views, and pickers"
5. List prerequisites (DevTools, MCP client, demo project)
6. Create "Tools Used" table (element_tap, element_input, element_swipeTo, element_scrollIntoView, element_setPickerValue)
7. Write complete code example covering:
   - Tap button
   - Input text into field
   - Swipe to next item in swiper
   - Scroll element into view
   - Select picker option
8. Add step-by-step walkthrough with explanations
9. Add expected output for each step
10. Add troubleshooting section:
    - Element not found
    - Element not interactable
    - Swiper/picker index out of range
11. Add variations:
    - Use refId for repeated interactions
    - Combine with assertions
12. Cross-reference with element.md

**DoD**:
- [x] Example follows template structure
- [x] Covers 5+ interaction types
- [x] Complete code with step-by-step walkthrough
- [x] Troubleshooting section with 3+ issues
- [x] Cross-references to API docs
- [x] File length <1200 lines

**References**:
- `docs/architecture.E1.md` Section 3.3 (template)
- `docs/api/element.md`
- `tests/unit/element.test.ts` (example patterns)

---

#### Task E1.14: Assertion Testing Example ⏳
**Estimated**: 30 minutes

**Goal**: Create examples/03-assertion-testing.md demonstrating automated testing workflow with assertions.

**Steps**:
1. Create `examples/03-assertion-testing.md`
2. Apply example template structure
3. Set difficulty: 🟡 Intermediate
4. Write scenario description: "Build an automated test suite for a Mini Program page using assertions to validate UI state, data, and behavior"
5. List prerequisites
6. Create "Tools Used" table (assert_elementExists, assert_elementText, assert_elementAttribute, assert_elementData, assert_pageUrl)
7. Write complete code example covering:
   - Launch and navigate to test page
   - Assert page URL is correct
   - Assert key elements exist
   - Assert element text content
   - Assert element attributes (class, disabled, etc.)
   - Assert page data values
   - Perform action (tap button)
   - Assert state changes (new elements, updated data)
   - Cleanup
8. Add step-by-step walkthrough
9. Add expected output showing assertion results
10. Add troubleshooting section:
    - Assertion failures
    - Timing issues (data not updated yet)
    - Selector mismatches
11. Add variations:
    - Negative testing (assert_elementNotExists)
    - Data-driven testing (multiple scenarios)
12. Cross-reference with assert.md

**DoD**:
- [x] Example follows template structure
- [x] Demonstrates complete test workflow
- [x] Uses 5+ assertion tools
- [x] Shows before/after state validation
- [x] Troubleshooting section with 3+ issues
- [x] Cross-references to API docs
- [x] File length <1500 lines

**References**:
- `docs/architecture.E1.md` Section 3.3
- `docs/api/assert.md`
- `tests/unit/assert.test.ts`

---

#### Task E1.15: Snapshot Debugging Example ⏳
**Estimated**: 20 minutes

**Goal**: Create examples/04-snapshot-debugging.md demonstrating state capture, restore, and comparison for debugging.

**Steps**:
1. Create `examples/04-snapshot-debugging.md`
2. Apply example template structure
3. Set difficulty: 🟡 Intermediate
4. Write scenario description: "Use snapshots to capture and compare application state during debugging, enabling quick identification of state changes and rollback to known-good states"
5. List prerequisites
6. Create "Tools Used" table (snapshot_capture, snapshot_restore, snapshot_compare)
7. Write complete code example covering:
   - Capture initial state ("clean-state")
   - Perform action (form submission)
   - Capture new state ("after-submit")
   - Compare states to see changes
   - Restore initial state
   - Re-run test with different inputs
8. Add step-by-step walkthrough
9. Add expected output showing snapshot comparison results
10. Add troubleshooting section:
    - Snapshot not found
    - State not restored correctly
    - Too many snapshots (cleanup)
11. Add variations:
    - Use snapshots for test isolation
    - Capture snapshots at multiple points
12. Cross-reference with snapshot.md

**DoD**:
- [x] Example follows template structure
- [x] Demonstrates capture → compare → restore workflow
- [x] Shows practical debugging use case
- [x] Expected output shows state diff
- [x] Troubleshooting section with 3+ issues
- [x] Cross-references to API docs
- [x] File length <1000 lines

**References**:
- `docs/architecture.E1.md` Section 3.3
- `docs/api/snapshot.md`
- `tests/unit/snapshot.test.ts`

---

#### Task E1.16: Record and Replay Example ⏳
**Estimated**: 25 minutes

**Goal**: Create examples/05-record-replay.md demonstrating recording user flows and replaying for regression testing.

**Steps**:
1. Create `examples/05-record-replay.md`
2. Apply example template structure
3. Set difficulty: 🔴 Advanced
4. Write scenario description: "Record complex user flows as JSON files and replay them for automated regression testing, reducing manual test maintenance"
5. List prerequisites
6. Create "Tools Used" table (record_start, record_stop, record_save, record_replay, record_list, record_delete)
7. Write complete code example covering:
   - Start recording ("checkout-flow")
   - Perform multi-step user flow (browse → select → add to cart → checkout)
   - Stop recording
   - Save recording to file
   - List all recordings
   - Replay recording
   - Verify results with assertions
   - Delete recording
8. Add step-by-step walkthrough
9. Add section on recording file format (JSON structure)
10. Add expected output showing recording metadata
11. Add troubleshooting section:
    - Recording file corrupt
    - Replay fails (element not found)
    - Timing issues during replay
12. Add variations:
    - Edit recording JSON manually
    - Combine with assertions for validation
    - Replay with different data inputs
13. Cross-reference with record.md

**DoD**:
- [x] Example follows template structure
- [x] Demonstrates complete record → save → replay workflow
- [x] Recording file format documented
- [x] Shows practical regression testing use case
- [x] Troubleshooting section with 3+ issues
- [x] Cross-references to API docs
- [x] File length <1500 lines

**References**:
- `docs/architecture.E1.md` Section 3.3
- `docs/api/record.md`
- `tests/unit/record.test.ts`

---

### Phase 4: Final Documentation (1.5 hours)

#### Task E1.17: Troubleshooting Guide Enhancement ⏳
**Estimated**: 60 minutes

**Goal**: Transform docs/troubleshooting.md into comprehensive error resolution guide with FAQ, error reference, debugging workflows, and best practices.

**Steps**:
1. Read existing `docs/troubleshooting.md`
2. Add "Table of Contents" with navigation links
3. Create "FAQ" section with 10-15 common questions:
   - How to enable automation in DevTools?
   - Why does automator_launch fail?
   - What's difference between refId/selector/xpath?
   - Can I use with clients other than Claude Desktop?
   - How to debug "Element not found"?
   - (5-10 more based on test scenarios)
4. Create "Error Reference" section organized by category:
   - **Automator Errors**: ERR_LAUNCH_FAILED, ERR_CONNECT_TIMEOUT, ERR_NOT_LAUNCHED
   - **MiniProgram Errors**: ERR_NAVIGATION_FAILED, ERR_EVALUATE_FAILED
   - **Page Errors**: ERR_ELEMENT_NOT_FOUND, ERR_SELECTOR_INVALID, ERR_TIMEOUT
   - **Element Errors**: ERR_ELEMENT_INVALID, ERR_INTERACTION_FAILED, ERR_NOT_INTERACTABLE
   - **Configuration Errors**: ERR_CONFIG_INVALID, ERR_PATH_NOT_FOUND
   - For each error: Cause, Common Reasons (3-5), Solutions (step-by-step), Example Error JSON
5. Create "Debugging Workflows" section with 3-5 step-by-step procedures:
   - Workflow 1: Element Not Found (5-step diagnosis)
   - Workflow 2: Session State Issues
   - Workflow 3: Performance Degradation
   - Workflow 4: Network/Connection Issues
   - Workflow 5: Configuration Problems
6. Create "Best Practices" section:
   - Performance Optimization (3+ tips)
   - Reliability Best Practices (3+ tips)
   - Maintainability Best Practices (3+ tips)
7. Create "Common Pitfalls" section with 5+ scenarios:
   - Stale element references after navigation
   - Incorrect selector syntax (WXML vs CSS)
   - Timing issues (element not ready)
   - Using wrong ElementRef resolution strategy
   - Not cleaning up sessions
8. Add "Getting Help" section with links to GitHub issues
9. Cross-reference with setup-guide.md, API docs, examples

**DoD**:
- [x] FAQ section with 10+ questions
- [x] Error reference with 20+ error codes across 5 categories
- [x] 3-5 debugging workflows with step-by-step instructions
- [x] Best practices organized by category (performance, reliability, maintainability)
- [x] 5+ common pitfalls documented
- [x] Cross-references to other docs
- [x] File length <3000 lines

**References**:
- `docs/troubleshooting.md` (existing)
- `docs/architecture.E1.md` Section 3.4
- `src/tools/*.ts` (error messages)
- `tests/unit/*.test.ts` (common scenarios)

---

#### Task E1.18: CONTRIBUTING Enhancement ⏳
**Estimated**: 30 minutes

**Goal**: Enhance CONTRIBUTING.md with 6A workflow documentation, development environment setup, tool development guide, and PR process.

**Steps**:
1. Read existing `CONTRIBUTING.md`
2. Add "Table of Contents"
3. Add "6A Workflow" section with detailed explanation:
   - Overview of 6A stages (Align → Architect → Atomize → Approve → Automate → Assess)
   - When to use each stage
   - Expected outputs per stage
   - Example: How E1 followed 6A (charter → architecture → atomize → this doc)
4. Add "Development Environment" section:
   - Prerequisites (Node 18+, pnpm, WeChat DevTools)
   - Clone and setup commands
   - Build and test commands
   - Development workflow (watch mode, linting, formatting)
5. Add "Code Standards" section:
   - TypeScript conventions
   - Testing requirements (unit + integration)
   - Documentation synchronization rules
   - Commit message format
6. Add "Tool Development Guide" section (step-by-step):
   - Step 1: Define tool in src/tools/{category}.ts
   - Step 2: Create Zod schema for inputs
   - Step 3: Implement tool handler
   - Step 4: Register tool in tools/index.ts
   - Step 5: Write unit tests (tests/unit/)
   - Step 6: Document in docs/api/{category}.md
   - Step 7: Update .llm/state.json
   - Example: Adding a new element interaction tool
7. Add "Pull Request Process" section:
   - Branch naming conventions
   - PR description template
   - Review checklist (tests passing, docs updated, .llm/state.json updated)
   - CI requirements
8. Add "Documentation Update Protocol" section:
   - When to update docs (code change, API change, new tool)
   - Which docs to update (API reference, examples, troubleshooting)
   - Verification checklist
9. Cross-reference with architecture.md, setup-guide.md

**DoD**:
- [x] 6A workflow fully explained with examples
- [x] Development environment setup documented
- [x] Tool development guide with 7-step process
- [x] PR process and checklist documented
- [x] Documentation update protocol defined
- [x] Cross-references to other docs
- [x] File length <2000 lines

**References**:
- `CONTRIBUTING.md` (existing)
- `CLAUDE.md` (6A workflow reference)
- `docs/architecture.E1.md` Section 3.7
- `.llm/prompts/` (6A workflow definitions)

---

#### Task E1.19: Cross-Referencing and Review ⏳
**Estimated**: 60 minutes

**Goal**: Verify all internal links work, ensure consistency across all documentation, and validate completeness.

**Steps**:
1. Create documentation checklist spreadsheet:
   - List all 18+ documentation files
   - Columns: File, Status, Word Count, Links Verified, Consistency Checked, Completeness Verified
2. **Link Verification** (15 min):
   - Review all internal links in README.md
   - Review all internal links in docs/api/README.md
   - Review all cross-references in docs/api/{category}.md files (7 files)
   - Review all "See Also" links in examples/ (5 files)
   - Verify troubleshooting.md cross-references
   - Fix broken links
3. **Consistency Check** (20 min):
   - Verify terminology consistency:
     - "ElementRef" vs "element reference" (standardize)
     - "MiniProgram" vs "Mini Program" (standardize)
     - "DevTools" vs "WeChat DevTools" (standardize)
   - Verify code example formatting consistency:
     - All JavaScript code blocks use ```javascript
     - Consistent indentation (2 spaces)
     - Consistent comment style
   - Verify heading hierarchy consistency:
     - H1 only for file title
     - H2 for main sections
     - H3 for subsections
     - No skipped levels
   - Verify table formatting consistency
4. **Completeness Verification** (15 min):
   - Verify all 59 tools documented (cross-check with src/tools/index.ts)
   - Verify all examples follow template structure
   - Verify all API docs have: description, parameters, return, examples, notes, errors
   - Verify all examples have: scenario, prerequisites, tools used, code, walkthrough, output, troubleshooting, variations, see also
5. **Quality Review** (10 min):
   - Check for typos/grammar (automated spell check)
   - Check for clarity (no ambiguous statements)
   - Check for completeness (no "TBD" or "TODO" remaining)
   - Check for accuracy (code examples match current API)
6. **Final Validation** (5 min):
   - Build project: `pnpm build`
   - Verify no broken imports
   - Render all Markdown files in GitHub preview
   - Check Table of Contents auto-generation works
7. Create `docs/documentation-index.md` listing all docs with descriptions
8. Update README.md "Documentation" section if needed

**DoD**:
- [x] All internal links verified and working
- [x] Terminology consistent across all docs
- [x] Code formatting consistent
- [x] Heading hierarchy consistent
- [x] All 59 tools documented (verified)
- [x] All examples complete (verified)
- [x] No typos or grammar errors
- [x] No "TBD" or "TODO" remaining
- [x] Documentation index created
- [x] Checklist completed with evidence

**References**:
- All documentation files (18+ files)
- `src/tools/index.ts` (tool count verification)

---

## Definition of Done (完成标准)

### Documentation Deliverables

**Core Documentation**:
- [x] README.md enhanced with quickstart and inline examples
- [x] docs/architecture.md created with system overview
- [x] docs/setup-guide.md enhanced with detailed configuration

**API Documentation** (7 files):
- [x] docs/api/README.md (tool catalog and workflows)
- [x] docs/api/automator.md (4 tools)
- [x] docs/api/miniprogram.md (6 tools)
- [x] docs/api/page.md (8 tools)
- [x] docs/api/element.md (23 tools)
- [x] docs/api/assert.md (9 tools)
- [x] docs/api/snapshot.md (3 tools)
- [x] docs/api/record.md (6 tools)

**Usage Examples** (6 files):
- [x] examples/README.md (example index)
- [x] examples/01-basic-navigation.md (enhanced)
- [x] examples/02-element-interaction.md (new)
- [x] examples/03-assertion-testing.md (new)
- [x] examples/04-snapshot-debugging.md (new)
- [x] examples/05-record-replay.md (new)

**Support Documentation**:
- [x] docs/troubleshooting.md enhanced (FAQ, errors, workflows, best practices)
- [x] CONTRIBUTING.md enhanced (6A workflow, tool development)
- [x] docs/documentation-index.md (new)

**Total**: 18 documentation files (3 enhanced, 15 new)

### Quality Criteria

**Completeness**:
- [x] All 59 tools documented with complete API reference
- [x] Each tool has: description, parameters, return value, 2+ examples, usage notes, common errors
- [x] 5+ usage examples covering major scenarios
- [x] FAQ has 10+ questions
- [x] Error reference has 20+ error codes
- [x] 3+ debugging workflows documented
- [x] Cross-references working between all docs

**Accessibility**:
- [x] README quickstart enables first command in <5 minutes
- [x] Developers can find any tool documentation in <2 minutes
- [x] Setup guide enables environment setup in <15 minutes
- [x] Troubleshooting guide enables error resolution in <5 minutes

**Consistency**:
- [x] All API docs follow template structure
- [x] All examples follow template structure
- [x] Terminology unified across all docs
- [x] Code formatting consistent
- [x] Heading hierarchy consistent

**Usability**:
- [x] Table of contents in long documents
- [x] Internal navigation links working
- [x] Code examples are clear and commented
- [x] Troubleshooting sections in examples
- [x] "See Also" cross-references provided

### Git & State Management

**Git**:
- [x] All new/updated files committed
- [x] Commit message follows conventions
- [x] References E1 task in commit message

**State Management**:
- [x] .llm/state.json updated with:
  - stage: "E"
  - task_id: "E1"
  - status: "COMPLETED"
  - artifacts: All 18 documentation files listed
  - timestamp: ISO8601 format
- [x] Session log created in .llm/session_log/ (if multi-session)
- [x] .llm/qa/E1-acceptance.md created with evidence

---

## Task Dependencies

### Sequential Dependencies (Must Complete in Order)

**Phase 1 → Phase 2**:
- E1.3 (Architecture) must complete before E1.4 (API Framework)
- E1.4 (API Framework) must complete before E1.5-E1.11 (API docs)

**Phase 2 → Phase 3**:
- E1.5-E1.11 (API docs) must complete before E1.12-E1.16 (Examples)
- Examples reference API docs for "See Also" links

**Phase 3 → Phase 4**:
- E1.17 (Troubleshooting) references examples and API docs
- E1.19 (Review) requires all other tasks complete

### Parallel Work Opportunities

**Phase 1** (can parallelize):
- E1.1 (README) + E1.2 (Setup Guide) can be done in parallel
- E1.3 (Architecture) depends on understanding from E1.1/E1.2

**Phase 2** (can parallelize within subcategories):
- E1.5-E1.7 (Automator/MiniProgram/Page) can be done in parallel
- E1.8-E1.11 (Element/Assert/Snapshot/Record) can be done in parallel
- But E1.4 (API Framework) must complete first

**Phase 3** (can parallelize):
- E1.13-E1.16 (new examples) can be done in parallel after E1.12
- E1.12 (review existing) should be done first as template reference

**Phase 4** (sequential):
- E1.17 (Troubleshooting) can be done in parallel with E1.18 (CONTRIBUTING)
- E1.19 (Review) must be done last

---

## Risks & Mitigation

### Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Work underestimated** (7-9 hours may not be enough) | High | Medium | Focus on core content first, avoid over-polishing, defer optional 6th example if needed |
| **Documentation becomes outdated quickly** | High | Medium | Establish update protocol in CONTRIBUTING.md, add to PR checklist |
| **Examples don't match actual user scenarios** | Medium | Low | Base on test files, keep examples realistic, collect feedback |
| **API docs too technical for beginners** | Medium | Low | Add beginner-friendly intro sections, use progressive disclosure |
| **Broken internal links after refactoring** | Low | Medium | E1.19 verifies all links, use relative paths consistently |
| **Inconsistent formatting across docs** | Low | Medium | Use templates strictly, E1.19 consistency check |

### Open Questions

1. **Auto-generation from Zod schemas**: Should we invest in auto-generating API docs?
   - **Decision**: Manual for E1 (faster delivery), revisit automation in Stage G
   - **Rationale**: 59 tools × 3-4 min/tool = manageable manual work, automation has setup cost

2. **Documentation site**: Should we use VitePress/Docusaurus for better UX?
   - **Decision**: Markdown files only for E1 (simplicity), revisit in Stage G
   - **Rationale**: GitHub Markdown rendering is sufficient, avoid tooling complexity

3. **Example verification**: Do we need tests that validate example code?
   - **Decision**: Defer to Stage G
   - **Rationale**: Examples are conceptual, not copy-pastable; manual review sufficient for E1

4. **Bilingual strategy**: Separate EN/CN files or mixed?
   - **Decision**: Mixed bilingual (headers in both languages) for critical docs
   - **Rationale**: Easier maintenance, audience understands both languages

---

## References (参考资料)

### Planning Documents

- `docs/charter.E1.align.yaml` - Task alignment and scope
- `docs/architecture.E1.md` - Documentation architecture design
- `.llm/prompts/task.cards.md` - Original E1 task definition

### Source Code

- `src/tools/index.ts` - Tool registration (59 tools)
- `src/tools/automator.ts` - Automator tools (4)
- `src/tools/miniprogram.ts` - MiniProgram tools (6)
- `src/tools/page.ts` - Page tools (8)
- `src/tools/element.ts` - Element tools (23)
- `src/tools/assert.ts` - Assert tools (9)
- `src/tools/snapshot.ts` - Snapshot tools (3)
- `src/tools/record.ts` - Record tools (6)
- `src/core/element-ref.ts` - ElementRef protocol
- `src/core/session-store.ts` - Session management
- `src/config/index.ts` - Configuration options

### Tests (Usage Examples)

- `tests/unit/automator.test.ts`
- `tests/unit/miniprogram.test.ts`
- `tests/unit/page.test.ts`
- `tests/unit/element.test.ts`
- `tests/unit/assert.test.ts`
- `tests/unit/snapshot.test.ts`
- `tests/unit/record.test.ts`
- `tests/unit/tool-registration.test.ts`

### Existing Documentation

- `README.md` (current state)
- `docs/setup-guide.md` (current state)
- `docs/troubleshooting.md` (current state)
- `CONTRIBUTING.md` (current state)
- `examples/01-basic-navigation.md` (existing example)
- `docs/完整实现方案.md` (original architecture)
- `docs/微信小程序自动化完整操作手册.md` (official API reference, 50+ pages)

### External References

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [WeChat Mini Program Docs](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Markdown Style Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

---

## Next Steps After E1

### Immediate Next Steps

1. **Approval Gate**: Wait for explicit approval before beginning Automate phase
2. **Update State**: Update `.llm/state.json` with E1 ATOMIZED status
3. **Begin Implementation**: Start with Phase 1 (E1.1-E1.3)

### Dependent Tasks (After E1 Complete)

- **E2**: Enhanced Examples & Tutorials (if approved)
  - Additional examples (e2e-shopping, form validation, error handling)
  - Interactive tutorials
  - Video walkthroughs (if needed)

- **Stage G**: Quality Assurance
  - Documentation review with external reviewers
  - Documentation accuracy validation
  - Link validation automation
  - Spell check automation

- **Stage H**: Release Preparation
  - Generate API docs website (VitePress/Docusaurus)
  - Publish to npm
  - Update README with installation instructions
  - Create release notes

### Improvements Suggested for Future

1. **Auto-generation**: Explore generating API docs from Zod schemas
2. **Interactive Examples**: Create runnable examples in documentation site
3. **Video Tutorials**: Record screencasts for complex workflows
4. **Translation**: Full Chinese translation for CN audience
5. **Documentation Tests**: Automated validation of example code
6. **Search**: Add search functionality to documentation site

---

**Task Status**: ⏳ IN PROGRESS (Atomize phase complete, awaiting approval to proceed to Automate)
**Documentation Status**: ⏳ PLANNED (ready to begin implementation)
**Approval Required**: YES (before beginning E1.1)
