// app/page.js
'use client';
import { useEffect, useState } from 'react';
import ManagementNavigation from '@/components/managementNavigation';

export default function Menu() {


  return (
    <div className="h-full bg-gray-100">
       <ManagementNavigation />

        <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
            <div id="menuSection" className="scrollable-content">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Add Menu Item</h3>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Item Name</label>
                                <input type="text" className="w-full p-3 border rounded-lg" placeholder="Enter item name" />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Category</label>
                                <select className="w-full p-3 border rounded-lg">
                                    <option>Hot Drinks</option>
                                    <option>Cold Drinks</option>
                                    <option>Food</option>
                                    <option>Desserts</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Price</label>
                                <input type="number" step="0.01" className="w-full p-3 border rounded-lg" placeholder="0.00" />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-gray-700 mb-2">Description</label>
                                <textarea className="w-full p-3 border rounded-lg" rows="2" placeholder="Enter item description"></textarea>
                            </div>
                            
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-gray-700 mb-2">Customization Options</label>
                                <div className="space-y-4" id="customizationOptions">
                                    <div className="border rounded-lg p-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-lg font-semibold">Option Group</h4>
                                            <button type="button" className="text-primary hover:text-primary/90">
                                                + Add Option Group
                                            </button>
                                        </div>
                                        <div id="optionGroups" className="space-y-4">
                                            <div className="option-group border-l-4 border-primary pl-4 space-y-3">
                                                <div className="flex items-center space-x-4">
                                                    <input type="text" className="flex-1 p-2 border rounded" placeholder="Group Name (e.g., Sugar Level)" />
                                                    <select className="p-2 border rounded">
                                                        <option>Single Select</option>
                                                        <option>Multi Select</option>
                                                    </select>
                                                    <button type="button" className="text-red-500 hover:text-red-700">Remove</button>
                                                </div>
                                                <div className="options-list space-y-2">
                                                    <div className="flex items-center space-x-4">
                                                        <input type="text" className="flex-1 p-2 border rounded" placeholder="Option Name" />
                                                        <input type="number" className="w-24 p-2 border rounded" placeholder="Extra Cost" step="0.01" />
                                                        <button type="button" className="text-red-500 hover:text-red-700">Remove</button>
                                                    </div>
                                                </div>
                                                <button type="button" className="text-sm text-primary hover:text-primary/90">
                                                    + Add Option
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 lg:col-span-3">
                                <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90">
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
                    <h3 className="text-xl font-bold mb-4">Menu Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-4">Item</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-4">Cappuccino</td>
                                    <td className="p-4">Hot Drinks</td>
                                    <td className="p-4">$4.50</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">Available</span></td>
                                    <td className="p-4">
                                        <button className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
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