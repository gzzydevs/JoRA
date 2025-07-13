import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../hooks/useTaskContext';
import { useTheme } from '../../hooks/useTheme';
import { useModal } from '../../contexts/ModalContext';

export const useNavBar = () => {
  const { config } = useTaskContext();
  const { isDarkMode, toggleTheme } = useTheme();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const handleBacklog = () => {
    navigate('/backlog');
  };

  const handleNewTask = () => {
    navigate('/tasks/new-task');
  };

  const handleNewEpic = () => {
    navigate('/epics/new-epic');
  };

  const handleEpics = () => {
    navigate('/epics');
  };

  const handleAuthors = () => {
    navigate('/authors');
  };

  const handleNewAuthor = () => {
    openModal('author', { author: null });
  };

  const handleRelease = () => {
    // TODO: Open release modal or navigate to new release page
    console.log('Open release modal');
  };

  return {
    config,
    isDarkMode,
    toggleTheme,
    handleBacklog,
    handleNewTask,
    handleNewEpic,
    handleEpics,
    handleAuthors,
    handleNewAuthor,
    handleRelease,
  };
};
