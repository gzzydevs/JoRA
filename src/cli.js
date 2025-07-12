#!/usr/bin/env node

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const fs = require('fs');
const { initializeProject } = require('./core/project-manager');
const { startServer } = require('./server/server');

const CLI_VERSION = '1.0.0';

// Main CLI handler
const cli = yargs(hideBin(process.argv))
  .version(CLI_VERSION)
  .scriptName('jora')
  .usage('$0 <cmd> [args]')
  .help('h')
  .alias('h', 'help')
  .command(
    ['start', '$0'],
    'Start JoRA web interface',
    (yargs) => {
      return yargs
        .option('port', {
          alias: 'p',
          type: 'number',
          default: 3333,
          describe: 'Port to run the web interface on'
        })
        .option('open', {
          alias: 'o',
          type: 'boolean',
          default: true,
          describe: 'Open browser automatically'
        });
    },
    async (argv) => {
      const projectPath = process.cwd();
      const todoPath = path.join(projectPath, 'cl-todo');
      
      // Check if JoRA is initialized
      if (!fs.existsSync(todoPath)) {
        console.log('❌ JoRA not initialized in this directory.');
        console.log('Run: jora init');
        process.exit(1);
      }
      
      console.log(`🎯 Starting JoRA on port ${argv.port}...`);
      await startServer(argv.port, argv.open, projectPath);
    }
  )
  .command(
    'init',
    'Initialize JoRA in current directory',
    {},
    async (argv) => {
      const projectPath = process.cwd();
      console.log('🎯 Initializing JoRA...');
      
      try {
        await initializeProject(projectPath);
        console.log('✅ JoRA initialized successfully!');
        console.log('📁 Created: cl-todo/ directory with initial structure');
        console.log('🚀 Run: jora');
      } catch (error) {
        console.error('❌ Error initializing JoRA:', error.message);
        process.exit(1);
      }
    }
  )
  .command(
    'status',
    'Show JoRA project status',
    {},
    (argv) => {
      const projectPath = process.cwd();
      const todoPath = path.join(projectPath, 'cl-todo');
      
      if (!fs.existsSync(todoPath)) {
        console.log('❌ JoRA not initialized in this directory.');
        return;
      }
      
      try {
        const configPath = path.join(todoPath, 'config.json');
        const tasksDir = path.join(todoPath, 'tasks');
        const releasesDir = path.join(todoPath, 'releases');
        
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const taskFiles = fs.existsSync(tasksDir) ? fs.readdirSync(tasksDir).filter(f => f.endsWith('.json')) : [];
        const releaseFiles = fs.existsSync(releasesDir) ? fs.readdirSync(releasesDir).filter(f => f.endsWith('.json')) : [];
        
        console.log('🎯 JoRA Project Status');
        console.log('═══════════════════════');
        console.log(`📋 Project: ${config.name}`);
        console.log(`🔢 Current Version: ${config.currentVersion}`);
        console.log(`📝 Active Tasks: ${taskFiles.length}`);
        console.log(`🚀 Releases: ${releaseFiles.length}`);
        console.log(`📁 Location: ${todoPath}`);
        
      } catch (error) {
        console.error('❌ Error reading project status:', error.message);
      }
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .strict();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Parse and execute
cli.parse();
