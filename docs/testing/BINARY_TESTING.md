# JoRA Binary Testing Suite

## 📋 Overview

Comprehensive testing suite for JoRA binary distribution automation. This suite validates that binaries are production-ready across all target platforms (Linux, Windows, macOS).

## 🧪 Test Categories

### 🚀 Startup Tests
- Binary execution validation
- Version command (`--version`)
- Help command (`--help`)

### 🌐 Server Tests
- Port binding verification
- Health endpoint validation
- Server startup/shutdown

### 📡 API Tests
- Core API endpoint validation (`/api/config`, `/api/tasks`, `/api/epics`, `/api/releases`)
- JSON response validation
- HTTP status code verification

### 🎨 Frontend Tests
- Main HTML page loading
- Static asset serving
- React bundle validation

### 💾 Data Tests
- JSON database read operations
- Data structure validation

## 🛠️ Usage

### Quick Testing (Recommended)
```bash
# Test all binaries (quick mode)
npm run test:binaries:quick

# Test specific binary
node scripts/test-binaries.js --binary=jora-mac --quick

# Verbose output
npm run test:binaries:verbose
```

### Comprehensive Testing
```bash
# Full test suite (slower, includes server tests)
npm run test:binaries

# Platform-specific testing
npm run test:macos      # macOS specific tests
npm run test:linux      # Linux specific tests  
npm run test:windows    # Windows specific tests
```

### Distribution Validation
```bash
# Validate distribution readiness
npm run validate:distribution

# Verbose validation
npm run validate:distribution:verbose
```

### Report Generation
```bash
# Generate HTML report from latest test
node scripts/testing/generate-test-report.js

# Generate from specific test file
node scripts/testing/generate-test-report.js dist/test-results/binary-test-report-*.json
```

## 📁 Files Created

### Core Testing Infrastructure
- `scripts/testing/BinaryTester.js` - Main testing class with comprehensive validation
- `scripts/testing/test-binaries.js` - Enhanced binary testing orchestrator
- `scripts/testing/validate-distribution.js` - Distribution readiness validator
- `scripts/testing/generate-test-report.js` - HTML report generator

### Platform-Specific Scripts
- `scripts/platform/test-linux.sh` - Linux binary testing with platform checks
- `scripts/platform/test-macos.sh` - macOS binary testing with Apple Silicon support
- `scripts/platform/test-windows.ps1` - Windows binary testing with PowerShell

### Test Data
- `scripts/test-data/sample-tasks.json` - Sample task data for validation
- `scripts/test-data/sample-config.json` - Test configuration file

### Output
- `dist/test-results/` - Directory containing test reports (JSON and HTML)
- `dist/test-results/binary-test-report-*.json` - Detailed test results
- `dist/test-results/binary-test-report-*.html` - Visual HTML reports
- `dist/test-results/distribution-validation-*.json` - Distribution validation reports

## 🔧 Configuration

The testing suite supports several configuration options:

### Command Line Arguments
- `--quick` - Run startup tests only (faster)
- `--verbose` - Show detailed output
- `--binary=<name>` - Test specific binary only
- `--skip-slow-tests` - Skip time-consuming tests

### Environment Detection
- Automatically detects cross-platform scenarios
- Skips incompatible tests (e.g., Linux binary on macOS)
- Finds available ports for server testing
- Handles permission issues gracefully

## 📊 Success Criteria

### Must Pass
- ✅ All binaries start without errors
- ✅ Version and help commands work
- ✅ Binary size within reasonable limits (30MB - 150MB)
- ✅ No critical security vulnerabilities

### Performance Targets
- ✅ Binary startup < 5 seconds
- ✅ API response time < 500ms
- ✅ Memory usage < 200MB after 1 hour

### Platform Compatibility
- ✅ Linux x64 (Ubuntu, CentOS, Debian)
- ✅ Windows x64 (Windows 10+)
- ✅ macOS (Intel & Apple Silicon)

## 🚨 Error Handling

### Critical Errors (Build Fails)
- Binary won't execute
- Version/help commands fail
- Server startup fails
- API endpoints return errors

### Warnings (Note but Continue)
- Cross-platform execution limitations
- Missing optional dependencies
- Performance below targets
- Code signing warnings

## 📈 Reporting

### Console Output
Real-time test progress with colored status indicators:
- ✅ Green: Test passed
- ❌ Red: Test failed
- ⚠️ Yellow: Warning/cross-platform limitation
- 🔀 Blue: Cross-platform test (expected failure)

### JSON Reports
Detailed machine-readable reports with:
- Test results and timing
- Binary metadata (size, permissions)
- Environment information
- Error details and stack traces

### HTML Reports  
Visual reports with:
- Interactive dashboard
- Test result summary
- Platform-specific details
- Performance metrics
- Responsive design for mobile viewing

## 🔄 CI/CD Integration

### Exit Codes
- `0` - All tests passed
- `1` - Critical test failures

### GitHub Actions Integration
```yaml
- name: Test Binaries
  run: npm run test:binaries:quick
  
- name: Validate Distribution
  run: npm run validate:distribution
  
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: dist/test-results/
```

## 🔧 Development

### Adding New Tests
1. Extend `BinaryTester` class with new test methods
2. Add test categories to the main test runner
3. Update platform-specific scripts if needed
4. Document new test criteria

### Debugging
```bash
# Run single test with maximum verbosity
node scripts/testing/test-binaries.js --binary=jora-mac --verbose

# Test specific functionality
node -e "const BT = require('./scripts/testing/BinaryTester'); const t = new BT('./dist/jora-mac', 'macos'); t.runStartupTests()"
```

## 📝 Notes

- **Cross-Platform Testing**: Tests automatically detect platform compatibility and adjust expectations
- **Port Management**: Automatically finds available ports to avoid conflicts
- **Graceful Degradation**: Tests continue even if some components fail
- **Version Agnostic**: No hardcoded version dependencies, works with any JoRA release
- **Security Conscious**: Validates binary integrity and permissions
- **Performance Aware**: Monitors resource usage and timing
- **Documentation**: Self-documenting with detailed error messages

---

**Status**: ✅ **COMPLETE** - Full binary testing suite implemented  
**Ready for**: Production use and CI/CD integration  
**Maintainer**: gzzy  
**Created**: July 20, 2025
