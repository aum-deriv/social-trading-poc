import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Strategy } from '@/types/strategy.types';
import type { CopyRelationship } from '@/types/copy.types';
import { useAuth } from '@/context/AuthContext';
import StrategyListItem from '@/components/strategy/StrategyListItem';
import Chip from '@/components/Chip';
import './StrategyList.css';

interface StrategyListProps {
  strategies: Strategy[];
  onCopyStrategy?: (strategyId: string, isCopying: boolean) => Promise<boolean>;
  isOwnProfile?: boolean;
}

const StrategyList = ({ strategies, onCopyStrategy, isOwnProfile = false }: StrategyListProps) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [copyRelations, setCopyRelations] = useState<Record<string, boolean>>({});
  const [selectedStrategies, setSelectedStrategies] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'copying' | 'not-copying'>('not-copying');
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    const timer = setTimeout(() => {
      setShowCheckboxes(true);
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;

    // If scrolled more than 10px, cancel long press
    const scrollDiff = Math.abs(e.touches[0].clientY - touchStartY);
    if (scrollDiff > 10) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStartY(null);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

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

  const handleSelectedAction = async () => {
    if (!onCopyStrategy) return;

    try {
      // Handle based on active filter
      const isCopying = isOwnProfile ? true : activeFilter === 'copying';
      const results = await Promise.all(
        Array.from(selectedStrategies).map(strategyId => onCopyStrategy(strategyId, isCopying))
      );

      // Update copyRelations for successful actions
      const newCopyRelations = { ...copyRelations };
      Array.from(selectedStrategies).forEach((strategyId, index) => {
        if (results[index]) {
          newCopyRelations[strategyId] = !isCopying; // Toggle the copy status
        }
      });
      setCopyRelations(newCopyRelations);

      // Clear selections after action
      setSelectedStrategies(new Set());
      setShowCheckboxes(false);
    } catch (error) {
      console.error('Error handling selected strategies:', error);
    }
  };

  // Only show copy options if user is a copier
  const showCopyOptions = onCopyStrategy && currentUser?.userType === 'copier';
  // Hide all copy functionality for leaders
  const isLeader = currentUser?.userType === 'leader';

  // Split strategies based on copy status
  const copyingStrategies = strategies.filter(strategy => copyRelations[strategy.id]);
  const notCopyingStrategies = strategies.filter(strategy => !copyRelations[strategy.id]);

  // In own profile, only show copying strategies. Otherwise, show based on filter
  const displayStrategies = isOwnProfile
    ? copyingStrategies
    : activeFilter === 'copying'
      ? copyingStrategies
      : notCopyingStrategies;

  return (
    <div className="strategy-list">
      {showCopyOptions && !isOwnProfile && (
        <div className="strategy-list__filters">
          <Chip
            onClick={() => setActiveFilter('not-copying')}
            active={activeFilter === 'not-copying'}
          >
            Start Copying ({notCopyingStrategies.length})
          </Chip>
          <Chip onClick={() => setActiveFilter('copying')} active={activeFilter === 'copying'}>
            Stop Copying ({copyingStrategies.length})
          </Chip>
        </div>
      )}
      {!isLeader && (showCopyOptions || isOwnProfile) && showCheckboxes && (
        <div className="strategy-list__header">
          <div className="strategy-list__header-actions">
            {selectedStrategies.size > 0 && (
              <button className="copy-selected-button" onClick={handleSelectedAction}>
                {isOwnProfile || activeFilter === 'copying'
                  ? `Stop Copying Selected (${selectedStrategies.size})`
                  : `Copy Selected Strategies (${selectedStrategies.size})`}
              </button>
            )}
            <button
              className="cancel-selection-button"
              onClick={() => {
                setShowCheckboxes(false);
                setSelectedStrategies(new Set());
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {displayStrategies.length === 0 ? (
        <div className="strategy-list--empty">
          {isOwnProfile
            ? "You haven't copied any strategies yet"
            : activeFilter === 'copying'
              ? "You're not copying any strategies yet"
              : 'No strategies available to copy'}
        </div>
      ) : (
        displayStrategies.map(strategy => (
          <div
            key={strategy.id}
            className="strategy-item"
            {...(!isLeader
              ? {
                  onTouchStart: handleTouchStart,
                  onTouchMove: handleTouchMove,
                  onTouchEnd: handleTouchEnd,
                  onTouchCancel: handleTouchEnd,
                }
              : {})}
          >
            {!isLeader && (showCopyOptions || isOwnProfile) && showCheckboxes && (
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
              showCopyButton={!isLeader && (!isOwnProfile || copyRelations[strategy.id])}
              isCopying={copyRelations[strategy.id]}
              onCopy={async (strategyId: string, isCopying: boolean) => {
                if (onCopyStrategy) {
                  const success = await onCopyStrategy(strategyId, isCopying);
                  if (success) {
                    setCopyRelations(prev => ({
                      ...prev,
                      [strategyId]: !isCopying,
                    }));
                  }
                }
              }}
              onClick={handleStrategyClick}
            />
          </div>
        ))
      )}
      {!showCopyOptions && strategies.length === 0 && (
        <div className="strategy-list--empty">No strategies found</div>
      )}
    </div>
  );
};

export default StrategyList;
