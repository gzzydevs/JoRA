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
    // TODO: Open task modal
    console.log('Open task modal');
  };

  const handleNewEpic = () => {
    // TODO: Open epic modal
    console.log('Open epic modal');
  };

  const handleNewAuthor = () => {
    // TODO: Open author modal
    console.log('Open author modal');
  };

  const handleRelease = () => {
    // TODO: Open release modal
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
