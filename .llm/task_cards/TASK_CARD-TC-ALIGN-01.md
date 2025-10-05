# TASK_CARD TC-ALIGN-01 · Migration Scope Alignment

## Goal
Document the agreed scope, constraints, and priorities for the Creatoria MiniApp MCP migration so every contributor shares the same baseline.

## Dependencies
- None

## Suggested Steps
1. Review `docs/directory-structure-and-code-style-best-practices.md` and highlight the sections that will be executed in the first migration cycle.
2. Confirm the systems that must stay stable during the restructure (CLI entry points, published artifacts, existing automation scripts).
3. Capture open questions or assumptions that need stakeholder confirmation.
4. Summarize decisions in `docs/migration/TC-ALIGN-01-notes.md` (create the directory if missing).

## Completion Criteria
- Decisions around scope, stability requirements, and immediate priorities are recorded in the notes file.
- Outstanding questions are listed with an owner or follow-up action.
- The summary avoids references to external tool chains beyond Creatoria MiniApp MCP itself.

## 6A Guidance
- **Align**: Validate the goals with stakeholders before locking the summary.
- **Architect**: Sketch the high-level directory and module boundaries informed by the best-practice doc.
- **Atomize**: Ensure follow-up work is expressed as actionable task candidates.
- **Approve**: Share the notes for review prior to execution.
- **Automate**: Reference existing scripts or plan new automation for repetitive work.
- **Assess**: Revisit the card once feedback is incorporated to confirm readiness for the next card.
