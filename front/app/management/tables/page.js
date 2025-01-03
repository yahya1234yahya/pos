'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/middleware/authMiddleware';
import TableLayout from '../../components/TableLayout';

function TablesPage() {
  const router = useRouter();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [newTable, setNewTable] = useState({ number: '', floor: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // Fetch tables
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

  useEffect(() => {
    fetchTables();
  }, []);

  // Create table
  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await fetch('http://localhost/pos/POS/api/tables.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTable),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create table');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to create table');
      }

      setTables([...tables, data.table]);
      setNewTable({ number: '', floor: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error creating table:', err);
      setError(err.message);
    }
  };

  // Update table
  const handleUpdateTable = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await fetch('http://localhost/pos/POS/api/tables.php', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTable),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update table');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to update table');
      }

      setTables(tables.map(table => 
        table.id === editingTable.id ? data.table : table
      ));
      setEditingTable(null);
    } catch (err) {
      console.error('Error updating table:', err);
      setError(err.message);
    }
  };

  // Delete table
  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch('http://localhost/pos/POS/api/tables.php', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: tableId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete table');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete table');
      }

      setTables(tables.filter(table => table.id !== tableId));
      setSelectedTable(null);
    } catch (err) {
      console.error('Error deleting table:', err);
      setError(err.message);
    }
  };

  // Update table status
  const handleStatusChange = async (tableId, newStatus) => {
    try {
      setError(null);
      const table = tables.find(t => t.id === tableId);
      const response = await fetch('http://localhost/pos/POS/api/tables.php', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: tableId,
          status: newStatus,
          number: table.number,
          floor: table.floor
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update table status');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to update table status');
      }

      setTables(tables.map(t => 
        t.id === tableId ? data.table : t
      ));
    } catch (err) {
      console.error('Error updating table status:', err);
      setError(err.message);
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setEditingTable(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="h-full flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading tables...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
            <p className="mt-2 text-gray-600">Manage restaurant tables and their status</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add New Table
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Add Table Form */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Table</h2>
            <form onSubmit={handleCreateTable} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Table Number
                  </label>
                  <input
                    type="number"
                    required
                    value={newTable.number}
                    onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Floor
                  </label>
                  <input
                    type="number"
                    required
                    value={newTable.floor}
                    onChange={(e) => setNewTable({ ...newTable, floor: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Table
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table Layout */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Table Layout</h2>
            <TableLayout
              tables={tables}
              onTableSelect={handleTableSelect}
              selectedTable={selectedTable}
              mode="manage"
            />
          </div>

          {/* Selected Table Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Table Details</h2>
            {selectedTable ? (
              editingTable?.id === selectedTable.id ? (
                <form onSubmit={handleUpdateTable} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Table Number
                    </label>
                    <input
                      type="number"
                      required
                      value={editingTable.number}
                      onChange={(e) => setEditingTable({ ...editingTable, number: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Floor
                    </label>
                    <input
                      type="number"
                      required
                      value={editingTable.floor}
                      onChange={(e) => setEditingTable({ ...editingTable, floor: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditingTable(null)}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Table Number
                    </label>
                    <p className="mt-1 text-lg">{selectedTable.number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Floor
                    </label>
                    <p className="mt-1 text-lg">{selectedTable.floor}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={selectedTable.status}
                      onChange={(e) => handleStatusChange(selectedTable.id, e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setEditingTable(selectedTable)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTable(selectedTable.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            ) : (
              <p className="text-gray-500">Select a table to view and edit details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(TablesPage, ['manager', 'admin']);
