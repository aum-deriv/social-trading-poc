import React from 'react';
import './ContractCard.css';
import Tick from '../../../../../assets/icons/Tick';
import { Contract } from '@/types/contract.types';

interface ContractItem {
  title: string;
  value: React.ReactNode;
}

interface ContractCardProps {
  isStatement?: boolean;
  items: ContractItem[];
  contract?: Contract;
  onShare?: () => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ items, contract, isStatement }) => {
  const isCopier = JSON.parse(localStorage.getItem('auth') || 'false').user.userType === 'copier';

  return (
    <div className="contract-card">
      <div
        className={`success-icon-container ${isStatement ? 'success-icon-container--statement' : ''}`}
      >
        <Tick className="success-icon" />
      </div>

      <div className="contract-card-header"></div>

      {!isStatement && (
        <>
          <div className="message">
            <div className="contract-card-up-title">Type</div>
            <div className="contract-card-up-value">{contract?.contract_type}</div>
          </div>
          {isCopier && (
            <>
              <div className="message">
                <div className="contract-card-up-title">Leader</div>
                <div className="contract-card-up-value">{contract?.leader}</div>
              </div>
              <div className="message">
                <div className="contract-card-up-title">Strategy</div>
                <div className="contract-card-up-value">{contract?.strategy_name}</div>
              </div>
            </>
          )}
        </>
      )}

      <div className="contract-card-items">
        {items.map((item, index) => (
          <div key={index} className="contract-card-item">
            <div className="contract-card-title">{item.title}</div>
            <div className="contract-card-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractCard;
