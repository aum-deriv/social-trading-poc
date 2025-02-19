import React from 'react';
import Button from '@/components/input/Button';
import './UpgradeModal.css';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Become a Leader</h2>
        <div className="modal-description">
          <p>As a leader, you'll be able to:</p>
          <div className="benefits-list">
            <div className="benefit-item">
              <span>📈</span>
              <p>Share your trading strategies</p>
            </div>
            <div className="benefit-item">
              <span>👥</span>
              <p>Build your following</p>
            </div>
            <div className="benefit-item">
              <span>💰</span>
              <p>Earn from copier subscriptions</p>
            </div>
          </div>
          <p className="warning-text">
            This action cannot be undone. Are you ready to start your journey as a leader?
          </p>
        </div>
        <div className="modal-actions">
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirm Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
