'use client';

const Order = ({ orderItems, onRemoveFromOrder }) => {
  const calculateTotal = () => {
    let subtotal = 0;
    orderItems.forEach(item => {
      subtotal += parseFloat(item.price.replace('$', '')) * item.quantity;
    });
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="w-96 bg-white shadow-lg flex flex-col">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-2xl font-bold cart-header">Commande en Cours</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {orderItems.map((item, index) => (
          <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-xl font-semibold">{item.name}</div>
              <div className="text-lg text-gray-600">{item.description}</div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onRemoveFromOrder(item.name)}
                className="w-10 h-10 rounded-full bg-gray-200 text-xl flex items-center justify-center"
              >
                -
              </button>
              <span className="text-xl font-semibold">{item.quantity}</span>
              <button
                onClick={() => onRemoveFromOrder(item.name)} // Add logic to increase the quantity
                className="w-10 h-10 rounded-full bg-gray-200 text-xl flex items-center justify-center"
              >
                +
              </button>
              <span className="text-xl font-semibold ml-4">{item.price}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Sous-total</span>
            <span>{`$${subtotal.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">TVA (10%)</span>
            <span>{`$${tax.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>{`$${total.toFixed(2)}`}</span>
          </div>
        </div>
        <div className="space-y-3">
          <button className="w-full bg-secondary text-white py-4 rounded-lg hover:bg-green-600 text-xl">
            Passer la Commande
          </button>
          <button className="w-full bg-primary text-white py-4 rounded-lg hover:bg-blue-600 text-xl">
            Procéder au Paiement
          </button>
          <button className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-lg hover:bg-gray-50 text-xl">
            Effacer la Commande
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;
