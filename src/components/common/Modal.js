import React, { useEffect } from "react";
import "./common.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer = null,
  maxWidth = "600px",
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="rc-modal-backdrop" onClick={onClose}>
      <div
        className="rc-modal-card"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rc-modal-header">
          <div>
            <h3 className="rc-modal-title">{title}</h3>
            {subtitle && <p className="rc-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            className="rc-modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="rc-modal-body">{children}</div>

        {footer && <div className="rc-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
