import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEpicModal } from './useEpicModal';
import './styles.scss';

const EpicModal = ({ 
  epicId = null, 
  isModal = true, 
  onClose = null,
  showHeader = false 
}) => {
  const navigate = useNavigate();
  const {
    epic,
    tasks,
    authors,
    tags,
    isLoading,
    isEditing,
    formData,
    handleFormChange,
    handleSave,
    handleDelete,
    toggleEdit,
    error,
    taskProgress
  } = useEpicModal(epicId);

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate(-1); // Go back
    }
  };

  const handleTaskClick = (taskId) => {
    if (isModal) {
      // If we're in modal mode, navigate to task page
      navigate(`/task/${taskId}`);
    } else {
      // If we're already in page mode, just update the current page
      navigate(`/task/${taskId}`, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className={isModal ? "modal-backdrop" : "epic-modal-page"}>
        <div className="epic-modal">
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading epic...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !epic) {
    return (
      <div className={isModal ? "modal-backdrop" : "epic-modal-page"}>
        <div className="epic-modal">
          <div className="error-container">
            <div className="error-message">
              ❌ {error || 'Epic not found'}
            </div>
            <button className="btn btn-primary" onClick={handleClose}>
              {isModal ? 'Close' : 'Go Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="epic-modal">
      {showHeader && (
        <div className="epic-modal-header">
          <div className="epic-modal-navigation">
            <Link to="/" className="btn btn-secondary btn-sm">
              ← Back to Kanban
            </Link>
          </div>
          <h1>Epic Details</h1>
        </div>
      )}

      <div className="epic-modal-content">
        <div className="epic-modal-actions">
          <div className="epic-modal-actions-left">
            {!isEditing ? (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={toggleEdit}
              >
                ✏️ Edit
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={handleSave}
                >
                  💾 Save
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={toggleEdit}
                >
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="epic-modal-actions-right">
            <button 
              className="btn btn-danger btn-sm" 
              onClick={handleDelete}
            >
              🗑️ Delete
            </button>
            <button 
              className="modal-close-btn" 
              onClick={handleClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="epic-form">
          <div className="epic-form-main">
            <div className="form-control">
              <label>Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Epic name..."
                />
              ) : (
                <div className="epic-display-name">{epic.name}</div>
              )}
            </div>

            <div className="form-control">
              <label>Description</label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Epic description..."
                  rows={4}
                />
              ) : (
                <div className="epic-display-description">
                  {epic.description || <em>No description</em>}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-control">
                <label>Color</label>
                {isEditing ? (
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleFormChange('color', e.target.value)}
                  />
                ) : (
                  <div className="epic-display-color">
                    <div 
                      className="color-swatch" 
                      style={{ backgroundColor: epic.color }}
                    ></div>
                    {epic.color}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label>Status</label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="planning">📝 Planning</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                    <option value="on_hold">⏸️ On Hold</option>
                  </select>
                ) : (
                  <div className={`epic-display-status status-${epic.status?.replace('_', '-')}`}>
                    {['📝', '🔄', '✅', '⏸️'][
                      ['planning', 'in_progress', 'completed', 'on_hold'].indexOf(epic.status)
                    ] || '📝'} {epic.status?.replace('_', ' ') || 'planning'}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label>Priority</label>
                {isEditing ? (
                  <select
                    value={formData.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                ) : (
                  <div className={`epic-display-priority priority-${epic.priority?.replace('_', '-')}`}>
                    {epic.priority?.replace('_', ' ') || 'medium'}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-control">
                <label>Start Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                  />
                ) : (
                  <div className="epic-display-date">
                    {epic.startDate ? (
                      new Date(epic.startDate).toLocaleDateString()
                    ) : (
                      <em>No start date</em>
                    )}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label>End Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                  />
                ) : (
                  <div className="epic-display-date">
                    {epic.endDate ? (
                      new Date(epic.endDate).toLocaleDateString()
                    ) : (
                      <em>No end date</em>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Section */}
            <div className="epic-progress-section">
              <h3>Progress</h3>
              <div className="progress-stats">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${taskProgress.percentage}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {taskProgress.completed} of {taskProgress.total} tasks completed ({taskProgress.percentage}%)
                </div>
              </div>
              <div className="progress-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">To Do:</span>
                  <span className="breakdown-count">{taskProgress.breakdown.todo}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">In Progress:</span>
                  <span className="breakdown-count">{taskProgress.breakdown.in_progress}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">In Review:</span>
                  <span className="breakdown-count">{taskProgress.breakdown.in_review}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Ready to Release:</span>
                  <span className="breakdown-count">{taskProgress.breakdown.ready_to_release}</span>
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="epic-tasks-section">
              <h3>Tasks ({tasks.length})</h3>
              {tasks.length > 0 ? (
                <div className="epic-tasks-list">
                  {tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="epic-task-item"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <span className={`task-state state-${task.state.replace('_', '-')}`}>
                            {task.state.replace('_', ' ')}
                          </span>
                          <span className={`task-priority priority-${task.priority.replace('_', '-')}`}>
                            {task.priority}
                          </span>
                          <span className="task-type">{task.type}</span>
                        </div>
                      </div>
                      <div className="task-assignee">
                        {task.assignee ? (
                          authors.find(a => a.id === task.assignee)?.name || task.assignee
                        ) : (
                          <em>Unassigned</em>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-tasks">
                  <em>No tasks in this epic</em>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return isModal ? (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      {content}
    </div>
  ) : (
    <div className="epic-modal-page">
      {content}
    </div>
  );
};

export default EpicModal;
