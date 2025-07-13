import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { useTaskContext } from '../../hooks/useTaskContext';
import './styles.scss';

const BacklogPage = () => {
  const { tasks, isLoading, error } = useTaskContext();

  if (isLoading) {
    return (
      <div className="backlog-page">
        <NavBar />
        <main className="backlog-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading backlog...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backlog-page">
        <NavBar />
        <main className="backlog-main">
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
    <div className="backlog-page">
      <NavBar />
      <main className="backlog-main">
        <div className="backlog-container">
          <div className="backlog-header">
            <div className="backlog-navigation">
              <Link to="/" className="btn btn-secondary">
                ← Back to Kanban
              </Link>
            </div>
            <h1>Project Backlog</h1>
            <p>All tasks across all states</p>
          </div>
          
          <div className="backlog-content">
            <div className="backlog-stats">
              <div className="stat-card">
                <div className="stat-number">{tasks.filter(t => t.state === 'todo').length}</div>
                <div className="stat-label">To Do</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{tasks.filter(t => t.state === 'in_progress').length}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{tasks.filter(t => t.state === 'in_review').length}</div>
                <div className="stat-label">In Review</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{tasks.filter(t => t.state === 'ready_to_release').length}</div>
                <div className="stat-label">Ready to Release</div>
              </div>
            </div>

            <div className="backlog-list">
              <h2>All Tasks ({tasks.length})</h2>
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <p>No tasks found</p>
                  <p>Create your first task to get started</p>
                </div>
              ) : (
                <div className="task-list">
                  {tasks.map(task => (
                    <div key={task.id} className="task-row">
                      <div className="task-row-header">
                        <div className="task-row-title">{task.title}</div>
                        <div className={`task-row-state state-${task.state.replace('_', '-')}`}>
                          {task.state.replace('_', ' ')}
                        </div>
                      </div>
                      {task.description && (
                        <div className="task-row-description">{task.description}</div>
                      )}
                      <div className="task-row-meta">
                        <span className={`priority priority-${task.priority.replace('_', '-')}`}>
                          {task.priority.replace('_', ' ')}
                        </span>
                        {task.estimatedPoints > 0 && (
                          <span className="points">{task.estimatedPoints} pts</span>
                        )}
                        {task.subtasks?.length > 0 && (
                          <span className="subtasks">
                            ✓ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BacklogPage;
