/**
 * Assert handlers - Testing and verification utilities
 */

import type { SessionState } from '../../../types.js'
import { query, getData } from '../../page/handlers/index.js'
import { getText, getValue, getAttribute, getProperty, getSize } from '../../element/handlers/index.js'

// ============================================================================
// Element Existence Assertions
// ============================================================================

export interface AssertExistsArgs {
  selector: string
  pagePath?: string
}

export interface AssertExistsResult {
  success: boolean
  message: string
}

export async function assertExists(session: SessionState, args: AssertExistsArgs): Promise<AssertExistsResult> {
  const { selector, pagePath } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element exists', { selector, pagePath })

    const result = await query(session, { selector, pagePath, save: false })

    if (!result.exists) {
      throw new Error(`Assertion failed: Element not found with selector: ${selector}`)
    }

    logger?.info('Element exists assertion passed', { selector })
    return { success: true, message: `Element exists: ${selector}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Element exists assertion failed', { error: errorMessage, selector })
    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

export interface AssertNotExistsArgs {
  selector: string
  pagePath?: string
}

export interface AssertNotExistsResult {
  success: boolean
  message: string
}

export async function assertNotExists(session: SessionState, args: AssertNotExistsArgs): Promise<AssertNotExistsResult> {
  const { selector, pagePath } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element does not exist', { selector, pagePath })

    const result = await query(session, { selector, pagePath, save: false })

    if (result.exists) {
      throw new Error(`Assertion failed: Element should not exist but found with selector: ${selector}`)
    }

    logger?.info('Element not exists assertion passed', { selector })
    return { success: true, message: `Element does not exist: ${selector}` }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('Element not found')) {
      logger?.info('Element not exists assertion passed', { selector })
      return { success: true, message: `Element does not exist: ${selector}` }
    }

    logger?.error('Element not exists assertion failed', { error: errorMessage, selector })
    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

// ============================================================================
// Text Assertions
// ============================================================================

export interface AssertTextArgs {
  refId: string
  expected: string
}

export interface AssertTextResult {
  success: boolean
  message: string
  actual: string
}

export async function assertText(session: SessionState, args: AssertTextArgs): Promise<AssertTextResult> {
  const { refId, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element text', { refId, expected })

    const result = await getText(session, { refId })
    const actual = result.text

    if (actual !== expected) {
      throw new Error(`Assertion failed: Text mismatch. Expected: "${expected}", Actual: "${actual}"`)
    }

    logger?.info('Text assertion passed', { refId, expected, actual })
    return { success: true, message: `Text matches: "${expected}"`, actual }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Text assertion failed', { error: errorMessage, refId, expected })
    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

export interface AssertTextContainsArgs {
  refId: string
  expected: string
}

export interface AssertTextContainsResult {
  success: boolean
  message: string
  actual: string
}

export async function assertTextContains(session: SessionState, args: AssertTextContainsArgs): Promise<AssertTextContainsResult> {
  const { refId, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element text contains', { refId, expected })

    const result = await getText(session, { refId })
    const actual = result.text

    if (!actual.includes(expected)) {
      throw new Error(`Assertion failed: Text does not contain expected substring. Expected to contain: "${expected}", Actual: "${actual}"`)
    }

    logger?.info('Text contains assertion passed', { refId, expected, actual })
    return { success: true, message: `Text contains: "${expected}"`, actual }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Text contains assertion failed', { error: errorMessage, refId, expected })
    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

// ============================================================================
// Value Assertions
// ============================================================================

export interface AssertValueArgs {
  refId: string
  expected: string
}

export interface AssertValueResult {
  success: boolean
  message: string
  actual: string
}

export async function assertValue(session: SessionState, args: AssertValueArgs): Promise<AssertValueResult> {
  const { refId, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element value', { refId, expected })

    const result = await getValue(session, { refId })
    const actual = result.value

    if (actual !== expected) {
      throw new Error(`Assertion failed: Value mismatch. Expected: "${expected}", Actual: "${actual}"`)
    }

    logger?.info('Value assertion passed', { refId, expected, actual })
    return { success: true, message: `Value matches: "${expected}"`, actual }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Value assertion failed', { error: errorMessage, refId, expected })
    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

// ============================================================================
// Attribute & Property Assertions
// ============================================================================

export interface AssertAttributeArgs {
  refId: string
  name: string
  expected: string
}

export interface AssertAttributeResult {
  success: boolean
  message: string
  actual: string
}

export async function assertAttribute(session: SessionState, args: AssertAttributeArgs): Promise<AssertAttributeResult> {
  const { refId, name, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element attribute', { refId, name, expected })

    const result = await getAttribute(session, { refId, name })
    const actual = result.value

    if (actual !== expected) {
      throw new Error(`Assertion failed: Attribute "${name}" mismatch. Expected: "${expected}", Actual: "${actual}"`)
    }

    logger?.info('Attribute assertion passed', { refId, name, expected, actual })
    return { success: true, message: `Attribute "${name}" matches: "${expected}"`, actual: actual ?? '' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Attribute assertion failed', { error: errorMessage, refId, name, expected })
    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

export interface AssertPropertyArgs {
  refId: string
  name: string
  expected: any
}

export interface AssertPropertyResult {
  success: boolean
  message: string
  actual: any
}

export async function assertProperty(session: SessionState, args: AssertPropertyArgs): Promise<AssertPropertyResult> {
  const { refId, name, expected } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element property', { refId, name, expected })

    const result = await getProperty(session, { refId, name })
    const actual = result.value

    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Assertion failed: Property "${name}" mismatch. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`)
    }

    logger?.info('Property assertion passed', { refId, name, expected, actual })
    return { success: true, message: `Property "${name}" matches`, actual }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Property assertion failed', { error: errorMessage, refId, name, expected })
    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

// ============================================================================
// Data Assertion
// ============================================================================

export interface AssertDataArgs {
  path?: string
  expected: any
  pagePath?: string
}

export interface AssertDataResult {
  success: boolean
  message: string
  actual: any
}

export async function assertData(session: SessionState, args: AssertDataArgs): Promise<AssertDataResult> {
  const { path, expected, pagePath } = args
  const logger = session.logger

  try {
    logger?.info('Asserting page data', { path, expected, pagePath })

    const result = await getData(session, { path, pagePath })
    const actual = result.data

    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Assertion failed: Page data${path ? ` at path "${path}"` : ''} mismatch. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`)
    }

    logger?.info('Data assertion passed', { path, expected, actual, pagePath })
    return { success: true, message: `Page data${path ? ` at "${path}"` : ''} matches`, actual }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Data assertion failed', { error: errorMessage, path, expected, pagePath })
    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}

// ============================================================================
// Visibility Assertion
// ============================================================================

export interface AssertVisibleArgs {
  refId: string
}

export interface AssertVisibleResult {
  success: boolean
  message: string
  size: { width: number; height: number }
}

export async function assertVisible(session: SessionState, args: AssertVisibleArgs): Promise<AssertVisibleResult> {
  const { refId } = args
  const logger = session.logger

  try {
    logger?.info('Asserting element is visible', { refId })

    const result = await getSize(session, { refId })
    const size = result.size

    if (!size || size.width === 0 || size.height === 0) {
      throw new Error(`Assertion failed: Element is not visible. Size: ${JSON.stringify(size)}`)
    }

    logger?.info('Visible assertion passed', { refId, size })
    return { success: true, message: `Element is visible`, size }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger?.error('Visible assertion failed', { error: errorMessage, refId })
    throw new Error(`Assertion failed: ${errorMessage}`)
  }
}
