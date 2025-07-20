#!/usr/bin/env node
/**
 * Enhanced Binary Testing Suite for JoRA
 * 
 * Comprehensive testing of JoRA binaries including startup, server, API, frontend, and data tests.
 * Uses the BinaryTester class for thorough validation.
 * 
 * Usage:
 *   npm run test:binaries              # Test all binaries
 *   node scripts/test-binaries.js      # Test all binaries
 *   node scripts/test-binaries.js --quick  # Quick test (startup only)
 *   node scripts/test-binaries.js --verbose # Verbose output
 *   node scripts/test-binaries.js --binary jora-mac # Test specific binary
 */

const path = require('path');
const fs = require('fs');
const BinaryTester = require('./BinaryTester');

const binariesPath = path.join(__dirname, '../../dist');
const binaries = [
  { name: 'jora-mac', platform: 'macos' },
  { name: 'jora-linux', platform: 'linux' },
  { name: 'jora-win.exe', platform: 'windows' }
];

// Parse command line arguments
const args = process.argv.slice(2);
const isQuickMode = args.includes('--quick');
const isVerbose = args.includes('--verbose');
const specificBinary = args.find(arg => arg.startsWith('--binary='))?.split('=')[1];

function getSizeInMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(1);
  } catch (error) {
    return 'unknown';
  }
}

async function testBinaryComprehensive(binaryPath, binaryName, platform) {
  console.log(`\n🎯 Testing ${binaryName} (${platform})...`);
  console.log('═'.repeat(60));
  
  // Check if this is a cross-platform scenario
  const currentPlatform = process.platform;
  const isCompatible = (
    (platform === 'macos' && currentPlatform === 'darwin') ||
    (platform === 'linux' && currentPlatform === 'linux') ||
    (platform === 'windows' && currentPlatform === 'win32')
  );
  
  if (!isCompatible) {
    console.log(`⚠️  Cross-platform testing: ${platform} binary on ${currentPlatform}`);
    console.log('📋 Will perform basic file validation only');
  }
  
  try {
    // Make sure binary is executable (Unix systems only)
    if (currentPlatform !== 'win32') {
      try {
        fs.chmodSync(binaryPath, '755');
      } catch (error) {
        console.log(`⚠️  Could not set permissions for ${binaryName}`);
      }
    }

    // Find available port for testing (only if compatible)
    let testPort = 3333;
    if (isCompatible && !isQuickMode) {
      testPort = await findAvailablePort(3333);
    }
    
    const tester = new BinaryTester(binaryPath, platform, {
      port: testPort,
      verbose: isVerbose,
      timeout: 15000
    });

    let report;
    if (isQuickMode || !isCompatible) {
      console.log('🚀 Running quick tests (startup only)...');
      await tester.runStartupTests();
      report = tester.generateReport();
    } else {
      console.log('🧪 Running comprehensive test suite...');
      report = await tester.runAllTests();
    }

    // Adjust status for cross-platform scenarios
    let status = report.summary.failed === 0 ? 'passed' : 'failed';
    if (!isCompatible) {
      // For cross-platform, we expect some failures
      const crossPlatformFailures = report.results.filter(r => 
        !r.passed && r.details && r.details.includes('Cross-platform')
      ).length;
      
      if (crossPlatformFailures === report.summary.failed) {
        status = 'cross-platform'; // All failures are expected cross-platform issues
      }
    }

    return {
      name: binaryName,
      platform: platform,
      status: status,
      size: getSizeInMB(binaryPath),
      tests: report.summary,
      details: report.results,
      compatible: isCompatible
    };

  } catch (error) {
    console.log(`❌ ${binaryName} - Critical Error: ${error.message}`);
    return {
      name: binaryName,
      platform: platform,
      status: 'error',
      size: getSizeInMB(binaryPath),
      error: error.message,
      compatible: isCompatible
    };
  }
}

async function findAvailablePort(startPort) {
  const net = require('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, (err) => {
      if (err) {
        server.close();
        // Try next port
        findAvailablePort(startPort + 1).then(resolve);
      } else {
        const port = server.address().port;
        server.close();
        resolve(port);
      }
    });
  });
}

async function main() {
  console.log('🎯 JoRA Enhanced Binary Testing Suite');
  console.log('═'.repeat(50));
  console.log(`Mode: ${isQuickMode ? 'Quick (startup only)' : 'Comprehensive'}`);
  console.log(`Verbose: ${isVerbose ? 'Yes' : 'No'}`);
  if (specificBinary) {
    console.log(`Target: ${specificBinary}`);
  }
  console.log('');

  const results = [];
  let binariesToTest = binaries;

  // Filter binaries if specific binary requested
  if (specificBinary) {
    binariesToTest = binaries.filter(b => b.name === specificBinary);
    if (binariesToTest.length === 0) {
      console.log(`❌ Binary not found: ${specificBinary}`);
      console.log(`Available binaries: ${binaries.map(b => b.name).join(', ')}`);
      process.exit(1);
    }
  }

  for (const binary of binariesToTest) {
    const binaryPath = path.join(binariesPath, binary.name);
    
    if (!fs.existsSync(binaryPath)) {
      console.log(`⚠️  ${binary.name} not found - skipping`);
      results.push({ 
        name: binary.name, 
        platform: binary.platform,
        status: 'not_found', 
        size: '0',
        tests: { totalTests: 0, passed: 0, failed: 0, successRate: '0%' }
      });
      continue;
    }

    const result = await testBinaryComprehensive(binaryPath, binary.name, binary.platform);
    results.push(result);
  }

  // Generate summary report
  printFinalSummary(results);

  // Save detailed report to file
  await saveTestReport(results);

  // Exit with appropriate code
  const hasFailures = results.some(r => r.status === 'failed' || r.status === 'error');
  process.exit(hasFailures ? 1 : 0);
}

function printFinalSummary(results) {
  console.log('\n\n📊 Final Test Summary');
  console.log('═'.repeat(80));
  
  let totalSize = 0;
  let workingCount = 0;
  let crossPlatformCount = 0;
  let totalTests = 0;
  let totalPassed = 0;
  
  results.forEach(result => {
    const status = result.status === 'passed' ? '✅' : 
                   result.status === 'cross-platform' ? '🔀' :
                   result.status === 'failed' ? '❌' : 
                   result.status === 'not_found' ? '⚠️' : '💥';
    
    const testInfo = result.tests ? 
      `${result.tests.passed}/${result.tests.totalTests} tests (${result.tests.successRate})` :
      'No test data';
    
    const platformInfo = result.compatible === false ? ' (cross-platform)' : '';
    
    console.log(`${status} ${result.name.padEnd(15)} - ${result.size.padEnd(6)} MB - ${result.platform.padEnd(8)} - ${testInfo}${platformInfo}`);
    
    if (result.status === 'passed') workingCount++;
    if (result.status === 'cross-platform') crossPlatformCount++;
    if (result.size !== 'unknown' && result.size !== '0') {
      totalSize += parseFloat(result.size);
    }
    
    if (result.tests) {
      totalTests += result.tests.totalTests;
      totalPassed += result.tests.passed;
    }

    // Show failed tests if any (excluding expected cross-platform failures)
    if (result.status === 'failed' && result.details && !isVerbose) {
      const realFailures = result.details.filter(t => 
        !t.passed && !(t.details && t.details.includes('Cross-platform'))
      );
      if (realFailures.length > 0) {
        console.log(`  Failed: ${realFailures.map(t => t.test).join(', ')}`);
      }
    }
  });

  console.log('\n📈 Overall Statistics:');
  console.log(`   Total binary size: ${totalSize.toFixed(1)} MB`);
  console.log(`   Working binaries: ${workingCount}/${results.length}`);
  if (crossPlatformCount > 0) {
    console.log(`   Cross-platform tested: ${crossPlatformCount}/${results.length}`);
  }
  console.log(`   Total tests run: ${totalPassed}/${totalTests} passed`);
  
  if (totalTests > 0) {
    const overallSuccessRate = ((totalPassed / totalTests) * 100).toFixed(1);
    console.log(`   Overall success rate: ${overallSuccessRate}%`);
  }
  
  // Determine overall status
  const compatibleResults = results.filter(r => r.compatible !== false);
  const compatibleWorking = compatibleResults.filter(r => r.status === 'passed').length;
  
  if (compatibleWorking === compatibleResults.length && compatibleResults.length > 0) {
    console.log('\n🎉 All compatible binaries passed tests! Ready for distribution.');
  } else if (workingCount + crossPlatformCount === results.length) {
    console.log('\n⚠️  All binaries validated (some cross-platform). Build looks good.');
  } else {
    console.log('\n❌ Some binaries failed critical tests. Build needs attention.');
  }
}

async function saveTestReport(results) {
  try {
    const reportDir = path.join(__dirname, '../../dist/test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `binary-test-report-${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      mode: isQuickMode ? 'quick' : 'comprehensive',
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        arch: process.arch
      },
      results: results,
      summary: {
        totalBinaries: results.length,
        workingBinaries: results.filter(r => r.status === 'passed').length,
        totalTests: results.reduce((sum, r) => sum + (r.tests?.totalTests || 0), 0),
        passedTests: results.reduce((sum, r) => sum + (r.tests?.passed || 0), 0)
      }
    };

    await fs.promises.writeFile(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportFile}`);
  } catch (error) {
    console.log(`⚠️  Could not save test report: ${error.message}`);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { testBinaryComprehensive, getSizeInMB };
