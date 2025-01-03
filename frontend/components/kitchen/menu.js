'use client';

const Menu = ({ selectedCategory, onAddToOrder }) => {
  const menuItems = {
    'hot-drinks': [
      { name: 'Expresso', description: 'Shot classique d\'expresso', price: '$3.50' },
      { name: 'Cappuccino', description: 'Espresso with steamed milk', price: '$4.50' },
      { name: 'Iced Latte', description: 'Cold espresso with milk', price: '$4.50' },
    ],
    'cold-drinks': [
      { name: 'Iced Coffee', description: 'Chilled coffee served over ice', price: '$3.00' },
      { name: 'Lemonade', description: 'Freshly squeezed lemonade', price: '$2.50' },
    ],
    'food': [
      { name: 'Croissant', description: 'Flaky butter pastry', price: '$2.00' },
      { name: 'Sandwich', description: 'Turkey and cheese sandwich', price: '$5.00' },
    ],
    'desserts': [
      { name: 'Chocolate Cake', description: 'Rich chocolate cake', price: '$4.00' },
      { name: 'Ice Cream', description: 'Vanilla ice cream with toppings', price: '$3.00' },
    ],
    'snacks': [
      { name: 'Chips', description: 'Crunchy potato chips', price: '$1.50' },
      { name: 'Nuts', description: 'Salted mixed nuts', price: '$2.00' },
    ],
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50" id="menu-items">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 menu-section" id={selectedCategory}>
        {menuItems[selectedCategory]?.map((item, index) => (
          <button
            key={index}
            onClick={() => onAddToOrder(item)}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl text-left"
          >
            <div className="text-xl font-semibold">{item.name}</div>
            <div className="text-gray-600 text-lg mb-2">{item.description}</div>
            <div className="text-primary font-bold text-xl">{item.price}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Menu;
