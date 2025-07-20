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
    openModal('release');
  };

  const handleSaveChanges = async () => {
    try {
      const result = await saveChanges();
      
      if (result.success) {
        if (result.action === 'no_changes') {
          showSuccess('No changes to save - everything is up to date');
        } else if (result.action === 'success') {
          showSuccess(`Changes saved and pushed successfully to '${result.currentBranch}' branch!`);
        } else if (result.action === 'commit_success_push_failed') {
          showError(`Changes committed locally but push failed. Check your internet connection.`);
        }
      } else if (result.warning && result.action === 'wrong_branch_no_commit') {
        // Special case: not on jora branch - changes executed but not committed
        showError(`⚠️ ${result.message}\n\nCurrent branch: ${result.currentBranch}\nRequired for auto-commit: ${result.requiredBranch}`);
      } else {
        showError(result.message || result.error || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error in handleSaveChanges:', error);
      
      // Handle HTTP error responses
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.warning && errorData.action === 'wrong_branch_no_commit') {
          showError(`⚠️ ${errorData.message}\n\nHint: ${errorData.hint || 'Switch to jora branch for auto-commits'}`);
        } else {
          showError(errorData.message || errorData.error || 'Failed to save changes');
        }
      } else {
        showError('Failed to save changes: ' + error.message);
      }
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
