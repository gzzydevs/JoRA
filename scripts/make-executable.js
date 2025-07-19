#!/usr/bin/env node
/**
 * make-executable.js
 * 
 * Converts NCC build output into executable binaries for cross-platform distribution.
 * This script processes the bundled index.js from NCC and creates platform-specific executables.
 */

const fs = require('fs');
const path = require('path');

const platform = process.argv[2] || 'linux';

const config = {
    linux: {
        input: 'dist/ncc-build/linux/index.js',
        output: 'dist/jora-linux',
        shebang: '#!/usr/bin/env node\n'
    },
    win: {
        input: 'dist/ncc-build/win/index.js',
        output: 'dist/jora-win.exe',
        shebang: '@echo off\nnode "%~dp0%~n0" %*\n'
    },
    mac: {
        input: 'dist/ncc-build/mac/index.js',
        output: 'dist/jora-mac',
        shebang: '#!/usr/bin/env node\n'
    }
};

function createExecutable(platformConfig) {
    try {
        // Ensure output directory exists
        const outputDir = path.dirname(platformConfig.output);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Read the bundled JS
        const bundledCode = fs.readFileSync(platformConfig.input, 'utf8');
        
        if (platform === 'win') {
            // For Windows, create a .cmd file that contains the bundled code inline
            const cmdContent = `@echo off
setlocal
node > nul 2>&1 && (
  echo const fs = require('fs'); const path = require('path'); const code = \`${bundledCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`; eval(code); | node %*
) || (
  echo Node.js not found. Please install Node.js to run JoRA.
  pause
)`;
            
            // Actually, let's use a simpler approach - bundle everything into a .js file and create a small .cmd wrapper
            const jsOutputPath = platformConfig.output.replace('.exe', '.js');
            const cmdContent2 = `@echo off
node "%~dp0jora-win.js" %*`;
            
            fs.writeFileSync(platformConfig.output, cmdContent2);
            fs.writeFileSync(jsOutputPath, bundledCode);
            
            console.log(`✅ Windows executable created: ${platformConfig.output}`);
            console.log(`✅ JS bundle created: ${jsOutputPath}`);
        } else {
            // For Unix-like systems, create executable directly with shebang
            // Check if the bundled code already has a shebang
            const hasShebang = bundledCode.startsWith('#!');
            const executableContent = hasShebang ? bundledCode : platformConfig.shebang + bundledCode;
            fs.writeFileSync(platformConfig.output, executableContent, { mode: 0o755 });
            
            console.log(`✅ Executable created: ${platformConfig.output}`);
        }
        
        // Copy frontend assets if they exist
        const frontendSrc = 'dist/frontend';
        const frontendDest = path.join(path.dirname(platformConfig.output), 'frontend');
        
        if (fs.existsSync(frontendSrc)) {
            console.log(`📁 Copying frontend assets to ${frontendDest}...`);
            copyDirectory(frontendSrc, frontendDest);
        }
        
        console.log(`🎉 ${platform.toUpperCase()} build completed successfully!`);
        
    } catch (error) {
        console.error(`❌ Error creating executable for ${platform}:`, error.message);
        process.exit(1);
    }
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    
    for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Validate platform
if (!config[platform]) {
    console.error(`❌ Unknown platform: ${platform}`);
    console.log('Available platforms:', Object.keys(config).join(', '));
    process.exit(1);
}

console.log(`🔧 Creating ${platform.toUpperCase()} executable...`);
createExecutable(config[platform]);
