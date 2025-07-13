import { useMemo } from 'react';
import { useTaskContext } from '../../hooks/useTaskContext';

export const useFilterBar = () => {
  const { filters, setFilters, resetFilters, epics, authors } = useTaskContext();

  const handleEpicChange = (e) => {
    setFilters(prev => ({ ...prev, epic: e.target.value }));
  };

  const handleAuthorChange = (e) => {
    setFilters(prev => ({ ...prev, author: e.target.value }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const hasActiveFilters = useMemo(() => {
    return filters.epic !== '' || filters.author !== '' || filters.search !== '';
  }, [filters]);

  return {
    filters,
    epics,
    authors,
    handleEpicChange,
    handleAuthorChange,
    handleSearchChange,
    resetFilters,
    hasActiveFilters,
  };
};
