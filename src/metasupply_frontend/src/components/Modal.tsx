import React from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <div
      className="bg-white p-8 rounded-lg shadow-2xl relative max-w-md w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
      >
        &times;
      </button>
      <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center break-words">{title}</h3>
      {children}
    </div>
  </div>
);

export default Modal;
