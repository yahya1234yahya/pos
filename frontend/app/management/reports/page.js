// app/page.js
'use client';
import { useEffect, useState } from 'react';
import ManagementNavigation from '@/components/managementNavigation';

export default function Reports() {
  return (
    <div className="h-full bg-gray-100">
        <ManagementNavigation />
        <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
            <div id="reportsSection" className="scrollable-content ">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label className="block text-gray-700 mb-2">Date Range</label>
                            <div className="flex space-x-4">
                                <input type="text" id="dateFrom" className="flex-1 p-3 border rounded-lg" placeholder="From" />
                                <input type="text" id="dateTo" className="flex-1 p-3 border rounded-lg" placeholder="To" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-gray-700 mb-2">Quick Select</label>
                            <select className="w-full p-3 border rounded-lg">
                                <option>Today</option>
                                <option>Yesterday</option>
                                <option>Last 7 days</option>
                                <option>This month</option>
                                <option>Last month</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90">
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
                    <h3 className="text-xl font-bold mb-4">Waiter Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-4">Waiter</th>
                                    <th className="p-4">Orders</th>
                                    <th className="p-4">Items Sold</th>
                                    <th className="p-4">Total Sales</th>
                                    <th className="p-4">Avg Order Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-4">John Doe</td>
                                    <td className="p-4">45</td>
                                    <td className="p-4">156</td>
                                    <td className="p-4">$789.50</td>
                                    <td className="p-4">$17.54</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
                    <h3 className="text-xl font-bold mb-4">Sales Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h4 className="text-lg text-gray-600 mb-2">Total Revenue</h4>
                            <p className="text-3xl font-bold text-primary">$4,567.89</p>
                        </div>
                        <div>
                            <h4 className="text-lg text-gray-600 mb-2">Total Orders</h4>
                            <p className="text-3xl font-bold text-primary">234</p>
                        </div>
                        <div>
                            <h4 className="text-lg text-gray-600 mb-2">Total Items</h4>
                            <p className="text-3xl font-bold text-primary">789</p>
                        </div>
                        <div>
                            <h4 className="text-lg text-gray-600 mb-2">Avg Order Value</h4>
                            <p className="text-3xl font-bold text-primary">$19.52</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>


    </div>
  );
}