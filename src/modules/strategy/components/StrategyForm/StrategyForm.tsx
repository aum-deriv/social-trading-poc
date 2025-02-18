import { useState } from 'react';
import type User from '@/types/user.types';
import './StrategyForm.css';

import type { TradeType } from '@/types/strategy.types';

export interface StrategyFormData {
  name: string;
  description: string;
  tradeType: TradeType;
  riskLevel: 'low' | 'medium' | 'high';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
}

interface StrategyFormProps {
  currentUser: User;
  onSubmit: (strategy: StrategyFormData) => Promise<any>;
  onClose: () => void;
}

const tradeTypes = [
  { value: 'rise_fall', label: 'Rise/Fall' },
  { value: 'touch_no_touch', label: 'Touch/No Touch' },
  { value: 'accumulators', label: 'Accumulators' },
  { value: 'digits', label: 'Digits' },
  { value: 'multipliers', label: 'Multipliers' },
  { value: 'turbos', label: 'Turbos' },
];

const riskLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
];

const StrategyForm: React.FC<StrategyFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState<StrategyFormData>({
    name: '',
    description: '',
    tradeType: 'rise_fall',
    riskLevel: 'medium',
    currency: 'USD',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create strategy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className="strategy-form" onSubmit={handleSubmit}>
      <div className="strategy-form__field">
        <label htmlFor="name">Strategy Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter strategy name"
          required
          maxLength={50}
        />
      </div>

      <div className="strategy-form__field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your trading strategy"
          required
          maxLength={500}
          rows={4}
        />
      </div>

      <div className="strategy-form__field">
        <label htmlFor="tradeType">Trade Type</label>
        <select
          id="tradeType"
          name="tradeType"
          value={formData.tradeType}
          onChange={handleChange}
          required
        >
          {tradeTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="strategy-form__field">
        <label htmlFor="riskLevel">Risk Level</label>
        <select
          id="riskLevel"
          name="riskLevel"
          value={formData.riskLevel}
          onChange={handleChange}
          required
        >
          {riskLevels.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div className="strategy-form__field">
        <label htmlFor="currency">Currency</label>
        <select
          id="currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
        >
          {currencies.map(currency => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="strategy-form__error">{error}</div>}

      <div className="strategy-form__actions">
        <button
          type="button"
          onClick={onClose}
          className="strategy-form__button strategy-form__button--secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="strategy-form__button strategy-form__button--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Strategy'}
        </button>
      </div>
    </form>
  );
};

export default StrategyForm;
