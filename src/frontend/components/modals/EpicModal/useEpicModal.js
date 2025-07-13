import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../../contexts/TaskContext';
import api from '../../../services/api';

export const useEpicModal = (epicId) => {
  const navigate = useNavigate();
  const { 
    tasks, 
    epics, 
    authors, 
    tags,
    currentVersion,
    createEpic, 
    updateEpic, 
    deleteEpic 
  } = useTaskContext();

  const [epic, setEpic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  // Load epic data
  useEffect(() => {
    const loadEpic = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (epicId) {
          // Try to find in context first
          let foundEpic = epics.find(e => e.id === epicId);
          
          if (!foundEpic) {
            // If not in context, try to load from API
            const response = await api.get(`/epics/${epicId}`);
            foundEpic = response.data;
          }

          if (foundEpic) {
            setEpic(foundEpic);
            setFormData({
              name: foundEpic.name || '',
              description: foundEpic.description || '',
              color: foundEpic.color || '#3b82f6',
              status: foundEpic.status || 'in_progress',
              priority: foundEpic.priority || 'medium',
              startDate: foundEpic.startDate || '',
              endDate: foundEpic.endDate || ''
            });
          } else {
            setError('Epic not found');
          }
        } else {
          // New epic
          setEpic(null);
          setFormData({
            name: '',
            description: '',
            color: '#3b82f6',
            status: 'in_progress',
            priority: 'medium',
            startDate: '',
            endDate: ''
          });
          setIsEditing(true); // New epic starts in edit mode
        }
      } catch (err) {
        console.error('Error loading epic:', err);
        setError('Failed to load epic');
      } finally {
        setIsLoading(false);
      }
    };

    loadEpic();
  }, [epicId, epics]);

  // Get tasks for this epic
  const epicTasks = tasks.filter(task => task.epic === epicId);

  // Calculate task progress
  const taskProgress = {
    total: epicTasks.length,
    completed: epicTasks.filter(task => task.state === 'ready_to_release').length,
    breakdown: {
      todo: epicTasks.filter(task => task.state === 'todo').length,
      in_progress: epicTasks.filter(task => task.state === 'in_progress').length,
      in_review: epicTasks.filter(task => task.state === 'in_review').length,
      ready_to_release: epicTasks.filter(task => task.state === 'ready_to_release').length
    }
  };
  taskProgress.percentage = taskProgress.total > 0 
    ? Math.round((taskProgress.completed / taskProgress.total) * 100) 
    : 0;

  // Form handlers
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Epic name is required.');
      return;
    }

    try {
      setIsLoading(true);
      
      const epicData = {
        ...formData,
        id: epic?.id || `epic-${Date.now()}`,
        createdAt: epic?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (epic) {
        // Update existing epic
        await updateEpic(epicData);
        setEpic(epicData);
      } else {
        // Create new epic
        const newEpic = await createEpic(epicData);
        if (newEpic) {
          navigate(`/epic/${newEpic.id}`);
        }
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving epic:', err);
      setError('Failed to save epic');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!epic) return;
    
    const epicTasks = tasks.filter(task => task.epic === epic.id);
    if (epicTasks.length > 0) {
      if (!window.confirm(`This epic has ${epicTasks.length} associated tasks. Are you sure you want to delete it?`)) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to delete this epic?')) {
        return;
      }
    }
    
    try {
      setIsLoading(true);
      await deleteEpic(epic.id);
      // Navigation will be handled by the parent component
    } catch (err) {
      console.error('Error deleting epic:', err);
      setError('Failed to delete epic');
      setIsLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      if (epic) {
        setFormData({
          name: epic.name || '',
          description: epic.description || '',
          color: epic.color || '#3b82f6',
          status: epic.status || 'in_progress',
          priority: epic.priority || 'medium',
          startDate: epic.startDate || '',
          endDate: epic.endDate || ''
        });
      }
    }
    setIsEditing(!isEditing);
  };

  return {
    epic,
    tasks: epicTasks,
    authors,
    tags,
    currentVersion,
    isLoading,
    isEditing,
    formData,
    error,
    taskProgress,
    handleFormChange,
    handleSave,
    handleDelete,
    toggleEdit
  };
};
