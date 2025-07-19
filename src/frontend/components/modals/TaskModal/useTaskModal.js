import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../../contexts/TaskContext';
import api from '../../../services/api';

export const useTaskModal = (taskId) => {
  const navigate = useNavigate();
  const { 
    tasks, 
    epics, 
    authors, 
    tags, 
    createTask, 
    updateTask, 
    deleteTask,
    fetchData 
  } = useTaskContext();

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  // Load task data
  useEffect(() => {
    const loadTask = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (taskId) {
          // Try to find in context first
          let foundTask = tasks.find(t => t.id === taskId);
          
          if (!foundTask) {
            // If not in context, try to load from API
            const response = await api.get(`/tasks/${taskId}`);
            foundTask = response.data;
          }

          if (foundTask) {
            setTask(foundTask);
            setFormData({
              title: foundTask.title || '',
              description: foundTask.description || '',
              state: foundTask.state || 'in_backlog',
              priority: foundTask.priority || 'medium',
              type: foundTask.type || 'feature',
              epic: foundTask.epic || '',
              author: foundTask.author || '',
              assignee: foundTask.assignee || '',
              estimatedPoints: foundTask.estimatedPoints || 0,
              estimatedDate: foundTask.estimatedDate || '',
              tags: foundTask.tags || [],
              subtasks: foundTask.subtasks || []
            });
          } else {
            setError('Task not found');
          }
        } else {
          // New task
          setTask(null);
          setFormData({
            title: '',
            description: '',
            state: 'in_backlog',
            priority: 'medium',
            type: 'feature',
            epic: '',
            author: authors[0]?.id || '',
            assignee: '',
            estimatedPoints: 0,
            estimatedDate: '',
            tags: [],
            subtasks: []
          });
          setIsEditing(true); // New task starts in edit mode
        }
      } catch (err) {
        console.error('Error loading task:', err);
        setError('Failed to load task');
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [taskId, tasks, authors]);

  // Form handlers
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested field like "subtasks.0.text"
      const [parent, index, subField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: prev[parent].map((item, i) => 
          i === parseInt(index) ? { ...item, [subField]: value } : item
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...(prev.tags || []), tagId]
    }));
  };

  const handleSubtaskAdd = () => {
    setFormData(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), { text: '', completed: false }]
    }));
  };

  const handleSubtaskRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const handleSubtaskToggle = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, i) => 
        i === index ? { ...subtask, completed: !subtask.completed } : subtask
      )
    }));
  };

  // Helper function to check if there are actual changes
  const hasChanges = (original, updates) => {
    if (!original) return true; // New task, always has changes
    
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'updatedAt' || key === 'createdAt' || key === 'id') continue; // Skip metadata fields
      
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
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      alert('Task title is required.');
      return;
    }

    try {
      setIsLoading(true);
      
      const taskData = {
        ...formData,
        id: task?.id || `task-${Date.now()}`,
        createdAt: task?.createdAt || new Date().toISOString(),
      };

      if (task) {
        // Check if there are actual changes before updating
        if (!hasChanges(task, taskData)) {
          console.log('No changes detected, skipping update');
          setIsEditing(false);
          setIsLoading(false);
          return;
        }
        
        // Add updatedAt only if there are changes
        taskData.updatedAt = new Date().toISOString();
        
        // Update existing task
        await updateTask(task.id, taskData);
        setTask(taskData);
      } else {
        // Create new task - always add updatedAt for new tasks
        taskData.updatedAt = new Date().toISOString();
        const newTask = await createTask(taskData);
        if (newTask) {
          navigate(`/task/${newTask.id}`);
        }
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setIsLoading(true);
        await deleteTask(task.id);
        // Navigation will be handled by the parent component
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task');
        setIsLoading(false);
      }
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          state: task.state || 'todo',
          priority: task.priority || 'medium',
          type: task.type || 'feature',
          epic: task.epic || '',
          author: task.author || '',
          assignee: task.assignee || '',
          estimatedPoints: task.estimatedPoints || 0,
          estimatedDate: task.estimatedDate || '',
          tags: task.tags || [],
          subtasks: task.subtasks || []
        });
      }
    }
    setIsEditing(!isEditing);
  };

  // Convert to Epic functionality
  const handleConvertToEpic = async () => {
    if (!task) return;

    // Generate prompt for AI agent
    const prompt = generateConvertToEpicPrompt(task);
    
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(prompt);
      alert('✅ Prompt copied to clipboard! You can now paste it to an AI agent to convert this task to an epic.');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback: show prompt in a modal or alert
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Prompt copied to clipboard! You can now paste it to an AI agent to convert this task to an epic.');
    }
  };

  // Reactivate cancelled task
  const handleReactivate = async () => {
    if (!task || task.state !== 'cancelled') return;

    try {
      const reactivatedTask = {
        ...task,
        state: 'in_backlog', // Move back to backlog when reactivated
        updatedAt: new Date().toISOString()
      };

      await updateTask(reactivatedTask.id, { state: 'in_backlog' });
      setTask(reactivatedTask);
      setFormData(prev => ({ ...prev, state: 'in_backlog' }));
      
      alert('✅ Task has been reactivated and moved to backlog.');
    } catch (err) {
      console.error('Failed to reactivate task:', err);
      setError('Failed to reactivate task');
    }
  };

  // Check if task is suitable for epic conversion
  const shouldShowConvertToEpic = () => {
    if (!task) return false;
    
    // Show convert button if:
    // 1. Task has multiple subtasks (>= 3)
    // 2. Task has high estimated points (>= 8)
    // 3. Task is not already converted
    const hasMultipleSubtasks = task.subtasks && task.subtasks.length >= 3;
    const isLargeTask = task.estimatedPoints >= 8;
    const notConverted = task.state !== 'converted_to_epic';
    
    return (hasMultipleSubtasks || isLargeTask) && notConverted;
  };

  const generateConvertToEpicPrompt = (task) => {
    return `🔄 CONVERT TASK TO EPIC REQUEST

Please convert the following task to an epic following these steps:

**TASK TO CONVERT:**
- **ID:** ${task.id}
- **Title:** ${task.title}
- **Description:** ${task.description}
- **Current State:** ${task.state}
- **Priority:** ${task.priority}
- **Type:** ${task.type}
- **Estimated Points:** ${task.estimatedPoints}
- **Estimated Date:** ${task.estimatedDate || 'Not set'}
- **Current Epic:** ${task.epic || 'None'}
- **Author:** ${task.author || 'Unknown'}
- **Assignee:** ${task.assignee || 'Unassigned'}
- **Tags:** [${task.tags?.join(', ') || 'No tags'}]
- **Subtasks:** ${task.subtasks?.length || 0} total
- **Created:** ${task.createdAt || 'Unknown'}
- **Updated:** ${task.updatedAt || 'Unknown'}

**SUBTASKS TO CONVERT:**
${task.subtasks?.map((subtask, index) => 
  `${index + 1}. [${subtask.completed ? '✅' : '❌'}] ${subtask.text}`
).join('\n') || 'No subtasks available'}

**FILE LOCATIONS (for reference):**
- Task file: \`/jora-changelog/tasks/${task.id}.json\`
- Current tasks list: \`/jora-changelog/current.json\`
- Epics directory: \`/jora-changelog/epics/\`
- Example epic file: \`/jora-changelog/epics/core-functionality.json\`

**INSTRUCTIONS:**
1. **Update original task state:** 
   - Open file: \`/jora-changelog/tasks/${task.id}.json\`
   - Change "state" from "${task.state}" to "converted_to_epic"
   - Update "updatedAt" timestamp

2. **Create new epic:** 
   - Create file: \`/jora-changelog/epics/epic-${task.id.replace('task-', '')}.json\`
   - Structure:
     {
       "id": "epic-${task.id.replace('task-', '')}",
       "name": "${task.title}" (or improved version),
       "description": "Enhanced description based on original task",
       "color": "#choose-appropriate-color",
       "status": "planning",
       "priority": "${task.priority}",
       "created_from": "${task.id}",
       "createdAt": "current-timestamp",
       "startDate": "${task.estimatedDate || 'TBD'}",
       "endDate": "calculated-end-date"
     }

3. **Convert subtasks to individual tasks:**
   For each subtask, create new task file in \`/jora-changelog/tasks/\`:
   - **If subtask was completed (✅):** set state to "ready_to_release"
   - **If subtask was not completed (❌):** set state to "todo"
   - **Epic assignment:** Set epic to "epic-${task.id.replace('task-', '')}"
   - **Inherit properties:** author, tags, priority from original task
   - **Add descriptions:** Expand subtask text into proper task descriptions
   - **Estimate points:** Distribute original ${task.estimatedPoints} points across new tasks

4. **Update current.json:**
   - Add new task IDs to tasks array
   - Update "lastUpdated" timestamp

5. **Add epic to epics list (if needed):**
   - Update any epic registry files

**EXAMPLE NEW TASK STRUCTURE:**
{
  "id": "task-epic-${task.id.replace('task-', '')}-subtask-1",
  "title": "Subtask title expanded",
  "description": "Detailed description based on subtask",
  "state": "ready_to_release" or "todo",
  "priority": "${task.priority}",
  "type": "${task.type}",
  "epic": "epic-${task.id.replace('task-', '')}",
  "author": "${task.author}",
  "assignee": "${task.assignee || ''}",
  "tags": [${task.tags?.map(tag => `"${tag}"`).join(', ') || ''}],
  "estimatedPoints": calculated-points,
  "createdAt": "current-timestamp",
  "updatedAt": "current-timestamp"
}

Please implement these changes and update all JoRA data files accordingly.`;
  };

  return {
    task,
    epics,
    authors,
    tags,
    isLoading,
    isEditing,
    formData,
    error,
    handleFormChange,
    handleTagToggle,
    handleSubtaskAdd,
    handleSubtaskRemove,
    handleSubtaskToggle,
    handleSave,
    handleDelete,
    toggleEdit,
    handleConvertToEpic,
    handleReactivate,
    shouldShowConvertToEpic
  };
};
