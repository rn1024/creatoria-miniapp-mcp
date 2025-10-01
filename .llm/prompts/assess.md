# assess.md — 评估/验收（通用）

```yaml
Assess:
  TaskID: {{TASK-ID}}
  DoD_Checklist:
    - {{逐条核对}}
  Evidence:
    - Test_Report: {{路径或链接}}
    - Artifacts: [{{截图/日志/构建产物}}]
    - CI_Status: {{workflow 链接或状态}}
  Regressions: {{有/无}}
  Release_Note: "{{一句话说明}}"
```

**输出**：
- 结论（Pass/Fail + 理由）
- 若 Fail → 返工项，并回到 Atomize
- 同步 `.llm/qa/acceptance.md` 与 `.llm/state.json`
