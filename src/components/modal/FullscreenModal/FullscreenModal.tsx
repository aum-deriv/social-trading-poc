import { ReactNode } from "react";
import BackIcon from "@/assets/icons/BackIcon";
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
                        <BackIcon />
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
