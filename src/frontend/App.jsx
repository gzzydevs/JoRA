import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import withTaskContext from './hocs/withTaskContext';
import KanbanPage from './pages/KanbanPage';
import BacklogPage from './pages/BacklogPage';
import ReleasePage from './pages/ReleasePage';
import './styles/globals.scss';

// Wrap pages with TaskContext
const KanbanPageWithContext = withTaskContext(KanbanPage);
const BacklogPageWithContext = withTaskContext(BacklogPage);
const ReleasePageWithContext = withTaskContext(ReleasePage);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<KanbanPageWithContext />} />
            <Route path="/backlog" element={<BacklogPageWithContext />} />
            <Route path="/release/:version" element={<ReleasePageWithContext />} />
            {/* Future routes will be added here */}
            {/* <Route path="/task/:id" element={<TaskDetailPageWithContext />} /> */}
            {/* <Route path="/epic/:id" element={<EpicDetailPageWithContext />} /> */}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
