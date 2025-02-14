import React, { useState } from "react";
import "./Reports.css";
import TabNavigation from "@components/navigation/TabNavigation";
import OpenPositions from "@modules/OpenPositions/OpenPositions";

const Reports: React.FC = () => {
  const tabs = [
    { label: "Open Positions", key: "open-positions" },
    { label: "Statements", key: "statements" },
    { label: "Copier Overview", key: "copier-overview" },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].key);

  const activeTabLabel =
    tabs.find((tab) => tab.key === activeTab)?.label || tabs[0].label;

  const handleTabChange = (newLabel: string) => {
    const foundTab = tabs.find((tab) => tab.label === newLabel);
    if (foundTab) {
      setActiveTab(foundTab.key);
    }
  };

  return (
    <div className="reports-container">
      <TabNavigation
        tabs={tabs.map((tab) => tab.label)}
        activeTab={activeTabLabel}
        onTabChange={handleTabChange}
      />
      <div className="reports-content">
        {activeTab === "open-positions" && <OpenPositions />}
        {activeTab === "statements" && <div>Statements Content</div>}
        {activeTab === "copier-overview" && <div>Copier Overview Content</div>}
      </div>
    </div>
  );
};

export default Reports;
