import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../contexts/TaskContext';
import './styles.scss';

const EpicsPage = () => {
  const navigate = useNavigate();
  const { epics, tasks, isLoading } = useTaskContext();

  const getEpicProgress = (epic) => {
    if (!tasks || !epic.id) {
      return { completed: 0, total: 0 };
    }

    const epicTasks = tasks.filter(task => task.epic === epic.id);
    const completedTasks = epicTasks.filter(task => 
      task.state === 'done' || task.state === 'ready_to_release'
    );

    return {
      completed: completedTasks.length,
      total: epicTasks.length
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'var(--success-color)';
      case 'in_progress':
        return 'var(--warning-color)';
      case 'on_hold':
        return 'var(--danger-color)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Finalizada';
      case 'in_progress':
        return 'En Progreso';
      case 'on_hold':
        return 'No Finalizable';
      default:
        return 'Sin Estado';
    }
  };

  if (isLoading) {
    return (
      <div className="epics-page">
        <div className="epics-header">
          <h1>Épicas</h1>
        </div>
        <div className="loading">Cargando épicas...</div>
      </div>
    );
  }

  return (
    <div className="epics-page">
      <div className="epics-header">
        <h1>Épicas</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/epics/new-epic')}
        >
          Nueva Épica
        </button>
      </div>

      <div className="epics-grid">
        {epics?.length > 0 ? (
          epics.map((epic) => {
            const progress = getEpicProgress(epic);
            const progressPercentage = progress.total > 0 
              ? Math.round((progress.completed / progress.total) * 100) 
              : 0;

            return (
              <div 
                key={epic.id} 
                className="epic-card"
                onClick={() => navigate(`/epic/${epic.id}`)}
              >
                <div className="epic-card-header">
                  <h3 className="epic-title">{epic.name}</h3>
                  <div 
                    className="epic-status"
                    style={{ color: getStatusColor(epic.status) }}
                  >
                    {getStatusText(epic.status)}
                  </div>
                </div>

                <div className="epic-description">
                  {epic.description || 'Sin descripción'}
                </div>

                <div className="epic-metadata">
                  {epic.version && (
                    <span className="epic-version">v{epic.version}</span>
                  )}
                  
                  <div className="epic-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {progress.completed}/{progress.total} tareas
                    </span>
                  </div>
                </div>

                <div className="epic-dates">
                  {epic.startDate && (
                    <span>Inicio: {new Date(epic.startDate).toLocaleDateString()}</span>
                  )}
                  {epic.endDate && (
                    <span>Fin: {new Date(epic.endDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-epics">
            <p>No hay épicas creadas.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/epics/new-epic')}
            >
              Crear tu primera épica
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpicsPage;
