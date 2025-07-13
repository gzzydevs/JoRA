import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskModal } from './useTaskModal';
import './TaskModal.scss';

const TaskModal = ({ 
  taskId = null, 
  isModal = true, 
  onClose = null,
  showHeader = false 
}) => {
  const navigate = useNavigate();
  const {
    task,
    epics,
    authors,
    tags,
    isLoading,
    isEditing,
    formData,
    handleFormChange,
    handleTagToggle,
    handleSubtaskAdd,
    handleSubtaskRemove,
    handleSubtaskToggle,
    handleSave,
    handleDelete,
    toggleEdit,
    error
  } = useTaskModal(taskId);

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate(-1); // Go back
    }
  };

  const handleTaskClick = (clickedTaskId) => {
    if (isModal) {
      // If we're in modal mode, navigate to task page
      navigate(`/task/${clickedTaskId}`);
    } else {
      // If we're already in page mode, just update the current page
      navigate(`/task/${clickedTaskId}`, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className={isModal ? "modal-backdrop" : "task-modal-page"}>
        <div className="task-modal">
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading task...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className={isModal ? "modal-backdrop" : "task-modal-page"}>
        <div className="task-modal">
          <div className="error-container">
            <div className="error-message">
              ❌ {error || 'Task not found'}
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
    <div className="task-modal">
      {showHeader && (
        <div className="task-modal-header">
          <div className="task-modal-navigation">
            <Link to="/" className="btn btn-secondary btn-sm">
              ← Back to Kanban
            </Link>
          </div>
          <h1>Task Details</h1>
        </div>
      )}

      <div className="task-modal-content">
        <div className="task-modal-actions">
          <div className="task-modal-actions-left">
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
          
          <div className="task-modal-actions-right">
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

        <div className="task-form">
          <div className="task-form-main">
            <div className="form-control">
              <label>Title</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Task title..."
                />
              ) : (
                <div className="task-display-title">{task.title}</div>
              )}
            </div>

            <div className="form-control">
              <label>Description</label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Task description..."
                  rows={4}
                />
              ) : (
                <div className="task-display-description">
                  {task.description || <em>No description</em>}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-control">
                <label>State</label>
                {isEditing ? (
                  <select
                    value={formData.state}
                    onChange={(e) => handleFormChange('state', e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="ready_to_release">Ready to Release</option>
                  </select>
                ) : (
                  <div className={`task-display-state state-${task.state.replace('_', '-')}`}>
                    {task.state.replace('_', ' ')}
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
                  <div className={`task-display-priority priority-${task.priority.replace('_', '-')}`}>
                    {task.priority.replace('_', ' ')}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label>Type</label>
                {isEditing ? (
                  <select
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                  >
                    <option value="feature">✨ Feature</option>
                    <option value="hotfix">🔥 Hotfix</option>
                    <option value="documentation">📚 Documentation</option>
                    <option value="poc">🧪 POC</option>
                    <option value="improvement">⚡ Improvement</option>
                    <option value="bug">🐛 Bug</option>
                    <option value="refactor">♻️ Refactor</option>
                    <option value="test">✅ Test</option>
                    <option value="chore">🔧 Chore</option>
                  </select>
                ) : (
                  <div className="task-display-type">
                    {['✨', '🔥', '📚', '🧪', '⚡', '🐛', '♻️', '✅', '🔧'][
                      ['feature', 'hotfix', 'documentation', 'poc', 'improvement', 'bug', 'refactor', 'test', 'chore'].indexOf(task.type)
                    ] || '📝'} {task.type}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-control">
                <label>Epic</label>
                {isEditing ? (
                  <select
                    value={formData.epic || ''}
                    onChange={(e) => handleFormChange('epic', e.target.value)}
                  >
                    <option value="">No Epic</option>
                    {epics.map(epic => (
                      <option key={epic.id} value={epic.id}>
                        {epic.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="task-display-epic">
                    {task.epic ? (
                      epics.find(e => e.id === task.epic)?.name || task.epic
                    ) : (
                      <em>No epic</em>
                    )}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label>Author</label>
                {isEditing ? (
                  <select
                    value={formData.author}
                    onChange={(e) => handleFormChange('author', e.target.value)}
                  >
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="task-display-author">
                    {authors.find(a => a.id === task.author)?.name || task.author}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label>Assignee</label>
                {isEditing ? (
                  <select
                    value={formData.assignee || ''}
                    onChange={(e) => handleFormChange('assignee', e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="task-display-assignee">
                    {task.assignee ? (
                      authors.find(a => a.id === task.assignee)?.name || task.assignee
                    ) : (
                      <em>Unassigned</em>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-control">
                <label>Estimated Points</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.estimatedPoints || ''}
                    onChange={(e) => handleFormChange('estimatedPoints', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                ) : (
                  <div className="task-display-points">
                    {task.estimatedPoints || 0} points
                  </div>
                )}
              </div>

              <div className="form-control">
                <label>Estimated Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.estimatedDate || ''}
                    onChange={(e) => handleFormChange('estimatedDate', e.target.value)}
                  />
                ) : (
                  <div className="task-display-date">
                    {task.estimatedDate ? (
                      new Date(task.estimatedDate).toLocaleDateString()
                    ) : (
                      <em>No date set</em>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-control">
              <label>Tags</label>
              {isEditing ? (
                <div className="tag-selector">
                  {tags.map(tag => (
                    <div
                      key={tag.id}
                      className={`tag-option ${formData.tags?.includes(tag.id) ? 'selected' : ''}`}
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="task-display-tags">
                  {task.tags?.length > 0 ? (
                    task.tags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <span key={tagId} className="task-tag">
                          {tag.name}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <em>No tags</em>
                  )}
                </div>
              )}
            </div>

            <div className="form-control">
              <label>Subtasks</label>
              <div className="subtasks-section">
                {(isEditing ? formData.subtasks : task.subtasks)?.map((subtask, index) => (
                  <div key={index} className="subtask-item">
                    {isEditing ? (
                      <>
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => handleSubtaskToggle(index)}
                        />
                        <input
                          type="text"
                          value={subtask.text}
                          onChange={(e) => handleFormChange(`subtasks.${index}.text`, e.target.value)}
                          placeholder="Subtask..."
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleSubtaskRemove(index)}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`subtask-checkbox ${subtask.completed ? 'completed' : ''}`}>
                          {subtask.completed ? '✅' : '☐'}
                        </span>
                        <span className={`subtask-text ${subtask.completed ? 'completed' : ''}`}>
                          {subtask.text}
                        </span>
                      </>
                    )}
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleSubtaskAdd}
                  >
                    + Add Subtask
                  </button>
                )}
                
                {(!task.subtasks || task.subtasks.length === 0) && !isEditing && (
                  <em>No subtasks</em>
                )}
              </div>
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
    <div className="task-modal-page">
      {content}
    </div>
  );
};

export default TaskModal;
