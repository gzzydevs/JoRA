#!/usr/bin/env node
/**
 * BinaryTester.js
 * 
 * Comprehensive binary testing suite for JoRA distribution automation.
 * Tests startup, server functionality, API endpoints, frontend serving, and data operations.
 * 
 * Author: gzzy
 * Part of: task-037-binary-testing-suite
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

class BinaryTester {
  constructor(binaryPath, platform, options = {}) {
    this.binaryPath = binaryPath;
    this.platform = platform;
    this.binaryName = path.basename(binaryPath);
    this.results = [];
    this.serverProcess = null;
    this.testPort = options.port || 3333;
    this.timeout = options.timeout || 30000;
    this.verbose = options.verbose || false;
    
    // Test configuration
    this.config = {
      startupTimeout: 10000,
      serverStartupTimeout: 15000,
      apiTimeout: 5000,
      cleanupTimeout: 5000
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${emoji} ${message}`);
  }

  addResult(testName, passed, details = '', duration = 0) {
    this.results.push({
      test: testName,
      passed,
      details,
      duration,
      timestamp: new Date().toISOString()
    });
    
    if (this.verbose || !passed) {
      this.log(`${testName}: ${passed ? 'PASSED' : 'FAILED'}${details ? ` - ${details}` : ''}`, passed ? 'success' : 'error');
    }
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        const duration = Date.now() - startTime;
        if (code === 0) {
          resolve({ stdout, stderr, code, duration });
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr || stdout}`));
        }
      });
      
      process.on('error', (err) => {
        reject(err);
      });
      
      // Set timeout
      const timeout = setTimeout(() => {
        process.kill();
        reject(new Error(`Command timeout after ${this.timeout}ms`));
      }, this.timeout);
      
      process.on('close', () => clearTimeout(timeout));
    });
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = http.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(this.config.apiTimeout, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });
    });
  }

  async runStartupTests() {
    this.log('🚀 Running startup tests...', 'test');
    
    // Test 1: Binary execution (just check if it starts without error)
    try {
      const startTime = Date.now();
      // For startup test, just run with --help to avoid server startup issues
      const result = await this.runCommand(this.binaryPath, ['--help'], { timeout: this.config.startupTimeout });
      this.addResult('Binary Execution', true, 'Binary runs without errors', Date.now() - startTime);
    } catch (error) {
      // Check if it's a cross-platform issue
      if (error.message.includes('ENOEXEC') || error.message.includes('cannot execute')) {
        this.addResult('Binary Execution', false, `Cross-platform: Cannot execute ${this.platform} binary on ${process.platform}`);
      } else {
        this.addResult('Binary Execution', false, error.message);
      }
    }

    // Test 2: Version command
    try {
      const startTime = Date.now();
      const result = await this.runCommand(this.binaryPath, ['--version'], { timeout: this.config.startupTimeout });
      const duration = Date.now() - startTime;
      
      if (result.stdout.match(/^\d+\.\d+\.\d+/)) {
        this.addResult('Version Command', true, `Version: ${result.stdout.trim()}`, duration);
      } else {
        this.addResult('Version Command', false, 'Invalid version format');
      }
    } catch (error) {
      if (error.message.includes('ENOEXEC') || error.message.includes('cannot execute')) {
        this.addResult('Version Command', false, `Cross-platform: Cannot execute ${this.platform} binary on ${process.platform}`);
      } else {
        this.addResult('Version Command', false, error.message);
      }
    }

    // Test 3: Help command
    try {
      const startTime = Date.now();
      const result = await this.runCommand(this.binaryPath, ['--help'], { timeout: this.config.startupTimeout });
      const duration = Date.now() - startTime;
      
      if (result.stdout.includes('JoRA') || result.stdout.includes('Usage')) {
        this.addResult('Help Command', true, 'Help output correct', duration);
      } else {
        this.addResult('Help Command', false, 'Invalid help output');
      }
    } catch (error) {
      if (error.message.includes('ENOEXEC') || error.message.includes('cannot execute')) {
        this.addResult('Help Command', false, `Cross-platform: Cannot execute ${this.platform} binary on ${process.platform}`);
      } else {
        this.addResult('Help Command', false, error.message);
      }
    }
  }

  async runServerTests() {
    this.log('🌐 Running server tests...', 'test');
    
    // Test 1: Server startup
    try {
      await this.startServer();
      this.addResult('Server Startup', true, `Server started on port ${this.testPort}`);
    } catch (error) {
      this.addResult('Server Startup', false, error.message);
      return; // Can't continue server tests if server doesn't start
    }

    // Test 2: Port binding check
    try {
      await this.waitForPort(this.testPort, this.config.serverStartupTimeout);
      this.addResult('Port Binding', true, `Port ${this.testPort} accessible`);
    } catch (error) {
      this.addResult('Port Binding', false, error.message);
    }

    // Test 3: Health check
    try {
      const response = await this.makeRequest(`http://localhost:${this.testPort}/`);
      if (response.statusCode === 200) {
        this.addResult('Health Check', true, 'Server responds with 200');
      } else {
        this.addResult('Health Check', false, `Server responded with ${response.statusCode}`);
      }
    } catch (error) {
      this.addResult('Health Check', false, error.message);
    }
  }

  async runAPITests() {
    this.log('📡 Running API tests...', 'test');
    
    const endpoints = [
      { path: '/api/config', name: 'Config API' },
      { path: '/api/tasks', name: 'Tasks API' },
      { path: '/api/epics', name: 'Epics API' },
      { path: '/api/releases', name: 'Releases API' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(`http://localhost:${this.testPort}${endpoint.path}`);
        if (response.statusCode === 200) {
          // Try to parse JSON
          try {
            JSON.parse(response.data);
            this.addResult(endpoint.name, true, 'Valid JSON response');
          } catch {
            this.addResult(endpoint.name, false, 'Invalid JSON response');
          }
        } else {
          this.addResult(endpoint.name, false, `HTTP ${response.statusCode}`);
        }
      } catch (error) {
        this.addResult(endpoint.name, false, error.message);
      }
    }
  }

  async runFrontendTests() {
    this.log('🎨 Running frontend tests...', 'test');
    
    // Test 1: Main HTML page
    try {
      const response = await this.makeRequest(`http://localhost:${this.testPort}/`);
      if (response.statusCode === 200 && response.data.includes('JoRA')) {
        this.addResult('Frontend HTML', true, 'Main page loads correctly');
      } else {
        this.addResult('Frontend HTML', false, 'Main page not loading properly');
      }
    } catch (error) {
      this.addResult('Frontend HTML', false, error.message);
    }

    // Test 2: Static assets (if available)
    const staticAssets = [
      '/static/js/',
      '/static/css/',
      '/assets/'
    ];

    for (const asset of staticAssets) {
      try {
        const response = await this.makeRequest(`http://localhost:${this.testPort}${asset}`);
        if (response.statusCode === 200 || response.statusCode === 404) {
          // 404 is ok for assets that might not exist
          this.addResult(`Static Assets ${asset}`, true, `HTTP ${response.statusCode}`);
        } else {
          this.addResult(`Static Assets ${asset}`, false, `HTTP ${response.statusCode}`);
        }
      } catch (error) {
        // Network errors are more concerning than 404s
        this.addResult(`Static Assets ${asset}`, false, error.message);
      }
    }
  }

  async runDataTests() {
    this.log('💾 Running data tests...', 'test');
    
    // Test 1: Create test task via API
    const testTask = {
      title: 'Binary Test Task',
      description: 'Test task created by binary testing suite',
      state: 'todo',
      type: 'task'
    };

    try {
      // Note: This would require implementing POST endpoints in the API
      // For now, we'll test that the existing data structure is accessible
      const response = await this.makeRequest(`http://localhost:${this.testPort}/api/tasks`);
      if (response.statusCode === 200) {
        const tasks = JSON.parse(response.data);
        this.addResult('Data Read Test', true, `Found ${Array.isArray(tasks) ? tasks.length : 'unknown'} tasks`);
      } else {
        this.addResult('Data Read Test', false, `HTTP ${response.statusCode}`);
      }
    } catch (error) {
      this.addResult('Data Read Test', false, error.message);
    }
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.log(`Starting server on port ${this.testPort}...`);
      
      this.serverProcess = spawn(this.binaryPath, ['start', '--port', this.testPort.toString(), '--no-open'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });

      let serverOutput = '';
      
      this.serverProcess.stdout.on('data', (data) => {
        serverOutput += data.toString();
        if (serverOutput.includes(`http://localhost:${this.testPort}`) || 
            serverOutput.includes('Server running') ||
            serverOutput.includes('JoRA is running')) {
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE')) {
          reject(new Error(`Port ${this.testPort} already in use`));
        }
      });

      this.serverProcess.on('error', (error) => {
        reject(error);
      });

      // Timeout for server startup
      setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, this.config.serverStartupTimeout);
    });
  }

  async waitForPort(port, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkPort = () => {
        const req = http.get(`http://localhost:${port}/`, (res) => {
          resolve();
        });
        
        req.on('error', () => {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Port ${port} not accessible after ${timeout}ms`));
          } else {
            setTimeout(checkPort, 500);
          }
        });
        
        req.setTimeout(1000, () => {
          req.abort();
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Port ${port} not accessible after ${timeout}ms`));
          } else {
            setTimeout(checkPort, 500);
          }
        });
      };
      
      checkPort();
    });
  }

  async cleanup() {
    this.log('🧹 Cleaning up...', 'test');
    
    if (this.serverProcess) {
      return new Promise((resolve) => {
        this.serverProcess.on('close', () => {
          this.log('Server process terminated');
          resolve();
        });
        
        // Try graceful shutdown first
        this.serverProcess.kill('SIGTERM');
        
        // Force kill after timeout
        setTimeout(() => {
          if (this.serverProcess && !this.serverProcess.killed) {
            this.serverProcess.kill('SIGKILL');
            this.log('Server process force killed', 'warning');
          }
          resolve();
        }, this.config.cleanupTimeout);
      });
    }
  }

  generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const avgDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / totalTests;

    const report = {
      binary: this.binaryName,
      platform: this.platform,
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
        averageDuration: `${avgDuration.toFixed(0)}ms`
      },
      results: this.results,
      binaryInfo: this.getBinaryInfo()
    };

    return report;
  }

  getBinaryInfo() {
    try {
      const stats = fs.statSync(this.binaryPath);
      return {
        path: this.binaryPath,
        size: `${(stats.size / (1024 * 1024)).toFixed(1)} MB`,
        modified: stats.mtime.toISOString(),
        executable: !!(stats.mode & 0o111)
      };
    } catch (error) {
      return {
        path: this.binaryPath,
        error: error.message
      };
    }
  }

  async runAllTests() {
    this.log(`🎯 Starting comprehensive test suite for ${this.binaryName}`, 'test');
    
    try {
      // Run all test categories
      await this.runStartupTests();
      await this.runServerTests();
      await this.runAPITests();
      await this.runFrontendTests();
      await this.runDataTests();
    } catch (error) {
      this.log(`Test suite error: ${error.message}`, 'error');
    } finally {
      await this.cleanup();
    }
    
    const report = this.generateReport();
    this.printSummary(report);
    
    return report;
  }

  printSummary(report) {
    this.log(`\n📊 Test Summary for ${report.binary}`, 'info');
    this.log('═'.repeat(50), 'info');
    this.log(`Platform: ${report.platform}`, 'info');
    this.log(`Binary: ${report.binaryInfo.size} - ${report.binaryInfo.path}`, 'info');
    this.log(`Tests: ${report.summary.passed}/${report.summary.totalTests} passed (${report.summary.successRate})`, 'info');
    this.log(`Average Duration: ${report.summary.averageDuration}`, 'info');
    
    if (report.summary.failed > 0) {
      this.log('\n❌ Failed Tests:', 'error');
      report.results.filter(r => !r.passed).forEach(result => {
        this.log(`  - ${result.test}: ${result.details}`, 'error');
      });
    }
    
    this.log('', 'info');
  }
}

module.exports = BinaryTester;
