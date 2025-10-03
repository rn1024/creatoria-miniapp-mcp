/**
 * Integration tests for scripts/release.sh
 *
 * These tests validate the release script structure and behavior
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const SCRIPT_PATH = join(__dirname, '../../scripts/release.sh')
const PROJECT_ROOT = join(__dirname, '../..')

describe('release.sh', () => {
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

    it('should have error handling flags', () => {
      expect(scriptContent).toContain('set -e')
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
    })

    it('should have header documentation', () => {
      expect(scriptContent).toContain('Release Script')
      expect(scriptContent).toContain('Usage:')
      expect(scriptContent).toContain('Examples:')
      expect(scriptContent).toContain('patch|minor|major|prerelease')
    })
  })

  describe('argument validation', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should check for missing arguments', () => {
      expect(scriptContent).toContain('if [ $# -eq 0 ]')
      expect(scriptContent).toContain('Missing version bump type')
    })

    it('should validate version type argument', () => {
      expect(scriptContent).toContain('VERSION_TYPE=$1')
      expect(scriptContent).toContain('patch|minor|major|prerelease')
    })

    it('should reject invalid version types', () => {
      expect(scriptContent).toContain('Invalid version type')
      expect(scriptContent).toContain('Must be one of: patch, minor, major, prerelease')
    })

    it('should provide usage examples', () => {
      expect(scriptContent).toContain('0.1.0 → 0.1.1 (bug fixes)')
      expect(scriptContent).toContain('0.1.0 → 0.2.0 (new features)')
      expect(scriptContent).toContain('0.1.0 → 1.0.0 (breaking changes)')
      expect(scriptContent).toContain('0.1.0 → 0.1.1-0 (pre-release)')
    })
  })

  describe('pre-release checks', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should verify main branch', () => {
      expect(scriptContent).toContain('git rev-parse --abbrev-ref HEAD')
      expect(scriptContent).toContain('CURRENT_BRANCH')
      expect(scriptContent).toContain('if [ "$CURRENT_BRANCH" != "main" ]')
    })

    it('should warn if not on main branch', () => {
      expect(scriptContent).toContain('Not on main branch')
      expect(scriptContent).toContain('Continue anyway?')
    })

    it('should check for uncommitted changes', () => {
      expect(scriptContent).toContain('git status --porcelain')
      expect(scriptContent).toContain('Uncommitted changes detected')
      expect(scriptContent).toContain('Please commit or stash changes')
    })

    it('should verify git remote exists', () => {
      expect(scriptContent).toContain('git remote get-url origin')
      expect(scriptContent).toContain("No git remote 'origin' configured")
    })

    it('should run smoke tests before release', () => {
      expect(scriptContent).toContain('bash scripts/smoke-test.sh')
      expect(scriptContent).toContain('Smoke tests failed')
      expect(scriptContent).toContain('Smoke tests passed')
    })
  })

  describe('version bumping', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should get current version from package.json', () => {
      expect(scriptContent).toContain(
        'CURRENT_VERSION=$(node -p "require(\'./package.json\').version")'
      )
    })

    it('should use pnpm version command', () => {
      expect(scriptContent).toContain('pnpm version $VERSION_TYPE')
      expect(scriptContent).toContain('--no-git-tag-version')
    })

    it('should get new version after bump', () => {
      expect(scriptContent).toContain(
        'NEW_VERSION=$(node -p "require(\'./package.json\').version")'
      )
    })

    it('should display version change', () => {
      expect(scriptContent).toContain('Version bumped: $CURRENT_VERSION → $NEW_VERSION')
    })
  })

  describe('documentation updates', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should update README last updated date', () => {
      expect(scriptContent).toContain('CURRENT_DATE=$(date +%Y-%m-%d)')
      expect(scriptContent).toContain('grep -q "Last Updated:" README.md')
      expect(scriptContent).toContain('sed -i.bak')
      expect(scriptContent).toContain('Last Updated')
    })

    it('should clean up backup files', () => {
      expect(scriptContent).toContain('rm -f README.md.bak')
    })
  })

  describe('git operations', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should stage changed files', () => {
      expect(scriptContent).toContain('git add package.json README.md')
    })

    it('should create commit with version', () => {
      expect(scriptContent).toContain('COMMIT_MSG="chore: release v$NEW_VERSION"')
      expect(scriptContent).toContain('git commit -m "$COMMIT_MSG"')
    })

    it('should create git tag', () => {
      expect(scriptContent).toContain('TAG_NAME="v$NEW_VERSION"')
      expect(scriptContent).toContain('git tag -a "$TAG_NAME" -m "Release $TAG_NAME"')
    })

    it('should log git operations', () => {
      expect(scriptContent).toContain('Committed:')
      expect(scriptContent).toContain('Tagged:')
    })
  })

  describe('summary output', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should display release summary', () => {
      expect(scriptContent).toContain('Release Ready: v$NEW_VERSION')
      expect(scriptContent).toContain('Next steps:')
    })

    it('should provide next action instructions', () => {
      expect(scriptContent).toContain('Review changes: git show')
      expect(scriptContent).toContain('Push to remote: git push origin main --tags')
    })

    it('should mention CI/CD automation', () => {
      expect(scriptContent).toContain('GitHub Actions will automatically:')
      expect(scriptContent).toContain('Create GitHub release')
      expect(scriptContent).toContain('Publish to npm')
    })

    it('should provide abort instructions', () => {
      expect(scriptContent).toContain('Or to abort:')
      expect(scriptContent).toContain('git tag -d $TAG_NAME')
      expect(scriptContent).toContain('git reset --hard HEAD~1')
    })

    it('should use section dividers', () => {
      const dividers = scriptContent.match(/━{60,}/g)
      expect(dividers).toBeDefined()
      expect(dividers!.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('error handling', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should exit on validation failures', () => {
      expect(scriptContent).toContain('exit 1')
    })

    it('should provide helpful error messages', () => {
      const errorMessages = [
        'Missing version bump type',
        'Invalid version type',
        'Uncommitted changes detected',
        'Smoke tests failed',
      ]

      errorMessages.forEach((msg) => {
        expect(scriptContent).toContain(msg)
      })
    })

    it('should redirect smoke test output to temp file', () => {
      expect(scriptContent).toContain('/tmp/smoke-test-$$.log')
      expect(scriptContent).toContain('cat /tmp/smoke-test-$$.log')
      expect(scriptContent).toContain('rm -f /tmp/smoke-test-$$.log')
    })
  })

  describe('integration with project', () => {
    it('should be registered in package.json', () => {
      const packageJson = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf-8'))

      expect(packageJson.scripts).toHaveProperty('release:patch')
      expect(packageJson.scripts).toHaveProperty('release:minor')
      expect(packageJson.scripts).toHaveProperty('release:major')
      expect(packageJson.scripts).toHaveProperty('release:prerelease')

      expect(packageJson.scripts['release:patch']).toContain('release.sh patch')
      expect(packageJson.scripts['release:minor']).toContain('release.sh minor')
      expect(packageJson.scripts['release:major']).toContain('release.sh major')
      expect(packageJson.scripts['release:prerelease']).toContain('release.sh prerelease')
    })

    it('should reference smoke-test.sh correctly', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      expect(scriptContent).toContain('scripts/smoke-test.sh')
    })

    it('should use pnpm (not npm) for version command', () => {
      const scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')

      // Should use pnpm for version bumping
      expect(scriptContent).toContain('pnpm version $VERSION_TYPE')

      // Check that actual command uses pnpm, not npm
      // (ignore comments which may reference npm)
      const commandLines = scriptContent
        .split('\n')
        .filter((line) => !line.trim().startsWith('#'))
        .join('\n')

      const hasNpmCommand = /\b(npm\s+version|npm\s+publish)\b/.test(commandLines)
      expect(hasNpmCommand).toBe(false)
    })
  })

  describe('version type examples', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should document patch version increment', () => {
      expect(scriptContent).toContain('patch      # 0.1.0 → 0.1.1')
    })

    it('should document minor version increment', () => {
      expect(scriptContent).toContain('minor      # 0.1.0 → 0.2.0')
    })

    it('should document major version increment', () => {
      expect(scriptContent).toContain('major      # 0.1.0 → 1.0.0')
    })

    it('should document prerelease version increment', () => {
      expect(scriptContent).toContain('prerelease # 0.1.0 → 0.1.1-0')
    })
  })

  describe('user confirmation flow', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should prompt for confirmation when not on main', () => {
      expect(scriptContent).toContain('Continue anyway?')
      expect(scriptContent).toContain('read -p')
      expect(scriptContent).toContain('-n 1 -r')
    })

    it('should check for Y/y response', () => {
      expect(scriptContent).toContain('[Yy]')
      expect(scriptContent).toContain('Aborted')
    })
  })

  describe('temporal file cleanup', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should clean up smoke test logs', () => {
      const cleanupCommands = scriptContent.match(/rm -f \/tmp\/smoke-test-.*\.log/g)
      expect(cleanupCommands).toBeDefined()
      expect(cleanupCommands!.length).toBeGreaterThan(0)
    })

    it('should clean up sed backup files', () => {
      expect(scriptContent).toContain('rm -f README.md.bak')
    })
  })

  describe('compliance with release workflow', () => {
    let scriptContent: string

    beforeAll(() => {
      scriptContent = readFileSync(SCRIPT_PATH, 'utf-8')
    })

    it('should follow standard release steps', () => {
      // 1. Validation
      expect(scriptContent).toContain('git status --porcelain')

      // 2. Smoke tests
      expect(scriptContent).toContain('smoke-test.sh')

      // 3. Version bump
      expect(scriptContent).toContain('pnpm version')

      // 4. Documentation update
      expect(scriptContent).toContain('README.md')

      // 5. Git commit
      expect(scriptContent).toContain('git commit')

      // 6. Git tag
      expect(scriptContent).toContain('git tag')
    })

    it('should mention CI/CD integration', () => {
      expect(scriptContent).toContain('GitHub Actions')
      expect(scriptContent).toContain('Create GitHub release')
      expect(scriptContent).toContain('Publish to npm')
    })
  })

  describe('documentation references', () => {
    it('should be documented in maintenance guide', () => {
      const maintenancePath = join(PROJECT_ROOT, 'docs/maintenance.md')
      if (existsSync(maintenancePath)) {
        const maintenanceContent = readFileSync(maintenancePath, 'utf-8')
        // Check for release script references (may use script name or command)
        const hasReleaseReference =
          maintenanceContent.includes('release.sh') ||
          maintenanceContent.includes('release:patch') ||
          maintenanceContent.includes('pnpm release')

        expect(hasReleaseReference).toBe(true)
      }
    })
  })
})
