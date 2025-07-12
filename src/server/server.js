const express = require('express');
const path = require('path');
const fs = require('fs');
const open = require('open');
const TaskManager = require('../core/task-manager');

async function startServer(port = 3333, openBrowser = true, projectPath) {
  const app = express();
  const taskManager = new TaskManager(projectPath);
  
  // Middleware
  app.use(express.json());
  
  // Serve static files from embedded assets
  const webPath = path.join(__dirname, '../web');
  app.use(express.static(webPath));
  
  // Root route that ensures TaskManager is initialized
  app.get('/', async (req, res) => {
    try {
      // Ensure TaskManager is ready
      await taskManager.loadProjectData();
      
      const indexPath = path.join(__dirname, '../web/index.html');
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
  
  // API Routes
  
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
  
  // Create author
  app.post('/api/authors', async (req, res) => {
    try {
      const author = await taskManager.createAuthor(req.body);
      res.status(201).json(author);
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
  
  // Start server
  const server = app.listen(port, 'localhost', () => {
    const url = `http://localhost:${port}`;
    console.log(`🎯 JoRA running at ${url}`);
    console.log('📋 Open your browser to start managing tasks');
    console.log('⏹️  Press Ctrl+C to stop');
    
    if (openBrowser) {
      open(url).catch(() => {
        console.log('💡 Could not open browser automatically. Navigate to the URL above.');
      });
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
