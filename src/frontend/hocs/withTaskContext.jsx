import React from 'react';
import { TaskProvider } from '../contexts/TaskContext';

const withTaskContext = (Component) => {
  const WrappedComponent = (props) => (
    <TaskProvider>
      <Component {...props} />
    </TaskProvider>
  );
  
  WrappedComponent.displayName = `withTaskContext(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default withTaskContext;
