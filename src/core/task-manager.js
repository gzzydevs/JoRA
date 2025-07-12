const fs = require('fs').promises;
const path = require('path');

class TaskManager {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.todoPath = path.join(projectPath, 'cl-todo');
    this.tasksPath = path.join(this.todoPath, 'tasks');
    this.epicsPath = path.join(this.todoPath, 'epics');
    this.releasesPath = path.join(this.todoPath, 'releases');
  }
  
  // Generate a simple unique ID
  generateId() {
    return 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  // Load all tasks
  async loadAllTasks() {
    try {
      const taskFiles = await fs.readdir(this.tasksPath);
      const tasks = [];
      
      for (const file of taskFiles) {
        if (file.endsWith('.json')) {
          const taskContent = await fs.readFile(path.join(this.tasksPath, file), 'utf8');
          tasks.push(JSON.parse(taskContent));
        }
      }
      
      return tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }
  
  // Load single task
  async loadTask(taskId) {
    try {
      const taskPath = path.join(this.tasksPath, `${taskId}.json`);
      const taskContent = await fs.readFile(taskPath, 'utf8');
      return JSON.parse(taskContent);
    } catch (error) {
      throw new Error(`Task ${taskId} not found`);
    }
  }
  
  // Create new task
  async createTask(taskData) {
    const task = {
      id: this.generateId(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      state: taskData.state || 'todo',
      type: taskData.type || 'feature',
      priority: taskData.priority || 'medium',
      epic: taskData.epic || null,
      author: taskData.author || 'default',
      assignee: taskData.assignee || null,
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || [],
      estimatedPoints: taskData.estimatedPoints || 0,
      estimatedDate: taskData.estimatedDate || null,
      images: taskData.images || [], // Array of base64 images
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.saveTask(task);
    await this.updateCurrentIndex();
    return task;
  }
  
  // Update existing task
  async updateTask(taskId, updates) {
    const task = await this.loadTask(taskId);
    
    // Update fields
    Object.assign(task, updates, {
      updatedAt: new Date().toISOString()
    });
    
    await this.saveTask(task);
    
    return task;
  }
  
  // Delete task
  async deleteTask(taskId) {
    try {
      await fs.unlink(path.join(this.tasksPath, `${taskId}.json`));
      await this.updateCurrentIndex();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete task ${taskId}`);
    }
  }
  
  // Save task to file
  async saveTask(task) {
    const taskPath = path.join(this.tasksPath, `${task.id}.json`);
    await fs.writeFile(taskPath, JSON.stringify(task, null, 2));
  }
  
  // Update current.json index
  async updateCurrentIndex() {
    try {
      const tasks = await this.loadAllTasks();
      const current = {
        tasks: tasks.map(t => t.id),
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(
        path.join(this.todoPath, 'current.json'),
        JSON.stringify(current, null, 2)
      );
    } catch (error) {
      console.error('Error updating current index:', error);
    }
  }
  
  // Load all epics
  async loadAllEpics() {
    try {
      const epicFiles = await fs.readdir(this.epicsPath);
      const epics = [];
      
      for (const file of epicFiles) {
        if (file.endsWith('.json')) {
          const epicContent = await fs.readFile(path.join(this.epicsPath, file), 'utf8');
          epics.push(JSON.parse(epicContent));
        }
      }
      
      return epics;
    } catch (error) {
      console.error('Error loading epics:', error);
      return [];
    }
  }
  
  // Create new epic
  async createEpic(epicData) {
    const epic = {
      id: epicData.id || epicData.name.toLowerCase().replace(/\s+/g, '-'),
      name: epicData.name,
      description: epicData.description || '',
      color: epicData.color || '#6366f1',
      status: epicData.status || 'active'
    };
    
    await this.saveEpic(epic);
    this.epics.push(epic);
    return epic;
  }
  
  // Create new author
  async createAuthor(authorData) {
    const author = { id: this.generateId(), ...authorData };
    
    this.projectData.authors.push(author);
    
    const configPath = path.join(this.todoPath, 'authors.json');
    await fs.writeFile(configPath, JSON.stringify(this.projectData.authors, null, 2));
    
    return author;
  }
  
  // Generate a new release
  async generateRelease(version, description = '') {
    const tasks = await this.loadAllTasks();
    const tasksToRelease = tasks.filter(task => task.state === 'ready_to_release');
    
    if (tasksToRelease.length === 0) {
      throw new Error('No tasks ready for release');
    }
    
    const release = {
      version,
      description,
      tasks: tasksToRelease,
      generatedAt: new Date().toISOString(),
      taskCount: tasksToRelease.length
    };
    
    // Save release file
    const releasePath = path.join(this.releasesPath, `v${version}.json`);
    await fs.writeFile(releasePath, JSON.stringify(release, null, 2));
    
    // Remove released tasks from the main tasks directory
    for (const task of tasksToRelease) {
      await this.deleteTask(task.id);
    }
    
    // Update config
    const config = await this.loadConfig();
    config.currentVersion = version;
    await this.saveConfig(config);
    
    this.releases.push(release);
    this.projectData.config = config;
    
    return release;
  }
  
  // Load all releases
  async loadAllReleases() {
    try {
      const releaseFiles = await fs.readdir(this.releasesPath);
      const releases = [];
      
      for (const file of releaseFiles) {
        if (file.endsWith('.json')) {
          const releaseContent = await fs.readFile(path.join(this.releasesPath, file), 'utf8');
          releases.push(JSON.parse(releaseContent));
        }
      }
      
      return releases.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
    } catch (error) {
      console.error('Error loading releases:', error);
      return [];
    }
  }
  
  // Load project data (config, authors, tags)
  async loadProjectData() {
    try {
      const config = await this.loadConfig();
      const authors = await this.loadAuthors();
      const tags = await this.loadTags();
      
      return {
        config,
        authors,
        tags
      };
    } catch (error) {
      console.error('Error loading project data:', error);
      return {
        config: { name: 'Unknown Project', currentVersion: '0.0.0' },
        authors: [],
        tags: []
      };
    }
  }
}

module.exports = TaskManager;
