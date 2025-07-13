import React from 'react';
import { useTask } from './useTask';
import './styles.scss';

const Task = ({ task, onEdit, onDelete }) => {
  const { 
    epic, 
    author, 
    assignee, 
    subtaskProgress, 
    estimatedDate,
    tags,
    handleDragStart,
    handleDragEnd,
    handleClick,
    isDragging
  } = useTask(task, onEdit, onDelete);

  return (
    <div
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      data-task-id={task.id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <div className="task-header">
        <div className="task-title">{task.title}</div>
        <div className={`task-priority priority-${task.priority.replace('_', '-')}`}>
          {task.priority.replace('_', ' ')}
        </div>
      </div>
      
      {task.description && (
        <div className="task-description">{task.description}</div>
      )}
      
      {(task.estimatedPoints > 0 || estimatedDate || task.images?.length > 0) && (
        <div className="task-estimated-info">
          {task.estimatedPoints > 0 && (
            <span className="task-points">{task.estimatedPoints} pts</span>
          )}
          {estimatedDate && (
            <span className="task-due-date">{estimatedDate}</span>
          )}
          {task.images?.length > 0 && (
            <span className="task-images-indicator">📷 {task.images.length}</span>
          )}
        </div>
      )}
      
      <div className="task-footer">
        <div className="task-meta">
          {epic && (
            <div 
              className="task-epic" 
              style={{ 
                backgroundColor: `${epic.color}20`, 
                color: epic.color 
              }}
            >
              {epic.name}
            </div>
          )}
          <div className="task-tags">
            {tags.map(tag => (
              <div key={tag.id} className="task-tag">
                {tag.name}
              </div>
            ))}
          </div>
        </div>
        
        <div className="task-meta">
          {author && <span>{author.name}</span>}
          {assignee && assignee.id !== author?.id && (
            <span>→ {assignee.name}</span>
          )}
          {subtaskProgress && (
            <span className="task-subtasks">✓ {subtaskProgress}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Task;
