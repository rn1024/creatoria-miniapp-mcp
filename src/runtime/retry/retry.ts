/**
 * Retry utilities for handling transient failures
 */

/**
 * Options for retry behavior
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 2) */
  maxRetries: number
  /** Initial delay between retries in ms (default: 1000) */
  delayMs: number
  /** Multiplier for exponential backoff (default: 1.5) */
  backoffMultiplier?: number
  /** Function to determine if error is retryable (default: always retry) */
  shouldRetry?: (error: Error) => boolean
  /** Callback for each retry attempt */
  onRetry?: (attempt: number, error: Error, nextDelayMs: number) => void
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> & {
  onRetry?: RetryOptions['onRetry']
} = {
  maxRetries: 2,
  delayMs: 1000,
  backoffMultiplier: 1.5,
  shouldRetry: () => true,
  onRetry: undefined,
}

/**
 * Wraps an async operation with retry logic
 *
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 * @returns The result of the operation
 * @throws The last error if all retries fail
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchData(),
 *   {
 *     maxRetries: 3,
 *     delayMs: 1000,
 *     shouldRetry: (err) => err.message.includes('timeout'),
 *   }
 * )
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_RETRY_OPTIONS.maxRetries,
    delayMs = DEFAULT_RETRY_OPTIONS.delayMs,
    backoffMultiplier = DEFAULT_RETRY_OPTIONS.backoffMultiplier,
    shouldRetry = DEFAULT_RETRY_OPTIONS.shouldRetry,
    onRetry,
  } = options

  let lastError: Error = new Error('No attempts made')

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const currentDelay = Math.round(delayMs * Math.pow(backoffMultiplier, attempt))

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError, currentDelay)
      }

      // Wait before next retry
      await sleep(currentDelay)
    }
  }

  throw lastError
}

/**
 * Common retry predicates
 */
export const RetryPredicates = {
  /** Retry on timeout errors */
  onTimeout: (error: Error): boolean => {
    return error.message.toLowerCase().includes('timeout')
  },

  /** Retry on connection errors */
  onConnectionError: (error: Error): boolean => {
    const message = error.message.toLowerCase()
    return (
      message.includes('connection') ||
      message.includes('econnreset') ||
      message.includes('econnrefused') ||
      message.includes('socket')
    )
  },

  /** Retry on timeout or connection errors */
  onTransientError: (error: Error): boolean => {
    return RetryPredicates.onTimeout(error) || RetryPredicates.onConnectionError(error)
  },

  /** Never retry */
  never: (): boolean => false,

  /** Always retry */
  always: (): boolean => true,
}

/**
 * Sleep for specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
