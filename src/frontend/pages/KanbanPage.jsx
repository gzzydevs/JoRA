import React from 'react';
import NavBar from '../components/NavBar/NavBar';
import FilterBar from '../components/FilterBar/FilterBar';
import TaskColumn from '../components/TaskColumn/TaskColumn';
import { useTaskContext } from '../hooks/useTaskContext';
import './KanbanPage.scss';

const KanbanPage = () => {
  const { tasksByState, isLoading, error } = useTaskContext();

  const columns = [
    {
      state: 'todo',
      icon: '📝',
      title: 'To Do',
      tasks: tasksByState.todo || []
    },
    {
      state: 'in_progress',
      icon: '🔄',
      title: 'In Progress',
      tasks: tasksByState.in_progress || []
    },
    {
      state: 'in_review',
      icon: '👀',
      title: 'In Review',
      tasks: tasksByState.in_review || []
    },
    {
      state: 'ready_to_release',
      icon: '✅',
      title: 'Ready to Release',
      tasks: tasksByState.ready_to_release || []
    }
  ];

  if (isLoading) {
    return (
      <div className="kanban-page">
        <NavBar />
        <main className="kanban-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading tasks...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-page">
        <NavBar />
        <main className="kanban-main">
          <div className="error-container">
            <div className="error-message">
              ❌ {error}
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="kanban-page">
      <NavBar />
      <main className="kanban-main">
        <div className="kanban-container">
          <FilterBar />
          
          <div className="kanban-board">
            {columns.map(column => (
              <TaskColumn
                key={column.state}
                icon={column.icon}
                title={column.title}
                tasks={column.tasks}
                state={column.state}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default KanbanPage;
