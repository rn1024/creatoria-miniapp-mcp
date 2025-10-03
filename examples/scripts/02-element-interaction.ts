/**
 * Example 02: Element Interaction
 *
 * This example demonstrates how to:
 * 1. Query elements by selector
 * 2. Get element properties (text, attributes, size, etc.)
 * 3. Click/tap elements
 * 4. Input text into fields
 * 5. Scroll to elements
 *
 * Usage:
 *   export TEST_PROJECT_PATH="/path/to/your/miniprogram"
 *   npx tsx examples/scripts/02-element-interaction.ts
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
  console.log('🎯 Example 02: Element Interaction')
  console.log('===================================\n')

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

    // Step 1: Query an element and get its refId
    console.log('🔍 Step 1: Querying element with save=true...')
    const queryResult = await callTool(server, 'page_query', {
      selector: 'view',
      save: true, // Save element reference
    })

    if (queryResult.isError) {
      console.error('❌ Query failed:', extractText(queryResult))
      return
    }

    const queryText = extractText(queryResult)
    console.log('✅ Element found and saved')

    // Extract refId from result (format: "refId: xxx")
    const refIdMatch = queryText.match(/refId[:\s]+([a-zA-Z0-9-]+)/)
    const refId = refIdMatch ? refIdMatch[1] : null

    if (refId) {
      console.log(`   RefId: ${refId}`)
    }
    console.log()

    // Step 2: Get element text
    console.log('📝 Step 2: Getting element text...')
    const textResult = await callTool(server, 'element_get_text', {
      selector: 'view', // Can use selector or refId
    })

    if (!textResult.isError) {
      const text = extractText(textResult)
      console.log('✅ Element text:', text.substring(0, 100))
    } else {
      console.log('⚠️  No text content or element not found')
    }
    console.log()

    // Step 3: Get element attribute
    console.log('🏷️  Step 3: Getting element class attribute...')
    const attrResult = await callTool(server, 'element_get_attribute', {
      selector: 'view',
      name: 'class',
    })

    if (!attrResult.isError) {
      console.log('✅ Class attribute:', extractText(attrResult))
    } else {
      console.log('⚠️  No class attribute')
    }
    console.log()

    // Step 4: Get element size and position
    console.log('📏 Step 4: Getting element size and position...')
    const sizeResult = await callTool(server, 'element_get_size', {
      selector: 'view',
    })

    if (!sizeResult.isError) {
      console.log('✅ Element size:', extractText(sizeResult))
    }

    const offsetResult = await callTool(server, 'element_get_offset', {
      selector: 'view',
    })

    if (!offsetResult.isError) {
      console.log('✅ Element offset:', extractText(offsetResult))
    }
    console.log()

    // Step 5: Try to find and click a button
    console.log('🖱️  Step 5: Finding and clicking a button...')
    const buttonResult = await callTool(server, 'page_query', {
      selector: 'button',
      save: true,
    })

    if (!buttonResult.isError) {
      const buttonText = extractText(buttonResult)
      const buttonRefIdMatch = buttonText.match(/refId[:\s]+([a-zA-Z0-9-]+)/)
      const buttonRefId = buttonRefIdMatch ? buttonRefIdMatch[1] : null

      if (buttonRefId) {
        console.log(`✅ Button found (refId: ${buttonRefId})`)

        const tapResult = await callTool(server, 'element_tap', {
          refId: buttonRefId,
        })

        if (!tapResult.isError) {
          console.log('✅ Button tapped successfully')
          console.log(`   ${extractText(tapResult)}`)
        } else {
          console.error('❌ Tap failed:', extractText(tapResult))
        }
      }
    } else {
      console.log('⚠️  No button found on this page')
    }
    console.log()

    // Step 6: Try to find and fill an input
    console.log('⌨️  Step 6: Finding and filling an input...')
    const inputResult = await callTool(server, 'page_query', {
      selector: 'input',
      save: true,
    })

    if (!inputResult.isError) {
      const inputText = extractText(inputResult)
      const inputRefIdMatch = inputText.match(/refId[:\s]+([a-zA-Z0-9-]+)/)
      const inputRefId = inputRefIdMatch ? inputRefIdMatch[1] : null

      if (inputRefId) {
        console.log(`✅ Input found (refId: ${inputRefId})`)

        // Input text
        const inputValResult = await callTool(server, 'element_input', {
          refId: inputRefId,
          value: 'Hello from MCP automation!',
        })

        if (!inputValResult.isError) {
          console.log('✅ Text input successfully')
          console.log(`   ${extractText(inputValResult)}`)

          // Get the value back to verify
          const valueResult = await callTool(server, 'element_get_value', {
            refId: inputRefId,
          })

          if (!valueResult.isError) {
            console.log('✅ Verified input value:', extractText(valueResult))
          }
        } else {
          console.error('❌ Input failed:', extractText(inputValResult))
        }
      }
    } else {
      console.log('⚠️  No input found on this page')
    }
    console.log()

    // Step 7: Scroll to an element
    console.log('📜 Step 7: Scrolling to element...')
    const scrollResult = await callTool(server, 'element_scroll_to', {
      selector: 'view',
    })

    if (!scrollResult.isError) {
      console.log('✅ Scrolled to element')
    } else {
      console.log('⚠️  Scroll not needed (element already in viewport)')
    }
    console.log()

    console.log('✅ All interaction steps completed!')
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
