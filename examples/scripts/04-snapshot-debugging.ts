/**
 * Example 04: Snapshot Debugging
 *
 * This example demonstrates how to:
 * 1. Capture page snapshots (JSON + screenshot)
 * 2. Capture full app snapshots
 * 3. Capture element-specific snapshots
 * 4. Use snapshots for debugging
 * 5. Export test evidence
 *
 * Usage:
 *   export TEST_PROJECT_PATH="/path/to/your/miniprogram"
 *   npx tsx examples/scripts/04-snapshot-debugging.ts
 */

import { startServer } from '../../src/server.js'
import type { Server } from '@modelcontextprotocol/sdk/server/index.js'

interface ToolResult {
  content: Array<{
    type: string
    text?: string
    [key: string]: unknown
  }>
  isError?: boolean
}

function extractText(result: ToolResult): string {
  return result.content
    .filter((item) => item.type === 'text')
    .map((item) => item.text || '')
    .join('\n')
}

async function callTool(
  server: Server,
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  try {
    const result = await server.callTool({
      params: {
        name: toolName,
        arguments: args,
      },
      meta: {
        progressToken: undefined,
      },
    })

    return result as ToolResult
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: error instanceof Error ? error.message : String(error),
        },
      ],
      isError: true,
    }
  }
}

async function main() {
  console.log('📸 Example 04: Snapshot Debugging')
  console.log('===================================\n')

  const projectPath = process.env.TEST_PROJECT_PATH || process.argv[2]

  if (!projectPath) {
    console.error('❌ Error: TEST_PROJECT_PATH environment variable not set')
    process.exit(1)
  }

  console.log(`📁 Project Path: ${projectPath}\n`)

  // Start MCP Server with snapshot features enabled
  console.log('🔧 Starting MCP Server...')
  const server = await startServer({
    projectPath,
    autoPort: parseInt(process.env.TEST_AUTO_PORT || '9420'),
    sessionTimeout: 30 * 60 * 1000,
    enableFileLog: false,
    enableSessionReport: false,
    // Snapshots are always available regardless of these settings
  })
  console.log('✅ MCP Server started\n')

  try {
    // Launch and navigate
    console.log('📱 Launching Mini Program...')
    await callTool(server, 'automator_launch', {
      projectPath,
      autoPort: parseInt(process.env.TEST_AUTO_PORT || '9420'),
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log('🧭 Navigating to /pages/index/index...')
    await callTool(server, 'miniprogram_navigate', {
      url: '/pages/index/index',
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log()

    // Step 1: Take a simple screenshot
    console.log('📸 Step 1: Taking basic screenshot...')
    const screenshotResult = await callTool(server, 'miniprogram_screenshot', {
      filename: 'debug-01-initial-state.png',
    })

    if (!screenshotResult.isError) {
      console.log('✅ Screenshot saved')
      console.log(`   ${extractText(screenshotResult)}`)
    } else {
      console.error('❌ Screenshot failed:', extractText(screenshotResult))
    }
    console.log()

    // Step 2: Capture page snapshot with screenshot
    console.log('📊 Step 2: Capturing page snapshot (JSON + PNG)...')
    const pageSnapshotResult = await callTool(server, 'snapshot_page', {
      filename: 'debug-02-page-snapshot.json',
      includeScreenshot: true,
    })

    if (!pageSnapshotResult.isError) {
      console.log('✅ Page snapshot saved')
      console.log(`   ${extractText(pageSnapshotResult)}`)
      console.log('   Snapshot includes:')
      console.log('   - Page structure (JSON)')
      console.log('   - Page data')
      console.log('   - Screenshot (PNG)')
    } else {
      console.error('❌ Page snapshot failed:', extractText(pageSnapshotResult))
    }
    console.log()

    // Step 3: Capture full app snapshot
    console.log('🌐 Step 3: Capturing full app snapshot...')
    const fullSnapshotResult = await callTool(server, 'snapshot_full', {
      filename: 'debug-03-full-app-snapshot.json',
      includeScreenshot: true,
    })

    if (!fullSnapshotResult.isError) {
      console.log('✅ Full app snapshot saved')
      console.log(`   ${extractText(fullSnapshotResult)}`)
      console.log('   Snapshot includes:')
      console.log('   - All pages in stack')
      console.log('   - App global data')
      console.log('   - System information')
      console.log('   - Screenshot (PNG)')
    } else {
      console.error('❌ Full snapshot failed:', extractText(fullSnapshotResult))
    }
    console.log()

    // Step 4: Capture element-specific snapshot
    console.log('🎯 Step 4: Capturing element snapshot...')

    // First find an element
    const queryResult = await callTool(server, 'page_query', {
      selector: 'view',
      save: true,
    })

    if (!queryResult.isError) {
      console.log('✅ Element found')

      const elementSnapshotResult = await callTool(server, 'snapshot_element', {
        selector: 'view',
        filename: 'debug-04-element-snapshot.json',
        includeScreenshot: true,
      })

      if (!elementSnapshotResult.isError) {
        console.log('✅ Element snapshot saved')
        console.log(`   ${extractText(elementSnapshotResult)}`)
        console.log('   Snapshot includes:')
        console.log('   - Element properties')
        console.log('   - Element size and position')
        console.log('   - Element screenshot (PNG)')
      } else {
        console.error('❌ Element snapshot failed:', extractText(elementSnapshotResult))
      }
    } else {
      console.log('⚠️  No element found for snapshot')
    }
    console.log()

    // Step 5: Snapshot without screenshot (faster)
    console.log('⚡ Step 5: Capturing fast snapshot (no screenshot)...')
    const fastSnapshotResult = await callTool(server, 'snapshot_page', {
      filename: 'debug-05-fast-snapshot.json',
      includeScreenshot: false, // Skip screenshot for speed
    })

    if (!fastSnapshotResult.isError) {
      console.log('✅ Fast snapshot saved (JSON only)')
      console.log(`   ${extractText(fastSnapshotResult)}`)
      console.log('   Use this when you only need page data, not visuals')
    } else {
      console.error('❌ Fast snapshot failed:', extractText(fastSnapshotResult))
    }
    console.log()

    // Step 6: Demonstrate debugging workflow
    console.log('🔍 Step 6: Debugging workflow example...')
    console.log('   Scenario: Verify element exists before interacting')
    console.log()

    // 6a. Take before snapshot
    console.log('   6a. Take "before" snapshot...')
    await callTool(server, 'snapshot_page', {
      filename: 'debug-06a-before-interaction.json',
      includeScreenshot: true,
    })
    console.log('   ✅ Before snapshot saved')

    // 6b. Try to interact with element
    console.log('   6b. Attempt to click button...')
    const tapResult = await callTool(server, 'element_tap', {
      selector: 'button',
    })

    if (tapResult.isError) {
      console.log('   ❌ Click failed (expected - demonstrating error capture)')
      console.log(`      Error: ${extractText(tapResult)}`)

      // 6c. Take failure snapshot
      console.log('   6c. Take "failure" snapshot for debugging...')
      await callTool(server, 'snapshot_page', {
        filename: 'debug-06c-failure-snapshot.json',
        includeScreenshot: true,
      })
      console.log('   ✅ Failure snapshot saved')
      console.log('      Use this to analyze why the interaction failed')
    } else {
      console.log('   ✅ Click succeeded')

      // 6d. Take success snapshot
      console.log('   6d. Take "after" snapshot...')
      await callTool(server, 'snapshot_page', {
        filename: 'debug-06d-after-interaction.json',
        includeScreenshot: true,
      })
      console.log('   ✅ After snapshot saved')
    }
    console.log()

    // Summary
    console.log('📋 Snapshot Files Summary')
    console.log('========================')
    console.log('All snapshots saved to: .mcp-artifacts/<session-id>/')
    console.log()
    console.log('Files created:')
    console.log('  1. debug-01-initial-state.png')
    console.log('  2. debug-02-page-snapshot.json + .png')
    console.log('  3. debug-03-full-app-snapshot.json + .png')
    console.log('  4. debug-04-element-snapshot.json + .png')
    console.log('  5. debug-05-fast-snapshot.json (no PNG)')
    console.log('  6. debug-06a-before-interaction.json + .png')
    console.log('  7. debug-06c-failure-snapshot.json + .png')
    console.log()
    console.log('💡 Tips:')
    console.log('  - Use includeScreenshot: false for faster snapshots')
    console.log('  - Take before/after snapshots to track changes')
    console.log('  - Capture failure snapshots for debugging')
    console.log('  - Element snapshots focus on specific UI components')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  } finally {
    console.log('\n🔌 Disconnecting...')
    await callTool(server, 'automator_disconnect', {})
    console.log('✅ Disconnected')
  }

  console.log('\n===================================')
  console.log('🎉 Example completed!')
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
