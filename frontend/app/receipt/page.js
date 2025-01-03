"use client";
import React, { useEffect, useState } from 'react';
let receiptData = {
    "restaurant": {
      "name": "COFFEE RESTAURANT",
      "address": "123 Coffee Street",
      "city": "Paris, France",
      "wifi": {
        "network": "COFFEE-GUEST",
        "password": "welcomecoffee"
      }
    },
    "order": {
      "id": "1234",
      "items": [
        { "name": "Espresso", "quantity": 2, "price": 7.00 },
        { "name": "Cappuccino", "quantity": 1, "price": 4.50 }
      ],
      "subtotal": 11.50,
      "total": 12.65
    }
  }
  
const Receipt = () => {
  const [currentDatetime, setCurrentDatetime] = useState('');

  useEffect(() => {
    const datetime = new Date().toLocaleString();
    setCurrentDatetime(datetime);
  }, []);

  const { restaurant, order } = receiptData;

  return (
    <div className="w-[80mm] p-6 mx-auto font-mono">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">{restaurant.name}</h1>
        <p>{restaurant.address}</p>
        <p>{restaurant.city}</p>
        <p>Date: {currentDatetime}</p>
      </div>

      <hr className="border-dashed border-black my-4" />

      <div className="text-center font-bold mb-4">
        <p>PAYMENT RECEIPT</p>
        <p>Order #{order.id}</p>
      </div>

      <hr className="border-dashed border-black my-4" />

      <div>
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between py-1">
            <span>
              {item.name} x{item.quantity}
            </span>
            <span>{item.price.toFixed(2)}€</span>
          </div>
        ))}
        <div className="flex justify-between font-bold py-1">
          <span>Subtotal</span>
          <span>{order.subtotal.toFixed(2)}€</span>
        </div>
      </div>

      <hr className="border-dashed border-black my-4" />

      <div className="flex justify-between font-bold py-2">
        <span>TOTAL</span>
        <span>{order.total.toFixed(2)}€</span>
      </div>

      <hr className="border-dashed border-black my-4" />

      <div className="text-center text-sm mt-4">
        <p>WiFi Network: {restaurant.wifi.network}</p>
        <p>Password: {restaurant.wifi.password}</p>
      </div>

      <div className="text-center text-sm mt-4">
        <p className="font-bold">Thank you for your visit!</p>
        <p>See you soon!</p>
      </div>
    </div>
  );
};

export default Receipt;
