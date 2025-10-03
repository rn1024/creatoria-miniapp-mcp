#!/usr/bin/env node
/**
 * Auto-generate tool inventory and update README.md
 *
 * This script:
 * 1. Extracts tool definitions from src/tools/index.ts using TypeScript AST
 * 2. Generates markdown tables for each category
 * 3. Updates README.md tool catalog section
 *
 * Features:
 * - Robust: Uses TypeScript Compiler API for accurate parsing
 * - Safe: Handles malformed input gracefully
 * - Fast: Single-pass AST traversal
 *
 * Usage:
 *   pnpm update-readme
 *   or
 *   npx tsx scripts/update-readme.ts
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import * as ts from 'typescript'

// Get script directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

interface Tool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}

interface ToolCategory {
  name: string
  displayName: string
  description: string
  tools: Tool[]
}

/**
 * Category metadata for tool extraction
 */
const CATEGORY_METADATA = {
  AUTOMATOR_TOOLS: {
    displayName: 'Automator',
    description: 'Connection & Lifecycle',
  },
  MINIPROGRAM_TOOLS: {
    displayName: 'MiniProgram',
    description: 'App-Level Operations',
  },
  PAGE_TOOLS: {
    displayName: 'Page',
    description: 'Page-Level Operations',
  },
  ELEMENT_TOOLS: {
    displayName: 'Element',
    description: 'Element-Level Operations',
  },
  ASSERT_TOOLS: {
    displayName: 'Assert',
    description: 'Testing & Verification',
  },
  SNAPSHOT_TOOLS: {
    displayName: 'Snapshot',
    description: 'State Capture & Debugging',
  },
  RECORD_TOOLS: {
    displayName: 'Record',
    description: 'Action Recording & Replay',
  },
  NETWORK_TOOLS: {
    displayName: 'Network',
    description: 'Network Mock & Testing',
  },
} as const

/**
 * Extract string literal value from AST node
 */
function extractStringLiteral(node: ts.Node | undefined): string | null {
  if (!node) return null

  if (ts.isStringLiteral(node)) {
    return node.text
  }

  // Handle template literals or concatenated strings
  if (ts.isTemplateExpression(node) || ts.isTemplateLiteral(node)) {
    // For simplicity, just return the first part
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      return node.text
    }
  }

  return null
}

/**
 * Extract tool object from ObjectLiteralExpression
 */
function extractToolFromObject(objectLiteral: ts.ObjectLiteralExpression): Tool | null {
  let name: string | null = null
  let description: string | null = null

  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) continue

    const propertyName = property.name.getText()

    if (propertyName === 'name') {
      name = extractStringLiteral(property.initializer)
    } else if (propertyName === 'description') {
      description = extractStringLiteral(property.initializer)
    }
  }

  if (name && description) {
    return {
      name,
      description,
      inputSchema: { type: 'object', properties: {}, required: [] },
    }
  }

  return null
}

/**
 * Extract tools from source file using TypeScript AST
 */
function extractToolsFromSource(source: string): ToolCategory[] {
  const categories: ToolCategory[] = []

  // Parse source file with TypeScript compiler
  const sourceFile = ts.createSourceFile(
    'tools.ts',
    source,
    ts.ScriptTarget.Latest,
    true // setParentNodes
  )

  // Traverse AST to find tool array declarations
  function visit(node: ts.Node) {
    // Look for: export const AUTOMATOR_TOOLS: Tool[] = [...]
    if (ts.isVariableStatement(node)) {
      // Check if it has export modifier
      const hasExport = node.modifiers?.some(
        (mod) => mod.kind === ts.SyntaxKind.ExportKeyword
      )

      if (!hasExport) {
        ts.forEachChild(node, visit)
        return
      }

      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue

        const varName = declaration.name.text

        // Check if this is a tool array (e.g., AUTOMATOR_TOOLS)
        if (varName.endsWith('_TOOLS') && varName in CATEGORY_METADATA) {
          const metadata =
            CATEGORY_METADATA[varName as keyof typeof CATEGORY_METADATA]

          // Extract tools from array literal
          if (declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
            const tools: Tool[] = []

            for (const element of declaration.initializer.elements) {
              if (ts.isObjectLiteralExpression(element)) {
                const tool = extractToolFromObject(element)
                if (tool) {
                  tools.push(tool)
                }
              }
            }

            if (tools.length > 0) {
              categories.push({
                name: varName.replace('_TOOLS', ''),
                displayName: metadata.displayName,
                description: metadata.description,
                tools,
              })
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return categories
}

/**
 * Generate markdown table for a category
 */
function generateCategoryMarkdown(category: ToolCategory): string {
  const lines: string[] = []

  lines.push(`### ${category.displayName} (${category.tools.length} tools) - ${category.description}`)
  lines.push('')
  lines.push('| Tool | Description |')
  lines.push('|------|-------------|')

  for (const tool of category.tools) {
    // Convert snake_case to tool.method format for display
    const displayName = tool.name.replace(/_/g, '.')
    lines.push(`| \`${displayName}\` | ${tool.description} |`)
  }

  lines.push('')

  return lines.join('\n')
}

/**
 * Generate full tool catalog section
 */
function generateToolCatalog(categories: ToolCategory[]): string {
  const lines: string[] = []

  // Calculate total tools
  const totalTools = categories.reduce((sum, cat) => sum + cat.tools.length, 0)

  lines.push(`## 🛠️ Tool Catalog (${totalTools} Tools across ${categories.length} Categories)`)
  lines.push('')

  // Generate category sections
  for (const category of categories) {
    lines.push(generateCategoryMarkdown(category))
  }

  // Add footer
  lines.push('---')
  lines.push('')
  lines.push('📚 **Documentation**:')
  lines.push('- [Complete Tool Reference](./docs/tools.md) - Detailed API documentation')
  lines.push('- [Usage Examples](./examples/) - Real-world automation scripts')
  lines.push('- [Integration Tests](./tests/integration/) - End-to-end test scenarios')

  return lines.join('\n')
}

/**
 * Update README.md with new tool catalog
 */
async function updateReadme(toolCatalog: string): Promise<void> {
  const readmePath = join(rootDir, 'README.md')

  let readme = await readFile(readmePath, 'utf-8')

  // Define markers for replacement
  const startMarker = '## 🛠️ Tool Catalog'
  const endMarker = '## 🏗️ 项目结构'

  // Find marker positions
  const startIdx = readme.indexOf(startMarker)
  const endIdx = readme.indexOf(endMarker)

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      'Could not find tool catalog section markers in README.md.\n' +
      'Expected markers:\n' +
      '  - Start: "## 🛠️ Tool Catalog"\n' +
      '  - End: "## 🏗️ 项目结构"'
    )
  }

  // Replace section
  const before = readme.substring(0, startIdx)
  const after = readme.substring(endIdx)

  const updated = before + toolCatalog + '\n\n' + after

  await writeFile(readmePath, updated, 'utf-8')
}

/**
 * Main function
 */
async function main() {
  console.log('🔧 Auto-generating tool inventory...\n')

  // Read tools source
  const toolsPath = join(rootDir, 'src', 'tools', 'index.ts')
  console.log(`📖 Reading tools from: ${toolsPath}`)

  const toolsSource = await readFile(toolsPath, 'utf-8')

  // Extract tools
  console.log('🔍 Extracting tool definitions...')
  const categories = extractToolsFromSource(toolsSource)

  console.log(`✅ Found ${categories.length} categories:\n`)

  let totalTools = 0
  for (const category of categories) {
    console.log(`   - ${category.displayName}: ${category.tools.length} tools`)
    totalTools += category.tools.length
  }

  console.log(`\n📊 Total: ${totalTools} tools\n`)

  // Generate markdown
  console.log('📝 Generating markdown...')
  const toolCatalog = generateToolCatalog(categories)

  // Update README
  console.log('💾 Updating README.md...')
  await updateReadme(toolCatalog)

  console.log('✅ README.md updated successfully!\n')
  console.log('🎉 Tool inventory generation complete!')
}

// Run main function
main().catch((error) => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
