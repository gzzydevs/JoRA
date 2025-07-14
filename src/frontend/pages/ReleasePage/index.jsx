import React from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { useReleasePage } from './useReleasePage';
import './styles.scss';

const ReleasePage = () => {
  const { version } = useParams();
  const {
    releaseData,
    groupedTasks,
    isLoading,
    isUndoing,
    error,
    taskTypeIcons,
    handleUndoRelease
  } = useReleasePage(version);

  if (isLoading) {
    return (
      <div className="release-page">
        <NavBar />
        <main className="release-main">
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading release v{version}...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="release-page">
        <NavBar />
        <main className="release-main">
          <div className="error-container">
            <div className="error-message">
              ❌ {error}
            </div>
            <Link to="/" className="btn btn-primary">
              Back to Kanban
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="release-page">
      <NavBar />
      <main className="release-main">
        <div className="release-container">
          <div className="release-header">
            <div className="release-navigation">
              <Link to="/" className="btn btn-secondary">
                ← Back to Kanban
              </Link>
            </div>
            
            <div className="release-title-section">
              <div className="release-title-row">
                <h1>Release v{version}</h1>
                {!releaseData?.isTestVersion && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleUndoRelease}
                    disabled={isUndoing}
                    title="Undo this release and restore tasks"
                  >
                    {isUndoing ? '⏳ Undoing...' : '↩️ Undo Release'}
                  </button>
                )}
              </div>
              {releaseData?.description && (
                <p className="release-description">{releaseData.description}</p>
              )}
              {releaseData?.date && (
                <p className="release-date">
                  Released on {new Date(releaseData.date).toLocaleDateString()}
                </p>
              )}
              {releaseData?.isTestVersion && (
                <p className="test-version-badge">
                  🧪 Test Version - Tasks not affected
                </p>
              )}
            </div>
          </div>

          <div className="release-content">
            <div className="release-stats">
              {Object.entries(groupedTasks).map(([type, tasks]) => (
                tasks.length > 0 && (
                  <div key={type} className="stat-card">
                    <div className="stat-icon">{taskTypeIcons[type]}</div>
                    <div className="stat-number">{tasks.length}</div>
                    <div className="stat-label">{type}</div>
                  </div>
                )
              ))}
            </div>

            <div className="release-groups">
              {Object.entries(groupedTasks).map(([type, tasks]) => (
                tasks.length > 0 && (
                  <div key={type} className="task-group">
                    <div className="task-group-header">
                      <div className="task-group-title">
                        <span className="task-group-icon">{taskTypeIcons[type]}</span>
                        <span>{type}</span>
                        <span className="task-group-count">({tasks.length})</span>
                      </div>
                    </div>
                    
                    <div className="task-group-content">
                      {tasks.map(task => (
                        <div key={task.id} className="task-item">
                          <div className="task-item-header">
                            <div className="task-item-title">{task.title}</div>
                            <div className={`task-item-priority priority-${task.priority.replace('_', '-')}`}>
                              {task.priority.replace('_', ' ')}
                            </div>
                          </div>
                          
                          {task.description && (
                            <div className="task-item-description">
                              {task.description}
                            </div>
                          )}
                          
                          <div className="task-item-meta">
                            {task.estimatedPoints > 0 && (
                              <span className="task-item-points">
                                {task.estimatedPoints} pts
                              </span>
                            )}
                            {task.subtasks?.length > 0 && (
                              <span className="task-item-subtasks">
                                ✓ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>

            {Object.values(groupedTasks).every(tasks => tasks.length === 0) && (
              <div className="empty-state">
                <p>No tasks found for this release</p>
                <p>This release might be empty or the version doesn't exist</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReleasePage;
