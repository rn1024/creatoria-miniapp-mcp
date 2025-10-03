/**
 * Timeout utilities for protecting async operations
 */

/**
 * Wraps a promise with timeout protection
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param operation - Description of the operation for error messages
 * @returns The promise result or throws TimeoutError
 *
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   page.$(selector),
 *   5000,
 *   'Query element'
 * )
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${operation} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}

/**
 * Default timeout values for different operations
 */
export const DEFAULT_TIMEOUTS = {
  /** Default timeout for most operations (30 seconds) */
  default: 30000,
  /** Timeout for evaluate operations (5 seconds) */
  evaluate: 5000,
  /** Timeout for launch operations (60 seconds) */
  launch: 60000,
  /** Timeout for connect operations (30 seconds) */
  connect: 30000,
  /** Timeout for screenshot operations (10 seconds) */
  screenshot: 10000,
  /** Timeout for waitFor operations (30 seconds) */
  waitFor: 30000,
  /** Timeout for element queries (10 seconds) */
  query: 10000,
} as const

/**
 * Get timeout value with fallback chain:
 * 1. Operation-specific timeout from config
 * 2. Global timeout from config
 * 3. Operation-specific default
 * 4. Global default (30s)
 */
export function getTimeout(configTimeout: number | undefined, operationDefault: number): number {
  return configTimeout ?? operationDefault ?? DEFAULT_TIMEOUTS.default
}
