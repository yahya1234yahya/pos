'use client';
import { useState, useEffect } from 'react';

const TableLayout = ({ tables, onTableSelect, selectedTable = null, mode = 'select' }) => {
  const [layout, setLayout] = useState([
    // Top row
    { x: 20, y: 10, width: 15, height: 15 },
    { x: 45, y: 10, width: 15, height: 15 },
    { x: 70, y: 10, width: 15, height: 15 },
    
    // Left column
    { x: 20, y: 35, width: 15, height: 15 },
    { x: 20, y: 60, width: 15, height: 15 },
    { x: 20, y: 85, width: 15, height: 15 },
    
    // Center area
    { x: 45, y: 35, width: 15, height: 15 },
    { x: 45, y: 60, width: 15, height: 15 },
    { x: 45, y: 85, width: 15, height: 15 },
    
    // Right position
    { x: 70, y: 85, width: 15, height: 15 },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#4ade80'; // green-400
      case 'occupied':
        return '#f87171'; // red-400
      case 'reserved':
        return '#fbbf24'; // yellow-400
      case 'maintenance':
        return '#9ca3af'; // gray-400
      default:
        return '#9ca3af'; // gray-400
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg p-4">
      {/* Restaurant Layout Border */}
      <div className="absolute inset-0 m-4 border-2 border-gray-300 rounded-lg">
        {/* Inner Layout Section */}
        <div className="absolute left-[25%] top-[25%] w-[50%] h-[75%] border-2 border-gray-300"></div>
      </div>

      {/* Tables */}
      {tables.map((table, index) => {
        if (index >= layout.length) return null; // Skip if we don't have a position for this table
        
        const position = layout[index];
        const isSelected = selectedTable && selectedTable.id === table.id;
        const statusColor = getStatusColor(table.status);

        return (
          <div
            key={table.id}
            onClick={() => onTableSelect(table)}
            className={`absolute cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-500 scale-110' : ''
            }`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.width}%`,
              height: `${position.height}%`,
              backgroundColor: statusColor,
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <span className="font-bold text-white text-sm">
              {table.number}
            </span>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1 bg-white p-2 rounded-lg shadow text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f87171]"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#fbbf24]"></div>
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#9ca3af]"></div>
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  );
};

export default TableLayout;
