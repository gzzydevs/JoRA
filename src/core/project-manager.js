const fs = require('fs').promises;
const path = require('path');

/**
 * Initialize a JoRA project in the given directory
 */
async function initializeProject(projectPath) {
  const todoPath = path.join(projectPath, 'cl-todo');
  
  // Check if already initialized
  try {
    await fs.access(todoPath);
    throw new Error('JoRA already initialized in this directory');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  
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
}

module.exports = {
  initializeProject
};
