import React from "react";
import "./ContractCard.css";

interface ContractItem {
  title: string;
  value: React.ReactNode;
}

interface ContractCardProps {
  items: ContractItem[];
}

const ContractCard: React.FC<ContractCardProps> = ({ items }) => {
  return (
    <div className="contract-card">
      {items.map((item, index) => (
        <div key={index} className="contract-card-item">
          <div className="contract-card-title">{item.title}</div>
          <div className="contract-card-value">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default ContractCard;
