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
        
        // Load tasks for this release
        // Note: This assumes the backend can filter tasks by release/version
        // For now, we'll load all tasks and filter client-side
        const allTasks = await apiService.getTasks();
        
        // Filter tasks that were part of this release
        // This logic might need to be adjusted based on how releases are tracked
        const versionTasks = allTasks.filter(task => {
          // You might need to adjust this logic based on your data structure
          return task.releaseVersion === version || 
                 (release.tasks && release.tasks.includes(task.id));
        });
        
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
