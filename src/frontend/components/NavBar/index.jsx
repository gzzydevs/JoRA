import React from 'react';
import VersionSelector from '../VersionSelector';
import { useNavBar } from './useNavBar';
import GitConflictModal from '../GitConflictModal';
import './styles.scss';

const NavBar = () => {
  const {
    config,
    isDarkMode,
    toggleTheme,
    handleBacklog,
    handleNewTask,
    handleNewEpic,
    handleEpics,
    handleAuthors,
    handleNewAuthor,
    handleRelease,
    handleSaveChanges,
    handleSyncWithRemote,
    gitStatus,
    canSaveChanges,
    needsUpdate,
    hasInvalidFiles,
    isSaving,
    isSyncing,
    gitError,
    modalState,
    closeModal
  } = useNavBar();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h1 className="navbar-title">
            JoRA 🎯
          </h1>
          <div className="navbar-subtitle">
            <span className="project-name">{config.name || 'Project'}</span>
            <span className="project-version">v{config.currentVersion || '0.1.0'}</span>
          </div>
        </div>

        <div className="navbar-actions">
          <VersionSelector />

          <div className="navbar-divider" />

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleBacklog}
          >
            📋 Backlog
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleEpics}
          >
            📦 Épicas
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAuthors}
          >
            👥 Autores
          </button>

          <div className="navbar-divider" />

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleNewAuthor}
          >
            👤 +Author
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleNewEpic}
          >
            📦 +Epic
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleNewTask}
          >
            ➕ New Task
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleRelease}
          >
            🚀 Release
          </button>

          <div className="navbar-divider" />

          {/* Sync Button with notification badge */}
          <button
            type="button"
            className={`btn btn-sm ${needsUpdate ? 'btn-warning' : 'btn-secondary'}`}
            onClick={handleSyncWithRemote}
            disabled={isSyncing}
            title={needsUpdate ? `${gitStatus.commitsBehind} commits behind remote` : 'Sync with remote jora-backlog'}
            style={{ position: 'relative' }}
          >
            {isSyncing ? '⏳ Syncing...' : '🔄 Update'}
            {needsUpdate && (
              <span className="notification-badge">
                {gitStatus.commitsBehind}
              </span>
            )}
          </button>

          {/* Save Button with validation */}
          <button
            type="button"
            className={`btn btn-sm ${
              canSaveChanges ? 'btn-primary' : 
              hasInvalidFiles ? 'btn-danger' : 
              needsUpdate ? 'btn-warning' : 'btn-secondary'
            }`}
            onClick={handleSaveChanges}
            disabled={!canSaveChanges || isSaving}
            title={
              hasInvalidFiles ? 'Invalid files in staging (only jora-changelog/*.json allowed)' :
              needsUpdate ? 'Please sync with remote first' :
              !canSaveChanges ? 'No changes to save' :
              'Save changes to jora-backlog branch'
            }
          >
            {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>

          {/* Git Status Indicator */}
          {gitError && (
            <span className="git-status-error" title={gitError}>
              ⚠️
            </span>
          )}
        </div>
      </div>
      
      {/* Git Conflict Modal */}
      <GitConflictModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        message={modalState.message}
        type={modalState.type}
      />
    </nav>
  );
};

export default NavBar;
