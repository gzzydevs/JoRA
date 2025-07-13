import React from 'react';
import { useFilterBar } from './useFilterBar';
import './FilterBar.scss';

const FilterBar = () => {
  const {
    filters,
    epics,
    authors,
    handleEpicChange,
    handleAuthorChange,
    handleSearchChange,
    resetFilters,
    hasActiveFilters
  } = useFilterBar();

  return (
    <div className="filter-bar">
      <div className="filter-controls">
        <div className="form-control">
          <select 
            id="epic-filter" 
            value={filters.epic} 
            onChange={handleEpicChange}
          >
            <option value="">All Epics</option>
            {epics.map(epic => (
              <option key={epic.id} value={epic.id}>
                {epic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <select 
            id="author-filter" 
            value={filters.author} 
            onChange={handleAuthorChange}
          >
            <option value="">All Authors</option>
            {authors.map(author => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control flex-1">
          <input
            type="text"
            id="search-input"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        {hasActiveFilters && (
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={resetFilters}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
