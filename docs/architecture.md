# System Architecture - creatoria-miniapp-mcp

> 🏗️ **Purpose**: Enable AI assistants to orchestrate WeChat Mini Program testing through a Model Context Protocol (MCP) server

This document describes the high-level architecture, core components, design decisions, and data flows of the `creatoria-miniapp-mcp` project.

---

## System Overview

### High-Level Architecture

**Architecture Flow**:
```
AI Assistant (Claude) → MCP Client → stdio → MCP Server (this project)
    → miniprogram-automator SDK → WeChat DevTools (port 9420)
    → Mini Program Instance
```

**Key Characteristics**:
- Protocol: Model Context Protocol (MCP) 1.0 via stdio
- Language: TypeScript (ESNext + ESM)
- Tools: 65 tools across 8 categories
- Sessions: Multi-session isolation, 30-min auto-cleanup
- Backend: WeChat official `miniprogram-automator` v0.12.1

---

## Core Components

### 1. MCP Server Layer
**Files**: `src/server.ts`, `src/cli.ts`

Handles MCP protocol communication, tool registration, and lifecycle management.

### 2. Session Management
**File**: `src/core/session.ts`

Multi-session isolation with automatic cleanup. Each session maintains:
- Automator/MiniProgram handles
- Element cache (refId → Element)
- Output directory
- Activity timestamp

### 3. Element Resolution
**File**: `src/core/element-ref.ts`

Unified element location supporting refId, selector, xpath, with caching and invalidation.

### 4. Tool Layer
**Files**: `src/tools/*.ts`

65 tools across 8 categories with Zod validation and modular capabilities loading.

---

## Design Decisions

### ADR-001: stdio Transport Only
- **Why**: Simplicity, security, MCP client compatibility
- **Trade-off**: No remote access (acceptable for local testing)

### ADR-002: Session-Based State
- **Why**: Isolation, resource management, concurrent workflows
- **Trade-off**: 30-min timeout (configurable)

### ADR-003: ElementRef Protocol
- **Why**: Unified API, performance caching, LLM ergonomics
- **Trade-off**: Cache invalidation on page change

### ADR-004: Capabilities System
- **Why**: Modular loading, smaller tool lists, extensibility
- **Trade-off**: Requires documentation

### ADR-005: Zod Validation
- **Why**: Runtime safety, clear errors, type inference
- **Trade-off**: Slight overhead (negligible)

---

## Extension Points

1. **New Tools**: Add to `src/tools/`, register in `index.ts`
2. **Custom Transports**: HTTP/WebSocket support (future)
3. **Session Storage**: Redis/database backends (future)
4. **Output Backends**: S3/cloud storage (future)

---

**Version**: 1.0 | **Updated**: 2025-10-02 | **Status**: Complete (E1.3)
