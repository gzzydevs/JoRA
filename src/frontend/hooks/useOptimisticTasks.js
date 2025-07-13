import { useState, useCallback } from 'react';
import { useTaskContext } from './useTaskContext';

export const useOptimisticTasks = () => {
  const { 
    tasks, 
    updateTask, 
    refreshData,
    showError 
  } = useTaskContext();
  
  const [optimisticTasks, setOptimisticTasks] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState(new Set());

  // Get current tasks (optimistic or real)
  const getCurrentTasks = useCallback(() => {
    return optimisticTasks.length > 0 ? optimisticTasks : tasks;
  }, [optimisticTasks, tasks]);

  // Optimistic task state update
  const updateTaskStateOptimistic = useCallback(async (taskId, newState) => {
    if (pendingUpdates.has(taskId)) {
      console.log('Update already pending for task:', taskId);
      return;
    }

    // Add to pending updates
    setPendingUpdates(prev => new Set([...prev, taskId]));

    // 1. Immediate optimistic update
    const currentTasks = getCurrentTasks();
    const updatedTasks = currentTasks.map(task => 
      task.id === taskId ? { ...task, state: newState } : task
    );
    setOptimisticTasks(updatedTasks);

    try {
      // 2. Background API call
      await updateTask(taskId, { state: newState });
      
      // 3. Success: clear optimistic state (let real data take over)
      setOptimisticTasks([]);
      
    } catch (error) {
      console.error('Failed to update task state:', error);
      
      // 4. Error: revert optimistic update
      setOptimisticTasks([]);
      showError('Failed to update task state');
      
      // Optionally refresh to get latest state
      await refreshData();
    } finally {
      // Remove from pending updates
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [getCurrentTasks, updateTask, showError, refreshData, pendingUpdates]);

  // Reset optimistic state when real tasks change
  const resetOptimisticState = useCallback(() => {
    setOptimisticTasks([]);
    setPendingUpdates(new Set());
  }, []);

  return {
    tasks: getCurrentTasks(),
    updateTaskStateOptimistic,
    resetOptimisticState,
    hasPendingUpdates: pendingUpdates.size > 0,
    pendingUpdates: Array.from(pendingUpdates),
  };
};
