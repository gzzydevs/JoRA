import { useState, useEffect } from 'react';
import { useTaskContext } from '../../../contexts/TaskContext';

export const useAuthorModal = (currentAuthor, onClose) => {
  const taskContext = useTaskContext();
  console.log('🔥🔥🔥 TASKCONTEXT COMPLETO:', taskContext);
  console.log('🔥🔥🔥 updateAuthor function:', taskContext.updateAuthor);
  console.log('🔥🔥🔥 updateAuthor toString:', taskContext.updateAuthor?.toString());
  
  const { 
    tasks,
    createAuthor, 
    updateAuthor,
    deleteAuthor,
    isLoading 
  } = taskContext;

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [error, setError] = useState(null);

  const isEditing = Boolean(currentAuthor);

  // Load author data when editing
  useEffect(() => {
    if (currentAuthor) {
      setFormData({
        name: currentAuthor.name || '',
        email: currentAuthor.email || ''
      });
    } else {
      setFormData({
        name: '',
        email: ''
      });
    }
    setError(null);
  }, [currentAuthor]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Name is required');
      return;
    }

    try {
      const authorData = {
        name: formData.name.trim(),
        email: formData.email?.trim() || ''
      };

      if (isEditing && currentAuthor?.id) {
        await updateAuthor(currentAuthor.id, authorData);
      } else {
        const newAuthor = {
          ...authorData,
          id: `author-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createAuthor(newAuthor);
      }

      onClose();
    } catch (err) {
      console.error('Error saving author:', err);
      setError('Failed to save author: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!currentAuthor) return;
    
    const authorTasks = tasks?.filter(task => 
      task.author === currentAuthor.id || task.assignee === currentAuthor.id
    ) || [];
    
    if (authorTasks.length > 0) {
      setError(`Cannot delete author with ${authorTasks.length} tasks.`);
      return;
    }

    if (window.confirm(`Delete "${currentAuthor.name}"?`)) {
      try {
        await deleteAuthor(currentAuthor.id);
        onClose();
      } catch (err) {
        setError('Failed to delete author');
      }
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const authorTaskInfo = currentAuthor ? {
    created: tasks?.filter(task => task.author === currentAuthor.id).length || 0,
    assigned: tasks?.filter(task => task.assignee === currentAuthor.id).length || 0,
    total: tasks?.filter(task => 
      task.author === currentAuthor.id || task.assignee === currentAuthor.id
    ).length || 0
  } : { created: 0, assigned: 0, total: 0 };

  return {
    formData,
    error,
    isEditing,
    isLoading,
    authorTaskInfo,
    handleFormChange,
    handleSave,
    handleDelete,
    handleClose
  };
};