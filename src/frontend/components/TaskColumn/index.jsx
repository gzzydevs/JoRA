import React from 'react';
import Task from '../Task';
import { useTaskColumn } from './useTaskColumn';
import './styles.scss';

const TaskColumn = ({ icon, title, tasks, state }) => {
  const {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTaskEdit
  } = useTaskColumn(state);

  return (
    <div 
      className={`task-column ${isDragOver ? 'drag-over' : ''}`}
      data-state={state}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="task-column-header">
        <div className="task-column-title">
          <span className="task-column-icon">{icon}</span>
          <span>{title}</span>
        </div>
        <span className="task-column-count">{tasks.length}</span>
      </div>
      
      <div className="task-column-content">
        {tasks.length === 0 ? (
          <div className="empty-state">No tasks</div>
        ) : (
          tasks.map(task => (
            <Task
              key={task.id}
              task={task}
              onEdit={handleTaskEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
