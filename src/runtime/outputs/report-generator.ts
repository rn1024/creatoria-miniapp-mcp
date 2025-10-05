import type { SessionState, SessionReport, ToolCallRecord } from '../../types.js'

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

export function generateSessionReport(session: SessionState): SessionReport {
  if (!session.reportData) {
    throw new Error('Session report data not initialized')
  }

  const { reportData } = session
  const endTime = reportData.endTime || new Date()
  const duration = endTime.getTime() - reportData.startTime.getTime()
  const summary = calculateSummary(reportData.toolCalls)

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

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}

function formatTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '').split('.')[0]
}

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

export function generateMarkdownReport(report: SessionReport): string {
  const lines: string[] = []

  lines.push(`# Session Report: ${report.sessionId}`)
  lines.push('')

  lines.push('## Summary')
  lines.push(`- **Duration**: ${formatDuration(report.duration)}`)
  lines.push(`- **Total Calls**: ${report.summary.totalCalls}`)
  lines.push(
    `- **Success Rate**: ${formatPercent(report.summary.successRate)} (${report.summary.successCount}/${report.summary.totalCalls})`
  )
  lines.push(`- **Average Duration**: ${formatDuration(report.summary.avgDuration)}`)
  lines.push('')

  const hasToolCalls = report.toolCalls.length > 0

  if (hasToolCalls) {
    lines.push('## Timeline')
    lines.push('| Time | Tool | Status | Duration |')
    lines.push('|------|------|--------|----------|')
    for (const toolCall of report.toolCalls) {
      lines.push(
        `| ${formatTimestamp(toolCall.timestamp)} | ${toolCall.toolName} | ${toolCall.success ? '✅' : '❌'} | ${formatDuration(toolCall.duration)} |`
      )
    }
    lines.push('')

    lines.push('## Tool Calls')
    for (const toolCall of report.toolCalls) {
      lines.push(
        `- ${formatTimestamp(toolCall.timestamp)} · ${toolCall.toolName} (${formatDuration(toolCall.duration)}) · ${toolCall.success ? '✅ Success' : '❌ Failure'}`
      )
      if (!toolCall.success && toolCall.error) {
        lines.push(`  - Error: ${toolCall.error.message}`)
        if (toolCall.error.snapshotPath) {
          lines.push(`  - Snapshot: ${toolCall.error.snapshotPath}`)
        }
      }
    }
    lines.push('')

    const toolStats = calculateToolStats(report.toolCalls)
    if (toolStats.length > 0) {
      lines.push('## Tool Call Statistics')
      lines.push('| Tool Name | Calls | Success | Failure | Avg Duration |')
      lines.push('|-----------|-------|---------|---------|--------------|')
      for (const stat of toolStats) {
        lines.push(
          `| ${stat.toolName} | ${stat.calls} | ${stat.success} | ${stat.failure} | ${formatDuration(stat.avgDuration)} |`
        )
      }
      lines.push('')
    }
  }

  if (report.failures.length > 0) {
    lines.push('## Failures')
    report.failures.forEach((failure, index) => {
      lines.push(`### ${index + 1}. ${failure.toolName}`)
      lines.push(`- **Time**: ${formatTimestamp(new Date(failure.timestamp))}`)
      lines.push(`- **Error**: ${failure.error}`)
      if (failure.snapshotPath) {
        lines.push(
          `- **Snapshot**: [${failure.snapshotPath}](${failure.snapshotPath})`
        )
      }
    })
  }

  return lines.join('\n')
}

export async function generateAndSaveReports(session: SessionState): Promise<void> {
  const logger = session.logger

  if (!session.outputManager) {
    logger?.warn?.('Cannot generate report: outputManager not available')
    return
  }

  try {
    const report = generateSessionReport(session)
    const jsonContent = JSON.stringify(report, null, 2)
    await session.outputManager.writeFile('session-report.json', jsonContent)

    try {
      const markdownContent = generateMarkdownReport(report)
      await session.outputManager.writeFile('session-report.md', markdownContent)
    } catch (error) {
      logger?.error?.('Failed to generate session reports', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  } catch (error) {
    logger?.error?.('Failed to generate session reports', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
