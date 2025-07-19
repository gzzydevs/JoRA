import { useState, useEffect, useMemo } from 'react';
import { useTaskContext } from '../../hooks/useTaskContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

export const useReleasePage = (version) => {
  const { releases, setSelectedVersion, showSuccess, showError, refreshData } = useTaskContext();
  const navigate = useNavigate();
  const [releaseData, setReleaseData] = useState(null);
  const [releaseTasks, setReleaseTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUndoing, setIsUndoing] = useState(false);
  const [error, setError] = useState(null);

  // Task type icons mapping
  const taskTypeIcons = {
    feature: '✨',
    hotfix: '🔥',
    documentation: '📚',
    poc: '🧪',
    improvement: '⚡',
    bug: '🐛',
    bugfix: '🐛',  // Added missing bugfix type
    refactor: '♻️',
    test: '✅',
    chore: '🔧'
  };

  // Load release data
  useEffect(() => {
    const loadReleaseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Find release info
        const release = releases.find(r => r.version === version);
        if (!release) {
          setError(`Release v${version} not found`);
          return;
        }
        
        setReleaseData(release);
        
        // For releases, tasks are typically stored inside the release object
        // rather than being mixed with current tasks
        let versionTasks = [];
        
        if (release.tasks && Array.isArray(release.tasks)) {
          // Tasks are stored directly in the release
          versionTasks = release.tasks;
        } else {
          // Fallback: try to find tasks by release association
          const allTasks = await apiService.getTasks();
          versionTasks = allTasks.filter(task => {
            return task.releaseVersion === version || 
                   task.release === version;
          });
        }
        
        setReleaseTasks(versionTasks);
        
        // Update selected version in context
        setSelectedVersion(version);
        
      } catch (err) {
        console.error('Error loading release data:', err);
        setError('Failed to load release data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (version && releases.length > 0) {
      loadReleaseData();
    }
  }, [version, releases, setSelectedVersion]);

  // Group tasks by type
  const groupedTasks = useMemo(() => {
    const types = Object.keys(taskTypeIcons);
    return types.reduce((acc, type) => {
      acc[type] = releaseTasks.filter(task => task.type === type);
      return acc;
    }, {});
  }, [releaseTasks, taskTypeIcons]);

  // Undo release function
  const handleUndoRelease = async () => {
    if (!window.confirm(`Are you sure you want to undo release v${version}? This will restore all tasks back to "ready_to_release" state.`)) {
      return;
    }

    setIsUndoing(true);
    try {
      const result = await apiService.delete(`/api/releases/${version}`);
      showSuccess(`${result.message}. ${result.restoredTasks} tasks restored.`);
      
      // Reload data and navigate back to current version
      await refreshData();
      navigate('/');
    } catch (error) {
      console.error('Error undoing release:', error);
      showError(error.response?.data?.error || 'Failed to undo release');
    } finally {
      setIsUndoing(false);
    }
  };

  return {
    releaseData,
    releaseTasks,
    groupedTasks,
    isLoading,
    isUndoing,
    error,
    taskTypeIcons,
    handleUndoRelease,
  };
};
