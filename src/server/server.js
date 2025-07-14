const express = require('express');
const path = require('path');
const fs = require('fs');
const open = require('open');
const TaskManager = require('../core/task-manager');

async function startServer(port = 3333, openBrowser = true, projectPath) {
  const app = express();
  const taskManager = new TaskManager(projectPath);
  
  // Initialize TaskManager immediately when server starts
  console.log('🔄 Initializing JoRA...');
  try {
    await taskManager.loadProjectData();
    console.log('✅ JoRA initialized successfully');
  } catch (error) {
    console.log('⚠️  JoRA started with minimal data');
  }
  
  // Middleware
  app.use(express.json());
  
  // Root route 
  app.get('/', (req, res) => {
    try {
      // Try to serve the React build first, fallback to old web
      const reactIndexPath = path.join(__dirname, '../../dist/frontend/index.html');
      const webIndexPath = path.join(__dirname, '../web/index.html');
      
      let indexPath;
      if (fs.existsSync(reactIndexPath)) {
        console.log('📦 Serving React frontend');
        indexPath = reactIndexPath;
      } else {
        console.log('⚠️  React build not found, serving legacy frontend');
        indexPath = webIndexPath;
      }
      
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      res.send(indexContent);
    } catch (error) {
      res.status(500).send(`
        <h1>JoRA Error</h1>
        <p>Could not load interface files.</p>
        <p>Error: ${error.message}</p>
      `);
    }
  });
  
  // Serve static files AFTER the root route
  const reactBuildPath = path.join(__dirname, '../../dist/frontend');
  const webPath = path.join(__dirname, '../web');
  
  // Try React build first, fallback to legacy web
  if (fs.existsSync(reactBuildPath)) {
    console.log('📦 Serving React static files from:', reactBuildPath);
    app.use(express.static(reactBuildPath));
  } else {
    console.log('⚠️  React build not found, serving legacy static files from:', webPath);
    app.use(express.static(webPath));
  }
  
  // API Routes

  // Diagnostic endpoint for WSL/VS Code debugging
  app.get('/wsl-test', (req, res) => {
    const headers = req.headers;
    const connection = {
      remoteAddress: req.connection.remoteAddress,
      remotePort: req.connection.remotePort,
      localAddress: req.connection.localAddress,
      localPort: req.connection.localPort
    };
    
    res.json({
      message: '🎉 WSL server is accessible!',
      timestamp: new Date().toISOString(),
      headers,
      connection,
      userAgent: req.get('User-Agent'),
      host: req.get('Host')
    });
  });
  
  // Get all tasks
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await taskManager.loadAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create task
  app.post('/api/tasks', async (req, res) => {
    try {
      const task = await taskManager.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update task
  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const task = await taskManager.updateTask(req.params.id, req.body);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Delete task
  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      await taskManager.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all epics
  app.get('/api/epics', async (req, res) => {
    try {
      const epics = await taskManager.loadAllEpics();
      res.json(epics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create epic
  app.post('/api/epics', async (req, res) => {
    try {
      const epic = await taskManager.createEpic(req.body);
      res.status(201).json(epic);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update epic
  app.put('/api/epics/:id', async (req, res) => {
    try {
      const epic = await taskManager.updateEpic(req.params.id, req.body);
      res.json(epic);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete epic
  app.delete('/api/epics/:id', async (req, res) => {
    try {
      await taskManager.deleteEpic(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all authors
  app.get('/api/authors', async (req, res) => {
    try {
      console.log('📦 [GET] /api/authors - Fetching authors...');
      const projectData = await taskManager.loadProjectData();
      console.log('✅ [GET] /api/authors - Authors fetched:', projectData.authors?.length || 0);
      res.json(projectData.authors || []);
    } catch (error) {
      console.error('❌ [GET] /api/authors - Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create author
  app.post('/api/authors', async (req, res) => {
    try {
      const author = await taskManager.createAuthor(req.body);
      res.status(201).json(author);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update author
  app.put('/api/authors/:id', async (req, res) => {
    try {
      console.log('PUT /api/authors/:id - Request received');
      console.log('Author ID:', req.params.id);
      console.log('Request body:', req.body);
      
      const author = await taskManager.updateAuthor(req.params.id, req.body);
      console.log('Author updated successfully:', author);
      res.json(author);
    } catch (error) {
      console.error('Error updating author:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete author
  app.delete('/api/authors/:id', async (req, res) => {
    try {
      await taskManager.deleteAuthor(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get backlog (all tasks with additional sorting/filtering)
  app.get('/api/backlog', async (req, res) => {
    try {
      const { sortBy = 'createdAt', order = 'desc', tag, assignee } = req.query;
      const tasks = await taskManager.loadAllTasks();
      
      let filteredTasks = tasks;
      
      if (tag) {
        filteredTasks = filteredTasks.filter(task => task.tags.includes(tag));
      }
      
      if (assignee) {
        filteredTasks = filteredTasks.filter(task => task.assignee === assignee);
      }
      
      // Sort tasks
      filteredTasks.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        
        if (order === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
      
      res.json(filteredTasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get project data (config, authors, tags)
  app.get('/api/project', async (req, res) => {
    try {
      const projectData = await taskManager.loadProjectData();
      res.json(projectData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Generate release
  app.post('/api/releases', async (req, res) => {
    try {
      const { version, description } = req.body;
      const release = await taskManager.generateRelease(version, description);
      res.status(201).json(release);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all releases
  app.get('/api/releases', async (req, res) => {
    try {
      const releases = await taskManager.loadAllReleases();
      res.json(releases);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Git operations endpoints
  
  // Check git sync status with jora-backlog branch
  app.get('/api/git/status', async (req, res) => {
    const { execSync } = require('child_process');
    
    try {
      console.log('� Checking git sync status...');
      
      const projectRoot = taskManager.projectPath || process.cwd();
      
      // Get current branch
      const currentBranch = execSync('git branch --show-current', { 
        cwd: projectRoot, 
        encoding: 'utf8' 
      }).trim();
      
      // Check if jora-backlog branch exists locally
      const localBranches = execSync('git branch', { cwd: projectRoot, encoding: 'utf8' });
      const joraBacklogExists = /\s+jora-backlog\s*$/m.test(localBranches) || /\*\s+jora-backlog\s*$/m.test(localBranches);
      
      // Check if origin/jora-backlog exists
      let originJoraBacklogExists = false;
      let commitsBehind = 0;
      let commitsAhead = 0;
      
      try {
        const remoteBranches = execSync('git branch -r', { cwd: projectRoot, encoding: 'utf8' });
        originJoraBacklogExists = remoteBranches.includes('origin/jora-backlog');
        
        if (originJoraBacklogExists && joraBacklogExists) {
          // Check how many commits behind/ahead we are
          try {
            const revListBehind = execSync('git rev-list --count jora-backlog..origin/jora-backlog', { 
              cwd: projectRoot, 
              encoding: 'utf8' 
            }).trim();
            commitsBehind = parseInt(revListBehind) || 0;
            
            const revListAhead = execSync('git rev-list --count origin/jora-backlog..jora-backlog', { 
              cwd: projectRoot, 
              encoding: 'utf8' 
            }).trim();
            commitsAhead = parseInt(revListAhead) || 0;
          } catch (revError) {
            console.log('⚠️ Could not check commit difference:', revError.message);
          }
        }
      } catch (remoteError) {
        console.log('⚠️ Could not check remote branches:', remoteError.message);
      }
      
      // Check if there are staged changes
      let hasStagedChanges = false;
      let stagedFiles = [];
      try {
        const statusOutput = execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf8' });
        const lines = statusOutput.split('\n').filter(line => line.trim());
        stagedFiles = lines
          .filter(line => line.startsWith('A ') || line.startsWith('M ') || line.startsWith('D '))
          .map(line => line.substring(3));
        hasStagedChanges = stagedFiles.length > 0;
        console.log('📊 Staged files detected:', stagedFiles);
      } catch (statusError) {
        console.log('⚠️ Could not check git status:', statusError.message);
      }
      
      // Check if staged files are only from jora-changelog
      const validStagedFiles = stagedFiles.filter(file => file.startsWith('jora-changelog/') && file.endsWith('.json'));
      const hasInvalidFiles = stagedFiles.length > 0 && validStagedFiles.length !== stagedFiles.length;
      
      const status = {
        currentBranch,
        joraBacklogExists,
        originJoraBacklogExists,
        commitsBehind,
        commitsAhead,
        isUpToDate: commitsBehind === 0,
        canSave: !hasInvalidFiles && (commitsBehind === 0 || currentBranch === 'jora-backlog'),
        hasStagedChanges,
        stagedFiles: validStagedFiles,
        invalidFiles: stagedFiles.filter(file => !file.startsWith('jora-changelog/') || !file.endsWith('.json')),
        needsSync: commitsBehind > 0,
        hasLocalChanges: commitsAhead > 0
      };
      
      console.log('📊 Git status:', status);
      res.json(status);
      
    } catch (error) {
      console.error('❌ Error checking git status:', error);
      res.status(500).json({ 
        error: error.message,
        currentBranch: 'unknown',
        canSave: false,
        needsSync: false
      });
    }
  });

  // Sync with origin/jora-backlog (fetch + merge)
  app.post('/api/git/sync', async (req, res) => {
    const { execSync } = require('child_process');
    
    try {
      console.log('🔄 Starting git sync operation...');
      
      const projectRoot = taskManager.projectPath || process.cwd();
      
      // Get current branch
      const currentBranch = execSync('git branch --show-current', { 
        cwd: projectRoot, 
        encoding: 'utf8' 
      }).trim();
      
      // Fetch latest changes
      console.log('📥 Fetching latest changes...');
      execSync('git fetch origin', { cwd: projectRoot });
      
      // Check if origin/jora-backlog exists
      const remoteBranches = execSync('git branch -r', { cwd: projectRoot, encoding: 'utf8' });
      const originJoraBacklogExists = remoteBranches.includes('origin/jora-backlog');
      
      if (!originJoraBacklogExists) {
        return res.json({
          success: true,
          message: 'No remote jora-backlog branch to sync with',
          action: 'no_remote'
        });
      }
      
      // Check if local jora-backlog exists
      const localBranches = execSync('git branch', { cwd: projectRoot, encoding: 'utf8' });
      const joraBacklogExists = /\s+jora-backlog\s*$/m.test(localBranches) || /\*\s+jora-backlog\s*$/m.test(localBranches);
      
      if (!joraBacklogExists) {
        // Create local jora-backlog tracking origin/jora-backlog
        console.log('🌿 Creating local jora-backlog branch...');
        execSync('git checkout -b jora-backlog origin/jora-backlog', { cwd: projectRoot });
        if (currentBranch !== 'jora-backlog') {
          execSync(`git checkout ${currentBranch}`, { cwd: projectRoot });
        }
      } else {
        // Merge origin/jora-backlog into local jora-backlog
        const wasOnJoraBacklog = currentBranch === 'jora-backlog';
        
        if (!wasOnJoraBacklog) {
          execSync('git checkout jora-backlog', { cwd: projectRoot });
        }
        
        try {
          console.log('� Merging origin/jora-backlog...');
          execSync('git merge origin/jora-backlog', { cwd: projectRoot });
        } catch (mergeError) {
          // Handle merge conflicts
          if (!wasOnJoraBacklog) {
            execSync(`git checkout ${currentBranch}`, { cwd: projectRoot });
          }
          return res.status(409).json({
            success: false,
            message: 'Merge conflict detected! Please resolve conflicts manually.',
            action: 'conflict',
            error: mergeError.message
          });
        }
        
        if (!wasOnJoraBacklog) {
          execSync(`git checkout ${currentBranch}`, { cwd: projectRoot });
        }
      }
      
      console.log('✅ Git sync completed successfully');
      res.json({
        success: true,
        message: 'Successfully synced with origin/jora-backlog',
        action: 'synced'
      });
      
    } catch (error) {
      console.error('❌ Git sync failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        action: 'failed'
      });
    }
  });

  // Save changes (Commit & Push) - REWRITTEN
  app.post('/api/git/save-changes', async (req, res) => {
    const { execSync } = require('child_process');
    
    try {
      console.log('🔄 Starting git save operation...');
      
      const projectRoot = taskManager.projectPath || process.cwd();
      
      // 1. Get current branch
      const currentBranch = execSync('git branch --show-current', { 
        cwd: projectRoot, 
        encoding: 'utf8' 
      }).trim();
      console.log('📍 Current branch:', currentBranch);
      
      // 2. Add only jora-changelog files (but first check what's already staged)
      let hasValidStagedFiles = false;
      try {
        const existingStaged = execSync('git diff --cached --name-only', { cwd: projectRoot, encoding: 'utf8' });
        const existingStagedFiles = existingStaged.split('\n').filter(f => f.trim());
        const validExistingFiles = existingStagedFiles.filter(file => 
          file.startsWith('jora-changelog/') && file.endsWith('.json')
        );
        hasValidStagedFiles = validExistingFiles.length > 0;
        console.log('📊 Existing staged files:', existingStagedFiles);
        console.log('📊 Valid existing staged files:', validExistingFiles);
      } catch (error) {
        console.log('⚠️ Could not check existing staged files');
      }
      
      if (!hasValidStagedFiles) {
        console.log('📝 Adding jora-changelog files...');
        try {
          execSync('git add jora-changelog/*.json', { cwd: projectRoot });
          execSync('git add jora-changelog/tasks/*.json', { cwd: projectRoot });
          execSync('git add jora-changelog/epics/*.json', { cwd: projectRoot });
          execSync('git add jora-changelog/releases/*.json', { cwd: projectRoot });
        } catch (addError) {
          // Some files might not exist, that's ok
          console.log('ℹ️ Some jora-changelog files not found (normal)');
        }
      } else {
        console.log('📝 Using already staged jora-changelog files...');
      }
      
      // 3. Check if we have anything to commit
      let hasChangesToCommit = false;
      try {
        const statusOutput = execSync('git diff --cached --name-status', { cwd: projectRoot, encoding: 'utf8' });
        hasChangesToCommit = statusOutput.trim().length > 0;
        console.log('📊 Staged changes:', statusOutput.trim() || 'none');
      } catch (statusError) {
        console.log('⚠️ Could not check staged changes:', statusError.message);
      }
      
      if (!hasChangesToCommit) {
        return res.json({
          success: true,
          message: 'No changes to commit',
          action: 'no_changes'
        });
      }
      
      // 4. Handle branch logic - safe approach
      const joraBacklogBranch = 'jora-backlog';
      let needToSwitchBack = false;
      let stagedChanges = [];
      
      if (currentBranch !== joraBacklogBranch) {
        needToSwitchBack = true;
        
        // First, capture what files are staged
        try {
          const stagedOutput = execSync('git diff --cached --name-only', { cwd: projectRoot, encoding: 'utf8' });
          stagedChanges = stagedOutput.split('\n').filter(f => f.trim());
          console.log('📦 Captured staged files:', stagedChanges);
        } catch (error) {
          console.log('⚠️ Could not capture staged files');
        }
        
        // Reset staging area to allow branch switch
        if (stagedChanges.length > 0) {
          console.log('🔄 Temporarily resetting staging area...');
          execSync('git reset', { cwd: projectRoot });
        }
        
        // Check if jora-backlog exists and switch
        const localBranches = execSync('git branch', { cwd: projectRoot, encoding: 'utf8' });
        const joraBacklogExists = /\s+jora-backlog\s*$/m.test(localBranches) || /\*\s+jora-backlog\s*$/m.test(localBranches);
        
        if (joraBacklogExists) {
          console.log('🔄 Switching to existing jora-backlog branch...');
          execSync(`git checkout ${joraBacklogBranch}`, { cwd: projectRoot });
        } else {
          console.log('🌿 Creating new jora-backlog branch...');
          execSync(`git checkout -b ${joraBacklogBranch}`, { cwd: projectRoot });
        }
        
        // Re-stage only the jora-changelog files
        console.log('📝 Re-staging jora-changelog files...');
        const joraFiles = stagedChanges.filter(file => 
          file.startsWith('jora-changelog/') && file.endsWith('.json')
        );
        
        for (const file of joraFiles) {
          try {
            execSync(`git add "${file}"`, { cwd: projectRoot });
          } catch (error) {
            console.log(`⚠️ Could not stage ${file}:`, error.message);
          }
        }
      }
      
      // 5. Commit changes
      try {
        console.log('� Committing changes...');
        const commitMessage = `jora auto update - ${new Date().toISOString()}`;
        execSync(`git commit -m "${commitMessage}"`, { cwd: projectRoot });
      } catch (commitError) {
        // Switch back if needed
        if (needToSwitchBack) {
          try {
            execSync(`git checkout ${currentBranch}`, { cwd: projectRoot });
          } catch (checkoutError) {
            console.error('⚠️ Could not switch back to original branch');
          }
        }
        
        const errorMessage = commitError.message || commitError.toString();
        if (errorMessage.includes('nothing to commit') || errorMessage.includes('no changes added')) {
          return res.json({
            success: true,
            message: 'No changes to commit',
            action: 'no_changes'
          });
        }
        
        throw new Error('Failed to commit: ' + commitError.message);
      }
      
      // 6. Push to remote
      try {
        console.log('🚀 Pushing to remote...');
        execSync(`git push origin ${joraBacklogBranch}`, { cwd: projectRoot });
      } catch (pushError) {
        console.error('⚠️ Push failed:', pushError.message);
        // Don't fail completely if push fails
      }
      
      // 7. Switch back to original branch
      if (needToSwitchBack) {
        try {
          console.log(`🔄 Switching back to ${currentBranch}...`);
          execSync(`git checkout ${currentBranch}`, { cwd: projectRoot });
        } catch (checkoutError) {
          console.error('⚠️ Could not switch back to original branch:', checkoutError.message);
        }
      }
      
      console.log('✅ Git save operation completed successfully');
      res.json({
        success: true,
        message: 'Changes saved successfully to jora-backlog branch!',
        action: 'success',
        originalBranch: currentBranch
      });
      
    } catch (error) {
      console.error('❌ Git save operation failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        action: 'failed'
      });
    }
  });

  // Start server
  const server = app.listen(port, '0.0.0.0', () => {
    const url = `http://localhost:${port}`;
    console.log(`🎯 JoRA running at ${url}`);
    console.log(`🌐 WSL: Also available at http://0.0.0.0:${port}`);
    console.log(`🔗 Windows: Try http://[::1]:${port} or http://127.0.0.1:${port}`);
    console.log('📋 Open your browser to start managing tasks');
    console.log('⏹️  Press Ctrl+C to stop');
    
    if (openBrowser) {
      // Don't auto-open in WSL, it's confusing
      console.log('💡 Auto-open disabled in WSL. Open browser manually.');
    }
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down JoRA...');
    server.close(() => {
      console.log('✅ JoRA stopped');
      process.exit(0);
    });
  });
  
  return server;
}

module.exports = {
  startServer
};
