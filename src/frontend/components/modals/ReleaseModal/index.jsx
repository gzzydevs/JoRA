import React from 'react';
import { useReleaseModal } from './useReleaseModal';
import './styles.scss';

const ReleaseModal = ({ isOpen, onClose }) => {
  const {
    version,
    setVersion,
    description,
    setDescription,
    isTestVersion,
    setIsTestVersion,
    isLoading,
    error,
    validationError,
    readyToReleaseTasks,
    handleCreateRelease,
    handleCancel
  } = useReleaseModal({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content release-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚀 Create New Release</h2>
          <button
            type="button"
            className="modal-close"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="release-form">
            <div className="form-group">
              <label htmlFor="version">Version *</label>
              <input
                id="version"
                type="text"
                placeholder="e.g., 0.1.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                disabled={isLoading}
                className={validationError ? 'error' : ''}
              />
              {validationError && (
                <span className="field-error">{validationError}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Release description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isTestVersion}
                  onChange={(e) => setIsTestVersion(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Test Version (won't affect the board)
              </label>
              <p className="form-hint">
                {isTestVersion 
                  ? "Tasks will remain in 'ready_to_release' state and stay on the board"
                  : "Tasks will be moved to the release and removed from the board"
                }
              </p>
            </div>

            <div className="tasks-summary">
              <h3>📋 Tasks Ready for Release ({readyToReleaseTasks.length})</h3>
              {readyToReleaseTasks.length === 0 ? (
                <p className="no-tasks">No tasks ready for release</p>
              ) : (
                <div className="tasks-list">
                  {readyToReleaseTasks.map(task => (
                    <div key={task.id} className="task-item">
                      <span className="task-title">{task.title}</span>
                      <span className="task-type">{task.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateRelease}
            disabled={isLoading || readyToReleaseTasks.length === 0 || !version.trim()}
          >
            {isLoading ? '🔄 Creating...' : '🚀 Create Release'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReleaseModal;
