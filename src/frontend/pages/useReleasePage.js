import { useState, useEffect, useMemo } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import apiService from '../services/api';

export const useReleasePage = (version) => {
  const { releases, setSelectedVersion } = useTaskContext();
  const [releaseData, setReleaseData] = useState(null);
  const [releaseTasks, setReleaseTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task type icons mapping
  const taskTypeIcons = {
    feature: '✨',
    hotfix: '🔥',
    documentation: '📚',
    poc: '🧪',
    improvement: '⚡',
    bug: '🐛',
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

  return {
    releaseData,
    releaseTasks,
    groupedTasks,
    isLoading,
    error,
    taskTypeIcons,
  };
};
