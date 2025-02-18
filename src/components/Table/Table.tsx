import React from 'react';
import './Table.css';

interface TableProps {
  data: Record<string, React.ReactNode>[];
}

const Table: React.FC<TableProps> = ({ data }) => {
  const columns = Object.keys(data[0]);

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Object.values(row).map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
