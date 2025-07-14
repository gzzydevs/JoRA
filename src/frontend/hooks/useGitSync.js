import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useGitSync = () => {
  const [gitStatus, setGitStatus] = useState({
    currentBranch: 'unknown',
    canSave: false,
    needsSync: false,
    commitsBehind: 0,
    commitsAhead: 0,
    isUpToDate: true,
    hasStagedChanges: false,
    invalidFiles: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRecreating, setIsRecreating] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Modal state for better user feedback
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: '',
    type: 'info'
  });

  // Modal helper functions
  const showModal = (message, type = 'info') => {
    setModalState({ isOpen: true, message, type });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, message: '', type: 'info' });
  };

  // Check git status
  const checkGitStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const status = await apiService.getGitStatus();
      setGitStatus(status);
      
      console.log('🔍 Git status updated:', status);
    } catch (err) {
      console.error('Error checking git status:', err);
      setError('Failed to check git status: ' + err.message);
      // Set safe defaults on error
      setGitStatus(prev => ({
        ...prev,
        canSave: false,
        needsSync: false
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save changes to git
  const saveChanges = useCallback(async () => {
    if (isSaving || !gitStatus.canSave) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      console.log('💾 Starting save operation...');
      const result = await apiService.saveChanges();
      
      if (result.success) {
        // Refresh git status after successful save
        await checkGitStatus();
        setLastSyncTime(new Date());
        return {
          success: true,
          message: result.message,
          action: result.action
        };
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes: ' + err.message);
      return {
        success: false,
        message: err.message
      };
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, gitStatus.canSave, checkGitStatus]);

  // Sync with remote
  const syncWithRemote = useCallback(async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      setError(null);
      
      console.log('🔄 Starting sync operation...');
      const result = await apiService.syncWithRemote();
      
      if (result.success) {
        // Refresh git status after successful sync
        await checkGitStatus();
        setLastSyncTime(new Date());
        return {
          success: true,
          message: result.message,
          action: result.action
        };
      } else {
        // Handle merge conflicts with modal
        if (result.action === 'conflict') {
          showModal(
            `Se detectó un conflicto de merge:\n\n${result.message}\n\nPor favor, resuelve los conflictos manualmente en el terminal y luego vuelve a sincronizar.`,
            'warning'
          );
          return {
            success: false,
            message: result.message,
            action: 'conflict'
          };
        }
        throw new Error(result.error || 'Sync failed');
      }
    } catch (err) {
      console.error('Error syncing with remote:', err);
      setError('Failed to sync: ' + err.message);
      return {
        success: false,
        message: err.message
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, checkGitStatus]);

  // Recreate jora-backlog branch from current branch
  const recreateJoraBacklog = useCallback(async () => {
    if (isRecreating) return;
    
    try {
      setIsRecreating(true);
      setError(null);
      
      console.log('🔄 Recreating jora-backlog branch...');
      const result = await apiService.recreateJoraBacklog();
      
      if (result.success) {
        // Refresh git status after successful recreation
        await checkGitStatus();
        setLastSyncTime(new Date());
        showModal(
          `✅ jora-backlog branch recreated successfully!\n\nYou are now on the jora-backlog branch and can save changes.`,
          'success'
        );
        return {
          success: true,
          message: result.message
        };
      } else {
        throw new Error(result.error || 'Recreation failed');
      }
    } catch (err) {
      console.error('Error recreating jora-backlog branch:', err);
      setError('Failed to recreate branch: ' + err.message);
      
      // Show specific error messages
      if (err.message.includes('already on jora-backlog')) {
        showModal('You are already on the jora-backlog branch.', 'info');
      } else if (err.message.includes('uncommitted changes')) {
        showModal('Please commit or stash your changes before recreating the branch.', 'warning');
      } else {
        showModal(`Failed to recreate jora-backlog branch:\n\n${err.message}`, 'error');
      }
      
      return {
        success: false,
        message: err.message
      };
    } finally {
      setIsRecreating(false);
    }
  }, [isRecreating, checkGitStatus, showModal]);

  // Auto-check git status on mount and periodically
  useEffect(() => {
    checkGitStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkGitStatus, 30000);
    
    return () => clearInterval(interval);
  }, [checkGitStatus]);

  // Computed properties
  const canSaveChanges = gitStatus.canSave && !isSaving && !isLoading;
  const needsUpdate = gitStatus.needsSync && !isSyncing;
  const hasUnsavedChanges = gitStatus.hasStagedChanges;
  const hasInvalidFiles = gitStatus.invalidFiles && gitStatus.invalidFiles.length > 0;

  return {
    // State
    gitStatus,
    isLoading,
    isSaving,
    isSyncing,
    error,
    lastSyncTime,
    modalState,
    
    // Computed
    canSaveChanges,
    needsUpdate,
    hasUnsavedChanges,
    hasInvalidFiles,
    
    // Actions
    checkGitStatus,
    saveChanges,
    syncWithRemote,
    showModal,
    closeModal,
    recreateJoraBacklog,
    
    // Clear error
    clearError: () => setError(null)
  };
};

export default useGitSync;
