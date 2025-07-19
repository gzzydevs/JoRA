#!/usr/bin/env node
/**
 * validate-binaries.js
 * 
 * Validates that all built binaries are functional and have correct metadata.
 * Part of the enhanced build process for task-038.
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const BINARIES = [
    { name: 'jora-linux', path: 'dist/jora-linux', platform: 'linux' },
    { name: 'jora-win.exe', path: 'dist/jora-win.exe', platform: 'win' },
    { name: 'jora-mac', path: 'dist/jora-mac', platform: 'mac' }
];

async function validateBinary(binary) {
    console.log(`\n🔍 Validating ${binary.name}...`);
    
    // Check if file exists
    if (!fs.existsSync(binary.path)) {
        console.log(`❌ Binary not found: ${binary.path}`);
        return false;
    }
    
    // Check file size (should be reasonable)
    const stats = fs.statSync(binary.path);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`📏 Size: ${sizeMB} MB`);
    
    if (stats.size < 1024) {
        console.log(`❌ Binary too small, probably corrupted`);
        return false;
    }
    
    // Check permissions (Unix-like systems)
    if (binary.platform !== 'win') {
        const mode = stats.mode & parseInt('777', 8);
        if (!(mode & parseInt('111', 8))) {
            console.log(`❌ Binary not executable`);
            return false;
        }
        console.log(`✅ Executable permissions OK`);
    }
    
    // Try to run --version command
    try {
        const versionOutput = await runCommand(binary.path, ['--version']);
        console.log(`✅ Version check: ${versionOutput.trim()}`);
        
        // Validate version format
        if (!versionOutput.match(/^\d+\.\d+\.\d+/)) {
            console.log(`❌ Invalid version format`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Failed to run version check: ${error.message}`);
        return false;
    }
    
    // Try to run --help command
    try {
        const helpOutput = await runCommand(binary.path, ['--help']);
        if (helpOutput.includes('JoRA') || helpOutput.includes('Usage')) {
            console.log(`✅ Help command working`);
        } else {
            console.log(`❌ Help output seems incorrect`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Failed to run help check: ${error.message}`);
        return false;
    }
    
    console.log(`✅ ${binary.name} validation passed!`);
    return true;
}

function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args);
        let output = '';
        let error = '';
        
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(error || `Process exited with code ${code}`));
            }
        });
        
        process.on('error', (err) => {
            reject(err);
        });
        
        // Set timeout
        setTimeout(() => {
            process.kill();
            reject(new Error('Command timeout'));
        }, 10000);
    });
}

async function validateAllBinaries() {
    console.log('🔍 Starting binary validation process...');
    
    let allValid = true;
    const results = [];
    
    for (const binary of BINARIES) {
        const isValid = await validateBinary(binary);
        results.push({ binary: binary.name, valid: isValid });
        if (!isValid) allValid = false;
    }
    
    console.log('\n📊 Validation Summary:');
    console.log('========================');
    
    for (const result of results) {
        const status = result.valid ? '✅ PASS' : '❌ FAIL';
        console.log(`${result.binary}: ${status}`);
    }
    
    if (allValid) {
        console.log('\n🎉 All binaries validated successfully!');
        process.exit(0);
    } else {
        console.log('\n❌ Some binaries failed validation');
        process.exit(1);
    }
}

// Run validation
validateAllBinaries().catch(error => {
    console.error('❌ Validation process failed:', error);
    process.exit(1);
});
