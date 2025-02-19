import { useState } from 'react';
import { TopLeadersSection } from '../TopLeadersSection';
import SuggestedLeadersSection from '../SuggestedLeadersSection';
import Chip from '@/components/Chip';
import './LeadersSection.css';

type LeaderTab = 'top' | 'suggested';

export default function LeadersSection() {
  const [activeTab, setActiveTab] = useState<LeaderTab>('top');

  return (
    <div className="leaders-section">
      <div className="leaders-section__tabs">
        <Chip active={activeTab === 'top'} onClick={() => setActiveTab('top')}>
          Top Leaders
        </Chip>
        <Chip active={activeTab === 'suggested'} onClick={() => setActiveTab('suggested')}>
          AI Suggested
        </Chip>
      </div>
      {activeTab === 'top' ? <TopLeadersSection /> : <SuggestedLeadersSection />}
    </div>
  );
}
