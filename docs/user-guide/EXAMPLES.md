# JoRA Example Project Structure

When you run `jora init` in your project, it creates the following structure:

```
your-project/
├── cl-todo/                    # JoRA data directory
│   ├── config.json            # Project configuration
│   ├── authors.json           # Team members
│   ├── tags.json             # Available tags
│   ├── current.json          # Current state index
│   ├── epics/                # Epic definitions
│   │   ├── frontend.json
│   │   ├── backend.json
│   │   └── documentation.json
│   ├── tasks/                # Individual tasks
│   │   ├── task-1703840000-abc123.json
│   │   ├── task-1703840060-def456.json
│   │   └── task-1703840120-ghi789.json
│   └── releases/             # Completed releases
│       ├── v0.1.0.json
│       └── v0.2.0.json
├── tools/                    # Your project tools
│   └── jora                  # JoRA binary
└── src/                      # Your actual project files
    ├── index.js
    └── ...
```

## Example Files

### config.json
```json
{
  "name": "my-awesome-project",
  "currentVersion": "1.2.3",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "joraVersion": "1.0.0"
}
```

### tasks/task-example.json
```json
{
  "id": "task-1703840000-abc123",
  "title": "Implement user authentication",
  "description": "Add login/logout functionality with JWT tokens",
  "state": "in_progress",
  "priority": "high",
  "epic": "backend",
  "author": "john",
  "tags": ["feature", "security"],
  "subtasks": [
    { "id": "sub-1", "text": "Create login API endpoint", "completed": true },
    { "id": "sub-2", "text": "Add JWT middleware", "completed": false },
    { "id": "sub-3", "text": "Write tests", "completed": false }
  ],
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T14:30:00.000Z"
}
```

### epics/backend.json
```json
{
  "id": "backend",
  "name": "Backend Development",
  "description": "All backend-related features and improvements",
  "color": "#ef4444",
  "status": "active",
  "createdAt": "2025-01-01T09:00:00.000Z"
}
```

### releases/v1.0.0.json
```json
{
  "version": "1.0.0",
  "description": "First major release with core features",
  "tasks": [
    {
      "id": "task-1703840000-abc123",
      "title": "User authentication",
      "epic": "backend",
      "priority": "high"
    }
  ],
  "generatedAt": "2025-01-01T18:00:00.000Z",
  "taskCount": 15
}
```

## Git Integration

All JoRA files are designed to work well with Git:

```bash
# Add JoRA directory to git
git add cl-todo/

# Commit your task management state
git commit -m "Update task status and add new features"

# Your tasks are now version controlled!
```

## Team Collaboration

Each team member can:
1. Pull latest task state: `git pull`
2. Make task updates through JoRA UI
3. Commit and push changes: `git add cl-todo/ && git commit -m "Updated tasks" && git push`

This way everyone stays in sync with the project's task state!
