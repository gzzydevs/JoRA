import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../hooks/useTaskContext';
import { useTheme } from '../../hooks/useTheme';
import { useModal } from '../../contexts/ModalContext';
import { useGitSync } from '../../hooks/useGitSync';

export const useNavBar = () => {
  const { config, showSuccess, showError } = useTaskContext();
  const { isDarkMode, toggleTheme } = useTheme();
  const { openModal } = useModal();
  const navigate = useNavigate();
  
  // Use git sync hook
  const {
    gitStatus,
    canSaveChanges,
    needsUpdate,
    hasInvalidFiles,
    isSaving,
    isSyncing,
    saveChanges,
    syncWithRemote,
    error: gitError,
    modalState,
    closeModal
  } = useGitSync();

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

  const handleSaveChanges = async () => {
    if (!canSaveChanges) {
      if (hasInvalidFiles) {
        showError('Cannot save: You can only commit jora-changelog/*.json files');
        return;
      }
      if (needsUpdate) {
        showError('Cannot save: Please sync with remote first');
        return;
      }
      return;
    }
    
    try {
      const result = await saveChanges();
      
      if (result.success) {
        if (result.action === 'no_changes') {
          showSuccess('No changes to save');
        } else {
          showSuccess('Changes saved to jora-backlog branch successfully!');
        }
      } else {
        showError(result.message || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error in handleSaveChanges:', error);
      showError('Failed to save changes: ' + error.message);
    }
  };

  const handleSyncWithRemote = async () => {
    try {
      const result = await syncWithRemote();
      
      if (result.success) {
        if (result.action === 'no_remote') {
          showSuccess('No remote branch to sync with');
        } else {
          showSuccess('Successfully synced with remote jora-backlog');
        }
      } else {
        if (result.action === 'conflict') {
          // TODO: Show modal instead of alert for conflicts
          alert('Merge conflict detected!\n\nPlease resolve conflicts manually in your editor and try again.');
        } else {
          showError(result.message || 'Failed to sync');
        }
      }
    } catch (error) {
      console.error('Error in handleSyncWithRemote:', error);
      showError('Failed to sync: ' + error.message);
    }
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
    handleSaveChanges,
    handleSyncWithRemote,
    
    // Git status
    gitStatus,
    canSaveChanges,
    needsUpdate,
    hasInvalidFiles,
    isSaving,
    isSyncing,
    gitError,
    modalState,
    closeModal
  };
};
