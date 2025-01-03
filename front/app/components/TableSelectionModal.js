'use client';
import { useState, useEffect } from 'react';
import TableLayout from './TableLayout';

const TableSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchTables();
    }
  }, [isOpen]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost/pos/POS/api/tables.php', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tables');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch tables');
      }

      setTables(data.tables);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleConfirm = () => {
    if (selectedTable) {
      onSelect(selectedTable);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Table</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading tables...</div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <TableLayout
                tables={tables}
                onTableSelect={handleTableSelect}
                selectedTable={selectedTable}
                mode="select"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedTable}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  selectedTable
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Confirm Selection
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TableSelectionModal;
