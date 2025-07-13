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
        updatedAt: new Date().toISOString()
      };

      if (task) {
        // Update existing task
        await updateTask(taskData);
        setTask(taskData);
      } else {
        // Create new task
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
    toggleEdit
  };
};
