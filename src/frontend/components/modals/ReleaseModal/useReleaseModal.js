import { useState, useEffect } from 'react';
import { useTaskContext } from '../../../hooks/useTaskContext';
import { api } from '../../../services/api';

export const useReleaseModal = ({ isOpen, onClose }) => {
  const { tasks, showSuccess, showError, refreshData } = useTaskContext();
  
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [isTestVersion, setIsTestVersion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Get tasks ready for release
  const readyToReleaseTasks = tasks.filter(task => task.state === 'ready_to_release');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setVersion('');
      setDescription('');
      setIsTestVersion(false);
      setError(null);
      setValidationError('');
    }
  }, [isOpen]);

  // Validate version format
  useEffect(() => {
    if (version.trim()) {
      // Simple version validation (e.g., 1.0.0, 0.1.0, 2.5.1-beta)
      const versionRegex = /^\d+\.\d+\.\d+(-\w+)?$/;
      if (!versionRegex.test(version)) {
        setValidationError('Version should follow format: x.y.z (e.g., 1.0.0)');
      } else {
        setValidationError('');
      }
    } else {
      setValidationError('');
    }
  }, [version]);

  const handleCreateRelease = async () => {
    if (!version.trim()) {
      setValidationError('Version is required');
      return;
    }

    if (validationError) {
      return;
    }

    if (readyToReleaseTasks.length === 0) {
      setError('No tasks ready for release');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isTestVersion) {
        // For test versions, create release without affecting tasks
        const release = {
          version,
          description: description || `Test release v${version}`,
          tasks: readyToReleaseTasks,
          isTestVersion: true,
          generatedAt: new Date().toISOString(),
          taskCount: readyToReleaseTasks.length
        };

        // Save test release (this would need a special endpoint or modification)
        await api.post('/api/releases/test', release);
        showSuccess(`Test release v${version} created successfully! Tasks remain on board.`);
      } else {
        // Regular release - moves tasks
        await api.post('/api/releases', {
          version,
          description: description || `Release v${version}`
        });
        showSuccess(`Release v${version} created successfully! ${readyToReleaseTasks.length} tasks moved to release.`);
        
        // Reload data to reflect changes
        await refreshData();
      }

      onClose();
    } catch (error) {
      console.error('Error creating release:', error);
      setError(error.response?.data?.error || error.message || 'Failed to create release');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return {
    version,
    setVersion,
    description,
    setDescription,
    isTestVersion,
    setIsTestVersion,
    isLoading,
    error,
    validationError,
    readyToReleaseTasks,
    handleCreateRelease,
    handleCancel
  };
};
