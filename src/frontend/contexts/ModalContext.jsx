import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [modalProps, setModalProps] = useState({});
  const [currentAuthor, setCurrentAuthor] = useState(null);

  const openModal = (modalType, props = {}) => {
    setActiveModal(modalType);
    setModalProps(props);
    
    // If opening author modal with authorId, set currentAuthor
    if (modalType === 'author' && props.author) {
      setCurrentAuthor(props.author);
    } else if (modalType === 'author' && !props.author) {
      setCurrentAuthor(null); // New author
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalProps({});
    setCurrentAuthor(null);
  };

  const value = {
    activeModal,
    modalProps,
    currentAuthor,
    openModal,
    closeModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
