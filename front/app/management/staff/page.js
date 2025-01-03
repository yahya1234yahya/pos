'use client';
import { useEffect, useState } from 'react';
import { withAuth } from '@/middleware/authMiddleware';

function Staff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'waiter',
    rfid: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/pos/POS/api/users.php', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost/pos/POS/api/users.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Reset form
        setFormData({
          name: '',
          role: 'waiter',
          rfid: ''
        });
        // Refresh users list
        await fetchUsers();
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost/pos/POS/api/users.php`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchUsers();
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-100">
      <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
        <div id="staffSection" className="scrollable-content">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Add New Staff</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  >
                    <option value="waiter">Waiter</option>
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">RFID Badge ID</label>
                  <input
                    type="text"
                    name="rfid"
                    value={formData.rfid}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Scan RFID badge"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
                  >
                    {loading ? 'Adding...' : 'Add Staff Member'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
            <h3 className="text-xl font-bold mb-4">Staff List</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-4">Name</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Badge ID</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !users.length ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center">
                        No staff members found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-4">{user.name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'waiter' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">{user.rfid}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 disabled:text-red-300"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Staff, 'admin');