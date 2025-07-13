import React from 'react';
import VersionSelector from '../VersionSelector';
import { useNavBar } from './useNavBar';
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
    handleRelease
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
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
