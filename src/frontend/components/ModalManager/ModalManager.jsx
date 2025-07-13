import React from 'react';
import { useModal } from '../../contexts/ModalContext';
import { TaskModal } from '../modals/TaskModal';
import { EpicModal } from '../modals/EpicModal';

const ModalManager = () => {
  const { activeModal, modalProps, closeModal } = useModal();

  if (!activeModal) return null;

  const renderModal = () => {
    switch (activeModal) {
      case 'task':
        return (
          <TaskModal
            taskId={modalProps.taskId}
            isModal={true}
            onClose={closeModal}
          />
        );
      case 'epic':
        return (
          <EpicModal
            epicId={modalProps.epicId}
            isModal={true}
            onClose={closeModal}
          />
        );
      default:
        return null;
    }
  };

  return renderModal();
};

export default ModalManager;
