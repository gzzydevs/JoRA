import React from 'react';
import Task from '../Task';
import { useBacklogColumn } from './useBacklogColumn';
import './styles.scss';

const BacklogColumn = ({ state, title, tasks, description }) => {
  const {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTaskEdit
  } = useBacklogColumn(state);

  return (
    <div
      className={`backlog-column ${isDragOver ? 'drag-over' : ''}`}
      data-state={state}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="backlog-column-header">
        <div className="backlog-column-title">
          <h3>{title}</h3>
          <span className="backlog-column-count">{tasks.length}</span>
        </div>
        <p className="backlog-column-description">{description}</p>
      </div>
      
      <div className="backlog-column-content">
        {tasks.length === 0 ? (
          <div className="empty-state">
            Drop tasks here
          </div>
        ) : (
          <div className="backlog-task-list">
            {tasks.map(task => (
              <Task
                key={task.id}
                task={task}
                onEdit={() => handleTaskEdit(task)}
                isBacklogView={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BacklogColumn;
