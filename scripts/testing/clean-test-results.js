#!/usr/bin/env node
/**
 * clean-test-results.js
 * 
 * Simple utility to clean old test reports
 */

const fs = require('fs');
const path = require('path');

const TEST_RESULTS_DIR = path.join(__dirname, '../dist/test-results');

function cleanOldReports(daysOld = 7) {
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    console.log('No test results directory found.');
    return;
  }

  const files = fs.readdirSync(TEST_RESULTS_DIR);
  const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  let cleaned = 0;

  files.forEach(file => {
    const filePath = path.join(TEST_RESULTS_DIR, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtime.getTime() < cutoff) {
      fs.unlinkSync(filePath);
      cleaned++;
      console.log(`🗑️  Removed old report: ${file}`);
    }
  });

  console.log(`✅ Cleaned ${cleaned} old reports (older than ${daysOld} days)`);
}

// Run with command line arg for days
const days = parseInt(process.argv[2]) || 7;
cleanOldReports(days);
