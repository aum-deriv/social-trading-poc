import React from "react";
import Table from "@/components/Table";
import { Contract } from "@/types/contract.types";
import { positionsTableColumns, TradeType } from "../../constants";
import { useTradePositionsDataMapper } from "../../hooks";
import { ContractCard } from "./ContractCard";
import { useViewport } from "@/hooks";
import "./TradePositions.css";

interface PositionsTableProps {
  contracts: Contract[];
  tradeType: TradeType;
}

const TradePositions = ({ contracts, tradeType }: PositionsTableProps) => {
  const columns = positionsTableColumns[tradeType];
  const data = useTradePositionsDataMapper(contracts, tradeType);
  const { isDesktop } = useViewport();

  return isDesktop ? (
    <Table columns={columns} data={data} />
  ) : (
    <div className="contract-card-container">
      {data.map((item) => {
        const items = columns.map((column, idx) => {
          return {
            title: column,
            value: item[idx],
          };
        });
        return <ContractCard items={items} />;
      })}
    </div>
  );
};

export default TradePositions;
