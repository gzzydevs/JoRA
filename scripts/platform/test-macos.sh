#!/bin/bash
#
# test-macos.sh
# macOS-specific binary testing script
#
# Tests the macOS binary with platform-specific checks and validations.
# Part of task-037-binary-testing-suite
#

set -e

echo "🍎 JoRA macOS Binary Testing"
echo "============================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BINARY_PATH="$PROJECT_ROOT/dist/jora-mac"

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
    log_error "macOS binary not found: $BINARY_PATH"
    log_info "Run 'npm run build:mac' to create the binary"
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
log_info "macOS Version: $(sw_vers -productVersion)"

# Check if it's Apple Silicon or Intel
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    log_info "Architecture: Apple Silicon (M1/M2)"
    
    # Check if binary can run natively or needs Rosetta
    if file "$BINARY_PATH" | grep -q "x86_64"; then
        log_warning "Binary is x86_64 - will run under Rosetta on Apple Silicon"
    else
        log_info "Binary architecture matches system"
    fi
elif [ "$ARCH" = "x86_64" ]; then
    log_info "Architecture: Intel x86_64"
else
    log_warning "Unknown architecture: $ARCH"
fi

# Check code signing status (if available)
if command -v codesign >/dev/null 2>&1; then
    log_info "Checking code signing status..."
    if codesign -dv "$BINARY_PATH" 2>/dev/null; then
        log_info "Binary is code signed"
    else
        log_warning "Binary is not code signed (normal for development)"
    fi
fi

# Check quarantine status (if xattr is available)
if command -v xattr >/dev/null 2>&1; then
    QUARANTINE=$(xattr -l "$BINARY_PATH" 2>/dev/null | grep "com.apple.quarantine" || true)
    if [ -n "$QUARANTINE" ]; then
        log_warning "Binary has quarantine attribute - may require user approval"
        log_info "Users may need to run: xattr -d com.apple.quarantine jora-mac"
    else
        log_info "No quarantine attribute found"
    fi
fi

# Check dependencies
log_info "Checking system dependencies..."

if ! command -v curl >/dev/null 2>&1; then
    log_warning "curl not found - some tests may fail"
fi

# Check otool for library dependencies (macOS specific)
if command -v otool >/dev/null 2>&1; then
    log_info "Checking library dependencies..."
    DEPS=$(otool -L "$BINARY_PATH" 2>/dev/null | tail -n +2 | wc -l)
    log_info "Library dependencies: $DEPS"
fi

# Test binary execution
log_info "Testing binary execution..."

echo ""
echo "🧪 Running comprehensive tests..."
echo "================================"

# Run the comprehensive test suite
node "$SCRIPT_DIR/../testing/test-binaries.js" --binary=jora-mac --verbose

TEST_EXIT_CODE=$?

echo ""
echo "📋 macOS-Specific Summary:"
echo "========================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    log_success "macOS binary passed all tests!"
    log_info "Binary is ready for macOS distribution"
    log_info "Users can run: ./jora-mac"
    
    if [ "$ARCH" = "arm64" ] && file "$BINARY_PATH" | grep -q "x86_64"; then
        log_info "Note: Binary will run under Rosetta on Apple Silicon"
    fi
    
    exit 0
else
    log_error "macOS binary failed some tests"
    log_info "Check the test output above for details"
    exit 1
fi
