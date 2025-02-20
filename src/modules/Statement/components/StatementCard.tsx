import React, { memo } from 'react';
import { formatTimestamp } from '@/utils/time';
import './StatementCard.css';

interface StatementCardProps {
  type?: string;
  actionType?: string;
  currency?: string;
  amount?: number;
  balanceAfter?: number;
  referenceId?: number;
  transactionTime?: string;
  symbol?: string;
  leaderDisplayName?: string;
  strategyName?: string;
  multiplier?: number;
  buyPrice?: number;
  payout?: number;
}

export const StatementCard: React.FC<StatementCardProps> = memo(
  ({
    type,
    actionType,
    currency,
    amount,
    balanceAfter,
    referenceId,
    transactionTime,
    symbol,
    leaderDisplayName,
    strategyName,
    multiplier,
    buyPrice,
    payout,
  }) => {
    return (
      <div className="statement-card">
        <div className="statement-card__header">
          <div className="statement-card__header-main">
            <div className="statement-card__type">
              <span className="statement-card__type-text">{leaderDisplayName || '-'}</span>
              <span className="statement-card__value">{strategyName || '-'}</span>
            </div>
            <div className={`statement-card__action ${actionType?.toLowerCase() || ''}`}>
              {actionType || '-'}
            </div>
          </div>
        </div>

        <div className="statement-card__content">
          <div className="statement-card__info">
            <div className="statement-card__row">
              <span className="statement-card__label">Type</span>
              <span className="statement-card__value">{type}</span>
            </div>

            <div className="statement-card__row">
              <span className="statement-card__label">Symbol</span>
              <span className="statement-card__value">{symbol || '-'}</span>
            </div>

            <div className="statement-card__row">
              <span className="statement-card__label">Currency</span>
              <span className="statement-card__currency">{currency || '-'}</span>
            </div>

            <div className="statement-card__row">
              <span className="statement-card__label">Balance</span>
              <span className="statement-card__balance">{balanceAfter?.toFixed(2) || '-'}</span>
            </div>
          </div>

          <div className="statement-card__section">
            {multiplier && (
              <div className="statement-card__row">
                <span className="statement-card__label">Multiplier</span>
                <span className="statement-card__value">{multiplier}x</span>
              </div>
            )}

            <div className="statement-card__row">
              <span className="statement-card__label">Credit/Debit</span>
              <span
                className={`statement-card__amount ${amount && amount < 0 ? 'negative' : 'positive'}`}
              >
                {amount ? (amount < 0 ? amount : `+${amount}`) : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="statement-card__meta">
          <div className="statement-card__meta-item">
            <span className="statement-card__label">Ref. ID:</span>
            <span className="statement-card__value">{referenceId || '-'}</span>
          </div>
          <div className="statement-card__meta-item">
            <span className="statement-card__label">Time:</span>
            <span className="statement-card__value">
              {transactionTime ? formatTimestamp(transactionTime) : '-'}
            </span>
          </div>
          {(buyPrice || payout) && (
            <div className="statement-card__meta-item">
              <span className="statement-card__label">{payout ? 'Payout:' : 'Buy Price:'}</span>
              <span className="statement-card__value">{payout || buyPrice}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatementCard.displayName = 'StatementCard';
