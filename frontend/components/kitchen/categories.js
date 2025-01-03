'use client';

const Categories = ({ selectedCategory, onCategoryChange }) => {
  // Hardcoded categories as JSON
  const categories = [
    { id: 'hot-drinks', label: 'Boissons Chaudes' },
    { id: 'cold-drinks', label: 'Boissons Froides' },
    { id: 'food', label: 'Plats' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'snacks', label: 'En-cas' },
  ];

  const handleCategoryClick = (category) => {
    onCategoryChange(category);
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <h2 className="text-xl font-bold p-4 bg-gray-50">Catégories</h2>
      <div className="overflow-y-auto flex-1 py-2" id="categories-list">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`w-full px-6 py-4 text-left text-lg hover:bg-primary hover:text-white transition-colors category-btn ${selectedCategory === category.id ? 'bg-primary text-white' : ''}`}
            data-category={category.id}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
