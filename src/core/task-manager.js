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
      status: epicData.status || 'active',
      priority: epicData.priority || 'medium',
      startDate: epicData.startDate || null,
      endDate: epicData.endDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.saveEpic(epic);
    if (this.epics) {
      this.epics.push(epic);
    }
    return epic;
  }

  // Update existing epic
  async updateEpic(epicId, updates) {
    try {
      const epicPath = path.join(this.epicsPath, `${epicId}.json`);
      const epicContent = await fs.readFile(epicPath, 'utf8');
      const epic = JSON.parse(epicContent);
      
      // Update fields
      Object.assign(epic, updates, {
        updatedAt: new Date().toISOString()
      });
      
      await this.saveEpic(epic);
      return epic;
    } catch (error) {
      throw new Error(`Epic ${epicId} not found`);
    }
  }

  // Delete epic
  async deleteEpic(epicId) {
    try {
      await fs.unlink(path.join(this.epicsPath, `${epicId}.json`));
      if (this.epics) {
        this.epics = this.epics.filter(epic => epic.id !== epicId);
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete epic ${epicId}`);
    }
  }

  // Save epic to file
  async saveEpic(epic) {
    try {
      const epicPath = path.join(this.epicsPath, `${epic.id}.json`);
      await fs.writeFile(epicPath, JSON.stringify(epic, null, 2));
      return epic;
    } catch (error) {
      throw new Error(`Failed to save epic ${epic.id}: ${error.message}`);
    }
  }
  
  // Create new author
  async createAuthor(authorData) {
    const author = { 
      id: authorData.id || this.generateId(), 
      ...authorData 
    };
    
    this.projectData.authors.push(author);
    
    const configPath = path.join(this.todoPath, 'authors.json');
    await fs.writeFile(configPath, JSON.stringify(this.projectData.authors, null, 2));
    
    return author;
  }

  // Update author
  async updateAuthor(authorId, updates) {
    try {
      console.log('updateAuthor called with:', { authorId, updates });
      console.log('Current projectData.authors:', this.projectData?.authors?.length || 'undefined');
      
      if (!this.projectData || !this.projectData.authors) {
        console.error('projectData or authors not loaded!');
        throw new Error('Project data not loaded');
      }
      
      const authorIndex = this.projectData.authors.findIndex(a => a.id === authorId);
      console.log('Author index found:', authorIndex);
      
      if (authorIndex === -1) {
        throw new Error(`Author ${authorId} not found`);
      }

      const oldAuthor = { ...this.projectData.authors[authorIndex] };
      this.projectData.authors[authorIndex] = {
        ...this.projectData.authors[authorIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      console.log('Author updated from:', oldAuthor);
      console.log('Author updated to:', this.projectData.authors[authorIndex]);

      const configPath = path.join(this.todoPath, 'authors.json');
      await fs.writeFile(configPath, JSON.stringify(this.projectData.authors, null, 2));
      console.log('Authors file saved to:', configPath);
      
      return this.projectData.authors[authorIndex];
    } catch (error) {
      console.error('updateAuthor error:', error);
      throw new Error(`Failed to update author ${authorId}: ${error.message}`);
    }
  }

  // Delete author
  async deleteAuthor(authorId) {
    try {
      const authorIndex = this.projectData.authors.findIndex(a => a.id === authorId);
      if (authorIndex === -1) {
        throw new Error(`Author ${authorId} not found`);
      }

      this.projectData.authors.splice(authorIndex, 1);

      const configPath = path.join(this.todoPath, 'authors.json');
      await fs.writeFile(configPath, JSON.stringify(this.projectData.authors, null, 2));
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete author ${authorId}: ${error.message}`);
    }
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
  
  // Load config
  async loadConfig() {
    try {
      const configPath = path.join(this.todoPath, 'config.json');
      const configContent = await fs.readFile(configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      return { projectName: 'JoRA', version: '1.0.0' };
    }
  }

  // Load authors
  async loadAuthors() {
    try {
      const authorsPath = path.join(this.todoPath, 'authors.json');
      const authorsContent = await fs.readFile(authorsPath, 'utf8');
      return JSON.parse(authorsContent);
    } catch (error) {
      return [];
    }
  }

  // Load tags
  async loadTags() {
    try {
      const tagsPath = path.join(this.todoPath, 'tags.json');
      const tagsContent = await fs.readFile(tagsPath, 'utf8');
      return JSON.parse(tagsContent);
    } catch (error) {
      return [];
    }
  }

  // Load project data (config, authors, tags)
  async loadProjectData() {
    try {
      const config = await this.loadConfig();
      const authors = await this.loadAuthors();
      const tags = await this.loadTags();
      
      // Assign to instance variable for use in other methods
      this.projectData = {
        config,
        authors,
        tags
      };
      
      return this.projectData;
    } catch (error) {
      console.error('Error loading project data:', error.message);
      this.projectData = {
        config: { projectName: 'JoRA', version: '1.0.0' },
        authors: [],
        tags: []
      };
      return this.projectData;
    }
  }
}

module.exports = TaskManager;
