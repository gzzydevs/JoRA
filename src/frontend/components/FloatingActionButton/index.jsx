import React from 'react';
import { useModal } from '../../contexts/ModalContext';
import './styles.scss';

const FloatingActionButton = () => {
  const { openModal } = useModal();

  const handleNewTask = () => {
    openModal('task', { taskId: null });
  };

  return (
    <button 
      className="floating-action-button"
      onClick={handleNewTask}
      title="Create New Task"
    >
      ✚
    </button>
  );
};

export default FloatingActionButton;
