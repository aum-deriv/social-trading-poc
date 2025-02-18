import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Strategy } from '@/types/strategy.types';
import { useAuth } from '@/context/AuthContext';
import StrategyListItem from './components/StrategyListItem/StrategyListItem';
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

  useEffect(() => {
    const fetchCopyRelations = async () => {
      if (!currentUser) return;

      const response = await fetch(
        `${import.meta.env.VITE_JSON_SERVER_URL}/copyRelationships?copierId=${currentUser.id}`
      );
      if (!response.ok) return;

      const relations = await response.json();
      const relationMap = relations.reduce((acc: Record<string, boolean>, rel: any) => {
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

  return (
    <div className="strategy-list">
      {strategies.map(strategy => (
        <StrategyListItem
          key={strategy.id}
          strategy={strategy}
          showCopyButton={onCopyStrategy && (!isOwnProfile || currentUser?.userType !== 'leader')}
          isCopying={copyRelations[strategy.id]}
          onCopy={onCopyStrategy}
          onClick={handleStrategyClick}
        />
      ))}
      {strategies.length === 0 && <div className="strategy-list--empty">No strategies found</div>}
    </div>
  );
};

export default StrategyList;
