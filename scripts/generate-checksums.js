#!/usr/bin/env node
/**
 * generate-checksums.js
 * 
 * Generates SHA256 checksums for all built binaries for verification.
 * Part of the enhanced build process for task-038.
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const DIST_DIR = 'dist';
const CHECKSUM_FILE = path.join(DIST_DIR, 'checksums.sha256');

function generateChecksum(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function generateChecksums() {
    console.log('🔐 Generating checksums for binaries...');
    
    if (!fs.existsSync(DIST_DIR)) {
        console.error(`❌ Distribution directory not found: ${DIST_DIR}`);
        process.exit(1);
    }
    
    const binaries = [];
    const checksums = [];
    
    // Find all binary files
    const files = fs.readdirSync(DIST_DIR);
    const binaryPattern = /^jora-(linux|win\.exe|mac)(-pkg)?$/;
    
    for (const file of files) {
        if (binaryPattern.test(file)) {
            const filePath = path.join(DIST_DIR, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
                binaries.push({
                    name: file,
                    path: filePath,
                    size: stats.size
                });
            }
        }
    }
    
    if (binaries.length === 0) {
        console.log('⚠️  No binaries found to generate checksums for');
        return;
    }
    
    console.log(`📁 Found ${binaries.length} binaries:`);
    
    // Generate checksums
    for (const binary of binaries) {
        console.log(`\n🔢 Processing ${binary.name}...`);
        console.log(`   Size: ${formatSize(binary.size)}`);
        
        try {
            const checksum = generateChecksum(binary.path);
            const checksumLine = `${checksum}  ${binary.name}`;
            checksums.push(checksumLine);
            
            console.log(`   SHA256: ${checksum}`);
            console.log(`   ✅ Checksum generated`);
        } catch (error) {
            console.error(`   ❌ Failed to generate checksum: ${error.message}`);
        }
    }
    
    // Write checksums file
    if (checksums.length > 0) {
        try {
            const timestamp = new Date().toISOString();
            const header = `# JoRA Binary Checksums\n# Generated: ${timestamp}\n# Format: SHA256  filename\n\n`;
            const content = header + checksums.join('\n') + '\n';
            
            fs.writeFileSync(CHECKSUM_FILE, content);
            
            console.log(`\n📄 Checksums written to: ${CHECKSUM_FILE}`);
            console.log(`\n📋 Verification commands:`);
            console.log(`   Linux/macOS: sha256sum -c ${CHECKSUM_FILE}`);
            console.log(`   Windows:     certutil -hashfile <filename> SHA256`);
            
        } catch (error) {
            console.error(`❌ Failed to write checksums file: ${error.message}`);
            process.exit(1);
        }
    }
    
    console.log('\n🎉 Checksum generation completed!');
}

// Run checksum generation
generateChecksums();
