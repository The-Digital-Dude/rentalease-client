import { type ReactNode } from "react";
import { RiCloseLine } from "react-icons/ri";
import Button from "../Button/Button";
import "./Modal.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "small" | "medium" | "large";
  showCloseButton?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  showCloseButton = true,
}: ModalProps) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content ${size}`}>
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h3>{title}</h3>}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                className="close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                <RiCloseLine />
              </Button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
