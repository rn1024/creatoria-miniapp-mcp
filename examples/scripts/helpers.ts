/**
 * Shared helpers for example scripts
 */

export interface ToolResult {
  content: Array<{
    type: string
    text?: string
    [key: string]: unknown
  }>
  isError?: boolean
}

/**
 * Server interface with callTool method
 * This matches the actual MCP server runtime API
 */
export interface Server {
  callTool(request: {
    params: {
      name: string
      arguments: Record<string, unknown>
    }
    meta: {
      progressToken: undefined
    }
  }): Promise<ToolResult>
}

/**
 * Helper function to extract text from tool result
 */
export function extractText(result: ToolResult): string {
  return result.content
    .filter((item) => item.type === 'text')
    .map((item) => item.text || '')
    .join('\n')
}

/**
 * Helper function to call a tool with full error context
 */
export async function callTool(
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
    // Preserve stack trace for debugging
    const errorMessage =
      error instanceof Error ? `${error.message}\n\nStack trace:\n${error.stack}` : String(error)

    return {
      content: [
        {
          type: 'text',
          text: errorMessage,
        },
      ],
      isError: true,
    }
  }
}

/**
 * Validate that a selector exists on the current page before using it
 *
 * @param server - MCP server instance
 * @param selector - WXML selector to validate
 * @param context - Optional context for error messages
 * @returns true if selector exists, false otherwise
 */
export async function validateSelector(
  server: Server,
  selector: string,
  context?: string
): Promise<boolean> {
  const result = await callTool(server, 'page_query', { selector })

  if (result.isError) {
    const error = extractText(result)
    console.error(
      `⚠️  Selector validation failed${context ? ` (${context})` : ''}: "${selector}"`
    )
    console.error(`   Error: ${error}`)
    return false
  }

  // Check if element was actually found (not just a successful empty result)
  const text = extractText(result)
  if (!text || text.includes('not found') || text.includes('No element')) {
    console.error(
      `⚠️  Selector not found${context ? ` (${context})` : ''}: "${selector}"`
    )
    console.error(`   Tip: Check if the element exists in your Mini Program`)
    return false
  }

  return true
}

/**
 * Call tool with selector validation
 *
 * @param server - MCP server instance
 * @param toolName - Tool to call
 * @param args - Tool arguments (must include 'selector' or 'refId')
 * @param context - Optional context for error messages
 * @returns Tool result, or error if selector validation fails
 */
export async function callToolWithValidation(
  server: Server,
  toolName: string,
  args: Record<string, unknown>,
  context?: string
): Promise<ToolResult> {
  // Only validate if using a selector (not refId)
  if (args.selector && typeof args.selector === 'string') {
    const isValid = await validateSelector(server, args.selector, context)
    if (!isValid) {
      return {
        content: [
          {
            type: 'text',
            text: `Selector validation failed: "${args.selector}"${context ? ` (${context})` : ''}`,
          },
        ],
        isError: true,
      }
    }
  }

  return callTool(server, toolName, args)
}

/**
 * Assert that a tool call succeeded, with detailed error context
 */
export function assertSuccess(result: ToolResult, context?: string): void {
  if (result.isError) {
    const error = new Error(
      `Tool call failed${context ? ` (${context})` : ''}:\n${extractText(result)}`
    )
    Error.captureStackTrace?.(error, assertSuccess)
    throw error
  }
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
