const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

/**
 * Execute a command and return a promise
 */
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      ...options
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      // Show progress to user
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      // Show errors to user
      process.stderr.write(data);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Initialize a JoRA project in the given directory
 */
async function initializeProject(projectPath) {
  const todoPath = path.join(projectPath, 'jora-changelog');
  
  // Check if already initialized
  try {
    await fs.access(todoPath);
    throw new Error('JoRA already initialized in this directory');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  
  console.log('📁 Creating basic JSON structure...');
  
  // Create directory structure
  await fs.mkdir(todoPath, { recursive: true });
  await fs.mkdir(path.join(todoPath, 'tasks'), { recursive: true });
  await fs.mkdir(path.join(todoPath, 'epics'), { recursive: true });
  await fs.mkdir(path.join(todoPath, 'releases'), { recursive: true });
  
  // Create initial config
  const projectName = path.basename(projectPath);
  const config = {
    name: projectName,
    currentVersion: '0.1.0',
    createdAt: new Date().toISOString(),
    joraVersion: '1.0.0'
  };
  
  await fs.writeFile(
    path.join(todoPath, 'config.json'),
    JSON.stringify(config, null, 2)
  );
  
  // Create initial authors
  const authors = [
    {
      id: 'default',
      name: 'Default User',
      email: 'user@example.com',
      avatar: {
        small: null,    // 32x32 base64
        medium: null,   // 64x64 base64
        large: null     // 128x128 base64
      }
    }
  ];
  
  await fs.writeFile(
    path.join(todoPath, 'authors.json'),
    JSON.stringify(authors, null, 2)
  );
  
  // Create initial tags
  const tags = [
    { id: 'bug', name: 'Bug', color: '#ff4444' },
    { id: 'feature', name: 'Feature', color: '#44ff44' },
    { id: 'improvement', name: 'Improvement', color: '#4444ff' },
    { id: 'documentation', name: 'Documentation', color: '#ffaa44' },
    { id: 'refactor', name: 'Refactor', color: '#aa44ff' }
  ];
  
  await fs.writeFile(
    path.join(todoPath, 'tags.json'),
    JSON.stringify(tags, null, 2)
  );
  
  // Create current state index
  const current = {
    tasks: [],
    lastUpdated: new Date().toISOString()
  };
  
  await fs.writeFile(
    path.join(todoPath, 'current.json'),
    JSON.stringify(current, null, 2)
  );
  
  // Create sample epic
  const sampleEpic = {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Initial setup and basic functionality',
    color: '#6366f1',
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  await fs.writeFile(
    path.join(todoPath, 'epics', 'getting-started.json'),
    JSON.stringify(sampleEpic, null, 2)
  );
  
  // Create sample task
  const sampleTask = {
    id: 'task-' + Date.now(),
    title: 'Welcome to JoRA!',
    description: 'This is your first task. Edit or delete it to get started.\n\n**Features:**\n- Markdown support\n- Image attachments\n- Estimated points and dates',
    state: 'in_backlog',
    priority: 'medium',
    epic: 'getting-started',
    author: 'default',
    assignee: 'default',
    tags: ['feature'],
    subtasks: [
      { id: 'subtask-1', text: 'Read the documentation', completed: false },
      { id: 'subtask-2', text: 'Create your first real task', completed: false }
    ],
    estimatedPoints: 3,
    estimatedDate: null,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await fs.writeFile(
    path.join(todoPath, 'tasks', `${sampleTask.id}.json`),
    JSON.stringify(sampleTask, null, 2)
  );
  
  // Update current index with the sample task
  current.tasks.push(sampleTask.id);
  await fs.writeFile(
    path.join(todoPath, 'current.json'),
    JSON.stringify(current, null, 2)
  );
  
  console.log('✅ JSON structure created successfully');
  console.log('🔨 Building frontend with Vite...');
  
  try {
    // Build the frontend
    const joraPath = path.dirname(path.dirname(__dirname)); // Go up to JoRA root
    console.log(`🏗️  Running build in: ${joraPath}`);
    
    await executeCommand('npm', ['run', 'build:frontend'], { 
      cwd: joraPath
    });
    
    // Verify that the build was successful
    const frontendBuildPath = path.join(joraPath, 'dist', 'frontend');
    try {
      await fs.access(frontendBuildPath);
      const buildFiles = await fs.readdir(frontendBuildPath);
      if (buildFiles.length === 0) {
        throw new Error('Frontend build directory is empty');
      }
      console.log('✅ Frontend build completed successfully!');
      console.log(`📁 Build files created in: ${frontendBuildPath}`);
    } catch (buildError) {
      throw new Error(`Frontend build verification failed: ${buildError.message}`);
    }
    
  } catch (buildError) {
    console.error('❌ Frontend build failed:', buildError.message);
    console.log('');
    console.log('🔧 Manual fix required:');
    console.log('   1. Make sure dependencies are installed: npm install');
    console.log('   2. Run the build manually: npm run build:frontend');
    console.log('   3. Then you can use: jora start');
    throw new Error('Frontend build failed - see above for manual fix instructions');
  }
}

module.exports = {
  initializeProject
};
