import { useState } from 'react';
import { useTaskContext } from '../../hooks/useTaskContext';

export const useTaskColumn = (state) => {
  const { updateTaskState } = useTaskContext();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only remove drag-over if we're actually leaving the column
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskId = e.dataTransfer.getData('text/plain');
    
    if (taskId && state) {
      // Use optimized updateTaskState (no full reload)
      await updateTaskState(taskId, state);
    }
  };

  const handleTaskEdit = (task) => {
    // This will be handled by a modal context or parent component
    // For now, we'll pass it up the component tree
    console.log('Edit task:', task);
  };

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTaskEdit,
  };
};
