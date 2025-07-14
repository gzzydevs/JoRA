import React from 'react';
import './styles.scss';

const GitConflictModal = ({ isOpen, onClose, message, type = 'warning' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Atención Requerida';
      case 'success':
        return 'Éxito';
      default:
        return 'Información';
    }
  };

  return (
    <div className="git-conflict-modal-overlay" onClick={onClose}>
      <div className="git-conflict-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`git-conflict-modal__header ${type}`}>
          <span className="git-conflict-modal__icon">{getIcon()}</span>
          <h3 className="git-conflict-modal__title">{getTitle()}</h3>
        </div>
        
        <div className="git-conflict-modal__content">
          <p className="git-conflict-modal__message">{message}</p>
        </div>
        
        <div className="git-conflict-modal__footer">
          <button 
            className="git-conflict-modal__button"
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitConflictModal;
