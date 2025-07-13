import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ModalProvider } from './contexts/ModalContext';
import { TaskProvider } from './contexts/TaskContext';
import ModalManager from './components/ModalManager';
import KanbanPage from './pages/KanbanPage';
import BacklogPage from './pages/BacklogPage';
import ReleasePage from './pages/ReleasePage';
import TaskDetailPage from './pages/TaskDetailPage';
import EpicDetailPage from './pages/EpicDetailPage';
import EpicsPage from './pages/EpicsPage';
import AuthorsPage from './pages/AuthorsPage';
import NewTaskPage from './pages/NewTaskPage';
import NewEpicPage from './pages/NewEpicPage';
import './styles/globals.scss';

function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <ModalProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<KanbanPage />} />
                <Route path="/backlog" element={<BacklogPage />} />
                <Route path="/release/:version" element={<ReleasePage />} />
                <Route path="/task/:id" element={<TaskDetailPage />} />
                <Route path="/tasks/new-task" element={<NewTaskPage />} />
                <Route path="/epics" element={<EpicsPage />} />
                <Route path="/authors" element={<AuthorsPage />} />
                <Route path="/epic/:id" element={<EpicDetailPage />} />
                <Route path="/epics/new-epic" element={<NewEpicPage />} />
              </Routes>
              <ModalManager />
            </div>
          </Router>
        </ModalProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
