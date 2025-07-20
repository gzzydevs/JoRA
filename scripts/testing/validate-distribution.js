#!/usr/bin/env node
/**
 * validate-distribution.js
 * 
 * Comprehensive validation suite for JoRA distribution readiness.
 * Validates that all binaries are production-ready for release.
 * 
 * Part of: task-037-binary-testing-suite
 * Author: gzzy
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const BinaryTester = require('./BinaryTester');

const DIST_DIR = path.join(__dirname, '../../dist');
const TEST_RESULTS_DIR = path.join(__dirname, '../../dist/test-results');

class DistributionValidator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.skipSlowTests = options.skipSlowTests || false;
    this.results = {
      validation: {
        passed: [],
        failed: [],
        warnings: []
      },
      binaries: {},
      overall: {
        ready: false,
        criticalIssues: 0,
        warnings: 0
      }
    };
  }

  log(message, type = 'info') {
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      check: '🔍'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} ${message}`);
  }

  async validateDistributionStructure() {
    this.log('🏗️  Validating distribution structure...', 'check');
    
    const requiredFiles = [
      'jora-linux',
      'jora-win.exe', 
      'jora-mac'
    ];

    const optionalFiles = [
      'checksums.sha256',
      'README.md',
      'LICENSE'
    ];

    // Check required binaries
    for (const file of requiredFiles) {
      const filePath = path.join(DIST_DIR, file);
      if (fs.existsSync(filePath)) {
        this.results.validation.passed.push(`Required file: ${file}`);
      } else {
        this.results.validation.failed.push(`Missing required file: ${file}`);
        this.results.overall.criticalIssues++;
      }
    }

    // Check optional files
    for (const file of optionalFiles) {
      const filePath = path.join(DIST_DIR, file);
      if (fs.existsSync(filePath)) {
        this.results.validation.passed.push(`Optional file: ${file}`);
      } else {
        this.results.validation.warnings.push(`Missing optional file: ${file}`);
        this.results.overall.warnings++;
      }
    }
  }

  async validateBinarySizes() {
    this.log('📏 Validating binary sizes...', 'check');
    
    const sizeLimit = 150 * 1024 * 1024; // 150MB limit
    const expectedMinSize = 30 * 1024 * 1024; // 30MB minimum
    
    const binaries = ['jora-linux', 'jora-win.exe', 'jora-mac'];
    
    for (const binary of binaries) {
      const binaryPath = path.join(DIST_DIR, binary);
      
      if (fs.existsSync(binaryPath)) {
        const stats = fs.statSync(binaryPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        
        if (stats.size > sizeLimit) {
          this.results.validation.failed.push(`${binary} too large: ${sizeMB}MB (limit: ${(sizeLimit / 1024 / 1024).toFixed(0)}MB)`);
          this.results.overall.criticalIssues++;
        } else if (stats.size < expectedMinSize) {
          this.results.validation.failed.push(`${binary} too small: ${sizeMB}MB (likely corrupted)`);
          this.results.overall.criticalIssues++;
        } else {
          this.results.validation.passed.push(`${binary} size OK: ${sizeMB}MB`);
        }
        
        if (!this.results.binaries[binary]) {
          this.results.binaries[binary] = {};
        }
        this.results.binaries[binary].size = sizeMB;
      }
    }
  }

  async validateChecksums() {
    this.log('🔐 Validating checksums...', 'check');
    
    const checksumFile = path.join(DIST_DIR, 'checksums.sha256');
    
    if (!fs.existsSync(checksumFile)) {
      this.results.validation.warnings.push('No checksums file found');
      this.results.overall.warnings++;
      return;
    }

    try {
      const checksumContent = fs.readFileSync(checksumFile, 'utf8');
      const lines = checksumContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      for (const line of lines) {
        const [expectedHash, filename] = line.trim().split(/\s+/);
        const binaryPath = path.join(DIST_DIR, filename);
        
        if (fs.existsSync(binaryPath)) {
          const actualHash = await this.calculateSHA256(binaryPath);
          
          if (actualHash === expectedHash) {
            this.results.validation.passed.push(`Checksum OK: ${filename}`);
          } else {
            this.results.validation.failed.push(`Checksum mismatch: ${filename}`);
            this.results.overall.criticalIssues++;
          }
        } else {
          this.results.validation.warnings.push(`Checksum file references missing binary: ${filename}`);
          this.results.overall.warnings++;
        }
      }
    } catch (error) {
      this.results.validation.failed.push(`Checksum validation error: ${error.message}`);
      this.results.overall.criticalIssues++;
    }
  }

  async calculateSHA256(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  async validateBinaryFunctionality() {
    this.log('🧪 Validating binary functionality...', 'check');
    
    const binaries = [
      { name: 'jora-mac', platform: 'macos', testable: process.platform === 'darwin' },
      { name: 'jora-linux', platform: 'linux', testable: process.platform === 'linux' },
      { name: 'jora-win.exe', platform: 'windows', testable: process.platform === 'win32' }
    ];

    for (const binary of binaries) {
      const binaryPath = path.join(DIST_DIR, binary.name);
      
      if (!fs.existsSync(binaryPath)) {
        continue;
      }

      if (!this.results.binaries[binary.name]) {
        this.results.binaries[binary.name] = {};
      }

      if (binary.testable && !this.skipSlowTests) {
        try {
          // Find available port
          const testPort = await this.findAvailablePort(3333);
          
          const tester = new BinaryTester(binaryPath, binary.platform, {
            port: testPort,
            verbose: false,
            timeout: 10000
          });

          // Run quick tests only for validation
          await tester.runStartupTests();
          const report = tester.generateReport();
          
          this.results.binaries[binary.name].tests = report.summary;
          
          if (report.summary.failed === 0) {
            this.results.validation.passed.push(`${binary.name} functionality OK`);
          } else {
            this.results.validation.failed.push(`${binary.name} failed ${report.summary.failed}/${report.summary.totalTests} tests`);
            this.results.overall.criticalIssues++;
          }
        } catch (error) {
          this.results.validation.failed.push(`${binary.name} test error: ${error.message}`);
          this.results.overall.criticalIssues++;
        }
      } else {
        // Can't test cross-platform, just check basic file properties
        const stats = fs.statSync(binaryPath);
        
        if (binary.platform !== 'windows') {
          // Check executable permissions on Unix-like systems
          if (stats.mode & 0o111) {
            this.results.validation.passed.push(`${binary.name} has executable permissions`);
          } else {
            this.results.validation.warnings.push(`${binary.name} missing executable permissions`);
            this.results.overall.warnings++;
          }
        }
        
        this.results.validation.passed.push(`${binary.name} basic checks OK (cross-platform)`);
      }
    }
  }

  async findAvailablePort(startPort) {
    const net = require('net');
    
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(startPort, (err) => {
        if (err) {
          server.close();
          this.findAvailablePort(startPort + 1).then(resolve);
        } else {
          const port = server.address().port;
          server.close();
          resolve(port);
        }
      });
    });
  }

  async validatePackageJson() {
    this.log('📦 Validating package.json...', 'check');
    
    try {
      const packagePath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check required fields
      const requiredFields = ['name', 'version', 'description', 'main', 'bin'];
      for (const field of requiredFields) {
        if (packageJson[field]) {
          this.results.validation.passed.push(`package.json has ${field}`);
        } else {
          this.results.validation.failed.push(`package.json missing ${field}`);
          this.results.overall.criticalIssues++;
        }
      }

      // Check build scripts
      const requiredScripts = ['build', 'build:binaries', 'test:binaries'];
      for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.results.validation.passed.push(`package.json has script: ${script}`);
        } else {
          this.results.validation.warnings.push(`package.json missing script: ${script}`);
          this.results.overall.warnings++;
        }
      }

      // Check PKG configuration
      if (packageJson.pkg) {
        this.results.validation.passed.push('package.json has PKG configuration');
        
        if (packageJson.pkg.assets && Array.isArray(packageJson.pkg.assets)) {
          this.results.validation.passed.push(`PKG configuration has ${packageJson.pkg.assets.length} asset patterns`);
        } else {
          this.results.validation.warnings.push('PKG configuration missing assets');
          this.results.overall.warnings++;
        }
      } else {
        this.results.validation.warnings.push('package.json missing PKG configuration');
        this.results.overall.warnings++;
      }

    } catch (error) {
      this.results.validation.failed.push(`package.json validation error: ${error.message}`);
      this.results.overall.criticalIssues++;
    }
  }

  async runValidation() {
    this.log('🔍 Starting distribution validation...', 'check');
    
    await this.validateDistributionStructure();
    await this.validateBinarySizes();
    await this.validateChecksums();
    await this.validatePackageJson();
    await this.validateBinaryFunctionality();
    
    // Determine overall readiness
    this.results.overall.ready = this.results.overall.criticalIssues === 0;
    
    return this.results;
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      ...this.results
    };

    this.printSummary();
    await this.saveReport(report);
    
    return report;
  }

  printSummary() {
    console.log('\n📊 Distribution Validation Summary');
    console.log('═'.repeat(50));
    
    console.log(`✅ Passed: ${this.results.validation.passed.length}`);
    console.log(`❌ Failed: ${this.results.validation.failed.length}`);
    console.log(`⚠️  Warnings: ${this.results.validation.warnings.length}`);
    
    if (this.results.validation.failed.length > 0) {
      console.log('\n❌ Critical Issues:');
      this.results.validation.failed.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
    
    if (this.results.validation.warnings.length > 0 && this.verbose) {
      console.log('\n⚠️  Warnings:');
      this.results.validation.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }

    console.log('\n🎯 Distribution Status:');
    if (this.results.overall.ready) {
      this.log('Distribution is READY for release! 🚀', 'success');
    } else {
      this.log(`Distribution has ${this.results.overall.criticalIssues} critical issues`, 'error');
      this.log('Fix critical issues before release', 'error');
    }
  }

  async saveReport(report) {
    try {
      if (!fs.existsSync(TEST_RESULTS_DIR)) {
        fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = path.join(TEST_RESULTS_DIR, `distribution-validation-${timestamp}.json`);
      
      await fs.promises.writeFile(reportFile, JSON.stringify(report, null, 2));
      this.log(`Report saved: ${reportFile}`, 'info');
    } catch (error) {
      this.log(`Could not save report: ${error.message}`, 'warning');
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const skipSlowTests = args.includes('--skip-slow-tests');

  const validator = new DistributionValidator({ verbose, skipSlowTests });
  
  try {
    await validator.runValidation();
    const report = await validator.generateReport();
    
    process.exit(report.overall.ready ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DistributionValidator;
