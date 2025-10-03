/**
 * Example 03: Assertion Testing
 *
 * This example demonstrates how to:
 * 1. Assert element existence
 * 2. Assert element visibility
 * 3. Assert text content
 * 4. Assert attributes
 * 5. Handle assertion failures
 *
 * Usage:
 *   export TEST_PROJECT_PATH="/path/to/your/miniprogram"
 *   npx tsx examples/scripts/03-assertion-testing.ts
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
  console.log('✅ Example 03: Assertion Testing')
  console.log('=================================\n')

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

  let passedAssertions = 0
  let failedAssertions = 0

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

    // Step 1: Assert element exists
    console.log('🔍 Step 1: Assert element exists...')
    const existsResult = await callTool(server, 'assert_exists', {
      selector: 'view',
    })

    if (!existsResult.isError) {
      console.log('✅ PASS:', extractText(existsResult))
      passedAssertions++
    } else {
      console.error('❌ FAIL:', extractText(existsResult))
      failedAssertions++
    }
    console.log()

    // Step 2: Assert element does not exist (should pass for non-existent selector)
    console.log('🔍 Step 2: Assert non-existent element...')
    const notExistsResult = await callTool(server, 'assert_not_exists', {
      selector: '.this-element-should-not-exist-12345',
    })

    if (!notExistsResult.isError) {
      console.log('✅ PASS:', extractText(notExistsResult))
      passedAssertions++
    } else {
      console.error('❌ FAIL:', extractText(notExistsResult))
      failedAssertions++
    }
    console.log()

    // Step 3: Assert element visibility
    console.log('👁️  Step 3: Assert element visibility...')
    const visibleResult = await callTool(server, 'assert_visible', {
      selector: 'view',
    })

    if (!visibleResult.isError) {
      console.log('✅ PASS:', extractText(visibleResult))
      passedAssertions++
    } else {
      console.error('❌ FAIL:', extractText(visibleResult))
      failedAssertions++
    }
    console.log()

    // Step 4: Assert text contains (first get some text)
    console.log('📝 Step 4: Assert text contains...')

    // First, get the element's text
    const textResult = await callTool(server, 'element_get_text', {
      selector: 'view',
    })

    if (!textResult.isError) {
      const actualText = extractText(textResult)
      console.log(`   Actual text: "${actualText.substring(0, 50)}..."`)

      if (actualText && actualText.length > 0) {
        // Use first word from actual text for assertion
        const firstWord = actualText.split(/\s+/)[0]

        if (firstWord) {
          const containsResult = await callTool(server, 'assert_text_contains', {
            selector: 'view',
            expected: firstWord,
          })

          if (!containsResult.isError) {
            console.log('✅ PASS:', extractText(containsResult))
            passedAssertions++
          } else {
            console.error('❌ FAIL:', extractText(containsResult))
            failedAssertions++
          }
        } else {
          console.log('⚠️  SKIP: No text content to verify')
        }
      } else {
        console.log('⚠️  SKIP: Element has no text content')
      }
    } else {
      console.log('⚠️  SKIP: Could not get element text')
    }
    console.log()

    // Step 5: Intentional assertion failure (to demonstrate error handling)
    console.log('❗ Step 5: Demonstrating assertion failure...')
    const failResult = await callTool(server, 'assert_text', {
      selector: 'view',
      expected: 'THIS_TEXT_WILL_NEVER_MATCH_12345',
    })

    if (failResult.isError) {
      console.log('✅ Expected failure occurred:', extractText(failResult))
      console.log('   (This is correct - the assertion should fail)')
      passedAssertions++ // Count this as "expected"
    } else {
      console.error('❌ Unexpected pass - this should have failed!')
      failedAssertions++
    }
    console.log()

    // Step 6: Assert attribute value
    console.log('🏷️  Step 6: Assert attribute value...')

    // First check if element has class attribute
    const attrResult = await callTool(server, 'element_get_attribute', {
      selector: 'view',
      name: 'class',
    })

    if (!attrResult.isError) {
      const attrValue = extractText(attrResult)
      console.log(`   Actual class: "${attrValue}"`)

      if (attrValue && attrValue.length > 0) {
        const assertAttrResult = await callTool(server, 'assert_attribute', {
          selector: 'view',
          name: 'class',
          expected: attrValue, // Use actual value
        })

        if (!assertAttrResult.isError) {
          console.log('✅ PASS:', extractText(assertAttrResult))
          passedAssertions++
        } else {
          console.error('❌ FAIL:', extractText(assertAttrResult))
          failedAssertions++
        }
      } else {
        console.log('⚠️  SKIP: No class attribute to verify')
      }
    } else {
      console.log('⚠️  SKIP: Element has no class attribute')
    }
    console.log()

    // Step 7: Assert element count
    console.log('🔢 Step 7: Assert element count...')
    const countResult = await callTool(server, 'assert_count', {
      selector: 'view',
      expected: 1,
      operator: 'gte', // Greater than or equal to
    })

    if (!countResult.isError) {
      console.log('✅ PASS:', extractText(countResult))
      passedAssertions++
    } else {
      console.error('❌ FAIL:', extractText(countResult))
      failedAssertions++
    }
    console.log()

    // Summary
    console.log('📊 Assertion Summary')
    console.log('===================')
    console.log(`✅ Passed: ${passedAssertions}`)
    console.log(`❌ Failed: ${failedAssertions}`)
    console.log(
      `📈 Success Rate: ${((passedAssertions / (passedAssertions + failedAssertions)) * 100).toFixed(1)}%`
    )
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  } finally {
    console.log('\n🔌 Disconnecting...')
    await callTool(server, 'automator_disconnect', {})
    console.log('✅ Disconnected')
  }

  console.log('\n=================================')
  console.log('🎉 Example completed!')
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
