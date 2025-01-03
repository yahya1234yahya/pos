'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost/pos/POS/api';

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rfid: '',
    floor: ''
  });

  // Check if user is admin
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    setCurrentUser(user);
  }, [router]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users.php`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        router.push('/');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch users');
      }
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/users.php`,
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSuccess('User created successfully!');
        setShowModal(false);
        setFormData({
          name: '',
          role: '',
          rfid: '',
          floor: ''
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      ...user
    });
    setShowModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `${API_BASE_URL}/users.php`,
        {
          ...formData,
          id: selectedUser.id
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSuccess('User updated successfully!');
        setShowModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/users.php`,
        {
          data: { id: selectedUser.id },
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSuccess('User deleted successfully!');
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'waiter':
        return 'bg-green-100 text-green-800';
      case 'kitchen':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) {
    return null; // Don't render anything while checking auth
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => {
            setSelectedUser(null);
            setFormData({
              name: '',
              role: '',
              rfid: '',
              floor: ''
            });
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add New User
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RFID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Floor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.rfid || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.floor || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {selectedUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={selectedUser ? handleEditSubmit : handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">RFID</label>
                  <input
                    type="text"
                    name="rfid"
                    value={formData.rfid}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="waiter">Waiter</option>
                    <option value="kitchen">Kitchen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Floor</label>
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                {selectedUser && (
                  <div>
                    <label className="block text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  {loading ? 'Saving...' : selectedUser ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Delete User</h3>
            <p className="mb-6">
              Are you sure you want to delete {selectedUser.name}?
            </p>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                  setError('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
