/**
 * Example 01: Basic Navigation
 *
 * This example demonstrates the fundamental flow of:
 * 1. Launching a Mini Program
 * 2. Navigating between pages
 * 3. Taking screenshots
 * 4. Disconnecting properly
 *
 * Usage:
 *   export TEST_PROJECT_PATH="/path/to/your/miniprogram"
 *   npx tsx examples/scripts/01-basic-navigation.ts
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

/**
 * Helper function to extract text from tool result
 */
function extractText(result: ToolResult): string {
  return result.content
    .filter((item) => item.type === 'text')
    .map((item) => item.text || '')
    .join('\n')
}

/**
 * Helper function to call a tool
 */
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
  console.log('🚀 Example 01: Basic Navigation')
  console.log('================================\n')

  // Get project path from environment or command line
  const projectPath = process.env.TEST_PROJECT_PATH || process.argv[2]

  if (!projectPath) {
    console.error('❌ Error: TEST_PROJECT_PATH environment variable not set')
    console.error('   Set it with: export TEST_PROJECT_PATH="/path/to/miniprogram"')
    process.exit(1)
  }

  console.log(`📁 Project Path: ${projectPath}`)

  // Parse automation port
  const autoPort = parseInt(process.env.TEST_AUTO_PORT || '9420')
  console.log(`🔌 Automation Port: ${autoPort}\n`)

  // Start MCP Server
  console.log('🔧 Starting MCP Server...')
  const server = await startServer({
    projectPath,
    autoPort,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    enableFileLog: false, // Disable file logging for examples
    enableSessionReport: false, // Disable session reports for examples
  })
  console.log('✅ MCP Server started\n')

  try {
    // Step 1: Launch Mini Program
    console.log('📱 Step 1: Launching Mini Program...')
    const launchResult = await callTool(server, 'automator_launch', {
      projectPath,
      autoPort,
    })

    if (launchResult.isError) {
      console.error('❌ Launch failed:', extractText(launchResult))
      return
    }

    console.log('✅ Launch successful')
    console.log(`   ${extractText(launchResult)}\n`)

    // Wait for launch to complete
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Step 2: Get current page
    console.log('📄 Step 2: Getting current page...')
    const currentPageResult = await callTool(server, 'miniprogram_current_page', {})

    if (currentPageResult.isError) {
      console.error('❌ Get current page failed:', extractText(currentPageResult))
    } else {
      console.log('✅ Current page:', extractText(currentPageResult))
    }
    console.log()

    // Step 3: Navigate to a page
    console.log('🧭 Step 3: Navigating to /pages/index/index...')
    const navigateResult = await callTool(server, 'miniprogram_navigate', {
      url: '/pages/index/index',
    })

    if (navigateResult.isError) {
      console.error('❌ Navigation failed:', extractText(navigateResult))
    } else {
      console.log('✅ Navigation successful')
      console.log(`   ${extractText(navigateResult)}`)
    }
    console.log()

    // Wait for page to load
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Step 4: Take a screenshot
    console.log('📸 Step 4: Taking screenshot...')
    const screenshotResult = await callTool(server, 'miniprogram_screenshot', {
      filename: 'example-01-navigation.png',
    })

    if (screenshotResult.isError) {
      console.error('❌ Screenshot failed:', extractText(screenshotResult))
    } else {
      console.log('✅ Screenshot saved')
      console.log(`   ${extractText(screenshotResult)}`)
    }
    console.log()

    // Step 5: Query page elements
    console.log('🔍 Step 5: Querying page elements...')
    const queryResult = await callTool(server, 'page_query', {
      selector: 'view',
    })

    if (queryResult.isError) {
      console.error('❌ Query failed:', extractText(queryResult))
    } else {
      console.log('✅ Element found')
      const text = extractText(queryResult)
      // Only show first 200 chars to keep output clean
      console.log(`   ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`)
    }
    console.log()

    console.log('✅ All steps completed successfully!')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  } finally {
    // Step 6: Disconnect
    console.log('\n🔌 Step 6: Disconnecting...')
    const disconnectResult = await callTool(server, 'automator_disconnect', {})

    if (disconnectResult.isError) {
      console.error('❌ Disconnect failed:', extractText(disconnectResult))
    } else {
      console.log('✅ Disconnected successfully')
      console.log(`   ${extractText(disconnectResult)}`)
    }
  }

  console.log('\n================================')
  console.log('🎉 Example completed!')
}

// Run the example
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
