#!/bin/bash
#
# test-linux.sh
# Linux-specific binary testing script
#
# Tests the Linux binary with platform-specific checks and validations.
# Part of task-037-binary-testing-suite
#

set -e

echo "🐧 JoRA Linux Binary Testing"
echo "============================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BINARY_PATH="$PROJECT_ROOT/dist/jora-linux"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if binary exists
if [ ! -f "$BINARY_PATH" ]; then
    log_error "Linux binary not found: $BINARY_PATH"
    log_info "Run 'npm run build:linux' to create the binary"
    exit 1
fi

log_info "Testing binary: $BINARY_PATH"

# Check file permissions
if [ ! -x "$BINARY_PATH" ]; then
    log_warning "Binary not executable, fixing permissions..."
    chmod +x "$BINARY_PATH"
fi

# Check binary info
BINARY_SIZE=$(du -h "$BINARY_PATH" | cut -f1)
log_info "Binary size: $BINARY_SIZE"

# Platform-specific checks
log_info "Platform: $(uname -s) $(uname -m)"
log_info "Kernel: $(uname -r)"

# Check dependencies
log_info "Checking system dependencies..."

# Check if we have required tools
if ! command -v curl >/dev/null 2>&1; then
    log_warning "curl not found - some tests may fail"
fi

if ! command -v ldd >/dev/null 2>&1; then
    log_warning "ldd not found - cannot check shared library dependencies"
else
    log_info "Checking shared library dependencies..."
    # Most Node.js binaries should be quite self-contained
    DEPS=$(ldd "$BINARY_PATH" 2>/dev/null | wc -l)
    log_info "Shared library dependencies: $DEPS"
fi

# Test binary execution
log_info "Testing binary execution..."

echo ""
echo "🧪 Running comprehensive tests..."
echo "================================"

# Run the comprehensive test suite
node "$SCRIPT_DIR/../testing/test-binaries.js" --binary=jora-linux --verbose

TEST_EXIT_CODE=$?

echo ""
echo "📋 Linux-Specific Summary:"
echo "=========================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    log_success "Linux binary passed all tests!"
    log_info "Binary is ready for Linux distribution"
    log_info "Users can run: chmod +x jora-linux && ./jora-linux"
    exit 0
else
    log_error "Linux binary failed some tests"
    log_info "Check the test output above for details"
    exit 1
fi
