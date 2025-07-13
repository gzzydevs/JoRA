import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ModalProvider } from './contexts/ModalContext';
import withTaskContext from './hocs/withTaskContext';
import ModalManager from './components/ModalManager';
import KanbanPage from './pages/KanbanPage';
import BacklogPage from './pages/BacklogPage';
import ReleasePage from './pages/ReleasePage';
import TaskDetailPage from './pages/TaskDetailPage';
import EpicDetailPage from './pages/EpicDetailPage';
import './styles/globals.scss';

// Wrap pages with TaskContext
const KanbanPageWithContext = withTaskContext(KanbanPage);
const BacklogPageWithContext = withTaskContext(BacklogPage);
const ReleasePageWithContext = withTaskContext(ReleasePage);
const TaskDetailPageWithContext = withTaskContext(TaskDetailPage);
const EpicDetailPageWithContext = withTaskContext(EpicDetailPage);

function App() {
  return (
    <ThemeProvider>
      <ModalProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<KanbanPageWithContext />} />
              <Route path="/backlog" element={<BacklogPageWithContext />} />
              <Route path="/release/:version" element={<ReleasePageWithContext />} />
              <Route path="/task/:id" element={<TaskDetailPageWithContext />} />
              <Route path="/epic/:id" element={<EpicDetailPageWithContext />} />
            </Routes>
            <ModalManager />
          </div>
        </Router>
      </ModalProvider>
    </ThemeProvider>
  );
}

export default App;
