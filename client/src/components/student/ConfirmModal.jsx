import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!show) return null;

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center z-[9999] p-4 transition-all duration-200 ${
        isOpen ? "animate-fadeIn" : "animate-fadeOut"
      } bg-black/60 backdrop-blur-md`}
    >
      <div
        className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl shadow-purple-900/30 p-6 max-w-md w-full ${
          isOpen ? "animate-zoomIn" : "animate-zoomOut"
        }`}
      >
        <h3 className="text-white text-lg font-semibold">
          Confirm Deletion
        </h3>

        <p className="text-gray-300 mt-2">
          {message ||
            "Are you sure you want to delete this? This action cannot be undone."}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="bg-white/10 text-gray-300 hover:bg-white/20 rounded-md px-4 py-2 transition-colors text-sm font-medium"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-500 text-white rounded-md px-4 py-2 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;