// app/page.js
'use client';
import KitchenNavigation from '@/components/kitchenNavigation';
import { useEffect, useState } from 'react';

export default function Complete() {


  return (
    <div className="h-full bg-gray-100">
        <KitchenNavigation />

        <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
            <div className="h-[calc(100vh-5rem)] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                    <div className="bg-white rounded-lg shadow-lg p-6 opacity-75">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <span className="text-xl font-bold">Order #1232</span>
                                <span className="ml-2 bg-secondary text-white px-3 py-1 rounded-full text-sm">Completed</span>
                            </div>
                            <span className="text-gray-500">Table 1</span>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="text-lg">Espresso</span>
                                    <span className="text-gray-600">x1</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Waiter: John</span>
                            <span>10:35 AM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    </div>
  );
}