'use client';
import { useState, useEffect } from 'react';
import WaiterNavigation from '@/components/waiterNavigation';
import { withAuth } from '@/middleware/authMiddleware';

const ConfirmationModal = ({ isOpen, table, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Confirmer la libération</h2>
        <p className="mb-6">
          Êtes-vous sûr de vouloir libérer la table {table.number} ?
          {table.status === 'occupied' && (
            <span className="block mt-2 text-red-600">
              Cette table est actuellement occupée. Assurez-vous que le client a payé avant de la libérer.
            </span>
          )}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchTables();
    // Set up periodic refresh
    const interval = setInterval(fetchTables, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('http://localhost/pos/POS/api/tables.php', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tables');
      }
      
      setTables(data.tables || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to load tables. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!selectedTable) return;

    try {
      const requestBody = {
        id: selectedTable.id,
        status: 'available'
      };
      
      console.log('Sending request:', requestBody);

      const response = await fetch('http://localhost/pos/POS/api/tables.php', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      // Log raw response for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse JSON response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      // Success - update the table list
      await fetchTables();
      setShowConfirmation(false);
      setSelectedTable(null);
    } catch (error) {
      console.error('Error updating table:', error);
      setError(error.message || 'Failed to update table status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <WaiterNavigation />
        <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
          <div className="text-xl text-gray-600">Loading tables...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <WaiterNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => table.status === 'occupied' && handleTableClick(table)}
              className={`
                p-6 rounded-lg shadow-md transition-all
                ${table.status === 'available' 
                  ? 'bg-green-100 cursor-default'
                  : 'bg-red-100 cursor-pointer hover:shadow-lg'
                }
              `}
            >
              <h3 className="text-lg font-bold mb-2">Table {table.number}</h3>
              <p className={`
                text-sm font-medium
                ${table.status === 'available' ? 'text-green-600' : 'text-red-600'}
              `}>
                {table.status === 'available' ? 'Disponible' : 'Occupée'}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <ConfirmationModal
          isOpen={showConfirmation}
          table={selectedTable}
          onConfirm={handleConfirm}
          onCancel={() => {
            setShowConfirmation(false);
            setSelectedTable(null);
          }}
        />
      </div>
    </div>
  );
};

export default withAuth(TablesPage, 'waiter');
