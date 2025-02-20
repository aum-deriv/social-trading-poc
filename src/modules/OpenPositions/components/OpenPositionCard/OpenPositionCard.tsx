import React, { memo, useMemo } from 'react';
import { TradeType } from '../../types';
import { formatTimestamp } from '@/utils/time';
import RandomValue from '@/components/RandomValue';
import CountdownTimer from '@/components/CountdownTimer';
import Button from '@/components/input/Button';
import './OpenPositionCard.css';

interface OpenPositionCardProps {
  contractId: string;
  contractType: TradeType;
  symbol: string;
  currency: string;
  stake: number;
  leaderId: string;
  leaderDisplayName: string;
  strategyId: string;
  strategyDisplayName: string;
  multiplier?: number;
  buyPrice?: number;
  dateStart?: string;
  expiryTime?: string;
  payout?: number;
  purchaseTime?: string;
  onClose: (id: string) => void;
}

export const OpenPositionCard: React.FC<OpenPositionCardProps> = memo(
  ({
    contractId,
    contractType,
    symbol,
    currency,
    stake,
    leaderDisplayName,
    strategyDisplayName,
    multiplier,
    buyPrice,
    dateStart,
    expiryTime,
    payout,
    onClose,
  }) => {
    const getRemainingSeconds = (expiryTimeStr: string) => {
      try {
        const expiry = new Date(expiryTimeStr);
        if (isNaN(expiry.getTime())) {
          return 0;
        }

        const now = Date.now();
        const remaining = Math.floor((expiry.getTime() - now) / 1000);
        return Math.max(0, remaining);
      } catch {
        return 0;
      }
    };

    const remainingSeconds = useMemo(() => {
      if (!expiryTime) {
        return 0;
      }
      return getRemainingSeconds(expiryTime);
    }, [expiryTime]);

    const handleClose = () => {
      onClose(contractId);
    };

    return (
      <div className="open-position-card">
        <div className="open-position-card__header">
          <div className="open-position-card__header-main">
            <div className="open-position-card__type">
              <span className="open-position-card__type-text">{leaderDisplayName || '-'}</span>
              <span className="open-position-card__value">{strategyDisplayName || '-'}</span>
            </div>
            <Button onClick={handleClose} variant="secondary">
              Close
            </Button>
          </div>
        </div>

        <div className="open-position-card__content">
          <div className="open-position-card__info">
            <div className="open-position-card__row">
              <span className="open-position-card__label">Type</span>
              <span className="open-position-card__value">{contractType}</span>
            </div>

            <div className="open-position-card__row">
              <span className="open-position-card__label">Symbol</span>
              <span className="open-position-card__value">{symbol || '-'}</span>
            </div>

            <div className="open-position-card__row">
              <span className="open-position-card__label">Currency</span>
              <span className="open-position-card__currency">{currency || '-'}</span>
            </div>

            <div className="open-position-card__row">
              <span className="open-position-card__label">Stake</span>
              <span className="open-position-card__value">{stake?.toFixed(2) || '-'}</span>
            </div>
          </div>

          <div className="open-position-card__section">
            {multiplier && (
              <div className="open-position-card__row">
                <span className="open-position-card__label">Multiplier</span>
                <span className="open-position-card__value">{multiplier}x</span>
              </div>
            )}

            <div className="open-position-card__row">
              <span className="open-position-card__label">Current Value</span>
              <span className="open-position-card__amount">
                <RandomValue min={stake * 0.8} max={stake * 1.2} interval={1000} />
              </span>
            </div>

            {contractType === TradeType.Accumulators && expiryTime && (
              <div className="open-position-card__row">
                <span className="open-position-card__label">Time Remaining</span>
                <span className="open-position-card__countdown">
                  <CountdownTimer
                    initialSeconds={remainingSeconds}
                    loop={false}
                    onCountdownComplete={handleClose}
                  />
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="open-position-card__meta">
          <div className="open-position-card__meta-item">
            <span className="open-position-card__label">Contract ID:</span>
            <span className="open-position-card__value">{contractId || '-'}</span>
          </div>
          {dateStart && (
            <div className="open-position-card__meta-item">
              <span className="open-position-card__label">Start:</span>
              <span className="open-position-card__value">{formatTimestamp(dateStart)}</span>
            </div>
          )}
          {(buyPrice || payout) && (
            <div className="open-position-card__meta-item">
              <span className="open-position-card__label">{payout ? 'Payout:' : 'Entry:'}</span>
              <span className="open-position-card__value">{payout || buyPrice}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

OpenPositionCard.displayName = 'OpenPositionCard';
