import React from 'react';
import { useAuthorModal } from './useAuthorModal';
import { useModal } from '../../../contexts/ModalContext';
import './styles.scss';

const AuthorModal = ({ onClose }) => {
  const { currentAuthor } = useModal();
  
  const {
    formData,
    isLoading,
    error,
    isEditing,
    authorTaskInfo,
    handleFormChange,
    handleSave,
    handleDelete,
    handleClose
  } = useAuthorModal(currentAuthor, onClose);

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="author-modal" onClick={(e) => e.stopPropagation()}>
        <div className="author-modal-header">
          <h2>{isEditing ? 'Editar Autor' : 'Nuevo Autor'}</h2>
          <button
            type="button"
            className="close-button"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <div className="author-modal-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-control">
              <label htmlFor="name">Nombre *</label>
              <input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Nombre completo del autor"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="email@ejemplo.com"
                disabled={isLoading}
              />
            </div>

            {isEditing && authorTaskInfo.total > 0 && (
              <div className="author-task-info">
                <h4>Tareas relacionadas:</h4>
                <div className="task-stats">
                  <span>Creadas: {authorTaskInfo.created}</span>
                  <span>Asignadas: {authorTaskInfo.assigned}</span>
                  <span>Total: {authorTaskInfo.total}</span>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Eliminar
                </button>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !formData.name?.trim()}
              >
                {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthorModal;
