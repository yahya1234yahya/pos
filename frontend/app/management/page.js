// app/page.js
'use client';
import ManagementNavigation from '@/components/managementNavigation';
import { useEffect, useState } from 'react';

export default function Overview() {


  return (
    <div className="h-full bg-gray-100">
        <ManagementNavigation />

        <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
            <div id="overviewSection" className="scrollable-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg text-gray-600 mb-2">Today's Revenue</h3>
                        <p className="text-3xl font-bold text-primary">$1,234.56</p>
                        <p className="text-sm text-gray-500 mt-2">+12.3% from yesterday</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg text-gray-600 mb-2">Customers Today</h3>
                        <p className="text-3xl font-bold text-primary">145</p>
                        <p className="text-sm text-gray-500 mt-2">+5% from yesterday</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg text-gray-600 mb-2">Items Ordered</h3>
                        <p className="text-3xl font-bold text-primary">387</p>
                        <p className="text-sm text-gray-500 mt-2">Most popular: Cappuccino</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg text-gray-600 mb-2">Active Staff</h3>
                        <p className="text-3xl font-bold text-primary">8</p>
                        <p className="text-sm text-gray-500 mt-2">2 kitchen, 6 waiters</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Today's Waiters Report</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-4">Waiter</th>
                                    <th className="p-4">Orders Taken</th>
                                    <th className="p-4">Total Sales</th>
                                    <th className="p-4">Items Sold</th>
                                    <th className="p-4">Avg Order Value</th>
                                    <th className="p-4">Most Sold Item</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="p-4">John Doe</td>
                                    <td className="p-4">25</td>
                                    <td className="p-4">$487.50</td>
                                    <td className="p-4">78</td>
                                    <td className="p-4">$19.50</td>
                                    <td className="p-4">Cappuccino</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active</span></td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="p-4">Jane Smith</td>
                                    <td className="p-4">18</td>
                                    <td className="p-4">$356.25</td>
                                    <td className="p-4">52</td>
                                    <td className="p-4">$19.79</td>
                                    <td className="p-4">Latte</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active</span></td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="p-4">Mike Johnson</td>
                                    <td className="p-4">22</td>
                                    <td className="p-4">$390.75</td>
                                    <td className="p-4">65</td>
                                    <td className="p-4">$17.76</td>
                                    <td className="p-4">Espresso</td>
                                    <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded">Off Duty</span></td>
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