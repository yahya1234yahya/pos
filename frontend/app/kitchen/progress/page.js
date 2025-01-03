// app/page.js
'use client';
import KitchenNavigation from '@/components/kitchenNavigation';
import { useEffect, useState } from 'react';

export default function Progress() {


  return (
    <div className="h-full bg-gray-100">
        <KitchenNavigation />

        <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
            <div className="h-[calc(100vh-5rem)] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <span className="text-xl font-bold">Order #1233</span>
                                <span className="ml-2 bg-warning text-white px-3 py-1 rounded-full text-sm">In Progress</span>
                            </div>
                            <span className="text-gray-500">Table 2</span>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="text-lg">Iced Latte</span>
                                    <span className="text-gray-600">x3</span>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    - Extra ice
                                    - Caramel syrup
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                            <span>Waiter: Sarah</span>
                            <span>10:40 AM</span>
                        </div>
                        <div className="flex space-x-2">
                            <button onclick="updateOrderStatus('1233', 'completed')" className="flex-1 bg-secondary text-white py-3 rounded-lg hover:bg-secondary/90 transition-colors">
                                Mark as Complete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    </div>
  );
}