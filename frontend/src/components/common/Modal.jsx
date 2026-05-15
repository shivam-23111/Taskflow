import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className={`relative ${sizes[size]} w-full bg-dark-900 border border-dark-700 rounded-lg shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-800">
          <h2 className="text-xl font-semibold text-dark-50">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
