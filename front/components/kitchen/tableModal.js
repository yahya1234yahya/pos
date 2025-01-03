'use client';
import { useState, useEffect } from 'react';

const TableModal = ({ onTableSelect, onClose }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('http://localhost/pos/POS/api/tables.php', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setTables(data.tables);
      } else {
        setError('Failed to fetch tables');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Error fetching tables');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Chargement des tables...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 h-[70vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Sélectionner une table</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="text-center text-red-600 mb-4">
            <p>{error}</p>
            <button
              onClick={fetchTables}
              className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                <span>Occupée</span>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 overflow-y-auto">
              {tables.map((table) => {
                const isOccupied = table.status === 'occupied';
                const isSelected = selectedTable?.id === table.id;
                
                return (
                  <button
                    key={table.id}
                    onClick={() => {
                      setSelectedTable(table);
                      onTableSelect(table);
                    }}
                    className={`p-4 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-primary text-white'
                        : isOccupied
                        ? 'bg-orange-100 border-2 border-orange-200 hover:border-primary'
                        : 'bg-white border-2 border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="text-lg font-bold">Table {table.number}</div>
                    <div
                      className={`text-sm ${
                        isSelected
                          ? 'text-white'
                          : isOccupied
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {isOccupied ? 'Occupée' : 'Disponible'}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TableModal;
