/**
 * Evaluate handler - Execute JavaScript in mini program context
 *
 * ⚠️ SECURITY WARNING:
 * This tool executes arbitrary JavaScript code in the mini program context.
 * Use with caution:
 * - All evaluations are logged for audit
 * - Evaluations are limited by timeout (default: 5s)
 * - Consider restricting this tool in production environments
 * - Never pass untrusted user input directly to this function
 */

import type { SessionState } from '../../../types.js'
import { withTimeout, getTimeout, DEFAULT_TIMEOUTS } from '../../../runtime/timeout/timeout.js'
import { withSessionLock } from '../../../runtime/concurrency/mutex.js'

/**
 * Evaluate input arguments
 */
export interface EvaluateArgs {
  expression: string
  args?: any[]
}

/**
 * Evaluate result
 */
export interface EvaluateResult {
  success: boolean
  message: string
  result?: any
}

/**
 * Evaluate JavaScript code in the mini program context
 */
export async function evaluate(session: SessionState, args: EvaluateArgs): Promise<EvaluateResult> {
  // Serialize against all other SDK operations on this session (shared single WebSocket).
  return withSessionLock(session.sessionId, () => evaluateImpl(session, args))
}

async function evaluateImpl(session: SessionState, args: EvaluateArgs): Promise<EvaluateResult> {
  const { expression, args: evalArgs = [] } = args
  const logger = session.logger

  try {
    if (!session.miniProgram) {
      throw new Error(
        'MiniProgram not connected. Call miniprogram_launch or miniprogram_connect first.'
      )
    }

    // Security: Log all evaluate calls for audit
    logger?.info('[SECURITY] Evaluating expression', {
      expression,
      argsCount: evalArgs.length,
      timestamp: new Date().toISOString(),
    })

    // Get timeout from config or use default (5 seconds for evaluate)
    const timeoutMs = getTimeout(session.config?.evaluateTimeout, DEFAULT_TIMEOUTS.evaluate)

    // DevTools "App.callFunction" expects a function declaration string, not a bare expression.
    // The automator calls .toString() on whatever is passed, so we wrap the expression in a
    // function string directly. A bare expression like "getApp().globalData" causes
    // "Arg string terminates parameters early" because DevTools tries to parse it as a function.
    const argNames = evalArgs.map((_, i) => `arg${i}`).join(', ')
    const fnStr = `function(${argNames}) { return (${expression}) }`

    // Evaluate expression with timeout protection
    const result = await withTimeout(
      session.miniProgram.evaluate(fnStr, ...evalArgs),
      timeoutMs,
      'Evaluate expression'
    )

    logger?.info('Evaluation successful', { result })

    return {
      success: true,
      message: 'Expression evaluated successfully',
      result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Security: Log failed evaluations
    logger?.error('[SECURITY] Evaluation failed', {
      error: errorMessage,
      expression,
      timestamp: new Date().toISOString(),
    })

    throw new Error(`Evaluation failed: ${errorMessage}`)
  }
}
