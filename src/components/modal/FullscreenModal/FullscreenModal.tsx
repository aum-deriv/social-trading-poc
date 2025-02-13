import { ReactNode } from "react";
import "./FullscreenModal.css";

interface FullscreenModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const FullscreenModal = ({ isOpen, onClose, title, children }: FullscreenModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fullscreen-modal">
            <div className="fullscreen-modal__content">
                <header className="fullscreen-modal__header">
                    <button 
                        className="fullscreen-modal__back" 
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="fullscreen-modal__title">{title}</h2>
                </header>
                <div className="fullscreen-modal__body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FullscreenModal;
