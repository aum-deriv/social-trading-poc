import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Strategy } from '@/types/strategy.types';
import type { CopyRelationship } from '@/types/copy.types';
import { useAuth } from '@/context/AuthContext';
import StrategyListItem from '@/components/strategy/StrategyListItem';
import './StrategyList.css';

interface StrategyListProps {
  strategies: Strategy[];
  onCopyStrategy?: (strategyId: string, isCopying: boolean) => Promise<void>;
  isOwnProfile?: boolean;
}

const StrategyList = ({ strategies, onCopyStrategy, isOwnProfile = false }: StrategyListProps) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [copyRelations, setCopyRelations] = useState<Record<string, boolean>>({});
  const [selectedStrategies, setSelectedStrategies] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCopyRelations = async () => {
      if (!currentUser) return;

      const response = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/copyRelationships?copierId=${currentUser.id}`
      );
      if (!response.ok) return;

      const relations: CopyRelationship[] = await response.json();
      const relationMap = relations.reduce((acc: Record<string, boolean>, rel) => {
        acc[rel.strategyId] = rel.status === 'active';
        return acc;
      }, {});
      setCopyRelations(relationMap);
    };

    fetchCopyRelations();
  }, [currentUser]);

  const handleStrategyClick = (strategyId: string) => {
    navigate(`/strategies/${strategyId}`);
  };

  const handleSelectStrategy = (strategyId: string, checked: boolean) => {
    setSelectedStrategies(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(strategyId);
      } else {
        newSet.delete(strategyId);
      }
      return newSet;
    });
  };

  const handleCopySelected = async () => {
    if (!onCopyStrategy) return;

    try {
      // Copy each selected strategy
      for (const strategyId of selectedStrategies) {
        await onCopyStrategy(strategyId, false);
      }
      // Clear selections after copying
      setSelectedStrategies(new Set());
    } catch (error) {
      console.error('Error copying selected strategies:', error);
    }
  };

  const showCopyOptions = onCopyStrategy && currentUser?.userType === 'copier' && !isOwnProfile;

  return (
    <div className="strategy-list">
      {showCopyOptions && selectedStrategies.size > 0 && (
        <div className="strategy-list__header">
          <button className="copy-selected-button" onClick={handleCopySelected}>
            Copy Selected Strategies ({selectedStrategies.size})
          </button>
        </div>
      )}
      {strategies.map(strategy => (
        <div key={strategy.id} className="strategy-item">
          {showCopyOptions && (
            <div className="strategy-item__checkbox">
              <input
                type="checkbox"
                checked={selectedStrategies.has(strategy.id)}
                onChange={e => handleSelectStrategy(strategy.id, e.target.checked)}
              />
            </div>
          )}
          <StrategyListItem
            strategy={strategy}
            showCopyButton={showCopyOptions}
            isCopying={copyRelations[strategy.id]}
            onCopy={onCopyStrategy}
            onClick={handleStrategyClick}
          />
        </div>
      ))}
      {strategies.length === 0 && <div className="strategy-list--empty">No strategies found</div>}
    </div>
  );
};

export default StrategyList;
