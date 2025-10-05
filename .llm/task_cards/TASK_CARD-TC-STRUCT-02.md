# TASK_CARD TC-STRUCT-02 · Runtime Skeleton Setup

## Goal
Introduce the new `src/app`, `src/runtime`, and `src/capabilities` skeleton without altering existing behavior, enabling gradual migration.

## Dependencies
- TC-ALIGN-01 decisions approved.

## Suggested Steps
1. Create placeholder directories and index files mirroring the target layout while keeping the current exports intact.
2. Add re-export stubs so current imports (e.g., `src/server.ts`, `src/tools/index.ts`) continue working.
3. Document the mapping from old paths to the new skeleton inside `docs/migration/runtime-skeleton.md`.
4. Run `pnpm lint && pnpm typecheck` to ensure no regressions are introduced.

## Completion Criteria
- New directories exist with placeholder files and pass lint/typecheck.
- No runtime behavior change; existing entry points continue to compile.
- Mapping documentation is committed for reviewers.

## 6A Guidance
- **Align**: Reconfirm the scope limits before editing files.
- **Architect**: Draw the module transition diagram before creating files.
- **Atomize**: Keep changes incremental (directory creation, re-exports, documentation) to simplify review.
- **Approve**: Request review once stubs and docs are ready.
- **Automate**: Use npm scripts rather than manual compilation for verification.
- **Assess**: Double-check lint/typecheck output and update the task status accordingly.
