import { useEffect } from 'react';
import { useTaskContext } from '../../hooks/useTaskContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export const useVersionSelector = () => {
  const { 
    releases, 
    selectedVersion, 
    setSelectedVersion,
    isLoading 
  } = useTaskContext();
  
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Sync selected version with current route
  useEffect(() => {
    if (location.pathname.startsWith('/release/')) {
      const version = params.version || location.pathname.split('/release/')[1];
      if (version && selectedVersion !== version) {
        setSelectedVersion(version);
      }
    } else if (location.pathname === '/' && selectedVersion !== 'current') {
      setSelectedVersion('current');
    }
  }, [location.pathname, params.version, selectedVersion, setSelectedVersion]);

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
