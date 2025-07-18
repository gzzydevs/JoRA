import React from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import TaskModal from '../../components/modals/TaskModal';
import './styles.scss';

const TaskDetailPage = () => {
  const { id } = useParams();

  return (
    <div className="task-detail-page">
      <NavBar />
      <main className="task-detail-main">
        <div className="task-detail-container">
          <TaskModal 
            taskId={id} 
            isModal={false} 
            showHeader={true}
          />
        </div>
      </main>
    </div>
  );
};

export default TaskDetailPage;
