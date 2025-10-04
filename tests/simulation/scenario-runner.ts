#!/usr/bin/env npx tsx
/**
 * Scenario Runner
 *
 * Runs AI simulation scenarios from JSON configuration
 *
 * Usage:
 *   npx tsx tests/simulation/scenario-runner.ts [scenario-id]
 *   npx tsx tests/simulation/scenario-runner.ts all
 *   npx tsx tests/simulation/scenario-runner.ts basic-navigation
 */

import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { StdioMCPClient } from './helpers/stdio-mcp-client.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface ScenarioStep {
  tool: string
  args: Record<string, unknown>
  aiReasoning: string
}

interface Scenario {
  id: string
  name: string
  description: string
  userMessage: string
  steps: ScenarioStep[]
}

interface ScenariosConfig {
  scenarios: Scenario[]
}

/**
 * Load scenarios from JSON file
 */
async function loadScenarios(): Promise<Scenario[]> {
  const scenariosPath = join(__dirname, 'scenarios.json')
  const content = await readFile(scenariosPath, 'utf-8')
  const config: ScenariosConfig = JSON.parse(content)
  return config.scenarios
}

/**
 * Run a single scenario
 */
async function runScenario(scenario: Scenario, client: StdioMCPClient): Promise<boolean> {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📋 Scenario: ${scenario.name}`)
  console.log(`📝 Description: ${scenario.description}`)
  console.log(`${'='.repeat(80)}\n`)

  console.log(`👤 User: "${scenario.userMessage}"\n`)

  let stepNumber = 1
  const results: Array<{ step: number; tool: string; success: boolean; error?: string }> = []

  for (const step of scenario.steps) {
    try {
      console.log(`\n🧠 AI Thinking (Step ${stepNumber}/${scenario.steps.length}):`)
      console.log(`   💭 ${step.aiReasoning}`)
      console.log(`   🔧 Tool: ${step.tool}`)
      console.log(`   📥 Args: ${JSON.stringify(step.args, null, 2)}`)

      const result = await client.callTool(step.tool, step.args)

      console.log(`   ✅ Success`)
      console.log(`   📤 Result: ${JSON.stringify(result, null, 2).substring(0, 200)}...`)

      results.push({ step: stepNumber, tool: step.tool, success: true })
      stepNumber++

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log(`   ❌ Failed: ${errorMessage}`)

      results.push({
        step: stepNumber,
        tool: step.tool,
        success: false,
        error: errorMessage,
      })

      console.log(`\n⚠️  Scenario failed at step ${stepNumber}`)
      return false
    }
  }

  console.log(`\n✅ Scenario completed successfully!`)
  console.log(`\n📊 Summary:`)
  console.log(`   - Total steps: ${results.length}`)
  console.log(`   - Successful: ${results.filter(r => r.success).length}`)
  console.log(`   - Failed: ${results.filter(r => !r.success).length}`)

  return results.every(r => r.success)
}

/**
 * Main function
 */
async function main() {
  const scenarioId = process.argv[2] || 'all'

  console.log('🎭 AI Scenario Runner\n')

  // Load scenarios
  const scenarios = await loadScenarios()
  console.log(`📚 Loaded ${scenarios.length} scenarios\n`)

  // Filter scenarios
  const toRun =
    scenarioId === 'all'
      ? scenarios
      : scenarios.filter(s => s.id === scenarioId)

  if (toRun.length === 0) {
    console.error(`❌ Scenario "${scenarioId}" not found`)
    console.log('\n📋 Available scenarios:')
    scenarios.forEach(s => {
      console.log(`   - ${s.id}: ${s.name}`)
    })
    process.exit(1)
  }

  // Connect to MCP
  const client = new StdioMCPClient()
  await client.connect()
  console.log('✅ Connected to MCP server\n')

  // Run scenarios
  const results: Array<{ scenario: string; success: boolean }> = []

  for (const scenario of toRun) {
    const success = await runScenario(scenario, client)
    results.push({ scenario: scenario.id, success })
  }

  // Cleanup
  await client.disconnect()
  console.log('\n✅ Disconnected from MCP server\n')

  // Final summary
  console.log(`\n${'='.repeat(80)}`)
  console.log('📈 Final Results')
  console.log(`${'='.repeat(80)}\n`)

  results.forEach(r => {
    const icon = r.success ? '✅' : '❌'
    console.log(`${icon} ${r.scenario}`)
  })

  const successCount = results.filter(r => r.success).length
  const totalCount = results.length

  console.log(`\n📊 Overall: ${successCount}/${totalCount} scenarios passed`)

  if (successCount === totalCount) {
    console.log('\n🎉 All scenarios passed!')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some scenarios failed')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error)
  process.exit(1)
})
