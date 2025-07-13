import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../hooks/useTaskContext';

export const useTask = (task, onEdit, onDelete) => {
  const { epics, authors, tags } = useTaskContext();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);

  const epic = useMemo(() => 
    epics.find(e => e.id === task.epic)
  , [epics, task.epic]);

  const author = useMemo(() => 
    authors.find(a => a.id === task.author)
  , [authors, task.author]);

  const assignee = useMemo(() => 
    authors.find(a => a.id === task.assignee)
  , [authors, task.assignee]);

  const taskTags = useMemo(() => 
    task.tags.map(tagId => tags.find(t => t.id === tagId)).filter(Boolean)
  , [task.tags, tags]);

  const subtaskProgress = useMemo(() => {
    if (!task.subtasks || task.subtasks.length === 0) return '';
    const completed = task.subtasks.filter(s => s.completed).length;
    return `${completed}/${task.subtasks.length}`;
  }, [task.subtasks]);

  const estimatedDate = useMemo(() => {
    return task.estimatedDate 
      ? new Date(task.estimatedDate).toLocaleDateString()
      : '';
  }, [task.estimatedDate]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (e) => {
    // Prevent drag and drop when clicking
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to task detail page
    navigate(`/task/${task.id}`);
  };

  return {
    epic,
    author,
    assignee,
    tags: taskTags,
    subtaskProgress,
    estimatedDate,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleClick,
  };
};
