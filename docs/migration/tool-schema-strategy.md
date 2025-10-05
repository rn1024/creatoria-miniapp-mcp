# Tool Schema Strategy

本策略用于规划 Creatoria MiniApp MCP 在迁移阶段的工具 schema 体系，目标是在保持现有 65 个工具可用的前提下，引入可维护、可生成文档的 Zod 驱动流程。

## 目标
- **统一定义**：每个工具的输入/输出同源于 Zod schema，避免 TypeScript 定义、JSON Schema、文档三者漂移。
- **自动产出**：通过 `scripts/generate-tool-schemas.ts` 生成 MCP `inputSchema`，后续扩展类型声明与文档片段，减少手工维护成本。
- **渐进迁移**：保留当前 `src/tools/index.ts` 行为，逐步让工具依赖新 schema，而非一次性重写。

## 模块组织
```
src/
└── capabilities/
    ├── automator/
    │   ├── handlers/              # 现有工具实现（后续迁移）
    │   └── schemas/
    │       ├── launch.ts          # Zod schema 定义
    │       └── index.ts           # 导出所有 automator schema
    ├── miniprogram/
    │   └── schemas/
    ├── ...
    └── schema-registry.ts         # 聚合所有 capability schema
```

- **命名约定**：`<tool-name>.schema.ts` 或在共享情况下使用 `<domain>.shared.ts`。
- **导出格式**：每个 schema 文件导出 `inputSchema`, `outputSchema?`, `ToolMetadata`（含描述、能力标签）。
- **类型复用**：结合 `z.infer<typeof schema>` 声明 TypeScript 类型，供 handlers 引用。

## 运行时集成
1. **Zod 校验**：在 `schema-registry.ts` 中维护 `Record<string, ToolSchema>`，加载时完成 `inputSchema.parse(args)`，替换现有手写校验。
2. **JSON Schema 生成**：新增 `scripts/generate-tool-schemas.ts`，使用 `zod-to-json-schema` 导出 JSON Schema：
   ```ts
   import { zodToJsonSchema } from 'zod-to-json-schema'
   const jsonSchema = zodToJsonSchema(schema, toolName)
   ```
3. **工具注册**：`src/tools/index.ts` 不再声明 `inputSchema`，改为从生成的 `dist/schemas/<tool>.json` 读取或直接从 registry 获取。
4. **构建产物**：在 `pnpm build` 前执行 schema 生成，确保 `dist/` 中包含 JSON schema 与 `.d.ts`。
5. **错误处理**：为每个 schema 注册友好的校验错误格式（例如 `schema.safeParse` + 自定义错误信息）。

## 文档生成流程
- 扩展现有 `scripts/update-readme.ts`：读取 schema registry，输出参数表（字段、类型、必填、描述）。
- 新增 `docs/playbook/tool-reference.md`（自动生成），列出每个工具的入参/出参。
- 通过 `package.json` 增加脚本：
  ```json
  {
    "scripts": {
      "generate:schemas": "tsx scripts/generate-tool-schemas.ts"
    }
  }
  ```
- 在 CI / smoke-test 中插入 `pnpm generate:schemas && pnpm docs:tools`，保证文档与实现同步。

## 渐进落地步骤
1. **阶段一**：引入 schema 目录与 registry（无行为改动），在 `tools/index.ts` 中引入可选的 `useSchemas` flag。
2. **阶段二**：为 Automator 工具编写首批 schema，验证生成脚本；文档仍引用旧结构。
3. **阶段三**：完成所有工具的 schema，切换工具注册逻辑；废弃 legacy JSON schema。
4. **阶段四**：拓展输出 schema、错误定义，并与测试（unit/integration）结合验证。

## 兼容性与风险
- 保留现有 `scripts/update-readme.ts` 行为，直到新脚本产出结果等效。
- 更新依赖需评估包体：`zod-to-json-schema`、可能的 `ts-node`/`tsx` 版本。
- 生成 JSON Schema 时注意 `z.union`、`z.discriminatedUnion` 与 `enum` 的映射，避免客户端解析问题。
- 调整 `SessionStore` 或工具 handler 时，确保 `args` 类型已切换为 schema 导出的类型。

## 开放问题
| 编号 | 问题 | 负责人 | 备注 |
|------|------|--------|------|
| Q1 | 是否需要为所有工具定义输出 schema，还是仅在需要结构化响应时启用？ | Maintainers | 当前 MCP 仅要求输入校验，但输出 schema 有助于客户端推断类型。 |
| Q2 | JSON Schema 存储位置选择：保存在 `dist/schemas/` 还是内嵌到构建产物？ | Maintainers | 影响发布包体积与消费方式。 |
| Q3 | 是否需要向后兼容旧 JSON schema 导出的文档格式？ | Docs Owner | 现有 README 表格依赖固定格式，需要确认迁移策略。 |

## 下一步
- 评审此策略并确认落地顺序。
- 在 TC-DOCS-04 中更新文档导航，提示 schema 目录及脚本位置。
- 进入下一阶段前，为 Automator 工具起草首个 schema 示例，验证生成脚本可行性。
