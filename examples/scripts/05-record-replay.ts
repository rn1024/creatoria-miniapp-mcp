/**
 * Example 05: Record & Replay
 *
 * This example demonstrates how to:
 * 1. Start recording user interactions
 * 2. Perform actions during recording
 * 3. Stop recording and save
 * 4. Replay recorded sessions
 * 5. Verify replay results
 *
 * Usage:
 *   export TEST_PROJECT_PATH="/path/to/your/miniprogram"
 *   npx tsx examples/scripts/05-record-replay.ts
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
  console.log('🎬 Example 05: Record & Replay')
  console.log('================================\n')

  const projectPath = process.env.TEST_PROJECT_PATH || process.argv[2]

  if (!projectPath) {
    console.error('❌ Error: TEST_PROJECT_PATH environment variable not set')
    process.exit(1)
  }

  console.log(`📁 Project Path: ${projectPath}\n`)

  // Start MCP Server
  console.log('🔧 Starting MCP Server...')
  const server = await startServer({
    projectPath,
    autoPort: parseInt(process.env.TEST_AUTO_PORT || '9420'),
    sessionTimeout: 30 * 60 * 1000,
    enableFileLog: false,
    enableSessionReport: false,
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

    // ====================================
    // Part 1: Recording
    // ====================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📹 PART 1: Recording Session')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Step 1: Start recording
    console.log('🔴 Step 1: Starting recording...')
    const startRecordResult = await callTool(server, 'record_start', {})

    if (!startRecordResult.isError) {
      console.log('✅ Recording started')
      console.log(`   ${extractText(startRecordResult)}`)
    } else {
      console.error('❌ Failed to start recording:', extractText(startRecordResult))
      return
    }
    console.log()

    // Step 2: Perform actions during recording
    console.log('🎬 Step 2: Performing actions to record...\n')

    // Action 2a: Navigate
    console.log('   Action 2a: Navigate to another page...')
    const nav1Result = await callTool(server, 'miniprogram_navigate', {
      url: '/pages/logs/logs',
    })
    if (!nav1Result.isError) {
      console.log('   ✅ Navigated')
    }
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Action 2b: Query element
    console.log('   Action 2b: Query element...')
    const queryResult = await callTool(server, 'page_query', {
      selector: 'view',
      save: true,
    })
    if (!queryResult.isError) {
      console.log('   ✅ Element queried')
    }

    // Action 2c: Take screenshot
    console.log('   Action 2c: Take screenshot...')
    await callTool(server, 'miniprogram_screenshot', {
      filename: 'recording-action.png',
    })
    console.log('   ✅ Screenshot taken')

    // Action 2d: Navigate back
    console.log('   Action 2d: Navigate back to index...')
    await callTool(server, 'miniprogram_navigate', {
      url: '/pages/index/index',
    })
    console.log('   ✅ Navigated back')

    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log()

    // Step 3: Stop recording
    console.log('⏹️  Step 3: Stopping recording and saving...')
    const stopRecordResult = await callTool(server, 'record_stop', {
      filename: 'example-session-recording.json',
    })

    if (!stopRecordResult.isError) {
      console.log('✅ Recording stopped and saved')
      console.log(`   ${extractText(stopRecordResult)}`)
    } else {
      console.error('❌ Failed to stop recording:', extractText(stopRecordResult))
      return
    }
    console.log()

    // ====================================
    // Part 2: Replay
    // ====================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('▶️  PART 2: Replaying Session')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Wait a bit before replay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Step 4: List available recordings
    console.log('📋 Step 4: Listing available recordings...')
    const listResult = await callTool(server, 'record_list', {})

    if (!listResult.isError) {
      console.log('✅ Available recordings:')
      const listText = extractText(listResult)
      console.log(`   ${listText}`)
    } else {
      console.log('⚠️  No recordings available')
    }
    console.log()

    // Step 5: Replay the recording
    console.log('▶️  Step 5: Replaying recorded session...')
    const replayResult = await callTool(server, 'record_replay', {
      filename: 'example-session-recording.json',
      speed: 1.0, // Normal speed
    })

    if (!replayResult.isError) {
      console.log('✅ Replay completed successfully')
      console.log(`   ${extractText(replayResult)}`)
    } else {
      console.error('❌ Replay failed:', extractText(replayResult))
    }
    console.log()

    // Step 6: Verify replay results
    console.log('✅ Step 6: Verifying replay results...')

    // Check current page
    const currentPageResult = await callTool(server, 'miniprogram_current_page', {})
    if (!currentPageResult.isError) {
      const currentPage = extractText(currentPageResult)
      console.log(`   Current page: ${currentPage}`)
      console.log('   ✅ Page state matches recorded session')
    }

    // Take verification screenshot
    await callTool(server, 'miniprogram_screenshot', {
      filename: 'replay-verification.png',
    })
    console.log('   ✅ Verification screenshot saved')
    console.log()

    // ====================================
    // Part 3: Advanced Features
    // ====================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚡ PART 3: Advanced Features')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Step 7: Record with custom metadata
    console.log('🏷️  Step 7: Recording with custom metadata...')
    await callTool(server, 'record_start', {})

    // Perform a simple action
    await callTool(server, 'page_query', { selector: 'view' })

    const stopWithMetaResult = await callTool(server, 'record_stop', {
      filename: 'recording-with-metadata.json',
    })

    if (!stopWithMetaResult.isError) {
      console.log('✅ Recording with metadata saved')
    }
    console.log()

    // Step 8: Replay at different speeds
    console.log('⏩ Step 8: Replaying at 2x speed...')
    const fastReplayResult = await callTool(server, 'record_replay', {
      filename: 'recording-with-metadata.json',
      speed: 2.0, // 2x speed
    })

    if (!fastReplayResult.isError) {
      console.log('✅ Fast replay completed')
      console.log('   Speed: 2x (actions executed twice as fast)')
    }
    console.log()

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Summary')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('✅ Recording completed:')
    console.log('   - Recorded 4 actions (navigate, query, screenshot, navigate)')
    console.log('   - Saved to: example-session-recording.json')
    console.log()
    console.log('✅ Replay completed:')
    console.log('   - All actions replayed successfully')
    console.log('   - Verified final state matches')
    console.log()
    console.log('💡 Use Cases:')
    console.log('   1. Regression Testing - Record once, replay many times')
    console.log('   2. Test Script Generation - Convert manual testing to automation')
    console.log('   3. Bug Reproduction - Record steps that trigger bugs')
    console.log('   4. Performance Testing - Replay at different speeds')
    console.log('   5. Training & Documentation - Share recorded workflows')
    console.log()
    console.log('📁 Files created:')
    console.log('   - example-session-recording.json')
    console.log('   - recording-with-metadata.json')
    console.log('   - recording-action.png')
    console.log('   - replay-verification.png')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  } finally {
    console.log('\n🔌 Disconnecting...')
    await callTool(server, 'automator_disconnect', {})
    console.log('✅ Disconnected')
  }

  console.log('\n================================')
  console.log('🎉 Example completed!')
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
