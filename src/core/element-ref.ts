/**
 * ElementRef resolver for locating elements in miniProgram pages
 * Supports multiple location strategies: refId, selector, xpath, index
 */

import type { SessionState, ElementRefInput, ResolvedElement } from '../types.js'

/**
 * Generate a unique reference ID for caching elements
 */
export function generateRefId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/**
 * Resolve page object from sessionState
 * @param state - Session state containing miniProgram instance
 * @param pagePath - Optional page path. If not provided, uses currentPage
 * @returns Page object
 * @throws Error if miniProgram not connected or page not found
 */
export async function resolvePage(
  state: SessionState,
  pagePath?: string
): Promise<any> {
  if (!state.miniProgram) {
    throw new Error('MiniProgram not launched or connected. Call miniprogram_launch or miniprogram_connect first.')
  }

  // If no pagePath specified, use current page
  if (!pagePath) {
    const currentPage = await state.miniProgram.currentPage()
    if (!currentPage) {
      throw new Error('No current page found. Ensure the miniProgram has navigated to a page.')
    }
    return currentPage
  }

  // Find page in pageStack by path
  const pageStack = await state.miniProgram.pageStack()
  if (!Array.isArray(pageStack) || pageStack.length === 0) {
    throw new Error('Page stack is empty. Ensure miniProgram has navigated to pages.')
  }

  // Normalize pagePath (support both '/path' and 'path')
  const normalizedPath = pagePath.startsWith('/') ? pagePath.slice(1) : pagePath
  const found = pageStack.find(
    (p: any) => p.path === normalizedPath || p.path === pagePath
  )

  if (!found) {
    const availablePaths = pageStack.map((p: any) => p.path).join(', ')
    throw new Error(
      `Page not found in stack: ${pagePath}. Available pages: ${availablePaths}`
    )
  }

  return found
}

/**
 * Resolve element using various location strategies
 * @param state - Session state containing element cache
 * @param ref - Element reference input with location strategy
 * @returns Resolved element with page, element object, and optional refId
 * @throws Error if element not found or invalid reference
 */
export async function resolveElement(
  state: SessionState,
  ref: ElementRefInput
): Promise<ResolvedElement> {
  // Get the page first
  const page = await resolvePage(state, ref.pagePath)

  let element: any = null

  // Strategy 1: Use cached refId
  if (ref.refId) {
    element = state.elements.get(ref.refId)
    if (!element) {
      const availableRefs = Array.from(state.elements.keys()).join(', ')
      throw new Error(
        `Invalid refId: ${ref.refId}. ` +
        `Available refIds: ${availableRefs || '(none)'}. ` +
        `The element may have been removed or the page has changed.`
      )
    }
  }
  // Strategy 2: Use XPath (requires SDK 0.11.0+)
  else if (ref.xpath) {
    const anyPage: any = page

    // Check if xpath is supported
    if (typeof anyPage.xpath !== 'function' && typeof anyPage.getElementByXpath !== 'function') {
      throw new Error(
        'XPath is not supported by current miniprogram-automator SDK version. ' +
        'Please upgrade to SDK 0.11.0 or later, or use selector instead.'
      )
    }

    // If index is specified, use getElementsByXpath
    if (typeof ref.index === 'number') {
      if (typeof anyPage.getElementsByXpath === 'function') {
        const elements = await anyPage.getElementsByXpath(ref.xpath)
        if (!Array.isArray(elements) || elements.length === 0) {
          throw new Error(`No elements found with XPath: ${ref.xpath}`)
        }
        if (ref.index < 0 || ref.index >= elements.length) {
          throw new Error(
            `Index ${ref.index} out of range. Found ${elements.length} elements with XPath: ${ref.xpath}`
          )
        }
        element = elements[ref.index]
      } else {
        throw new Error(
          'getElementsByXpath is not supported. Cannot use index with xpath in this SDK version.'
        )
      }
    } else {
      // Use getElementByXpath or xpath (fallback)
      if (typeof anyPage.getElementByXpath === 'function') {
        element = await anyPage.getElementByXpath(ref.xpath)
      } else if (typeof anyPage.xpath === 'function') {
        element = await anyPage.xpath(ref.xpath)
      }
    }

    if (!element) {
      throw new Error(`Element not found with XPath: ${ref.xpath}`)
    }
  }
  // Strategy 3: Use CSS selector
  else if (ref.selector) {
    // If index is specified, use $$
    if (typeof ref.index === 'number') {
      const elements = await page.$$(ref.selector)
      if (!Array.isArray(elements) || elements.length === 0) {
        throw new Error(`No elements found with selector: ${ref.selector}`)
      }
      if (ref.index < 0 || ref.index >= elements.length) {
        throw new Error(
          `Index ${ref.index} out of range. Found ${elements.length} elements with selector: ${ref.selector}`
        )
      }
      element = elements[ref.index]
    } else {
      // Use $ for single element
      element = await page.$(ref.selector)
      if (!element) {
        throw new Error(`Element not found with selector: ${ref.selector}`)
      }
    }
  }
  // No valid location strategy provided
  else {
    throw new Error(
      'Invalid ElementRef: must provide one of: refId, selector, or xpath'
    )
  }

  // Cache element if save=true
  let newRefId: string | undefined
  if (ref.save && element) {
    newRefId = generateRefId()
    state.elements.set(newRefId, element)
    console.error(`Cached element with refId: ${newRefId}`)
  }

  return {
    page,
    element,
    refId: newRefId,
  }
}

/**
 * Validate ElementRefInput and provide helpful error messages
 */
export function validateElementRef(ref: ElementRefInput): void {
  if (!ref || typeof ref !== 'object') {
    throw new Error('ElementRef must be an object')
  }

  const hasRefId = typeof ref.refId === 'string' && ref.refId.length > 0
  const hasSelector = typeof ref.selector === 'string' && ref.selector.length > 0
  const hasXpath = typeof ref.xpath === 'string' && ref.xpath.length > 0

  if (!hasRefId && !hasSelector && !hasXpath) {
    throw new Error(
      'ElementRef must provide one of: refId, selector, or xpath'
    )
  }

  if (ref.index !== undefined && typeof ref.index !== 'number') {
    throw new Error('ElementRef.index must be a number')
  }

  if (ref.pagePath !== undefined && typeof ref.pagePath !== 'string') {
    throw new Error('ElementRef.pagePath must be a string')
  }

  if (ref.save !== undefined && typeof ref.save !== 'boolean') {
    throw new Error('ElementRef.save must be a boolean')
  }
}
