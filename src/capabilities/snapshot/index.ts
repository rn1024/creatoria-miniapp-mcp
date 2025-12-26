/**
 * Snapshot Capability Module
 *
 * Provides tools for state capture and diagnostics including page snapshots,
 * full application snapshots, and element snapshots.
 */

import type { CapabilityModule, ToolDefinition } from '../registry.js'
import {
  snapshotPageSchema,
  snapshotFullSchema,
  snapshotElementSchema,
} from './schemas/index.js'
import {
  snapshotPage,
  snapshotFull,
  snapshotElement,
} from './handlers/index.js'

// Re-export schemas for external use
export * from './schemas/index.js'

// Re-export handlers for external use
export * from './handlers/index.js'

/**
 * Snapshot tool definitions - 3 tools
 */
const tools: ToolDefinition[] = [
  {
    name: 'snapshot_page',
    description: 'Capture complete page snapshot (data + screenshot)',
    capability: 'snapshot',
    inputSchema: snapshotPageSchema,
    handler: snapshotPage,
  },
  {
    name: 'snapshot_full',
    description: 'Capture complete application snapshot (system info + page stack + current page)',
    capability: 'snapshot',
    inputSchema: snapshotFullSchema,
    handler: snapshotFull,
  },
  {
    name: 'snapshot_element',
    description: 'Capture element snapshot (properties + optional screenshot)',
    capability: 'snapshot',
    inputSchema: snapshotElementSchema,
    handler: snapshotElement,
  },
]

/**
 * Snapshot capability module
 */
export const capability: CapabilityModule = {
  name: 'snapshot',
  description: 'State capture and diagnostic utilities (3 tools)',
  tools,
}

export default capability
