import type { SessionState } from '../../../types.js'
import { generateAndSaveReports } from '../../outputs/report-generator.js'

export async function cleanupSessionResources(session: SessionState, sessionId: string): Promise<void> {
  const errors: Error[] = []

  if (session.reportData) {
    try {
      await generateAndSaveReports(session)
      console.error(`Session reports generated for ${sessionId}`)
    } catch (error) {
      console.error(`Failed to generate session reports for ${sessionId}:`, error)
    }
  }

  if (session.logger?.dispose) {
    try {
      await session.logger.dispose()
      console.error(`Logger disposed for session ${sessionId}`)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      errors.push(new Error(`Failed to dispose logger: ${err.message}`))
      console.error(`Failed to dispose logger for session ${sessionId}:`, error)
    }
  }

  if (session.miniProgram) {
    try {
      if (typeof session.miniProgram.disconnect === 'function') {
        await session.miniProgram.disconnect()
      }
      console.error(`Disconnected miniProgram for session ${sessionId}`)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      errors.push(new Error(`Failed to disconnect miniProgram: ${err.message}`))
      console.error(`Failed to disconnect miniProgram for session ${sessionId}:`, error)
    }
  }

  const ideProcess = session.ideProcess
  if (ideProcess) {
    try {
      if (typeof ideProcess.kill === 'function') {
        if (typeof ideProcess.once === 'function') {
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('IDE process did not exit within 5 seconds'))
            }, 5000)

            ideProcess.once('exit', () => {
              clearTimeout(timeout)
              resolve()
            })

            ideProcess.kill()
          })
        } else {
          ideProcess.kill()
        }
      }
      console.error(`Killed IDE process for session ${sessionId}`)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      errors.push(new Error(`Failed to kill IDE process: ${err.message}`))
      console.error(`Failed to kill IDE process for session ${sessionId}:`, error)
    }
  }

  try {
    session.elements.clear()
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    errors.push(new Error(`Failed to clear element cache: ${err.message}`))
  }

  if (errors.length > 0) {
    console.error(`Session ${sessionId} cleanup completed with ${errors.length} error(s)`)
    throw new AggregateError(errors, `Session cleanup had ${errors.length} error(s)`)
  }

  console.error(`Session ${sessionId} cleaned up successfully`)
}
