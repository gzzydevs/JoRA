import React from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useEpicModal } from './useEpicModal';
import Task from '../../Task';
import './styles.scss';

const EpicModal = ({ 
  epicId = null, 
  isModal = true, 
  onClose = null,
  showHeader = false 
}) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const actualEpicId = epicId || paramId;
  
  const {
    epic,
    tasks,
    authors,
    tags,
    currentVersion,
    isLoading,
    isEditing,
    formData,
    handleFormChange,
    handleSave,
    handleDelete,
    toggleEdit,
    error,
    taskProgress
  } = useEpicModal(actualEpicId);

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

  if (isLoading && actualEpicId) {
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

  if (error) {
    return (
      <div className={isModal ? "modal-backdrop" : "epic-modal-page"}>
        <div className="epic-modal">
          <div className="error-container">
            <div className="error-message">
              ❌ {error}
            </div>
            <button className="btn btn-primary" onClick={handleClose}>
              {isModal ? 'Close' : 'Go Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isNewEpic = !actualEpicId;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'on_hold': return '⏸️';
      default: return '📋';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'in_progress': return 'En Curso';
      case 'completed': return 'Finalizada';
      case 'on_hold': return 'No Finalizable';
      default: return status;
    }
  };

  const content = (
    <div className="epic-modal">
      {showHeader && (
        <div className="epic-modal-header">
          <div className="epic-modal-navigation">
            <Link to="/" className="btn btn-secondary btn-sm">
              ← Back to Kanban
            </Link>
          </div>
          <h1>{isNewEpic ? 'New Epic' : 'Epic Details'}</h1>
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
            {!isNewEpic && (
              <button 
                className="btn btn-danger btn-sm" 
                onClick={handleDelete}
              >
                🗑️ Delete
              </button>
            )}
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
                <div className="epic-display-name">{epic?.name}</div>
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
                  {epic?.description || <em>No description</em>}
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
                      style={{ backgroundColor: epic?.color }}
                    ></div>
                    {epic?.color}
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
                    <option value="in_progress">🔄 En Curso</option>
                    <option value="completed">✅ Finalizada</option>
                    <option value="on_hold">⏸️ No Finalizable</option>
                  </select>
                ) : (
                  <div className={`epic-display-status status-${epic?.status?.replace('_', '-')}`}>
                    {getStatusIcon(epic?.status)} {getStatusLabel(epic?.status)}
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
                  <div className={`epic-display-priority priority-${epic?.priority?.replace('_', '-')}`}>
                    {epic?.priority?.replace('_', ' ') || 'medium'}
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
                    {epic?.startDate ? (
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
                    {epic?.endDate ? (
                      new Date(epic.endDate).toLocaleDateString()
                    ) : (
                      <em>No end date</em>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!isNewEpic && (
              <>
                {/* Progress Section */}
                <div className="epic-progress-section">
                  <h3>Progress Overview</h3>
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
                  <h3>Associated Tasks {currentVersion && `(${currentVersion})`}</h3>
                  {tasks.length > 0 ? (
                    <div className="epic-tasks-list">
                      {tasks.map(task => (
                        <div key={task.id} className="task-item">
                          <Task 
                            task={task} 
                            onClick={() => navigate(`/task/${task.id}`)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-tasks">
                      <em>No tasks associated with this epic in the current version.</em>
                    </div>
                  )}
                </div>
              </>
            )}
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
