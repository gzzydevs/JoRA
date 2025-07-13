import React from 'react';
import { useTaskContext } from '../../contexts/TaskContext';
import { useModal } from '../../contexts/ModalContext';
import './styles.scss';

const AuthorsPage = () => {
  const { authors, tasks, isLoading } = useTaskContext();
  const { openModal } = useModal();

  const getAuthorStats = (author) => {
    if (!tasks || !author.id) {
      return { created: 0, assigned: 0, total: 0 };
    }

    const createdTasks = tasks.filter(task => task.author === author.id);
    const assignedTasks = tasks.filter(task => task.assignee === author.id);
    const totalTasks = new Set([
      ...createdTasks.map(t => t.id),
      ...assignedTasks.map(t => t.id)
    ]).size;

    return {
      created: createdTasks.length,
      assigned: assignedTasks.length,
      total: totalTasks
    };
  };

  const handleNewAuthor = () => {
    openModal('author', { author: null });
  };

  const handleEditAuthor = (author) => {
    openModal('author', { author: author });
  };

  if (isLoading) {
    return (
      <div className="authors-page">
        <div className="authors-header">
          <h1>Autores</h1>
        </div>
        <div className="loading">Cargando autores...</div>
      </div>
    );
  }

  return (
    <div className="authors-page">
      <div className="authors-header">
        <h1>Autores</h1>
        <button 
          className="btn btn-primary"
          onClick={handleNewAuthor}
        >
          Nuevo Autor
        </button>
      </div>

      <div className="authors-grid">
        {authors?.length > 0 ? (
          authors.map((author) => {
            const stats = getAuthorStats(author);

            return (
              <div 
                key={author.id} 
                className="author-card"
                onClick={() => handleEditAuthor(author)}
              >
                <div className="author-card-header">
                  <div className="author-avatar">
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {author.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="author-info">
                    <h3 className="author-name">{author.name}</h3>
                    {author.email && (
                      <p className="author-email">{author.email}</p>
                    )}
                  </div>
                </div>

                {author.role && (
                  <div className="author-role">
                    {author.role}
                  </div>
                )}

                <div className="author-stats">
                  <div className="stat-item">
                    <span className="stat-value">{stats.created}</span>
                    <span className="stat-label">Creadas</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.assigned}</span>
                    <span className="stat-label">Asignadas</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </div>

                <div className="author-metadata">
                  {author.createdAt && (
                    <span className="created-date">
                      Desde: {new Date(author.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-authors">
            <p>No hay autores creados.</p>
            <button 
              className="btn btn-primary"
              onClick={handleNewAuthor}
            >
              Crear tu primer autor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorsPage;
