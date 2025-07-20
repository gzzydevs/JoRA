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
      // Fix static file serving in bundled mode
      let frontendPath, indexPath;
      
      if (process.pkg) {
        // In packaged mode, files are in the snapshot filesystem
        frontendPath = '/snapshot/JoRA/dist/frontend';
        indexPath = path.join(frontendPath, 'index.html');
      } else {
        // In development mode
        frontendPath = path.join(__dirname, '../../dist/frontend');
        indexPath = path.join(frontendPath, 'index.html');
      }
      
      if (fs.existsSync(indexPath)) {
        console.log('📦 Serving React frontend from:', frontendPath);
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        res.send(indexContent);
      } else {
        console.log('⚠️  React build not found, creating basic interface');
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>JoRA - Task Management</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; }
              .api-link { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; margin: 20px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>🎯 JoRA - Task Management</h1>
            <div class="warning">
              <h3>⚠️ Frontend not available</h3>
              <p>The React frontend was not found. JoRA is running in API-only mode.</p>
            </div>
            <div class="api-link">
              <h3>📡 API Access</h3>
              <p>You can still access the API directly:</p>
              <ul>
                <li><a href="/api/tasks">/api/tasks</a> - View all tasks</li>
                <li><a href="/api/epics">/api/epics</a> - View all epics</li>
                <li><a href="/api/git/status">/api/git/status</a> - Git status</li>
              </ul>
            </div>
          </body>
          </html>
        `);
      }
    } catch (error) {
      res.status(500).send(`
        <h1>JoRA Error</h1>
        <p>Could not load interface files.</p>
        <p>Error: ${error.message}</p>
      `);
    }
  });
  
  // Serve static files AFTER the root route
  // Fix static file serving in bundled mode
  let staticPath;
  
  if (process.pkg) {
    // In packaged mode, files are in the snapshot filesystem
    staticPath = '/snapshot/JoRA/dist/frontend';
  } else {
    // In development mode
    staticPath = path.join(__dirname, '../../dist/frontend');
  }
  
  if (fs.existsSync(staticPath)) {
    console.log('📦 Serving React static files from:', staticPath);
    app.use(express.static(staticPath));
  } else {
    console.log('⚠️  React build not found, no static files served');
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
      console.error(`Error updating task ${req.params.id}:`, error.message);
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

  // Generate test release (doesn't affect tasks)
  app.post('/api/releases/test', async (req, res) => {
    try {
      const { version, description, tasks } = req.body;
      const release = await taskManager.generateTestRelease(version, description, tasks);
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
  
  // Undo/revert a release (restore tasks to ready_to_release)
  app.delete('/api/releases/:version', async (req, res) => {
    try {
      const { version } = req.params;
      const result = await taskManager.undoRelease(version);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Git operations endpoints
  
  // Check git sync status with jora-backlog branch
  app.get('/api/git/status', async (req, res) => {
    const { execSync } = require('child_process');
    
    try {
      console.log('� Checking git sync status...');
      
      const projectRoot = taskManager.projectPath || process.cwd();
      
      // Check if we're in a git repository first
      try {
        execSync('git rev-parse --git-dir', { cwd: projectRoot, encoding: 'utf8' });
      } catch (gitError) {
        console.log('⚠️ No git repository detected in project directory');
        return res.json({
          error: 'No git repository found',
          isGitRepository: false,
          currentBranch: null,
          joraBacklogExists: false,
          originJoraBacklogExists: false,
          commitsBehind: 0,
          commitsAhead: 0,
          isUpToDate: true,
          canSave: false,
          hasStagedChanges: false,
          stagedFiles: [],
          invalidFiles: [],
          needsSync: false,
          hasLocalChanges: false,
          onCorrectBranch: false,
          requiredBranch: 'jora-backlog',
          message: 'JoRA works best when run from within a git repository. Consider initializing git in your project directory.'
        });
      }
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
        canSave: currentBranch === 'jora-backlog' && !hasInvalidFiles,
        hasStagedChanges,
        stagedFiles: validStagedFiles,
        invalidFiles: stagedFiles.filter(file => !file.startsWith('jora-changelog/') || !file.endsWith('.json')),
        needsSync: commitsBehind > 0,
        hasLocalChanges: commitsAhead > 0,
        onCorrectBranch: currentBranch === 'jora-backlog',
        requiredBranch: 'jora-backlog'
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
      
      // Check if we're in a git repository first
      try {
        execSync('git rev-parse --git-dir', { cwd: projectRoot, encoding: 'utf8' });
      } catch (gitError) {
        console.log('⚠️ No git repository detected in project directory');
        return res.status(500).json({ error: 'Git repository not found' });
      }
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

  // Save changes (Commit & Push) - NEW LOGIC: Only auto-commit if on 'jora' branch
  app.post('/api/git/save-changes', async (req, res) => {
    const { execSync } = require('child_process');
    
    try {
      console.log('🔄 Starting git save operation...');
      
      const projectRoot = taskManager.projectPath || process.cwd();
      
      // Check if we're in a git repository first
      try {
        execSync('git rev-parse --git-dir', { cwd: projectRoot, encoding: 'utf8' });
      } catch (gitError) {
        console.log('⚠️ No git repository detected in project directory');
        return res.status(500).json({ error: 'Git repository not found' });
      }
      // 1. Get current branch
      const currentBranch = execSync('git branch --show-current', { 
        cwd: projectRoot, 
        encoding: 'utf8' 
      }).trim();
      console.log('📍 Current branch:', currentBranch);
      
      // 2. Check if we're on the 'jora' branch
      const isOnJoraBranch = currentBranch === 'jora';
      
      if (!isOnJoraBranch) {
        // Not on jora branch - show warning but allow execution
        console.log('⚠️ Not on jora branch - changes will be executed but NOT committed automatically');
        
        // Still execute changes (this applies any pending data updates)
        // The task manager updates are already done by the time this endpoint is called
        
        return res.status(200).json({
          success: false,
          warning: true,
          message: `You are on branch '${currentBranch}'. Changes have been applied but NOT committed automatically. Please commit manually if you want to save them.`,
          action: 'wrong_branch_no_commit',
          currentBranch,
          requiredBranch: 'jora',
          hint: 'Switch to "jora" branch for automatic commits, or commit manually'
        });
      }
      
      // 3. We're on jora branch - proceed with automatic commit
      console.log('✅ On jora branch - proceeding with automatic commit...');
      
      // 4. Create jora branch if it doesn't exist
      try {
        execSync('git show-ref --verify --quiet refs/heads/jora', { cwd: projectRoot });
        console.log('� jora branch exists');
      } catch (branchNotFound) {
        console.log('🌿 Creating jora branch...');
        try {
          execSync('git checkout -b jora', { cwd: projectRoot });
        } catch (createError) {
          throw new Error('Failed to create jora branch: ' + createError.message);
        }
      }
      
      // 5. Add jora-changelog files
      console.log('📝 Adding jora-changelog changes...');
      try {
        // Add specific jora-changelog files that may have changes
        const addCommands = [
          'git add jora-changelog/*.json',
          'git add jora-changelog/tasks/*.json', 
          'git add jora-changelog/epics/*.json',
          'git add jora-changelog/releases/*.json'
        ];
        
        for (const cmd of addCommands) {
          try {
            execSync(cmd, { cwd: projectRoot });
          } catch (addError) {
            // Ignore errors for files that don't exist
            console.log(`ℹ️ ${cmd} - some files not found (normal)`);
          }
        }
      } catch (addError) {
        console.log('ℹ️ Some jora-changelog files not found (normal)');
      }
      
      // 6. Check if we have anything to commit
      let hasChangesToCommit = false;
      let stagedFiles = '';
      try {
        const statusOutput = execSync('git diff --cached --name-status', { cwd: projectRoot, encoding: 'utf8' });
        hasChangesToCommit = statusOutput.trim().length > 0;
        stagedFiles = statusOutput.trim();
        console.log('📊 Staged changes:', stagedFiles || 'none');
      } catch (statusError) {
        console.log('⚠️ Could not check staged changes:', statusError.message);
      }
      
      if (!hasChangesToCommit) {
        return res.json({
          success: true,
          message: 'No changes to commit - all up to date',
          action: 'no_changes',
          currentBranch
        });
      }
      
      // 7. Commit changes
      try {
        console.log('💾 Committing changes...');
        const commitMessage = `jora auto update - ${new Date().toISOString()}`;
        execSync(`git commit -m "${commitMessage}"`, { cwd: projectRoot });
        console.log('✅ Changes committed successfully');
      } catch (commitError) {
        const errorMessage = commitError.message || commitError.toString();
        if (errorMessage.includes('nothing to commit') || errorMessage.includes('no changes added')) {
          return res.json({
            success: true,
            message: 'No changes to commit - all up to date',
            action: 'no_changes',
            currentBranch
          });
        }
        
        throw new Error('Failed to commit: ' + commitError.message);
      }
      
      // 8. Push to remote
      try {
        console.log('🚀 Pushing to remote...');
        execSync('git push origin jora', { cwd: projectRoot });
        console.log('✅ Changes pushed successfully');
      } catch (pushError) {
        console.error('⚠️ Push failed:', pushError.message);
        // Don't fail completely if push fails - commit was successful
        return res.json({
          success: true,
          warning: true,
          message: 'Changes committed locally but push failed. Check your internet connection.',
          action: 'commit_success_push_failed',
          currentBranch,
          stagedFiles: stagedFiles.split('\n').filter(line => line.trim()),
          error: pushError.message
        });
      }
      
      console.log('✅ Git save operation completed successfully');
      res.json({
        success: true,
        message: 'Changes saved and pushed successfully to jora branch!',
        action: 'success',
        currentBranch,
        stagedFiles: stagedFiles.split('\n').filter(line => line.trim())
      });
      
    } catch (error) {
      console.error('❌ Git save operation failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        action: 'failed',
        currentBranch: currentBranch || 'unknown'
      });
    }
  });

  // Recreate jora-backlog branch from current branch
  app.post('/api/git/recreate-jora-backlog', async (req, res) => {
    const { execSync } = require('child_process');
    
    try {
      console.log('🔄 Recreating jora-backlog branch...');
      
      const projectRoot = taskManager.projectPath || process.cwd();
      
      // Check if we're in a git repository first
      try {
        execSync('git rev-parse --git-dir', { cwd: projectRoot, encoding: 'utf8' });
      } catch (gitError) {
        console.log('⚠️ No git repository detected in project directory');
        return res.status(500).json({ error: 'Git repository not found' });
      }
      // 1. Get current branch
      const currentBranch = execSync('git branch --show-current', { 
        cwd: projectRoot, 
        encoding: 'utf8' 
      }).trim();
      console.log('📍 Current branch:', currentBranch);
      
      if (currentBranch === 'jora-backlog') {
        return res.status(400).json({
          success: false,
          error: 'You are already on jora-backlog branch. Switch to another branch first.',
          action: 'already_on_target'
        });
      }
      
      // 2. Check for uncommitted changes
      try {
        const statusOutput = execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf8' });
        if (statusOutput.trim().length > 0) {
          return res.status(400).json({
            success: false,
            error: 'You have uncommitted changes. Please commit or stash them first.',
            action: 'uncommitted_changes'
          });
        }
      } catch (statusError) {
        console.log('⚠️ Could not check git status');
      }
      
      // 3. Delete existing jora-backlog branch (local and remote)
      try {
        console.log('🗑️ Deleting existing jora-backlog branch...');
        
        // Delete local branch
        try {
          execSync('git branch -D jora-backlog', { cwd: projectRoot });
          console.log('✅ Deleted local jora-backlog branch');
        } catch (deleteError) {
          console.log('ℹ️ Local jora-backlog branch did not exist');
        }
        
        // Delete remote branch
        try {
          execSync('git push origin --delete jora-backlog', { cwd: projectRoot });
          console.log('✅ Deleted remote jora-backlog branch');
        } catch (deleteRemoteError) {
          console.log('ℹ️ Remote jora-backlog branch did not exist');
        }
        
      } catch (error) {
        console.log('⚠️ Could not delete existing branches (normal if they don\'t exist)');
      }
      
      // 4. Create new jora-backlog branch from current branch
      try {
        console.log('🌿 Creating new jora-backlog branch from', currentBranch);
        execSync('git checkout -b jora-backlog', { cwd: projectRoot });
      } catch (createError) {
        throw new Error('Failed to create jora-backlog branch: ' + createError.message);
      }
      
      // 5. Push new branch to remote
      try {
        console.log('🚀 Pushing new jora-backlog branch to remote...');
        execSync('git push -u origin jora-backlog', { cwd: projectRoot });
      } catch (pushError) {
        console.error('⚠️ Push failed:', pushError.message);
        // Don't fail completely
      }
      
      console.log('✅ jora-backlog branch recreated successfully');
      res.json({
        success: true,
        message: `jora-backlog branch recreated from ${currentBranch} and is now the current branch`,
        action: 'recreated',
        sourceBranch: currentBranch,
        currentBranch: 'jora-backlog'
      });
      
    } catch (error) {
      console.error('❌ Failed to recreate jora-backlog branch:', error);
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
