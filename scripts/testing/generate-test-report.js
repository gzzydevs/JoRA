#!/usr/bin/env node
/**
 * generate-test-report.js
 * 
 * Generates HTML reports from binary test results.
 * Creates visual, shareable reports for distribution validation.
 * 
 * Part of: task-037-binary-testing-suite
 * Author: gzzy
 */

const fs = require('fs');
const path = require('path');

const TEST_RESULTS_DIR = path.join(__dirname, '../../dist/test-results');

function generateHTMLReport(testData) {
  const timestamp = new Date(testData.timestamp).toLocaleString();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JoRA Binary Test Report - ${timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .content {
            padding: 30px;
        }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        
        .card h3 {
            color: #495057;
            margin-bottom: 10px;
        }
        
        .card .value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .card .value.success { color: #28a745; }
        .card .value.warning { color: #ffc107; }
        .card .value.error { color: #dc3545; }
        
        .binary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .binary-card {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .binary-header {
            background: #6c757d;
            color: white;
            padding: 15px;
            font-weight: bold;
        }
        
        .binary-header.passed { background: #28a745; }
        .binary-header.failed { background: #dc3545; }
        .binary-header.warning { background: #ffc107; color: #212529; }
        
        .binary-body {
            padding: 15px;
        }
        
        .test-list {
            list-style: none;
        }
        
        .test-list li {
            padding: 5px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .test-list li:last-child {
            border-bottom: none;
        }
        
        .test-status {
            display: inline-block;
            width: 20px;
            text-align: center;
        }
        
        .test-status.pass { color: #28a745; }
        .test-status.fail { color: #dc3545; }
        
        .details-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .details-section h3 {
            margin-bottom: 15px;
            color: #495057;
        }
        
        .issue-list {
            list-style: none;
        }
        
        .issue-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .issue-list li:last-child {
            border-bottom: none;
        }
        
        .issue-type {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .issue-type.error {
            background: #dc3545;
            color: white;
        }
        
        .issue-type.warning {
            background: #ffc107;
            color: #212529;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
            background: #f8f9fa;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
            transition: width 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .summary-cards {
                grid-template-columns: 1fr;
            }
            
            .binary-grid {
                grid-template-columns: 1fr;
            }
            
            .container {
                margin: 10px;
            }
            
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 JoRA Binary Test Report</h1>
            <div class="subtitle">Generated on ${timestamp}</div>
            <div class="subtitle">Environment: ${testData.environment?.platform || 'Unknown'} ${testData.environment?.arch || ''}</div>
        </div>
        
        <div class="content">
            ${generateSummarySection(testData)}
            ${generateBinarySection(testData)}
            ${generateDetailsSection(testData)}
        </div>
        
        <div class="footer">
            <p>Generated by JoRA Binary Testing Suite v${getVersion()}</p>
            <p>Report ID: ${generateReportId(testData)}</p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateSummarySection(testData) {
  const summary = testData.summary || {};
  const successRate = summary.totalTests > 0 ? 
    Math.round((summary.passedTests / summary.totalTests) * 100) : 0;
  
  return `
    <div class="summary-cards">
      <div class="card">
        <h3>📊 Overall Status</h3>
        <div class="value ${successRate === 100 ? 'success' : successRate > 75 ? 'warning' : 'error'}">
          ${successRate}%
        </div>
        <div>Success Rate</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${successRate}%"></div>
        </div>
      </div>
      
      <div class="card">
        <h3>🎯 Binaries</h3>
        <div class="value">${summary.workingBinaries || 0}/${summary.totalBinaries || 0}</div>
        <div>Working</div>
      </div>
      
      <div class="card">
        <h3>🧪 Tests</h3>
        <div class="value success">${summary.passedTests || 0}</div>
        <div>Passed</div>
      </div>
      
      <div class="card">
        <h3>⚡ Mode</h3>
        <div class="value">${testData.mode === 'quick' ? '🚀' : '🔬'}</div>
        <div>${testData.mode === 'quick' ? 'Quick' : 'Comprehensive'}</div>
      </div>
    </div>
  `;
}

function generateBinarySection(testData) {
  const results = testData.results || [];
  
  const binaryCards = results.map(result => {
    const status = result.status === 'passed' ? 'passed' : 
                   result.status === 'failed' ? 'failed' : 'warning';
    
    const tests = result.details || [];
    const testList = tests.map(test => `
      <li>
        <span class="test-status ${test.passed ? 'pass' : 'fail'}">
          ${test.passed ? '✅' : '❌'}
        </span>
        ${test.test}
        ${test.details ? `<small style="color: #6c757d;"> - ${test.details}</small>` : ''}
      </li>
    `).join('');
    
    return `
      <div class="binary-card">
        <div class="binary-header ${status}">
          ${result.name} - ${result.platform}
          <small style="float: right;">${result.size} MB</small>
        </div>
        <div class="binary-body">
          ${result.tests ? `
            <p><strong>Tests:</strong> ${result.tests.passed}/${result.tests.totalTests} passed (${result.tests.successRate})</p>
          ` : ''}
          
          ${result.error ? `
            <p style="color: #dc3545;"><strong>Error:</strong> ${result.error}</p>
          ` : ''}
          
          ${testList ? `
            <ul class="test-list">
              ${testList}
            </ul>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <h2>📦 Binary Results</h2>
    <div class="binary-grid">
      ${binaryCards}
    </div>
  `;
}

function generateDetailsSection(testData) {
  // This would be more relevant for distribution validation reports
  if (!testData.validation) {
    return '';
  }
  
  const failed = testData.validation.failed || [];
  const warnings = testData.validation.warnings || [];
  
  if (failed.length === 0 && warnings.length === 0) {
    return `
      <div class="details-section">
        <h3>✅ All Validation Checks Passed</h3>
        <p>No issues found. Distribution is ready for release!</p>
      </div>
    `;
  }
  
  const failedList = failed.map(issue => `
    <li>
      <span class="issue-type error">ERROR</span>
      ${issue}
    </li>
  `).join('');
  
  const warningsList = warnings.map(issue => `
    <li>
      <span class="issue-type warning">WARNING</span>
      ${issue}
    </li>
  `).join('');
  
  return `
    <div class="details-section">
      <h3>🔍 Validation Details</h3>
      
      ${failed.length > 0 ? `
        <h4>❌ Critical Issues</h4>
        <ul class="issue-list">
          ${failedList}
        </ul>
      ` : ''}
      
      ${warnings.length > 0 ? `
        <h4>⚠️ Warnings</h4>
        <ul class="issue-list">
          ${warningsList}
        </ul>
      ` : ''}
    </div>
  `;
}

function getVersion() {
  try {
    const packagePath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function generateReportId(testData) {
  const timestamp = new Date(testData.timestamp).getTime();
  const hash = timestamp.toString(36);
  return hash.toUpperCase();
}

async function generateReportFromFile(jsonFile) {
  try {
    const testData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const html = generateHTMLReport(testData);
    
    const htmlFile = jsonFile.replace('.json', '.html');
    fs.writeFileSync(htmlFile, html);
    
    console.log(`✅ HTML report generated: ${htmlFile}`);
    return htmlFile;
  } catch (error) {
    console.error(`❌ Failed to generate report: ${error.message}`);
    throw error;
  }
}

async function generateLatestReport() {
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    throw new Error('No test results directory found');
  }
  
  const files = fs.readdirSync(TEST_RESULTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(TEST_RESULTS_DIR, f),
      mtime: fs.statSync(path.join(TEST_RESULTS_DIR, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);
  
  if (files.length === 0) {
    throw new Error('No test result files found');
  }
  
  console.log(`📊 Generating report from latest test: ${files[0].name}`);
  return await generateReportFromFile(files[0].path);
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Generate from latest file
    try {
      await generateLatestReport();
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  } else {
    // Generate from specific file
    const inputFile = args[0];
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ File not found: ${inputFile}`);
      process.exit(1);
    }
    
    try {
      await generateReportFromFile(inputFile);
    } catch (error) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateHTMLReport, generateReportFromFile };
