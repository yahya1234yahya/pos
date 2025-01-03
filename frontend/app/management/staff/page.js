// app/page.js
'use client';
import { useEffect, useState } from 'react';
import ManagementNavigation from '@/components/managementNavigation';

export default function Staff() {
  return (
    <div className="h-full bg-gray-100">
        <ManagementNavigation />

        <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
            <div id="staffSection" className="scrollable-content">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Add New Staff</h3>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Name</label>
                                <input type="text" className="w-full p-3 border rounded-lg" placeholder="Enter name" />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Role</label>
                                <select className="w-full p-3 border rounded-lg">
                                    <option>Waiter</option>
                                    <option>Kitchen Staff</option>
                                    <option>Manager</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">RFID Badge ID</label>
                                <input type="text" className="w-full p-3 border rounded-lg" placeholder="Scan RFID badge" />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary/90">
                                    Add Staff Member
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
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-4">John Doe</td>
                                    <td className="p-4">Waiter</td>
                                    <td className="p-4">#12345</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active</span></td>
                                    <td className="p-4">
                                        <button className="text-red-500 hover:text-red-700">Remove</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>


    </div>
  );
}