# TASK_CARD TC-SCHEMA-03 · Tool Schema Strategy

## Goal
Design the schema-driven tool metadata workflow (validation, JSON schema export, documentation sync) tailored to Creatoria MiniApp MCP.

## Dependencies
- TC-ALIGN-01 scope notes available.
- TC-STRUCT-02 stubs in place.

## Suggested Steps
1. Inventory current tool definitions under `src/tools/` and note shared input/output patterns.
2. Propose Zod (or equivalent) schema modules per capability, including naming conventions and file placement inside `src/capabilities/*/schemas`.
3. Outline the automation pipeline for generating JSON schema and documentation (script entry point, output targets, integration with `package.json` scripts).
4. Capture the plan in `docs/migration/tool-schema-strategy.md`, including open questions (e.g., backward compatibility for existing clients).

## Completion Criteria
- A reviewed document describing schema modules, generation workflow, and rollout order.
- Identified impacts on type definitions and distribution artifacts.
- No code changes required yet; deliverable is the approved strategy doc.

## 6A Guidance
- **Align**: Validate compatibility expectations with maintainers.
- **Architect**: Diagram the data flow from schema definition to generated artifacts.
- **Atomize**: Separate immediate document updates from future scripting work.
- **Approve**: Share the strategy document for sign-off before implementation.
- **Automate**: Specify how scripts will be wired into continuous integration.
- **Assess**: Ensure reviewers’ feedback is tracked, then mark the card complete.
