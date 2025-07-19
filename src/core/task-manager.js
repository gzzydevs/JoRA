const fs = require('fs').promises;
const path = require('path');

class TaskManager {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.todoPath = this.getProjectDataPath(projectPath);
    this.tasksPath = path.join(this.todoPath, 'tasks');
    this.epicsPath = path.join(this.todoPath, 'epics');
    this.releasesPath = path.join(this.todoPath, 'releases');
  }

  // Determine the correct project data path and migrate if needed
  getProjectDataPath(projectPath) {
    const newPath = path.join(projectPath, 'jora-changelog');
    const oldPath = path.join(projectPath, 'cl-todo');
    
    // Check if new path exists
    try {
      require('fs').accessSync(newPath);
      console.log('🎯 Using jora-changelog directory');
      return newPath;
    } catch (err) {
      // New path doesn't exist, check for old path
      try {
        require('fs').accessSync(oldPath);
        console.log('🔄 Found cl-todo directory, will migrate to jora-changelog...');
        this.migrateFromOldPath(oldPath, newPath);
        return newPath;
      } catch (err2) {
        // Neither exists, use new path (will be created)
        console.log('📁 Will create new jora-changelog directory');
        return newPath;
      }
    }
  }

  // Migrate from cl-todo to jora-changelog
  migrateFromOldPath(oldPath, newPath) {
    try {
      console.log(`📦 Migrating data from ${oldPath} to ${newPath}...`);
      
      // Copy the entire directory synchronously (we need this to happen before continuing)
      const fs = require('fs');
      
      function copyDirSync(src, dest) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      
      copyDirSync(oldPath, newPath);
      console.log('✅ Migration completed successfully!');
      console.log('💡 You can safely delete the old cl-todo directory');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('🔙 Falling back to cl-todo directory');
      return oldPath;
    }
  }
  
  // Generate a simple unique ID
  async generateId(title = '') {
    // Create a slug from the title if provided
    const slug = title 
      ? title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
          .replace(/\s+/g, '-')         // Replace spaces with dashes
          .slice(0, 30)                 // Limit length
      : 'auto-generated';
    
    // Get next counter by reading existing tasks
    try {
      const existingTasks = await this.loadAllTasks();
      const maxNumber = existingTasks
        .map(task => {
          const match = task.id.match(/^task-(\d+)-/);
          return match ? parseInt(match[1]) : 0;
        })
        .reduce((max, num) => Math.max(max, num), 21); // Start from 022 to avoid conflicts
      
      const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
      return `task-${nextNumber}-${slug}`;
    } catch (error) {
      // Fallback to timestamp if reading tasks fails
      const timestamp = Date.now();
      const counter = timestamp.toString().slice(-3);
      return `task-${counter}-${slug}`;
    }
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
      id: await this.generateId(taskData.title),
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      state: taskData.state || 'in_backlog',
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
  
  // Helper function to check if there are actual changes
  hasChanges(original, updates) {
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'updatedAt') continue; // Skip updatedAt field
      
      // Deep comparison for arrays and objects
      if (Array.isArray(value) && Array.isArray(original[key])) {
        if (JSON.stringify(value) !== JSON.stringify(original[key])) {
          return true;
        }
      } else if (typeof value === 'object' && value !== null && typeof original[key] === 'object' && original[key] !== null) {
        if (JSON.stringify(value) !== JSON.stringify(original[key])) {
          return true;
        }
      } else if (original[key] !== value) {
        return true;
      }
    }
    return false;
  }

  // Update existing task
  async updateTask(taskId, updates) {
    const task = await this.loadTask(taskId);
    
    // Check if there are actual changes
    if (!this.hasChanges(task, updates)) {
      // No changes detected, return task without updating updatedAt
      return task;
    }
    
    // Update fields only if there are actual changes
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
      
      // Check if there are actual changes
      if (!this.hasChanges(epic, updates)) {
        // No changes detected, return epic without updating updatedAt
        return epic;
      }
      
      // Update fields only if there are actual changes
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
      
      // Check if there are actual changes
      if (!this.hasChanges(oldAuthor, updates)) {
        // No changes detected, return author without updating updatedAt
        console.log('No changes detected for author:', authorId);
        return oldAuthor;
      }
      
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
    const convertedToEpics = tasks.filter(task => task.state === 'converted_to_epic');
    
    if (tasksToRelease.length === 0) {
      throw new Error('No tasks ready for release');
    }
    
    const release = {
      version,
      description,
      tasks: tasksToRelease,
      convertedToEpics: convertedToEpics, // Include converted tasks for reference but don't move them
      generatedAt: new Date().toISOString(),
      taskCount: tasksToRelease.length,
      convertedCount: convertedToEpics.length
    };
    
    // Save release file
    const releasePath = path.join(this.releasesPath, `v${version}.json`);
    await fs.writeFile(releasePath, JSON.stringify(release, null, 2));
    
    // Remove only ready_to_release tasks from the main tasks directory
    // Leave converted_to_epic tasks as they represent historical conversions
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
  
  // Generate a test release (doesn't move tasks)
  async generateTestRelease(version, description = '', tasksToInclude = null) {
    const tasks = await this.loadAllTasks();
    const tasksToRelease = tasksToInclude || tasks.filter(task => task.state === 'ready_to_release');
    
    if (tasksToRelease.length === 0) {
      throw new Error('No tasks specified for test release');
    }
    
    const release = {
      version,
      description,
      tasks: tasksToRelease,
      isTestVersion: true,
      generatedAt: new Date().toISOString(),
      taskCount: tasksToRelease.length
    };
    
    // Save test release file with special naming
    const releasePath = path.join(this.releasesPath, `test-v${version}.json`);
    await fs.writeFile(releasePath, JSON.stringify(release, null, 2));
    
    // Don't modify tasks or config for test releases
    // Add to releases list for UI purposes
    this.releases.push(release);
    
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

  // Save config
  async saveConfig(config) {
    try {
      const configPath = path.join(this.todoPath, 'config.json');
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
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
  
  // Undo a release (restore tasks to ready_to_release state)
  async undoRelease(version) {
    const releasePath = path.join(this.releasesPath, `v${version}.json`);
    
    // Check if release exists
    try {
      await fs.access(releasePath);
    } catch (error) {
      throw new Error(`Release v${version} not found`);
    }
    
    // Load release data
    const releaseContent = await fs.readFile(releasePath, 'utf8');
    const release = JSON.parse(releaseContent);
    
    // Don't undo test releases
    if (release.isTestVersion) {
      throw new Error('Cannot undo test releases');
    }
    
    // Restore tasks to ready_to_release state
    const restoredTasks = [];
    for (const task of release.tasks) {
      // Set state back to ready_to_release
      task.state = 'ready_to_release';
      task.updatedAt = new Date().toISOString();
      
      // Save task back to tasks directory
      const taskPath = path.join(this.tasksPath, `${task.id}.json`);
      await fs.writeFile(taskPath, JSON.stringify(task, null, 2));
      restoredTasks.push(task);
    }
    
    // Remove release file
    await fs.unlink(releasePath);
    
    // Update releases list
    this.releases = this.releases.filter(r => r.version !== version);
    
    // Reset config version to previous release or default
    const config = await this.loadConfig();
    const remainingReleases = await this.loadAllReleases();
    if (remainingReleases.length > 0) {
      // Set to latest remaining release
      const latestRelease = remainingReleases.sort((a, b) => 
        new Date(b.generatedAt) - new Date(a.generatedAt)
      )[0];
      config.currentVersion = latestRelease.version;
    } else {
      // No releases left, reset to default
      config.currentVersion = '0.0.1';
    }
    await this.saveConfig(config);
    
    this.projectData.config = config;
    
    return {
      message: `Release v${version} has been undone`,
      restoredTasks: restoredTasks.length,
      currentVersion: config.currentVersion
    };
  }
}

module.exports = TaskManager;
