import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import BacklogColumn from '../../components/BacklogColumn';
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
                <div className="stat-number">{tasks.filter(t => t.state === 'in_backlog').length}</div>
                <div className="stat-label">In Backlog</div>
              </div>
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

            <div className="backlog-board">
              <h2>Task Organization</h2>
              <p>Drag tasks between states to organize your backlog</p>
              
              <div className="backlog-columns">
                <BacklogColumn 
                  state="in_backlog"
                  title="📋 In Backlog" 
                  tasks={tasks.filter(t => t.state === 'in_backlog')}
                  description="Future tasks and ideas"
                />
                <BacklogColumn 
                  state="todo"
                  title="📝 Next Sprint" 
                  tasks={tasks.filter(t => t.state === 'todo')}
                  description="Ready for next sprint"
                />
                <BacklogColumn 
                  state="in_progress"
                  title="🔄 In Progress" 
                  tasks={tasks.filter(t => t.state === 'in_progress')}
                  description="Currently being worked"
                />
                <BacklogColumn 
                  state="in_review"
                  title="👀 In Review" 
                  tasks={tasks.filter(t => t.state === 'in_review')}
                  description="Under review"
                />
                <BacklogColumn 
                  state="ready_to_release"
                  title="✅ Ready to Release" 
                  tasks={tasks.filter(t => t.state === 'ready_to_release')}
                  description="Ready for next release"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BacklogPage;
