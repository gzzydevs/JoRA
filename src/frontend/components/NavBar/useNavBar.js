import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../hooks/useTaskContext';
import { useTheme } from '../../hooks/useTheme';

export const useNavBar = () => {
  const { config } = useTaskContext();
  const { isDarkMode, toggleTheme } = useTheme();
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

  const handleNewAuthor = () => {
    navigate('/authors/new-author');
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
    handleNewAuthor,
    handleRelease,
  };
};
