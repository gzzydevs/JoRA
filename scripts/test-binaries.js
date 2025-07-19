#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const binariesPath = path.join(__dirname, '../dist');
const binaries = [
  { name: 'jora-mac', platform: 'darwin' },
  { name: 'jora-linux', platform: 'linux' },
  { name: 'jora-win.exe', platform: 'win32' }
];

async function testBinary(binaryPath, binaryName) {
  return new Promise((resolve) => {
    console.log(`🧪 Testing ${binaryName}...`);
    
    // Make sure binary is executable
    try {
      fs.chmodSync(binaryPath, '755');
    } catch (error) {
      console.log(`⚠️  Could not set permissions for ${binaryName}`);
    }

    const child = spawn(binaryPath, ['--help'], {
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && stdout.includes('jora')) {
        console.log(`✅ ${binaryName} - WORKING`);
        resolve({ name: binaryName, status: 'working', size: getSizeInMB(binaryPath) });
      } else {
        console.log(`❌ ${binaryName} - FAILED (exit code: ${code})`);
        if (stderr) console.log(`   Error: ${stderr.slice(0, 200)}`);
        resolve({ name: binaryName, status: 'failed', size: getSizeInMB(binaryPath) });
      }
    });

    child.on('error', (error) => {
      console.log(`❌ ${binaryName} - ERROR: ${error.message}`);
      resolve({ name: binaryName, status: 'error', size: getSizeInMB(binaryPath) });
    });
  });
}

function getSizeInMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(1);
  } catch (error) {
    return 'unknown';
  }
}

async function main() {
  console.log('🎯 JoRA Binary Testing Suite');
  console.log('============================');

  const results = [];

  for (const binary of binaries) {
    const binaryPath = path.join(binariesPath, binary.name);
    
    if (!fs.existsSync(binaryPath)) {
      console.log(`⚠️  ${binary.name} not found - skipping`);
      results.push({ name: binary.name, status: 'not_found', size: '0' });
      continue;
    }

    const result = await testBinary(binaryPath, binary.name);
    results.push(result);
  }

  console.log('\n📊 Binary Test Summary:');
  console.log('========================');
  
  let totalSize = 0;
  let workingCount = 0;
  
  results.forEach(result => {
    const status = result.status === 'working' ? '✅' : 
                   result.status === 'failed' ? '❌' : 
                   result.status === 'not_found' ? '⚠️' : '💥';
    console.log(`${status} ${result.name.padEnd(15)} - ${result.size} MB - ${result.status.toUpperCase()}`);
    
    if (result.status === 'working') workingCount++;
    if (result.size !== 'unknown' && result.size !== '0') {
      totalSize += parseFloat(result.size);
    }
  });

  console.log(`\n📈 Total size: ${totalSize.toFixed(1)} MB`);
  console.log(`🎯 Working binaries: ${workingCount}/${results.length}`);
  
  if (workingCount === results.length) {
    console.log('\n🎉 All binaries are working! Ready for release.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some binaries need attention.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testBinary, getSizeInMB };
