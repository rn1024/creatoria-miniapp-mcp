# Maintenance Guide

This document provides guidance for maintaining the creatoria-miniapp-mcp project, including regular tasks, updates, monitoring, and troubleshooting.

---

## 📋 Table of Contents

- [Regular Maintenance Tasks](#regular-maintenance-tasks)
- [Dependency Management](#dependency-management)
- [Release Process](#release-process)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Backup & Recovery](#backup--recovery)
- [Performance Tuning](#performance-tuning)
- [Security Updates](#security-updates)
- [Troubleshooting](#troubleshooting)

---

## Regular Maintenance Tasks

### Weekly Tasks

#### 1. Run Smoke Tests

Ensure core functionality is working:

```bash
pnpm smoke-test
```

**Expected Output**:
- ✅ Unit Tests: 354 passing
- ✅ Tool Count: 65 tools
- ✅ Lint: No errors
- ✅ Format: All files formatted

**If Failed**: See [Troubleshooting](#troubleshooting) section

---

#### 2. Check for Security Vulnerabilities

Run npm audit:

```bash
pnpm audit
```

**Action Required**:
- **High/Critical**: Fix immediately
- **Moderate**: Schedule fix within 1 week
- **Low**: Review and fix in next release

**Fix Vulnerabilities**:
```bash
# Automatic fix (if available)
pnpm audit fix

# Manual fix (update specific package)
pnpm update <package-name>
```

---

#### 3. Review Open Issues

Check GitHub Issues for:
- Bug reports requiring triage
- Feature requests to evaluate
- Questions needing answers

**Triage Labels**:
- `bug` - Confirmed bugs
- `enhancement` - Feature requests
- `question` - User questions
- `good first issue` - Good for new contributors

---

### Monthly Tasks

#### 1. Dependency Updates

Check for outdated dependencies:

```bash
pnpm outdated
```

**Update Strategy**:
- **Patch updates** (0.1.0 → 0.1.1): Update immediately
- **Minor updates** (0.1.0 → 0.2.0): Test thoroughly, update monthly
- **Major updates** (0.1.0 → 1.0.0): Review breaking changes, plan migration

**Update Process**:
```bash
# Update all patch versions
pnpm update

# Update specific package to latest
pnpm update <package-name>@latest

# After updating, run full test suite
pnpm test
pnpm smoke-test
```

---

#### 2. Review and Update Documentation

- [ ] Check if README.md tool count matches actual tools (65)
- [ ] Update examples if API changes occurred
- [ ] Review troubleshooting guide for new issues
- [ ] Check if architecture docs are up to date

**Update Tool Count**:
```bash
pnpm update-readme
```

---

#### 3. Performance Monitoring

Check for performance regressions:

```bash
# Run unit tests with timing
pnpm test:unit --verbose

# Check for slow tests (>1s)
```

**Performance Metrics**:
- Unit test suite: < 10 seconds
- Smoke test: < 20 seconds
- Individual test: < 1 second (warn if exceeded)

---

### Quarterly Tasks

#### 1. Major Version Updates

Review and plan major dependency updates:
- TypeScript
- Node.js (LTS versions)
- @modelcontextprotocol/sdk
- Jest
- ESLint/Prettier

**Process**:
1. Create feature branch: `chore/update-deps-Q2-2025`
2. Update one major dependency at a time
3. Run full test suite after each update
4. Document breaking changes in CHANGELOG.md
5. Create PR for review

---

#### 2. Security Audit

Perform comprehensive security review:

```bash
# Run npm audit
pnpm audit

# Check for known vulnerabilities in dependencies
npm outdated --long
```

**Review**:
- [ ] No high/critical vulnerabilities
- [ ] All dependencies actively maintained
- [ ] No deprecated packages

---

#### 3. Code Quality Review

Run full quality checks:

```bash
# Type coverage
pnpm typecheck

# Lint entire codebase
pnpm lint

# Check code formatting
pnpm format:check

# Run all tests
pnpm test
```

---

## Dependency Management

### Updating Dependencies

#### Safe Update Process

```bash
# 1. Create branch
git checkout -b chore/update-dependencies

# 2. Update patch versions
pnpm update

# 3. Run smoke test
pnpm smoke-test

# 4. Commit
git add package.json pnpm-lock.yaml
git commit -m "chore: update dependencies (patch)"

# 5. Push and create PR
git push origin chore/update-dependencies
```

---

### Critical Dependencies

Monitor these closely for updates:

| Dependency | Purpose | Update Frequency |
|------------|---------|------------------|
| `miniprogram-automator` | Core automation SDK | Check monthly |
| `@modelcontextprotocol/sdk` | MCP protocol | Check weekly |
| `typescript` | Type system | Minor updates only |
| `jest` | Testing framework | Quarterly |

---

### Known Issues

#### miniprogram-automator Type Declarations

**Issue**: Incomplete TypeScript type definitions

**Impact**: Build warnings (not errors), does not affect runtime

**Workaround**: Treated as warnings in smoke-test.sh

**Long-term Fix**:
- Contribute to upstream package
- Or create local `.d.ts` declarations

---

## Release Process

### Automated Release via Script

Use the release script for version bumping and tagging:

```bash
# Patch release (0.1.0 → 0.1.1)
pnpm release:patch

# Minor release (0.1.0 → 0.2.0)
pnpm release:minor

# Major release (0.1.0 → 1.0.0)
pnpm release:major

# Pre-release (0.1.0 → 0.1.1-0)
pnpm release:prerelease
```

**The script will**:
1. Run smoke tests
2. Bump version in package.json
3. Update README.md "Last Updated" date
4. Create git commit
5. Create git tag (v0.1.1)
6. Display next steps

**After Script Completes**:
```bash
# Push to GitHub (triggers CI/CD)
git push origin main --tags
```

**GitHub Actions will**:
- Create GitHub release with changelog
- Publish to npm (stable releases only)

---

### Manual Release Process

If the script fails or you need more control:

```bash
# 1. Ensure clean working directory
git status

# 2. Run smoke test manually
pnpm smoke-test

# 3. Bump version
pnpm version patch  # or minor/major

# 4. Update docs
# Edit README.md "Last Updated" date

# 5. Commit and tag
git add .
git commit -m "chore: release v0.1.1"
git tag -a v0.1.1 -m "Release v0.1.1"

# 6. Push
git push origin main --tags
```

---

### Release Checklist

Before creating a release:

- [ ] All smoke tests passing
- [ ] README.md tool count updated (if tools changed)
- [ ] CHANGELOG.md updated with release notes
- [ ] No open critical bugs
- [ ] Documentation up to date
- [ ] Examples tested

---

## Monitoring & Health Checks

### Automated Health Checks

#### GitHub Actions CI

Monitors:
- Every PR merge
- Every push to main branch
- Node.js 18.x and 20.x compatibility

**Check Status**: https://github.com/your-org/creatoria-miniapp-mcp/actions

---

#### Smoke Test Coverage

The smoke test validates:

1. **Build**: TypeScript compilation
2. **Type Check**: tsc --noEmit
3. **Unit Tests**: 354 tests across all tool categories
4. **Tool Count**: Exactly 65 tools registered
5. **Lint**: ESLint with 0 errors
6. **Format**: Prettier compliance

**Run Locally**:
```bash
pnpm smoke-test
```

---

### Manual Health Checks

#### 1. Tool Registration Integrity

Verify tool count hasn't regressed:

```bash
pnpm update-readme 2>&1 | grep "Total:"
# Expected: 📊 Total: 65 tools
```

---

#### 2. Session Cleanup

Verify session cleanup works correctly:

```bash
# Run session tests
pnpm test tests/unit/session.test.ts
```

**Expected**: All tests pass with proper cleanup logs

---

#### 3. Example Scripts

Periodically run example scripts to ensure they work:

```bash
# Set test project
export TEST_PROJECT_PATH="/path/to/test/miniprogram"

# Run basic example
npx tsx examples/scripts/01-basic-navigation.ts
```

---

## Backup & Recovery

### What to Backup

1. **Source Code**: Stored in Git (GitHub)
2. **Configuration Files**:
   - `.mcp.json` (user-specific, not in git)
   - `package.json`
   - `tsconfig.json`
   - `.eslintrc.cjs`

3. **Documentation**: All in git under `docs/`

4. **Test Artifacts** (optional):
   - `.mcp-artifacts/` (generated, can be recreated)

---

### Recovery Procedures

#### Recover from Git

```bash
# Clone fresh repository
git clone https://github.com/your-org/creatoria-miniapp-mcp.git
cd creatoria-miniapp-mcp

# Install dependencies
pnpm install

# Build
pnpm build

# Verify
pnpm smoke-test
```

---

#### Recover Lost Configuration

If `.mcp.json` is lost:

```json
// Create new .mcp.json
{
  "projectPath": "/path/to/your/miniprogram",
  "cliPath": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
  "port": 9420
}
```

---

## Performance Tuning

### Identify Slow Tests

```bash
# Run tests with verbose timing
pnpm test:unit --verbose | grep -E "PASS|FAIL|\\([0-9]+\\s*ms\\)"
```

**Action Thresholds**:
- Test > 1 second: Investigate and optimize
- Test suite > 10 seconds: Review test structure

---

### Optimize Session Cleanup

Default session timeout: 30 minutes

**Reduce timeout for faster cleanup**:
```javascript
// In server config
{
  sessionTimeout: 10 * 60 * 1000  // 10 minutes
}
```

**Trade-off**: Shorter timeout = more frequent cleanups, but less idle time tolerance

---

### Tool Call Optimization

Use element references to avoid repeated queries:

```javascript
// ❌ Slow: Query element each time
await element_tap({ selector: '.btn' })
await element_get_text({ selector: '.btn' })

// ✅ Fast: Query once, use refId
const btn = await page_query({ selector: '.btn', save: true })
await element_tap({ refId: btn.refId })
await element_get_text({ refId: btn.refId })
```

---

## Security Updates

### Vulnerability Response Process

1. **Detection**: `pnpm audit` or GitHub Dependabot alert

2. **Assessment**:
   - Severity: Critical/High/Moderate/Low
   - Exploitability: Is the vulnerable code path used?
   - Availability of fix: Is patch available?

3. **Response Timeline**:
   - **Critical**: Fix within 24 hours
   - **High**: Fix within 1 week
   - **Moderate**: Fix in next release cycle
   - **Low**: Track for future update

4. **Fix Application**:
   ```bash
   # Update vulnerable package
   pnpm update <package-name>@<safe-version>

   # Run full test suite
   pnpm smoke-test

   # Create hotfix PR
   git checkout -b security/fix-<vulnerability-id>
   git commit -m "security: fix <vulnerability-description>"
   ```

5. **Release**:
   - Create patch release if critical/high
   - Include in regular release if moderate/low

---

### Regular Security Practices

- [ ] Enable Dependabot alerts on GitHub
- [ ] Review `pnpm audit` output weekly
- [ ] Keep Node.js updated to LTS versions
- [ ] Subscribe to security advisories for critical dependencies

---

## Troubleshooting

### Common Maintenance Issues

#### Issue: Smoke Test Fails After Dependency Update

**Symptoms**:
```bash
$ pnpm smoke-test
❌ Unit Tests FAILED
```

**Diagnosis**:
```bash
# Run tests with verbose output
pnpm test:unit --verbose

# Check for breaking changes in updated packages
git diff HEAD~1 package.json
```

**Resolution**:
1. Identify which dependency caused failure
2. Check changelog for breaking changes
3. Update code to accommodate changes
4. Or revert update: `pnpm install <package>@<previous-version>`

---

#### Issue: Tool Count Mismatch

**Symptoms**:
```bash
$ pnpm update-readme
❌ Expected 65 tools, found 63
```

**Diagnosis**:
```bash
# Check which tools are missing
pnpm update-readme 2>&1 | less
```

**Resolution**:
1. Verify all tool files in `src/tools/` are exporting tools correctly
2. Check `src/tools/index.ts` registration
3. Ensure CATEGORY_METADATA matches tool arrays

---

#### Issue: Build Fails on CI but Passes Locally

**Symptoms**: GitHub Actions fail, local build succeeds

**Common Causes**:
- Node version mismatch
- Missing environment variables
- File system case sensitivity (macOS vs Linux)

**Resolution**:
```bash
# Test with same Node version as CI
nvm use 20

# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Build
pnpm build
```

---

#### Issue: Release Script Fails

**Symptoms**:
```bash
$ pnpm release:patch
❌ Uncommitted changes detected
```

**Resolution**:
```bash
# Commit or stash changes first
git status
git add .
git commit -m "chore: prepare for release"

# Retry release
pnpm release:patch
```

---

## Additional Resources

### Documentation

- [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Architecture](./architecture.md) - System design overview
- [API Reference](./api/README.md) - Complete tool documentation

### External Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [miniprogram-automator Docs](https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check Existing Issues**: [GitHub Issues](https://github.com/your-org/creatoria-miniapp-mcp/issues)
2. **Start Discussion**: [GitHub Discussions](https://github.com/your-org/creatoria-miniapp-mcp/discussions)
3. **Contact Maintainers**: Open an issue with `question` label

---

**Last Updated**: 2025-10-03
**Next Review**: 2026-01-03 (Quarterly)
