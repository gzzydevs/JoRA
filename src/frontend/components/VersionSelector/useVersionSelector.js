import { useTaskContext } from '../../hooks/useTaskContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const useVersionSelector = () => {
  const { 
    releases, 
    selectedVersion, 
    setSelectedVersion,
    isLoading 
  } = useTaskContext();
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleVersionChange = (e) => {
    const version = e.target.value;
    setSelectedVersion(version);
    
    if (version === 'current') {
      // Go to main kanban
      navigate('/');
    } else {
      // Go to release page
      navigate(`/release/${version}`);
    }
  };

  return {
    releases,
    selectedVersion,
    handleVersionChange,
    isLoading,
    currentPath: location.pathname,
  };
};
