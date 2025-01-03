// app/page.js
'use client';
import { useEffect, useState } from 'react';
import ManagementNavigation from '@/components/managementNavigation'

export default function Settings() {


  return (
    <div className="h-full bg-gray-100">
       <ManagementNavigation />

        <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
            <div id="settingsSection" className="scrollable-content">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Receipt Settings</h3>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 mb-2">Restaurant Name</label>
                                <input type="text" className="w-full p-3 border rounded-lg" placeholder="Enter restaurant name" />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Phone Number</label>
                                <input type="text" className="w-full p-3 border rounded-lg" placeholder="Enter phone number" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 mb-2">Address</label>
                                <textarea className="w-full p-3 border rounded-lg" rows="2" placeholder="Enter full address"></textarea>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">WiFi Network</label>
                                <input type="text" className="w-full p-3 border rounded-lg" placeholder="Enter WiFi network name" />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">WiFi Password</label>
                                <input type="text" className="w-full p-3 border rounded-lg" placeholder="Enter WiFi password" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 mb-2">Receipt Footer Message</label>
                                <textarea className="w-full p-3 border rounded-lg" rows="2" placeholder="Enter thank you message or promotional text"></textarea>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Tax Rate (%)</label>
                                <input type="number" step="0.01" className="w-full p-3 border rounded-lg" placeholder="Enter tax rate" />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Service Charge (%)</label>
                                <input type="number" step="0.01" className="w-full p-3 border rounded-lg" placeholder="Enter service charge" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90">
                                Save Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>


    </div>
  );
}