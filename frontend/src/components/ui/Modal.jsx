import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  showClose = true,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} rounded-2xl bg-[#161B22] border border-[#21262D] p-6 shadow-2xl transition-all duration-150 transform scale-100 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#21262D]">
          {title && (
            <h3 id="modal-title" className="text-lg font-semibold text-[#F0F6FC]">
              {title}
            </h3>
          )}
          {showClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#1F242C] transition-colors ml-auto"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
