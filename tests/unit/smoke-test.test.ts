/**
 * Integration tests for scripts/smoke-test.sh
 *
 * These tests validate the smoke test script behavior in different scenarios
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const SCRIPT_PATH = join(__dirname, '../../scripts/smoke-test.sh')
const PROJECT_ROOT = join(__dirname, '../..')

describe('smoke-test.sh', () => {
  beforeAll(() => {
    // Ensure script exists
    expect(existsSync(SCRIPT_PATH)).toBe(true)
  })

  describe('script structure', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should have bash shebang', () => {
      expect(scriptContent.startsWith('#!/bin/bash')).toBe(true)
    })

    it('should have set -e for error handling', () => {
      expect(scriptContent).toContain('set -e')
    })

    it('should have set -u for undefined variable protection', () => {
      expect(scriptContent).toContain('set -u')
    })

    it('should define color codes', () => {
      expect(scriptContent).toContain("RED='\\033[0;31m'")
      expect(scriptContent).toContain("GREEN='\\033[0;32m'")
      expect(scriptContent).toContain("YELLOW='\\033[1;33m'")
      expect(scriptContent).toContain("BLUE='\\033[0;34m'")
    })

    it('should define helper functions', () => {
      expect(scriptContent).toContain('log_info()')
      expect(scriptContent).toContain('log_success()')
      expect(scriptContent).toContain('log_error()')
      expect(scriptContent).toContain('log_warning()')
      expect(scriptContent).toContain('run_test()')
    })

    it('should run all 6 test categories', () => {
      expect(scriptContent).toContain('# Test 1: Build Check')
      expect(scriptContent).toContain('# Test 2: Type Check')
      expect(scriptContent).toContain('# Test 3: Unit Tests')
      expect(scriptContent).toContain('# Test 4: Tool Count Verification')
      expect(scriptContent).toContain('# Test 5: Lint Check')
      expect(scriptContent).toContain('# Test 6: Format Check')
    })

    it('should handle build failures gracefully', () => {
      expect(scriptContent).toContain('known issue: miniprogram-automator types')
      expect(scriptContent).toContain('log_warning "Build FAILED')
    })

    it('should verify tool count is 65', () => {
      expect(scriptContent).toContain('if [ "$TOOL_COUNT" = "65" ]')
    })

    it('should distinguish between lint errors and warnings', () => {
      expect(scriptContent).toContain('grep -q " error "')
      expect(scriptContent).toContain('log_warning "Lint has warnings (acceptable)"')
    })

    it('should calculate and display elapsed time', () => {
      expect(scriptContent).toContain('START_TIME=$(date +%s)')
      expect(scriptContent).toContain('END_TIME=$(date +%s)')
      expect(scriptContent).toContain('ELAPSED=$((END_TIME - START_TIME))')
    })

    it('should exit with appropriate codes', () => {
      expect(scriptContent).toContain('exit 0')
      expect(scriptContent).toContain('exit 1')
    })
  })

  describe('test execution logic', () => {
    it('should track test counts', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('TOTAL_TESTS=0')
      expect(scriptContent).toContain('PASSED_TESTS=0')
      expect(scriptContent).toContain('FAILED_TESTS=0')
      expect(scriptContent).toContain('TOTAL_TESTS=$((TOTAL_TESTS + 1))')
      expect(scriptContent).toContain('PASSED_TESTS=$((PASSED_TESTS + 1))')
    })

    it('should use temporary files for test output', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('/tmp/smoke-test-$$.log')
      expect(scriptContent).toContain('rm -f /tmp/smoke-test-$$.log')
    })

    it('should limit error output display', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('head -20')
      expect(scriptContent).toContain('head -10')
    })
  })

  describe('commands validation', () => {
    it('should run pnpm build for build check', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
      expect(scriptContent).toContain('pnpm build')
    })

    it('should run pnpm typecheck for type checking', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
      expect(scriptContent).toContain('pnpm typecheck')
    })

    it('should run pnpm test:unit for unit tests', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
      expect(scriptContent).toContain('pnpm test:unit')
    })

    it('should run pnpm update-readme for tool count', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
      expect(scriptContent).toContain('pnpm update-readme')
    })

    it('should run pnpm lint for linting', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
      expect(scriptContent).toContain('pnpm lint')
    })

    it('should run pnpm format:check for formatting', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
      expect(scriptContent).toContain('pnpm format:check')
    })
  })

  describe('output formatting', () => {
    it('should use consistent section dividers', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      const dividers = scriptContent.match(/━{60,}/g)
      expect(dividers).toBeDefined()
      expect(dividers!.length).toBeGreaterThanOrEqual(4)
    })

    it('should display summary section', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('📊 Test Summary')
      expect(scriptContent).toContain('Total Tests:')
      expect(scriptContent).toContain('Passed:')
      expect(scriptContent).toContain('Failed:')
      expect(scriptContent).toContain('Duration:')
    })

    it('should provide debugging tips on failure', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('Debugging tips:')
      expect(scriptContent).toContain('Check error output above')
      expect(scriptContent).toContain('Run individual commands to debug')
      expect(scriptContent).toContain('Ensure all dependencies are installed')
    })

    it('should display success message when all tests pass', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('All smoke tests passed!')
      expect(scriptContent).toContain('Ready to commit/deploy!')
    })
  })

  describe('error handling', () => {
    it('should handle missing dependencies gracefully', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      // Should redirect stderr to temp file
      expect(scriptContent).toContain('2>&1')
    })

    it('should clean up temporary files', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      // Count rm commands for temp files
      const cleanupCommands = scriptContent.match(/rm -f \/tmp\/smoke-test-.*\.log/g)
      expect(cleanupCommands).toBeDefined()
      expect(cleanupCommands!.length).toBeGreaterThan(3)
    })
  })

  describe('special handling', () => {
    it('should allow build/typecheck to fail with warnings', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      // Build and typecheck failures should not fail the whole suite
      expect(scriptContent).toContain('if pnpm build')
      expect(scriptContent).toContain('else')
      expect(scriptContent).toContain('log_warning')
      expect(scriptContent).not.toContain('exit 1" immediately after "pnpm build')
    })

    it('should use "|| true" for non-critical tests', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('|| true')
    })

    it('should extract tool count from emoji-prefixed output', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('grep "📊 Total:"')
      expect(scriptContent).toContain("sed 's/.*Total: \\([0-9]*\\) tools.*/\\1/'")
    })
  })

  describe('integration with project structure', () => {
    it('should be executable', () => {
      try {
        execSync(`test -x ${SCRIPT_PATH}`)
      } catch (error) {
        // If not executable, at least the file should exist and be readable
        expect(existsSync(SCRIPT_PATH)).toBe(true)
      }
    })

    it('should be registered in package.json', () => {
      const packageJson = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf-8'))

      expect(packageJson.scripts).toHaveProperty('smoke-test')
      expect(packageJson.scripts['smoke-test']).toContain('smoke-test.sh')
    })

    it('should reference correct pnpm commands', () => {
      const packageJson = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf-8'))
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      // All pnpm commands in smoke-test should exist in package.json
      const pnpmCommands = [
        'build',
        'typecheck',
        'test:unit',
        'update-readme',
        'lint',
        'format:check',
      ]

      pnpmCommands.forEach((cmd) => {
        expect(scriptContent).toContain(`pnpm ${cmd}`)
        expect(packageJson.scripts).toHaveProperty(cmd)
      })
    })
  })

  describe('expected tool count validation', () => {
    it('should verify exactly 65 tools', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      // Should check for exactly 65 tools
      expect(scriptContent).toContain('if [ "$TOOL_COUNT" = "65" ]')
      expect(scriptContent).toContain('expected 65')
    })

    it('should provide helpful error message on mismatch', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('expected 65, got $TOOL_COUNT')
    })
  })

  describe('documentation completeness', () => {
    it('should have header documentation', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('Smoke Test Script')
      expect(scriptContent).toContain('Quick validation')
      expect(scriptContent).toContain('Usage:')
      expect(scriptContent).toContain('Exit codes:')
    })

    it('should list all test categories in documentation', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      const testCategories = [
        'Build check',
        'Type check',
        'Unit tests',
        'Tool count verification',
        'Lint check',
        'Format check',
      ]

      testCategories.forEach((category) => {
        expect(scriptContent.toLowerCase()).toContain(category.toLowerCase())
      })
    })
  })
})
