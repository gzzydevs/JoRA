import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import apiService from '../services/api';

const TaskContext = createContext({
  // Data
  tasks: [],
  epics: [],
  authors: [],
  tags: [],
  config: {},
  releases: [],
  
  // State
  selectedVersion: 'current',
  filters: { epic: '', author: '', search: '' },
  isLoading: false,
  error: null,
  
  // Computed
  filteredTasks: [],
  tasksByState: {},
  
  // Actions
  setFilters: () => {},
  resetFilters: () => {},
  setSelectedVersion: () => {},
  
  // Task actions
  createTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  updateTaskState: async () => {},
  
  // Epic actions
  createEpic: async () => {},
  updateEpic: async () => {},
  deleteEpic: async () => {},
  
  // Author actions
  createAuthor: async () => {},
  updateAuthor: async () => {},
  deleteAuthor: async () => {},
  
  // Release actions
  createRelease: async () => {},
  
  // Data loading
  refreshData: async () => {},
  showError: () => {},
  showSuccess: () => {},
});

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [epics, setEpics] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [tags, setTags] = useState([]);
  const [config, setConfig] = useState({});
  const [releases, setReleases] = useState([]);
  
  const [selectedVersion, setSelectedVersion] = useState('current');
  const [filters, setFilters] = useState({ epic: '', author: '', search: '', showCancelled: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Computed values
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Exclude converted tasks from main views
      if (task.state === 'converted_to_epic') return false;
      // Exclude cancelled tasks from Kanban views (they'll be shown only in Backlog)
      if (task.state === 'cancelled' && !filters.showCancelled) return false;
      
      if (filters.epic && task.epic !== filters.epic) return false;
      if (filters.author && task.author !== filters.author) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return task.title.toLowerCase().includes(searchLower) ||
               task.description.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [tasks, filters]);

  const tasksByState = useMemo(() => {
    const states = ['in_backlog', 'todo', 'in_progress', 'in_review', 'ready_to_release', 'converted_to_epic', 'cancelled'];
    return states.reduce((acc, state) => {
      acc[state] = filteredTasks.filter(task => task.state === state);
      return acc;
    }, {});
  }, [filteredTasks]);

  // Current version computed value
  const currentVersion = useMemo(() => {
    return selectedVersion === 'current' ? 'current' : selectedVersion;
  }, [selectedVersion]);

  // Load initial data
  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading project data...');
      const projectData = await apiService.getProject();
      console.log('Project data loaded:', projectData);
      
      setConfig(projectData.config || {});
      setAuthors(projectData.authors || []);
      setTags(projectData.tags || []);
      
      // Load other data
      await Promise.all([
        loadTasks(),
        loadEpics(),
        loadReleases()
      ]);
      
    } catch (err) {
      console.error('Error loading project data:', err);
      setError('Failed to load project data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const tasksData = await apiService.getTasks();
      setTasks(tasksData || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    }
  };

  const loadEpics = async () => {
    try {
      const epicsData = await apiService.getEpics();
      setEpics(epicsData || []);
    } catch (err) {
      console.error('Error loading epics:', err);
      setError('Failed to load epics');
    }
  };

  const loadReleases = async () => {
    try {
      const releasesData = await apiService.getReleases();
      setReleases(releasesData || []);
    } catch (err) {
      console.error('Error loading releases:', err);
      setError('Failed to load releases');
    }
  };

  // Filter actions
  const resetFilters = () => {
    setFilters({ epic: '', author: '', search: '', showCancelled: false });
  };

  // Task actions
  const createTask = async (taskData) => {
    try {
      setIsLoading(true);
      const newTask = await apiService.createTask(taskData);
      await loadTasks(); // Reload to get updated data
      showSuccess('Task created successfully');
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      setIsLoading(true);
      const updatedTask = await apiService.updateTask(taskId, updates);
      
      // Update local state immediately without full reload
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      
      showSuccess('Task updated successfully');
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setIsLoading(true);
      await apiService.deleteTask(taskId);
      await loadTasks(); // Reload to get updated data
      showSuccess('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskState = async (taskId, newState) => {
    try {
      // Validate inputs
      if (!taskId) {
        throw new Error('Task ID is required');
      }
      if (!newState) {
        throw new Error('New state is required');
      }
      
      // Validate state
      const validStates = ['in_backlog', 'todo', 'in_progress', 'in_review', 'ready_to_release', 'converted_to_epic', 'cancelled'];
      if (!validStates.includes(newState)) {
        throw new Error(`Invalid state: ${newState}. Valid states are: ${validStates.join(', ')}`);
      }
      
      const updatedTask = await apiService.updateTask(taskId, { state: newState });
      
      // Update local state immediately without full reload
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, state: newState } : task
        )
      );
      
      return updatedTask;
    } catch (err) {
      console.error('Error updating task state:', err);
      setError(`Failed to update task state: ${err.message}`);
      throw err;
    }
  };

  // Epic actions
  const createEpic = async (epicData) => {
    try {
      setIsLoading(true);
      const newEpic = await apiService.createEpic(epicData);
      await loadEpics(); // Reload to get updated data
      showSuccess('Epic created successfully');
      return newEpic;
    } catch (err) {
      console.error('Error creating epic:', err);
      setError('Failed to create epic: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEpic = async (epicData) => {
    try {
      setIsLoading(true);
      const updatedEpic = await apiService.updateEpic(epicData.id, epicData);
      
      // Update local state immediately without full reload
      setEpics(prevEpics => 
        prevEpics.map(epic => 
          epic.id === epicData.id ? { ...epic, ...epicData } : epic
        )
      );
      
      showSuccess('Epic updated successfully');
      return updatedEpic;
    } catch (err) {
      console.error('Error updating epic:', err);
      setError('Failed to update epic: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEpic = async (epicId) => {
    try {
      setIsLoading(true);
      await apiService.deleteEpic(epicId);
      await loadEpics(); // Reload to get updated data
      showSuccess('Epic deleted successfully');
    } catch (err) {
      console.error('Error deleting epic:', err);
      setError('Failed to delete epic: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Author actions
  const createAuthor = async (authorData) => {
    try {
      setIsLoading(true);
      const newAuthor = await apiService.createAuthor(authorData);
      await loadProjectData(); // Reload project data to get updated authors
      showSuccess('Author created successfully');
      return newAuthor;
    } catch (err) {
      console.error('Error creating author:', err);
      setError('Failed to create author: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAuthor = async (authorId, authorData) => {
    try {
      setIsLoading(true);
      const updatedAuthor = await apiService.updateAuthor(authorId, authorData);
      
      // Update local state immediately without full reload
      setAuthors(prevAuthors => 
        prevAuthors.map(author => 
          author.id === authorId ? { ...author, ...authorData } : author
        )
      );
      
      showSuccess('Author updated successfully');
      return updatedAuthor;
    } catch (err) {
      console.error('Error updating author:', err);
      setError('Failed to update author: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAuthor = async (authorId) => {
    try {
      setIsLoading(true);
      await apiService.deleteAuthor(authorId);
      await loadProjectData(); // Reload project data to get updated authors
      showSuccess('Author deleted successfully');
    } catch (err) {
      console.error('Error deleting author:', err);
      setError('Failed to delete author: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Release actions
  const createRelease = async (releaseData) => {
    try {
      setIsLoading(true);
      const newRelease = await apiService.createRelease(releaseData);
      await Promise.all([
        loadTasks(),
        loadProjectData(),
        loadReleases()
      ]);
      showSuccess(`Release v${releaseData.version} generated successfully!`);
      return newRelease;
    } catch (err) {
      console.error('Error creating release:', err);
      setError('Failed to create release: ' + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Utility actions
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const refreshData = async () => {
    await loadProjectData();
  };

  const value = {
    // Data
    tasks,
    epics,
    authors,
    tags,
    config,
    releases,
    
    // State
    selectedVersion,
    currentVersion,
    filters,
    isLoading,
    error,
    successMessage,
    
    // Computed
    filteredTasks,
    tasksByState,
    
    // Actions
    setFilters,
    resetFilters,
    setSelectedVersion,
    
    // Task actions
    createTask,
    updateTask,
    deleteTask,
    updateTaskState,
    
    // Epic actions
    createEpic,
    updateEpic,
    deleteEpic,
    
    // Author actions
    createAuthor,
    updateAuthor,
    deleteAuthor,
    
    // Release actions
    createRelease,
    
    // Utility actions
    refreshData,
    showError,
    showSuccess,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
