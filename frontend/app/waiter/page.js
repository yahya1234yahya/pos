// app/page.js
'use client';
import { useState } from 'react';
import WaiterNavigation from '@/components/waiterNavigation';
import Categories from '@/components/kitchen/categories';
import Menu from '@/components/kitchen/menu';
import Order from '@/components/kitchen/order';
import Floor from '@/components/kitchen/floor';

export default function Waiter() {
  const [selectedCategory, setSelectedCategory] = useState('hot-drinks');
  const [orderItems, setOrderItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const addToOrder = (item) => {
    const existingItem = orderItems.find((orderItem) => orderItem.name === item.name);
    if (existingItem) {
      setOrderItems(
        orderItems.map((orderItem) =>
          orderItem.name === item.name
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        )
      );
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (itemName) => {
    setOrderItems(orderItems.filter((item) => item.name !== itemName));
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  return (
    <div className="h-full bg-gray-100">
      <WaiterNavigation />

      <div className="content-container" style={{ height: `calc(100vh - 5rem)`, overflow: 'hidden' }}>
        <div id="orderInterface" className="h-full">
          <div className="flex h-full">

            {!selectedTable ? (
              <Floor onTableSelect={handleTableSelect} />
            ) : (
              <>
                <Categories selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
                <Menu selectedCategory={selectedCategory} onAddToOrder={addToOrder} />
                <Order orderItems={orderItems} onRemoveFromOrder={removeFromOrder} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
