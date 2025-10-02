/**
 * Assert tools for MCP server
 * Provides assertion utilities for testing mini program functionality
 */

import type { SessionState } from '../types.js'
import * as pageTools from './page.js'
import * as elementTools from './element.js'

/**
 * Assert that an element exists on the page
 */
export async function assertExists(
  session: SessionState,
  args: {
    selector: string
    pagePath?: string
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { selector, pagePath } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element exists', { selector, pagePath })

    // Try to query the element
    const result = await pageTools.query(session, {
      selector,
      pagePath,
      save: false,
    })

    if (!result.exists) {
      throw new Error(
        `Assertion failed: Element not found with selector: ${selector}`
      )
    }

    logger?.info('Element exists assertion passed', { selector })

    return {
      success: true,
      message: `Element exists: ${selector}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Element exists assertion failed', {
      error: errorMessage,
      selector,
    })

    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

/**
 * Assert that an element does not exist on the page
 */
export async function assertNotExists(
  session: SessionState,
  args: {
    selector: string
    pagePath?: string
  }
): Promise<{
  success: boolean
  message: string
}> {
  const { selector, pagePath } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element does not exist', { selector, pagePath })

    // Try to query the element
    const result = await pageTools.query(session, {
      selector,
      pagePath,
      save: false,
    })

    if (result.exists) {
      throw new Error(
        `Assertion failed: Element should not exist but found with selector: ${selector}`
      )
    }

    logger?.info('Element not exists assertion passed', { selector })

    return {
      success: true,
      message: `Element does not exist: ${selector}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // If error is "Element not found", the assertion passes
    if (errorMessage.includes('Element not found')) {
      logger?.info('Element not exists assertion passed', { selector })
      return {
        success: true,
        message: `Element does not exist: ${selector}`,
      }
    }

    logger?.error('Element not exists assertion failed', {
      error: errorMessage,
      selector,
    })

    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

/**
 * Assert element text equals expected value
 */
export async function assertText(
  session: SessionState,
  args: {
    refId: string
    expected: string
  }
): Promise<{
  success: boolean
  message: string
  actual: string
}> {
  const { refId, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element text', { refId, expected })

    const result = await elementTools.getText(session, { refId })
    const actual = result.text

    if (actual !== expected) {
      throw new Error(
        `Assertion failed: Text mismatch. Expected: "${expected}", Actual: "${actual}"`
      )
    }

    logger?.info('Text assertion passed', { refId, expected, actual })

    return {
      success: true,
      message: `Text matches: "${expected}"`,
      actual,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Text assertion failed', {
      error: errorMessage,
      refId,
      expected,
    })

    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

/**
 * Assert element text contains expected substring
 */
export async function assertTextContains(
  session: SessionState,
  args: {
    refId: string
    expected: string
  }
): Promise<{
  success: boolean
  message: string
  actual: string
}> {
  const { refId, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element text contains', { refId, expected })

    const result = await elementTools.getText(session, { refId })
    const actual = result.text

    if (!actual.includes(expected)) {
      throw new Error(
        `Assertion failed: Text does not contain expected substring. Expected to contain: "${expected}", Actual: "${actual}"`
      )
    }

    logger?.info('Text contains assertion passed', { refId, expected, actual })

    return {
      success: true,
      message: `Text contains: "${expected}"`,
      actual,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Text contains assertion failed', {
      error: errorMessage,
      refId,
      expected,
    })

    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

/**
 * Assert element value equals expected value
 */
export async function assertValue(
  session: SessionState,
  args: {
    refId: string
    expected: string
  }
): Promise<{
  success: boolean
  message: string
  actual: string
}> {
  const { refId, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element value', { refId, expected })

    const result = await elementTools.getValue(session, { refId })
    const actual = result.value

    if (actual !== expected) {
      throw new Error(
        `Assertion failed: Value mismatch. Expected: "${expected}", Actual: "${actual}"`
      )
    }

    logger?.info('Value assertion passed', { refId, expected, actual })

    return {
      success: true,
      message: `Value matches: "${expected}"`,
      actual,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Value assertion failed', {
      error: errorMessage,
      refId,
      expected,
    })

    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

/**
 * Assert element attribute equals expected value
 */
export async function assertAttribute(
  session: SessionState,
  args: {
    refId: string
    name: string
    expected: string
  }
): Promise<{
  success: boolean
  message: string
  actual: string
}> {
  const { refId, name, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element attribute', { refId, name, expected })

    const result = await elementTools.getAttribute(session, { refId, name })
    const actual = result.value

    if (actual !== expected) {
      throw new Error(
        `Assertion failed: Attribute "${name}" mismatch. Expected: "${expected}", Actual: "${actual}"`
      )
    }

    logger?.info('Attribute assertion passed', { refId, name, expected, actual })

    return {
      success: true,
      message: `Attribute "${name}" matches: "${expected}"`,
      actual,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Attribute assertion failed', {
      error: errorMessage,
      refId,
      name,
      expected,
    })

    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

/**
 * Assert element property equals expected value
 */
export async function assertProperty(
  session: SessionState,
  args: {
    refId: string
    name: string
    expected: any
  }
): Promise<{
  success: boolean
  message: string
  actual: any
}> {
  const { refId, name, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element property', { refId, name, expected })

    const result = await elementTools.getProperty(session, { refId, name })
    const actual = result.value

    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `Assertion failed: Property "${name}" mismatch. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`
      )
    }

    logger?.info('Property assertion passed', { refId, name, expected, actual })

    return {
      success: true,
      message: `Property "${name}" matches`,
      actual,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Property assertion failed', {
      error: errorMessage,
      refId,
      name,
      expected,
    })

    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

/**
 * Assert page data equals expected value
 */
export async function assertData(
  session: SessionState,
  args: {
    path?: string
    expected: any
    pagePath?: string
  }
): Promise<{
  success: boolean
  message: string
  actual: any
}> {
  const { path, expected, pagePath } = args
  const logger = session.logger

  try {
    logger?.info('Asserting page data', { path, expected, pagePath })

    const result = await pageTools.getData(session, { path, pagePath })
    const actual = result.data

    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `Assertion failed: Page data${path ? ` at path "${path}"` : ''} mismatch. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`
      )
    }

    logger?.info('Data assertion passed', { path, expected, actual, pagePath })

    return {
      success: true,
      message: `Page data${path ? ` at "${path}"` : ''} matches`,
      actual,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Data assertion failed', {
      error: errorMessage,
      path,
      expected,
      pagePath,
    })

    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

/**
 * Assert element is visible (has non-zero size)
 */
export async function assertVisible(
  session: SessionState,
  args: {
    refId: string
  }
): Promise<{
  success: boolean
  message: string
  size: { width: number; height: number }
}> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element is visible', { refId })

    const result = await elementTools.getSize(session, { refId })
    const size = result.size

    if (!size || size.width === 0 || size.height === 0) {
      throw new Error(
        `Assertion failed: Element is not visible. Size: ${JSON.stringify(size)}`
      )
    }

    logger?.info('Visible assertion passed', { refId, size })

    return {
      success: true,
      message: `Element is visible`,
      size,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Visible assertion failed', {
      error: errorMessage,
      refId,
    })

    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}
