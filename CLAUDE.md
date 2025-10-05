# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Package manager: ALWAYS use pnpm (never npm or yarn)
pnpm install              # Install dependencies
pnpm build               # Build TypeScript to dist/
pnpm dev                 # Watch mode compilation
pnpm typecheck           # Type checking without emitting files
pnpm lint                # Run ESLint
pnpm format              # Format code with Prettier
pnpm test                # Run Jest tests
pnpm test:watch          # Run tests in watch mode
```

## Project Architecture

### MCP Server for WeChat Mini Program Automation

This project wraps WeChat's official `miniprogram-automator` SDK as a Model Context Protocol (MCP) server, enabling LLMs to orchestrate end-to-end testing of WeChat Mini Programs through natural language.

**Core Architecture:**
```
LLM/Agent → MCP Transport (stdio) → MCP Server (this repo)
    → WeChat DevTools CLI → miniprogram-automator → Mini Program
```

**Key Design Patterns:**
- **Session Management**: Each MCP session maintains isolated state (miniProgram instance, IDE process, element cache)
- **ElementRef Protocol**: Unified element resolution supporting refId/selector/xpath with automatic invalidation on page changes
- **Capabilities System**: Modular tool registration (`core`, `assert`, `snapshot`, `record`, `network`, `tracing`)
- **6A Workflow**: All development follows Align → Architect → Atomize → Approve → Automate → Assess stages

### Directory Structure

```
src/
  ├── tools/          # MCP tool implementations (Automator/MiniProgram/Page/Element)
  ├── config/         # Configuration resolution (CLI/file/env priority)
  ├── core/           # SessionStore, ElementRef resolver, OutputManager
  ├── server.ts       # MCP Server with StdioServerTransport
  ├── cli.ts          # CLI entry point
  └── types.ts        # Core TypeScript interfaces

.llm/                 # Project governance system (DO NOT DELETE)
  ├── state.json      # SSOT (Single Source of Truth) - must be updated for all changes
  ├── prompts/        # Workflow definitions (6A, simple step method)
  └── session_log/    # Session history logs
```

## Development Workflow (6A Method)

**CRITICAL**: This project uses the 6A workflow. Every task must follow these stages:

1. **Align**: Define goals/non-goals/scope/constraints → `docs/charter.align.yaml`
2. **Architect**: Create C4 diagrams, interfaces, ADRs → `docs/architecture.md`
3. **Atomize**: Break into 1-3 hour tasks → `.llm/prompts/task.cards.md`
4. **Approve**: Wait for explicit approval before implementation
5. **Automate**: Implement (code + tests + docs + runbook MUST be synchronous)
6. **Assess**: Verify DoD, collect evidence → `.llm/qa/acceptance.md`

**Output Format (Simple Step Method)** - REQUIRED for every response:
```
1. Context: Background snapshot
2. Plan: 3-7 action steps
3. Execute: Actions taken and results
4. Verify: How to verify + expected evidence
5. Record: Updated files and key points
6. Next: Next steps
```

**SSOT Update Rule**: `.llm/state.json` MUST be fully overwritten (not diff'd) after ANY change. Include:
- `stage`, `task_id`, `context_digest`
- `open_questions` (NEVER speculate - list unknowns explicitly)
- `artifacts` (all changed files with type/change/note)
- `risks`, `blocks`, `next_actions`
- `timestamp` in ISO8601 format

## Critical Configuration

**Package Manager**: pnpm@9.0.0 is mandatory (`packageManager` field in package.json)
- All docs/scripts/commands use `pnpm` exclusively
- `pnpm-lock.yaml` MUST be committed to git
- `.npmrc` configured with `shamefully-hoist=true`

**Sensitive Files** (NEVER commit):
- `.mcp.json` - contains API keys (Figma, Supabase)
- `.claude/` - local IDE settings
- Use `.mcp.json.example` as template for new installations

## Task Management

**Task Cards**: All tasks defined in `.llm/prompts/task.cards.md` (36 tasks across 8 stages)
- Format: `[Task ID] Name` with Goal/Prerequisites/Steps/DoD/References
- Task granularity: 1-3 hours
- Current stage: Stage A (Environment & Infrastructure Setup)
- Completed: A3 (repo structure), A4 (code quality tools), Git setup
- Pending: A1 (environment verification), A2 (automation port script), Stage B-H

**Session Logs**: Create `.llm/session_log/{date}-{agent}.md` for each significant work session
- Include: Context/Plan/Execute/Verify/Record/Next sections
- List all file changes in tabular format
- Document key decisions and open questions

## MCP Tool Implementation Guidelines

**Tool Mapping**: Reference `docs/微信小程序自动化完整操作手册.md` for complete API coverage
- **Automator level**: launch, connect, disconnect, close
- **MiniProgram level**: navigation, wx methods, evaluate, screenshot, mock
- **Page level**: query, data manipulation, waiting
- **Element level**: attributes, interactions, specialized component methods

**Schema Definition**: Use `zod` for all tool input schemas
- Tools registered in `tools/index.ts` via `registerTools(server, capabilities)`
- Schema auto-generates documentation (planned: `scripts/update-readme.ts`)

**ElementRef Protocol**:
```typescript
type ElementRef = {
  refId?: string;      // Cached handle
  selector?: string;   // WXML/CSS selector
  xpath?: string;      // XPath selector
  index?: number;      // Multi-element index
  pagePath?: string;   // Target page
  save?: boolean;      // Cache handle and return new refId
};
```

## Testing Requirements

- **Unit Tests**: Cover ElementRef resolution, config parsing, tool schema validation
- **Integration Tests**: Use example Mini Program project with end-to-end flows
- Test files: `tests/unit/**/*.test.ts` and `tests/integration/**/*.test.ts`
- CI must pass before any commit

## Git Workflow

**Commit Message Format**:
```
feat/fix/docs/refactor: Brief description

- Detailed bullet points
- Include task references [A3], [B1], etc.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Remote**: git@github.com:rn1024/creatoria-miniapp-mcp.git
**Branch**: main (direct commits allowed during early stage)

## Key Documentation References

- `docs/完整实现方案.md`: Complete implementation architecture
- `docs/微信小程序自动化完整操作手册.md`: Official API reference (50+ pages)
- `docs/开发任务计划.md`: Task breakdown with milestones
- `docs/接口方案.md`: MCP interface mapping design
- `docs/directory-structure-and-code-style-best-practices.md`: Directory structure and coding guidelines

## Critical Rules

1. **Never speculate**: If uncertain, add to `open_questions` in state.json
2. **Synchronous delivery**: Code + Tests + Docs + Runbook must be delivered together
3. **Task granularity**: 1-3 hours max; break larger tasks down
4. **State updates**: ALWAYS update `.llm/state.json` after changes (full overwrite)
5. **Session logs**: Record significant work in `.llm/session_log/`
6. **Handoff protocol**: Use `.llm/prompts/handoff.md` template when context >80% or TTL near

## WeChat DevTools Integration

**CLI Path** (macOS): `/Applications/wechatwebdevtools.app/Contents/MacOS/cli`
**Automation Port**: Default 9420 (WebSocket)
**Launch Command**: `cli --auto <projectPath> --auto-port <port>`
**Connection**: `miniprogram-automator.connect({ port })`

Enable automation in DevTools: Settings → Security → Allow CLI/HTTP calls

## Current Project State

**Status**: Stage A - Infrastructure Setup (50% complete)
- ✅ A3: Repository structure initialized
- ✅ A4: Code quality tools configured (ESLint, Prettier, Husky)
- ✅ Git: Connected to GitHub, initial commit pushed
- ✅ pnpm: Configured as default package manager
- ❌ A1: Environment verification (Node 18+, WeChat DevTools)
- ❌ A2: Automation port launch script
- ⏸️ Dependencies not yet installed - run `pnpm install` before development

**Next Milestones**:
- M1: Basic runnable (Stage B + C1 complete)
- M2: Core tools complete (MiniProgram/Page/Element tools)
- M3: Advanced capabilities (Capabilities, snapshots, recording)
- M4: Quality acceptance (tests, examples, docs)
- M5: Release ready (CI/CD, publish scripts)

## TypeScript Configuration

- Target: ESNext
- Module: ESNext (ESM only, `type: "module"` in package.json)
- moduleResolution: node
- Strict mode enabled
- Path alias: `@/*` → `src/*`

## Handoff & Rotation

**Triggers** (see `.llm/prompts/policy.rotation.md`):
- TTL near (≤30 min remaining)
- Context >80% full
- Awaiting approval gate
- Single task >90 min without completion
- Exception requiring isolation

**Handoff Package**: Generate using `.llm/prompts/handoff.md` template to `.llm/handoff/TASK-*.md`
