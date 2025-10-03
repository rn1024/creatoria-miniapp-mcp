#!/bin/bash
###############################################################################
# Release Script
#
# Handles version bumping, changelog generation, git tagging, and publishing
#
# Usage:
#   bash scripts/release.sh [patch|minor|major|prerelease]
#
# Examples:
#   bash scripts/release.sh patch      # 0.1.0 → 0.1.1
#   bash scripts/release.sh minor      # 0.1.0 → 0.2.0
#   bash scripts/release.sh major      # 0.1.0 → 1.0.0
#   bash scripts/release.sh prerelease # 0.1.0 → 0.1.1-0
###############################################################################

set -e  # Exit on error
set -u  # Error on undefined variables

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}ℹ${NC}  $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

###############################################################################
# Validation
###############################################################################

# Check if npm version argument is provided
if [ $# -eq 0 ]; then
    log_error "Missing version bump type"
    echo ""
    echo "Usage: bash scripts/release.sh [patch|minor|major|prerelease]"
    echo ""
    echo "Examples:"
    echo "  patch      - 0.1.0 → 0.1.1 (bug fixes)"
    echo "  minor      - 0.1.0 → 0.2.0 (new features)"
    echo "  major      - 0.1.0 → 1.0.0 (breaking changes)"
    echo "  prerelease - 0.1.0 → 0.1.1-0 (pre-release)"
    exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major|prerelease)$ ]]; then
    log_error "Invalid version type: $VERSION_TYPE"
    echo "Must be one of: patch, minor, major, prerelease"
    exit 1
fi

# Check if on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_warning "Not on main branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Aborted"
        exit 0
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    log_error "Uncommitted changes detected"
    echo ""
    git status --short
    echo ""
    log_info "Please commit or stash changes before releasing"
    exit 1
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    log_error "No git remote 'origin' configured"
    exit 1
fi

###############################################################################
# Pre-Release Checks
###############################################################################

log_info "Running pre-release checks..."

# Run smoke test
log_info "Running smoke tests..."
if ! bash scripts/smoke-test.sh > /tmp/smoke-test-$$.log 2>&1; then
    log_error "Smoke tests failed"
    cat /tmp/smoke-test-$$.log
    rm -f /tmp/smoke-test-$$.log
    exit 1
fi
log_success "Smoke tests passed"
rm -f /tmp/smoke-test-$$.log

###############################################################################
# Version Bump
###############################################################################

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
log_info "Current version: $CURRENT_VERSION"

# Bump version using npm
log_info "Bumping version ($VERSION_TYPE)..."
pnpm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
log_success "Version bumped: $CURRENT_VERSION → $NEW_VERSION"

###############################################################################
# Update Documentation
###############################################################################

log_info "Updating documentation..."

# Update README last updated date
CURRENT_DATE=$(date +%Y-%m-%d)
if grep -q "Last Updated:" README.md; then
    sed -i.bak "s/\*\*Last Updated\*\*:.*/\*\*Last Updated\*\*: $CURRENT_DATE/" README.md
    rm -f README.md.bak
    log_success "Updated README.md"
fi

###############################################################################
# Git Commit & Tag
###############################################################################

log_info "Creating git commit and tag..."

# Stage changes
git add package.json README.md

# Create commit
COMMIT_MSG="chore: release v$NEW_VERSION"
git commit -m "$COMMIT_MSG"
log_success "Committed: $COMMIT_MSG"

# Create git tag
TAG_NAME="v$NEW_VERSION"
git tag -a "$TAG_NAME" -m "Release $TAG_NAME"
log_success "Tagged: $TAG_NAME"

###############################################################################
# Summary & Next Steps
###############################################################################

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Release Ready: v$NEW_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Review changes: git show"
echo "  2. Push to remote: git push origin main --tags"
echo "  3. GitHub Actions will automatically:"
echo "     - Create GitHub release"
echo "     - Publish to npm (if stable release)"
echo ""
echo "Or to abort:"
echo "  git tag -d $TAG_NAME"
echo "  git reset --hard HEAD~1"
echo ""
