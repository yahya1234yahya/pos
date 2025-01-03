'use client';
import { useState, useEffect } from 'react';

const Floor = ({ onTableSelect }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost/pos/POS/api/tables.php', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setTables(data.tables || []);
        } else {
          setError(data.message || 'Failed to fetch tables');
        }
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError('Error fetching tables');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
    const interval = setInterval(fetchTables, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Sélectionner une Table</h2>
        <p className="text-gray-600 text-center mb-6">Choisissez une table pour commencer la commande</p>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Sélectionner une Table</h2>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  const floorTables = tables.filter(table => table.floor === selectedFloor);

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Sélectionner une Table</h2>
      <p className="text-gray-600 text-center mb-6">Choisissez une table pour commencer la commande</p>
      
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setSelectedFloor(1)}
          className={`px-4 py-2 rounded ${
            selectedFloor === 1
              ? 'bg-indigo-600 text-white'
              : 'bg-white border hover:bg-gray-50'
          }`}
        >
          Étage 1
        </button>
        <button
          onClick={() => setSelectedFloor(2)}
          className={`px-4 py-2 rounded ${
            selectedFloor === 2
              ? 'bg-indigo-600 text-white'
              : 'bg-white border hover:bg-gray-50'
          }`}
        >
          Étage 2
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {floorTables.map((table) => (
          <button
            key={table.id}
            onClick={() => table.status !== 'occupied' && onTableSelect(table)}
            className={`p-6 rounded-lg border text-center ${
              table.status === 'occupied'
                ? 'bg-gray-50 cursor-not-allowed'
                : 'hover:border-indigo-600 cursor-pointer'
            }`}
          >
            <div className="text-lg font-bold mb-2">T{table.number}</div>
            <div className={`text-sm ${
              table.status === 'occupied'
                ? 'text-orange-500'
                : 'text-green-500'
            }`}>
              {table.status === 'occupied' ? 'Occupée' : 'Disponible'}
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-4 mt-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
          <span>Occupée</span>
        </div>
      </div>
    </div>
  );
};

export default Floor;
