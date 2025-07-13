import React from 'react';
import { useVersionSelector } from './useVersionSelector';
import './VersionSelector.scss';

const VersionSelector = () => {
  const {
    releases,
    selectedVersion,
    handleVersionChange,
    isLoading
  } = useVersionSelector();

  if (isLoading || releases.length === 0) {
    return null;
  }

  return (
    <div className="version-selector">
      <select 
        value={selectedVersion} 
        onChange={handleVersionChange}
        className="version-select"
        title="Select version to view"
      >
        <option value="current">📋 Current</option>
        {releases.map(release => (
          <option key={release.version} value={release.version}>
            🚀 v{release.version}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VersionSelector;
