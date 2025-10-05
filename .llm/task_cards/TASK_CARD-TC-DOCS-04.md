# TASK_CARD TC-DOCS-04 · Documentation Alignment

## Goal
Refresh contributor-facing documentation so it reflects the migration plan and removes outdated context.

## Dependencies
- TC-ALIGN-01 summary approved.
- Draft plans from TC-STRUCT-02 and TC-SCHEMA-03 available.

## Suggested Steps
1. Audit `docs/` for stale references or obsolete metrics and list required updates.
2. Update `README.md` and `docs/directory-structure-and-code-style-best-practices.md` to emphasize Creatoria MiniApp MCP context only.
3. Add a `docs/migration/README.md` that links the new planning materials and task cards.
4. Confirm language consistency (Chinese/English) and align terminology across docs.

## Completion Criteria
- Key docs no longer reference unrelated projects or tooling.
- Migration overview page added and linked from the main README if appropriate.
- Documentation changes reviewed and accepted by maintainers.

## 6A Guidance
- **Align**: Validate documentation scope with stakeholders.
- **Architect**: Sketch the documentation navigation before editing content.
- **Atomize**: Commit related doc updates in focused batches for easier review.
- **Approve**: Route significant wording changes for human review.
- **Automate**: Leverage markdown linting or spell-check scripts if available.
- **Assess**: Perform a documentation walkthrough to ensure consistency before closure.
