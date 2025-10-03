/**
 * Session report generator (F3)
 *
 * Generates JSON and Markdown reports from session tool call data
 */

import type { SessionState, SessionReport, ToolCallRecord } from '../types.js'

/**
 * Calculate summary statistics from tool call records
 */
function calculateSummary(toolCalls: ToolCallRecord[]): SessionReport['summary'] {
  if (toolCalls.length === 0) {
    return {
      totalCalls: 0,
      successCount: 0,
      failureCount: 0,
      successRate: 0,
      avgDuration: 0,
      maxDuration: 0,
      minDuration: 0,
    }
  }

  const successCount = toolCalls.filter((call) => call.success).length
  const failureCount = toolCalls.length - successCount
  const durations = toolCalls.map((call) => call.duration)

  return {
    totalCalls: toolCalls.length,
    successCount,
    failureCount,
    successRate: toolCalls.length > 0 ? successCount / toolCalls.length : 0,
    avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
  }
}

/**
 * Generate JSON session report
 */
export function generateSessionReport(session: SessionState): SessionReport {
  if (!session.reportData) {
    throw new Error('Session report data not initialized')
  }

  const { reportData } = session
  const endTime = reportData.endTime || new Date()
  const duration = endTime.getTime() - reportData.startTime.getTime()

  const summary = calculateSummary(reportData.toolCalls)

  // Extract failures for dedicated section
  const failures = reportData.toolCalls
    .filter((call) => !call.success && call.error)
    .map((call) => ({
      toolName: call.toolName,
      timestamp: call.timestamp.toISOString(),
      error: call.error!.message,
      snapshotPath: call.error!.snapshotPath,
    }))

  return {
    sessionId: session.sessionId,
    startTime: reportData.startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration,
    summary,
    toolCalls: reportData.toolCalls.map((call) => ({
      ...call,
      timestamp: call.timestamp,
    })),
    failures,
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

/**
 * Format percentage
 */
function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '').split('.')[0]
}

/**
 * Calculate per-tool statistics
 */
interface ToolStats {
  toolName: string
  calls: number
  success: number
  failure: number
  avgDuration: number
}

function calculateToolStats(toolCalls: ToolCallRecord[]): ToolStats[] {
  const statsMap = new Map<string, ToolStats>()

  for (const call of toolCalls) {
    const existing = statsMap.get(call.toolName)
    if (!existing) {
      statsMap.set(call.toolName, {
        toolName: call.toolName,
        calls: 1,
        success: call.success ? 1 : 0,
        failure: call.success ? 0 : 1,
        avgDuration: call.duration,
      })
    } else {
      existing.calls++
      existing.success += call.success ? 1 : 0
      existing.failure += call.success ? 0 : 1
      existing.avgDuration =
        (existing.avgDuration * (existing.calls - 1) + call.duration) / existing.calls
    }
  }

  return Array.from(statsMap.values()).sort((a, b) => b.calls - a.calls)
}

/**
 * Generate Markdown session report
 */
export function generateMarkdownReport(report: SessionReport): string {
  const lines: string[] = []

  // Header
  lines.push(`# Session Report: ${report.sessionId}`)
  lines.push('')

  // Summary
  lines.push('## Summary')
  lines.push(`- **Duration**: ${formatDuration(report.duration)}`)
  lines.push(`- **Total Calls**: ${report.summary.totalCalls}`)
  lines.push(
    `- **Success Rate**: ${formatPercent(report.summary.successRate)} (${report.summary.successCount}/${report.summary.totalCalls})`
  )
  lines.push(`- **Average Duration**: ${formatDuration(report.summary.avgDuration)}`)
  lines.push('')

  // Tool Call Statistics
  if (report.toolCalls.length > 0) {
    lines.push('## Tool Call Statistics')
    lines.push('| Tool Name | Calls | Success | Failure | Avg Duration |')
    lines.push('|-----------|-------|---------|---------|--------------|')

    const toolStats = calculateToolStats(report.toolCalls)
    for (const stats of toolStats) {
      lines.push(
        `| ${stats.toolName} | ${stats.calls} | ${stats.success} | ${stats.failure} | ${formatDuration(stats.avgDuration)} |`
      )
    }
    lines.push('')
  }

  // Failures
  if (report.failures.length > 0) {
    lines.push('## Failures')
    for (let i = 0; i < report.failures.length; i++) {
      const failure = report.failures[i]
      lines.push(`### ${i + 1}. ${failure.toolName}`)
      lines.push(`- **Time**: ${formatTimestamp(new Date(failure.timestamp))}`)
      lines.push(`- **Error**: ${failure.error}`)
      if (failure.snapshotPath) {
        lines.push(`- **Snapshot**: [${failure.snapshotPath}](${failure.snapshotPath})`)
      }
      lines.push('')
    }
  }

  // Timeline
  if (report.toolCalls.length > 0) {
    lines.push('## Timeline')
    lines.push('| Time | Tool | Status | Duration |')
    lines.push('|------|------|--------|----------|')

    for (const call of report.toolCalls) {
      const status = call.success ? '✅' : '❌'
      const time = formatTimestamp(call.timestamp)
      lines.push(`| ${time} | ${call.toolName} | ${status} | ${formatDuration(call.duration)} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generate and save session reports (JSON + Markdown)
 *
 * Called automatically when session is disposed.
 * Fire-and-forget pattern - errors are logged but not thrown.
 *
 * @param session Session state with reportData
 */
export async function generateAndSaveReports(session: SessionState): Promise<void> {
  if (!session.reportData) {
    // Reporting not enabled for this session
    return
  }

  if (!session.outputManager) {
    session.logger?.warn('Cannot generate report: outputManager not available')
    return
  }

  try {
    // Set end time
    session.reportData.endTime = new Date()

    // Generate reports
    const jsonReport = generateSessionReport(session)
    const markdownReport = generateMarkdownReport(jsonReport)

    // F3-P1: Save both reports in parallel for better performance
    const [jsonPath, mdPath] = await Promise.all([
      session.outputManager.writeFile(
        'report.json',
        Buffer.from(JSON.stringify(jsonReport, null, 2))
      ),
      session.outputManager.writeFile('report.md', markdownReport),
    ])

    session.logger?.info('Session reports generated', {
      jsonPath,
      mdPath,
      totalCalls: jsonReport.summary.totalCalls,
      successRate: jsonReport.summary.successRate,
    })
  } catch (error) {
    session.logger?.error('Failed to generate session reports', {
      error: error instanceof Error ? error.message : String(error),
    })
    // Don't throw - report generation failure shouldn't block session cleanup
  }
}
