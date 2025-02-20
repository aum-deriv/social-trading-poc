import { useEffect, useState } from 'react';
import CloseIcon from '@/assets/icons/CloseIcon';
import './Overlay.css';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
}

const Overlay = ({
  isOpen,
  onClose,
  onExited,
  children,
  className = '',
  header = 'text',
}: OverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationState, setAnimationState] = useState<'entering' | 'exiting' | ''>('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsVisible(true);
      setAnimationState('entering');
    } else {
      document.body.style.overflow = 'unset';
      setAnimationState('exiting');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAnimationEnd = () => {
    if (animationState === 'exiting') {
      setIsVisible(false);
      onExited?.();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`overlay ${animationState} ${className}`} onClick={handleBackdropClick}>
      <div className="overlay__header">
        <div className="overlay__header-content">{header}</div>
        <button className="overlay__close" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="overlay__content" onAnimationEnd={handleAnimationEnd}>
        {children}
      </div>
    </div>
  );
};

export default Overlay;
