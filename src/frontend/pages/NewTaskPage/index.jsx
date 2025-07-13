import React from 'react';
import TaskModal from '../../components/modals/TaskModal';
import './styles.scss';

const NewTaskPage = () => {
  return (
    <div className="new-task-page">
      <TaskModal taskId={null} isModal={false} showHeader={true} />
    </div>
  );
};

export default NewTaskPage;
