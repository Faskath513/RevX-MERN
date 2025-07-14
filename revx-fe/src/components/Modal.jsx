import React from 'react';

const Modal = ({ show, closeModal }) => {
  if (!show) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={closeModal}>×</span>
        <p>This is a modal</p>
      </div>
    </div>
  );
};

export default Modal;
