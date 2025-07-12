// JoRA Frontend Application
console.log('JoRA app.js starting to load...');

class JoRAApp {
    constructor() {
        console.log('JoRAApp constructor called');
        this.tasks = [];
        this.epics = [];
        this.authors = [];
        this.tags = [];
        this.config = {};
        this.releases = [];
        this.currentView = 'kanban'; // 'kanban' or 'release'
        this.selectedVersion = 'current';
        this.currentTask = null;
        this.filters = {
            epic: '',
            author: '',
            search: ''
        };
        
        console.log('JoRAApp calling init()...');
        this.init();
    }
    
    async init() {
        this.initTheme();
        await this.loadProjectData();
        await this.loadReleases();
        this.setupEventListeners();
        await this.loadTasks();
        this.populateVersionSelector();
        this.currentView = 'kanban'; // Set initial view
        this.renderTasks();
    }
    
    // API calls
    async apiCall(url, options = {}) {
        try {
            console.log(`Making API call to: ${url}`);
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }
            
            const result = await response.json();
            console.log(`API response from ${url}:`, result);
            return result;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
    
    async loadProjectData() {
        try {
            console.log('Loading project data...');
            const data = await this.apiCall('/api/project');
            console.log('Project data loaded:', data);
            
            this.config = data.config;
            this.authors = data.authors;
            this.tags = data.tags;
            
            document.getElementById('project-name').textContent = this.config.name;
            document.getElementById('project-version').textContent = `v${this.config.currentVersion}`;
            
            await this.loadEpics();
            this.populateSelects();
        } catch (error) {
            console.error('Error loading project data:', error);
            this.showError('Failed to load project data: ' + error.message);
        }
    }
    
    async loadTasks() {
        try {
            this.tasks = await this.apiCall('/api/tasks');
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showError('Failed to load tasks');
        }
    }
    
    async loadEpics() {
        try {
            this.epics = await this.apiCall('/api/epics');
        } catch (error) {
            console.error('Error loading epics:', error);
            this.showError('Failed to load epics');
        }
    }

    async loadReleases() {
        try {
            this.releases = await this.apiCall('/api/releases');
        } catch (error) {
            console.error('Error loading releases:', error);
            this.showError('Failed to load releases');
        }
    }
    
    async createTask(taskData) {
        return await this.apiCall('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }
    
    async updateTask(taskId, updates) {
        return await this.apiCall(`/api/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }
    
    async deleteTask(taskId) {
        await this.apiCall(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }
    
    async createEpic(epicData) {
        return await this.apiCall('/api/epics', {
            method: 'POST',
            body: JSON.stringify(epicData)
        });
    }
    
    async createAuthor(authorData) {
        return await this.apiCall('/api/authors', {
            method: 'POST',
            body: JSON.stringify(authorData)
        });
    }
    
    async generateRelease(version, description) {
        return await this.apiCall('/api/releases', {
            method: 'POST',
            body: JSON.stringify({ version, description })
        });
    }
    
    // Event listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle-btn').addEventListener('click', () => this.toggleTheme());
        
        // Modal controls
        document.getElementById('new-task-btn').addEventListener('click', () => this.openTaskModal());
        document.getElementById('new-epic-btn').addEventListener('click', () => this.openEpicModal());
        document.getElementById('new-author-btn').addEventListener('click', () => this.openAuthorModal());
        document.getElementById('release-btn').addEventListener('click', () => this.openReleaseModal());
        document.getElementById('backlog-btn').addEventListener('click', () => this.showBacklogView());
        
        // Version selector
        document.getElementById('version-select').addEventListener('change', (e) => this.handleVersionChange(e.target.value));
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });
        
        // Form submissions
        document.getElementById('task-form').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('epic-form').addEventListener('submit', (e) => this.handleEpicSubmit(e));
        document.getElementById('author-form').addEventListener('submit', (e) => this.handleAuthorSubmit(e));
        document.getElementById('release-form').addEventListener('submit', (e) => this.handleReleaseSubmit(e));
        
        // Task form buttons
        document.getElementById('cancel-task-btn').addEventListener('click', () => this.closeModal(document.getElementById('task-modal')));
        document.getElementById('delete-task-btn').addEventListener('click', () => this.handleTaskDelete());
        
        // Epic form buttons
        document.getElementById('cancel-epic-btn').addEventListener('click', () => this.closeModal(document.getElementById('epic-modal')));
        
        // Author form buttons
        document.getElementById('cancel-author-btn').addEventListener('click', () => this.closeModal(document.getElementById('author-modal')));
        
        // Release form buttons
        document.getElementById('cancel-release-btn').addEventListener('click', () => this.closeModal(document.getElementById('release-modal')));
        
        // Subtask management
        document.getElementById('add-subtask-btn').addEventListener('click', () => this.addSubtask());
        
        // Image upload management
        document.getElementById('browse-images-btn').addEventListener('click', () => {
            document.getElementById('image-input').click();
        });
        
        document.getElementById('image-input').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files);
        });
        
        // Paste image handling
        document.addEventListener('paste', (e) => {
            if (document.querySelector('.modal.active')) {
                this.handlePasteImage(e);
            }
        });
        
        // Avatar upload
        document.getElementById('author-avatar-input').addEventListener('change', (e) => {
            this.handleAvatarUpload(e.target.files[0]);
        });
        
        // View navigation
        document.getElementById('back-to-kanban').addEventListener('click', () => this.showKanbanView());
        document.getElementById('back-to-kanban-2').addEventListener('click', () => this.showKanbanView());
        
        // Filters
        document.getElementById('epic-filter').addEventListener('change', (e) => {
            this.filters.epic = e.target.value;
            this.renderTasks();
        });
        
        document.getElementById('author-filter').addEventListener('change', (e) => {
            this.filters.author = e.target.value;
            this.renderTasks();
        });
        
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.renderTasks();
        });
        
        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
        
        // Drag and drop
        this.setupDragAndDrop();
    }
    
    setupDragAndDrop() {
        // Will be implemented for drag and drop functionality
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.remove('dragging');
            }
        });
        
        document.querySelectorAll('.kanban-column').forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', (e) => {
                if (!column.contains(e.relatedTarget)) {
                    column.classList.remove('drag-over');
                }
            });
            
            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const taskId = e.dataTransfer.getData('text/plain');
                const newState = column.dataset.state;
                
                if (taskId && newState) {
                    await this.updateTaskState(taskId, newState);
                }
            });
        });
    }
    
    // Task management
    async updateTaskState(taskId, newState) {
        try {
            await this.updateTask(taskId, { state: newState });
            await this.loadTasks();
            this.renderTasks();
        } catch (error) {
            console.error('Error updating task state:', error);
            this.showError('Failed to update task state');
        }
    }
    
    // UI rendering
    populateSelects() {
        // Populate epic selects
        const epicSelects = [
            document.getElementById('task-epic'),
            document.getElementById('epic-filter')
        ];
        
        epicSelects.forEach(select => {
            if (select.id === 'epic-filter') {
                select.innerHTML = '<option value="">All Epics</option>';
            } else {
                select.innerHTML = '<option value="">No Epic</option>';
            }
            
            this.epics.forEach(epic => {
                const option = document.createElement('option');
                option.value = epic.id;
                option.textContent = epic.name;
                select.appendChild(option);
            });
        });
        
        // Populate author selects
        const authorSelects = [
            document.getElementById('task-author'),
            document.getElementById('task-assignee'),
            document.getElementById('author-filter')
        ];
        
        authorSelects.forEach(select => {
            if (select.id === 'author-filter') {
                select.innerHTML = '<option value="">All Authors</option>';
            } else if (select.id === 'task-assignee') {
                select.innerHTML = '<option value="">Unassigned</option>';
            } else {
                select.innerHTML = '';
            }
            
            this.authors.forEach(author => {
                const option = document.createElement('option');
                option.value = author.id;
                option.textContent = author.name;
                select.appendChild(option);
            });
        });
        
        // Populate tags
        this.populateTags();
    }
    
    populateTags() {
        const tagContainer = document.getElementById('task-tags');
        tagContainer.innerHTML = '';
        
        this.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-option';
            tagElement.dataset.tagId = tag.id;
            tagElement.textContent = tag.name;
            tagElement.addEventListener('click', () => {
                tagElement.classList.toggle('selected');
            });
            tagContainer.appendChild(tagElement);
        });
    }
    
    renderTasks() {
        // Only render tasks if we're in kanban view
        if (this.currentView !== 'kanban') {
            return;
        }
        
        const states = ['todo', 'in_progress', 'ready_to_release'];
        const containers = {
            'todo': document.getElementById('todo-tasks'),
            'in_progress': document.getElementById('progress-tasks'),
            'ready_to_release': document.getElementById('ready-tasks')
        };
        
        // Clear containers
        Object.values(containers).forEach(container => {
            if (container) container.innerHTML = '';
        });
        
        // Filter tasks
        const filteredTasks = this.tasks.filter(task => {
            if (this.filters.epic && task.epic !== this.filters.epic) return false;
            if (this.filters.author && task.author !== this.filters.author) return false;
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                return task.title.toLowerCase().includes(searchLower) ||
                       task.description.toLowerCase().includes(searchLower);
            }
            return true;
        });
        
        // Group by state and render
        states.forEach(state => {
            const stateTasks = filteredTasks.filter(task => task.state === state);
            const container = containers[state];
            
            if (!container) return;
            
            if (stateTasks.length === 0) {
                container.innerHTML = '<div class="empty-state">No tasks</div>';
            } else {
                stateTasks.forEach(task => {
                    container.appendChild(this.createTaskCard(task));
                });
            }
        });
        
        // Update counts
        this.updateTaskCounts(filteredTasks);
    }
    
    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.dataset.taskId = task.id;
        card.draggable = true;
        
        const epic = this.epics.find(e => e.id === task.epic);
        const author = this.authors.find(a => a.id === task.author);
        const assignee = this.authors.find(a => a.id === task.assignee);
        
        const subtaskProgress = task.subtasks.length > 0 
            ? `${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}`
            : '';
        
        const estimatedDate = task.estimatedDate 
            ? new Date(task.estimatedDate).toLocaleDateString()
            : '';
        
        card.innerHTML = `
            <div class="task-header">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                <div class="task-priority priority-${task.priority}">${task.priority.replace('_', ' ')}</div>
            </div>
            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
            ${task.estimatedPoints > 0 || estimatedDate || task.images?.length > 0 ? `
                <div class="task-estimated-info">
                    ${task.estimatedPoints > 0 ? `<span class="task-points">${task.estimatedPoints} pts</span>` : ''}
                    ${estimatedDate ? `<span class="task-due-date">${estimatedDate}</span>` : ''}
                    ${task.images?.length > 0 ? `<span class="task-images-indicator">📷 ${task.images.length}</span>` : ''}
                </div>
            ` : ''}
            <div class="task-footer">
                <div class="task-meta">
                    ${epic ? `<div class="task-epic" style="background-color: ${epic.color}20; color: ${epic.color};">${epic.name}</div>` : ''}
                    <div class="task-tags">
                        ${task.tags.map(tagId => {
                            const tag = this.tags.find(t => t.id === tagId);
                            return tag ? `<div class="task-tag">${tag.name}</div>` : '';
                        }).join('')}
                    </div>
                </div>
                <div class="task-meta">
                    ${author ? `<span>${author.name}</span>` : ''}
                    ${assignee && assignee.id !== author?.id ? `<span>→ ${assignee.name}</span>` : ''}
                    ${subtaskProgress ? `<span class="task-subtasks">✓ ${subtaskProgress}</span>` : ''}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => this.openTaskModal(task));
        
        return card;
    }
    
    updateTaskCounts(tasks) {
        const counts = {
            todo: tasks.filter(t => t.state === 'todo').length,
            in_progress: tasks.filter(t => t.state === 'in_progress').length,
            ready_to_release: tasks.filter(t => t.state === 'ready_to_release').length
        };
        
        document.getElementById('todo-count').textContent = counts.todo;
        document.getElementById('progress-count').textContent = counts.in_progress;
        document.getElementById('ready-count').textContent = counts.ready_to_release;
        
        document.getElementById('todo-column-count').textContent = counts.todo;
        document.getElementById('progress-column-count').textContent = counts.in_progress;
        document.getElementById('ready-column-count').textContent = counts.ready_to_release;
    }
    
    // Modal management
    openTaskModal(task = null) {
        this.currentTask = task;
        const modal = document.getElementById('task-modal');
        const title = document.getElementById('modal-title');
        const deleteBtn = document.getElementById('delete-task-btn');
        
        if (task) {
            title.textContent = 'Edit Task';
            deleteBtn.style.display = 'inline-flex';
            this.populateTaskForm(task);
        } else {
            title.textContent = 'New Task';
            deleteBtn.style.display = 'none';
            this.resetTaskForm();
        }
        
        modal.classList.add('active');
    }
    
    openEpicModal() {
        const modal = document.getElementById('epic-modal');
        this.resetEpicForm();
        modal.classList.add('active');
    }
    
    async openReleaseModal() {
        const modal = document.getElementById('release-modal');
        const readyTasks = this.tasks.filter(task => task.state === 'ready_to_release');
        
        if (readyTasks.length === 0) {
            this.showError('No tasks ready for release');
            return;
        }
        
        // Show preview
        const preview = document.getElementById('release-preview');
        preview.innerHTML = `
            <h4>Tasks to be released (${readyTasks.length}):</h4>
            <div class="release-task-list">
                ${readyTasks.map(task => `
                    <div class="release-task">
                        <div class="release-task-title">${this.escapeHtml(task.title)}</div>
                        <div class="release-task-meta">
                            ${task.epic ? this.epics.find(e => e.id === task.epic)?.name || task.epic : 'No epic'} • 
                            ${task.priority} priority
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Suggest next version
        const currentVersion = this.config.currentVersion;
        const versionParts = currentVersion.split('.');
        versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
        document.getElementById('release-version').value = versionParts.join('.');
        
        modal.classList.add('active');
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        this.currentTask = null;
    }
    
    // Form management
    populateTaskForm(task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-epic').value = task.epic || '';
        document.getElementById('task-type').value = task.type || 'feature';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-author').value = task.author;
        document.getElementById('task-assignee').value = task.assignee || '';
        document.getElementById('task-state').value = task.state;
        document.getElementById('task-estimated-points').value = task.estimatedPoints || '';
        document.getElementById('task-estimated-date').value = task.estimatedDate || '';
        
        // Set selected tags
        document.querySelectorAll('.tag-option').forEach(tagEl => {
            if (task.tags.includes(tagEl.dataset.tagId)) {
                tagEl.classList.add('selected');
            } else {
                tagEl.classList.remove('selected');
            }
        });
        
        // Populate subtasks
        this.populateSubtasks(task.subtasks);
        
        // Populate images
        this.populateImages(task.images);
    }
    
    resetTaskForm() {
        document.getElementById('task-form').reset();
        document.getElementById('task-state').value = 'todo';
        document.getElementById('task-type').value = 'feature';
        document.getElementById('task-author').value = this.authors[0]?.id || '';
        document.querySelectorAll('.tag-option').forEach(tagEl => {
            tagEl.classList.remove('selected');
        });
        document.getElementById('subtasks-container').innerHTML = '';
        document.getElementById('image-preview-container').innerHTML = '';
    }
    
    resetEpicForm() {
        document.getElementById('epic-form').reset();
        document.getElementById('epic-color').value = '#6366f1';
    }
    
    populateSubtasks(subtasks) {
        const container = document.getElementById('subtasks-container');
        container.innerHTML = '';
        
        subtasks.forEach(subtask => {
            this.addSubtask(subtask.text, subtask.completed);
        });
    }
    
    addSubtask(text = '', completed = false) {
        const container = document.getElementById('subtasks-container');
        const subtask = document.createElement('div');
        subtask.className = 'subtask-item';
        
        subtask.innerHTML = `
            <input type="checkbox" ${completed ? 'checked' : ''}>
            <input type="text" placeholder="Subtask..." value="${this.escapeHtml(text)}">
            <button type="button" class="subtask-remove">Remove</button>
        `;
        
        subtask.querySelector('.subtask-remove').addEventListener('click', () => {
            subtask.remove();
        });
        
        container.appendChild(subtask);
    }
    
    // Form submissions
    async handleTaskSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = this.getTaskFormData();
            
            if (this.currentTask) {
                await this.updateTask(this.currentTask.id, formData);
            } else {
                await this.createTask(formData);
            }
            
            await this.loadTasks();
            this.renderTasks();
            this.closeModal(document.getElementById('task-modal'));
            this.showSuccess(this.currentTask ? 'Task updated' : 'Task created');
        } catch (error) {
            console.error('Error saving task:', error);
            this.showError('Failed to save task: ' + error.message);
        }
    }
    
    async handleEpicSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = {
                name: document.getElementById('epic-name').value,
                description: document.getElementById('epic-description').value,
                color: document.getElementById('epic-color').value
            };
            
            await this.createEpic(formData);
            await this.loadEpics();
            this.populateSelects();
            this.closeModal(document.getElementById('epic-modal'));
            this.showSuccess('Epic created');
        } catch (error) {
            console.error('Error creating epic:', error);
            this.showError('Failed to create epic: ' + error.message);
        }
    }
    
    async handleReleaseSubmit(e) {
        e.preventDefault();
        
        try {
            const version = document.getElementById('release-version').value;
            const description = document.getElementById('release-description').value;
            
            await this.generateRelease(version, description);
            await this.loadTasks();
            await this.loadProjectData();
            this.renderTasks();
            this.closeModal(document.getElementById('release-modal'));
            this.showSuccess(`Release v${version} generated successfully!`);
        } catch (error) {
            console.error('Error generating release:', error);
            this.showError('Failed to generate release: ' + error.message);
        }
    }
    
    async handleTaskDelete() {
        if (!this.currentTask) return;
        
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await this.deleteTask(this.currentTask.id);
                await this.loadTasks();
                this.renderTasks();
                this.closeModal(document.getElementById('task-modal'));
                this.showSuccess('Task deleted');
            } catch (error) {
                console.error('Error deleting task:', error);
                this.showError('Failed to delete task: ' + error.message);
            }
        }
    }
    
    getTaskFormData() {
        const selectedTags = Array.from(document.querySelectorAll('.tag-option.selected'))
            .map(el => el.dataset.tagId);
        
        const subtasks = Array.from(document.querySelectorAll('.subtask-item')).map(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const text = item.querySelector('input[type="text"]').value;
            return {
                id: 'subtask-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                text,
                completed: checkbox.checked
            };
        }).filter(s => s.text.trim());
        
        const images = Array.from(document.querySelectorAll('.image-preview')).map(preview => {
            return preview.dataset.imageData;
        }).filter(Boolean);
        
        return {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            epic: document.getElementById('task-epic').value || null,
            type: document.getElementById('task-type').value || 'feature',
            priority: document.getElementById('task-priority').value,
            author: document.getElementById('task-author').value,
            assignee: document.getElementById('task-assignee').value || null,
            state: document.getElementById('task-state').value,
            tags: selectedTags,
            subtasks,
            estimatedPoints: parseFloat(document.getElementById('task-estimated-points').value) || 0,
            estimatedDate: document.getElementById('task-estimated-date').value || null,
            images
        };
    }
    
    // Image handling methods
    handleImageUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.processImage(file);
            }
        });
    }
    
    handlePasteImage(e) {
        const items = e.clipboardData?.items;
        if (!items) return;
        
        for (let item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                this.processImage(item.getAsFile());
                break;
            }
        }
    }
    
    processImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.addImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    addImagePreview(base64Data) {
        const container = document.getElementById('image-preview-container');
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.dataset.imageData = base64Data;
        
        preview.innerHTML = `
            <img src="${base64Data}" alt="Uploaded image">
            <button type="button" class="remove-image" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(preview);
    }
    
    populateImages(images) {
        const container = document.getElementById('image-preview-container');
        container.innerHTML = '';
        
        images.forEach(imageData => {
            this.addImagePreview(imageData);
        });
    }
    
    // Avatar handling
    handleAvatarUpload(file) {
        if (!file || !file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('avatar-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Avatar preview">`;
            preview.dataset.avatarData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // View management
    populateVersionSelector() {
        const select = document.getElementById('version-select');
        select.innerHTML = '<option value="current">🏃 Current Version</option>';
        
        // Sort releases by version (most recent first)
        const sortedReleases = this.releases.sort((a, b) => {
            // Simple version comparison - assumes semantic versioning
            const aVersion = a.version.split('.').map(Number);
            const bVersion = b.version.split('.').map(Number);
            
            for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
                const aPart = aVersion[i] || 0;
                const bPart = bVersion[i] || 0;
                if (aPart !== bPart) {
                    return bPart - aPart; // Descending order
                }
            }
            return 0;
        });
        
        sortedReleases.forEach(release => {
            const option = document.createElement('option');
            option.value = release.version;
            option.textContent = `📦 v${release.version} (${release.taskCount} tasks)`;
            select.appendChild(option);
        });
    }
    
    handleVersionChange(version) {
        this.selectedVersion = version;
        
        if (version === 'current') {
            this.showKanbanView();
        } else {
            this.showReleaseView(version);
        }
    }
    
    showReleaseView(version) {
        const release = this.releases.find(r => r.version === version);
        if (!release) {
            this.showError('Release not found');
            return;
        }
        
        // Hide kanban view and show release view
        document.getElementById('kanban-view').style.display = 'none';
        document.getElementById('release-view').style.display = 'block';
        
        this.renderReleaseView(release);
    }
    
    showKanbanView() {
        document.getElementById('kanban-view').style.display = 'block';
        document.getElementById('release-view').style.display = 'none';
        this.currentView = 'kanban';
    }
    
    renderReleaseView(release) {
        // Update release header
        document.getElementById('release-title').textContent = `Version ${release.version}`;
        document.getElementById('release-description').textContent = release.description;
        
        const releaseDate = new Date(release.generatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('release-date').textContent = `Generated on: ${releaseDate}`;
        document.getElementById('release-task-count').textContent = `${release.taskCount} tasks`;
        
        // Group tasks by type
        const tasksByType = {
            feature: [],
            fix: [],
            hotfix: [],
            poc: []
        };
        
        release.tasks.forEach(task => {
            const type = task.type || 'feature'; // Default to feature if no type
            if (tasksByType[type]) {
                tasksByType[type].push(task);
            } else {
                tasksByType.feature.push(task); // Fallback to feature
            }
        });
        
        // Render each type column
        Object.keys(tasksByType).forEach(type => {
            this.renderTypeColumn(type, tasksByType[type]);
        });
        
        this.currentView = 'release';
    }
    
    renderTypeColumn(type, tasks) {
        const container = document.getElementById(`${type}-tasks`);
        const countElement = document.getElementById(`${type}-count`);
        
        // Update count
        countElement.textContent = tasks.length;
        
        // Clear container
        container.innerHTML = '';
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">No tasks</div>';
            return;
        }
        
        // Render tasks
        tasks.forEach(task => {
            const taskCard = this.createReleaseTaskCard(task);
            container.appendChild(taskCard);
        });
    }
    
    createReleaseTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.dataset.taskId = task.id;
        
        const epic = this.epics.find(e => e.id === task.epic);
        const author = this.authors.find(a => a.id === task.author);
        const assignee = this.authors.find(a => a.id === task.assignee);
        
        const priorityColors = {
            'very_low': '#6b7280',
            'low': '#10b981', 
            'medium': '#f59e0b',
            'high': '#ef4444',
            'very_high': '#7c2d12'
        };
        
        const completedDate = task.completedAt 
            ? new Date(task.completedAt).toLocaleDateString()
            : '';
        
        card.innerHTML = `
            <div class="task-header">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                <div class="task-priority" style="background-color: ${priorityColors[task.priority]};">
                    ${task.priority.replace('_', ' ')}
                </div>
            </div>
            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                ${epic ? `<span class="task-epic" style="background-color: ${epic.color}20; color: ${epic.color};">${epic.name}</span>` : ''}
                <div class="task-tags">
                    ${task.tags.map(tagId => {
                        const tag = this.tags.find(t => t.id === tagId);
                        return tag ? `<span class="task-tag">${tag.name}</span>` : '';
                    }).join('')}
                </div>
            </div>
            <div class="task-footer">
                <div class="task-authors">
                    ${author ? `<span>by ${author.name}</span>` : ''}
                    ${assignee ? `<span>→ ${assignee.name}</span>` : ''}
                </div>
                <div class="task-dates">
                    ${task.estimatedPoints > 0 ? `<span>${task.estimatedPoints} pts</span>` : ''}
                    ${completedDate ? `<span>✅ ${completedDate}</span>` : ''}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => this.openTaskModal(task));
        
        return card;
    }

    showBacklogView() {
        document.querySelector('.main-content').style.display = 'none';
        document.getElementById('backlog-view').style.display = 'block';
        this.loadBacklogData();
    }
    
    showCurrentVersionView() {
        document.querySelector('.main-content').style.display = 'none';
        document.getElementById('current-version-view').style.display = 'block';
        this.loadCurrentVersionData();
    }
    
    showKanbanView() {
        document.querySelector('.main-content').style.display = 'block';
        document.getElementById('backlog-view').style.display = 'none';
        document.getElementById('current-version-view').style.display = 'none';
    }
    
    async loadBacklogData() {
        try {
            const tasks = await this.loadBacklog();
            this.renderBacklogList(tasks);
        } catch (error) {
            console.error('Error loading backlog:', error);
            this.showError('Failed to load backlog');
        }
    }
    
    renderBacklogList(tasks) {
        const container = document.getElementById('backlog-list');
        container.innerHTML = '';
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">No tasks in backlog</div>';
            return;
        }
        
        tasks.forEach(task => {
            const item = this.createBacklogItem(task);
            container.appendChild(item);
        });
    }
    
    createBacklogItem(task) {
        const item = document.createElement('div');
        item.className = 'backlog-item';
        item.dataset.taskId = task.id;
        
        const epic = this.epics.find(e => e.id === task.epic);
        const author = this.authors.find(a => a.id === task.author);
        const assignee = this.authors.find(a => a.id === task.assignee);
        
        const estimatedDate = task.estimatedDate 
            ? new Date(task.estimatedDate).toLocaleDateString()
            : '';
        
        item.innerHTML = `
            <div class="backlog-item-header">
                <div class="backlog-item-title">${this.escapeHtml(task.title)}</div>
                <div class="backlog-item-meta">
                    ${task.estimatedPoints > 0 ? `<span class="backlog-item-points">${task.estimatedPoints} pts</span>` : ''}
                    ${estimatedDate ? `<span class="backlog-item-date">${estimatedDate}</span>` : ''}
                    <span class="task-priority priority-${task.priority}">${task.priority.replace('_', ' ')}</span>
                </div>
            </div>
            ${task.description ? `<div class="backlog-item-description">${this.escapeHtml(task.description)}</div>` : ''}
            <div class="backlog-item-footer">
                <div class="task-meta">
                    ${epic ? `<span class="task-epic" style="background-color: ${epic.color}20; color: ${epic.color};">${epic.name}</span>` : ''}
                    <div class="task-tags">
                        ${task.tags.map(tagId => {
                            const tag = this.tags.find(t => t.id === tagId);
                            return tag ? `<span class="task-tag">${tag.name}</span>` : '';
                        }).join('')}
                    </div>
                </div>
                <div class="task-meta">
                    ${author ? `<span>by ${author.name}</span>` : ''}
                    ${assignee ? `<span>→ ${assignee.name}</span>` : ''}
                    <span>${task.state.replace('_', ' ')}</span>
                </div>
            </div>
        `;
        
        item.addEventListener('click', () => this.openTaskModal(task));
        
        return item;
    }
    
    async loadCurrentVersionData() {
        // For now, show all current tasks
        // In the future, this could filter by sprint/version
        this.renderCurrentVersionBoard();
    }
    
    renderCurrentVersionBoard() {
        const containers = {
            'todo': document.getElementById('sprint-todo-tasks'),
            'in_progress': document.getElementById('sprint-progress-tasks'),
            'ready_to_release': document.getElementById('sprint-ready-tasks')
        };
        
        // Clear containers
        Object.values(containers).forEach(container => {
            container.innerHTML = '';
        });
        
        const states = ['todo', 'in_progress', 'ready_to_release'];
        let totalPoints = 0;
        
        states.forEach(state => {
            const stateTasks = this.tasks.filter(task => task.state === state);
            const container = containers[state];
            
            if (stateTasks.length === 0) {
                container.innerHTML = '<div class="empty-state">No tasks</div>';
            } else {
                stateTasks.forEach(task => {
                    container.appendChild(this.createTaskCard(task));
                    totalPoints += task.estimatedPoints || 0;
                });
            }
            
            // Update counts
            const countId = state === 'todo' ? 'sprint-todo-count' :
                           state === 'in_progress' ? 'sprint-progress-count' :
                           'sprint-ready-count';
            document.getElementById(countId).textContent = stateTasks.length;
        });
        
        document.getElementById('sprint-points-total').textContent = `${totalPoints} points planned`;
    }
    
    // Modal management for new modals
    openAuthorModal() {
        const modal = document.getElementById('author-modal');
        this.resetAuthorForm();
        modal.classList.add('active');
    }
    
    resetAuthorForm() {
        document.getElementById('author-form').reset();
        document.getElementById('avatar-preview').innerHTML = '<span>No avatar selected</span>';
        delete document.getElementById('avatar-preview').dataset.avatarData;
    }
    
    // Form submission for author
    async handleAuthorSubmit(e) {
        e.preventDefault();
        
        try {
            const avatarData = document.getElementById('avatar-preview').dataset.avatarData;
            const formData = {
                name: document.getElementById('author-name').value,
                email: document.getElementById('author-email').value,
                avatarSmall: avatarData ? this.resizeImage(avatarData, 32) : null,
                avatarMedium: avatarData ? this.resizeImage(avatarData, 64) : null,
                avatarLarge: avatarData ? this.resizeImage(avatarData, 128) : null
            };
            
            await this.createAuthor(formData);
            await this.loadProjectData();
            this.closeModal(document.getElementById('author-modal'));
            this.showSuccess('Author created');
        } catch (error) {
            console.error('Error creating author:', error);
            this.showError('Failed to create author: ' + error.message);
        }
    }
    
    // Image resizing utility
    resizeImage(base64Data, size) {
        // For now, return the original image
        // In a real implementation, you'd use canvas to resize
        return base64Data;
    }
    
    // Theme management
    toggleTheme() {
        const body = document.body;
        const currentTheme = localStorage.getItem('jora-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        const body = document.body;
        const themeBtn = document.getElementById('theme-toggle-btn');
        
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeBtn.innerHTML = '☀️ Light';
            localStorage.setItem('jora-theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            themeBtn.innerHTML = '🌙 Dark';
            localStorage.setItem('jora-theme', 'light');
        }
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('jora-theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showMessage(message, type = 'success') {
        const existing = document.querySelector('.success-message, .error-message');
        if (existing) existing.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = `${type}-message`;
        messageEl.textContent = message;
        
        document.querySelector('.main-content').insertBefore(messageEl, document.querySelector('.controls'));
        
        setTimeout(() => messageEl.remove(), 5000);
    }
    
    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }
    
    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }
}

// Initialize app when DOM is loaded
console.log('Setting up DOMContentLoaded listener...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded! Creating JoRAApp...');
    try {
        new JoRAApp();
        console.log('JoRAApp created successfully');
    } catch (error) {
        console.error('Error creating JoRAApp:', error);
    }
});
