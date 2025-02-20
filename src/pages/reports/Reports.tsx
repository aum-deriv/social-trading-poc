import React, { useState } from 'react';
import './Reports.css';
import TabNavigation from '@components/navigation/TabNavigation';
import OpenPositions from '@modules/OpenPositions/OpenPositions';
import { Statement } from '@/modules/Statement';
import CopierOverviewContent from '@modules/CopierOverviewContent/CopierOverviewContent';

const tabs = [
  { label: 'Open Positions', key: 'open-positions' },
  { label: 'Statements', key: 'statements' },
  { label: 'Copier Overview', key: 'copier-overview' },
];

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const isCopier = JSON.parse(localStorage.getItem('auth') || 'false').user.userType === 'copier';
  const activeTabLabel = tabs.find(tab => tab.key === activeTab)?.label || tabs[0].label;

  const handleTabChange = (newLabel: string) => {
    const foundTab = tabs.find(tab => tab.label === newLabel);
    if (foundTab) {
      setActiveTab(foundTab.key);
    }
  };

  return (
    <div className="reports">
      <TabNavigation
        tabs={(isCopier ? tabs.filter(tab => tab.key !== 'copier-overview') : tabs).map(
          tab => tab.label
        )}
        activeTab={activeTabLabel}
        onTabChange={handleTabChange}
      />
      <div className="reports-content">
        {activeTab === 'open-positions' && <OpenPositions />}
        {activeTab === 'statements' && <Statement />}
        {activeTab === 'copier-overview' && <CopierOverviewContent />}
      </div>
    </div>
  );
};

export default Reports;
