'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost/pos/POS/api';

const Categories = ({ selectedCategory, onCategoryChange }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`${API_BASE_URL}/categories.php`, {
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.success && Array.isArray(response.data.categories)) {
                    // Sort categories by display_order
                    const sortedCategories = [...response.data.categories].sort((a, b) => 
                        (a.display_order || 0) - (b.display_order || 0)
                    );
                    setCategories(sortedCategories);
                } else {
                    throw new Error(response.data.message || 'Failed to load categories');
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to load categories';
                setError(errorMessage);
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="w-64 p-4 bg-white border-r border-gray-200">
                <div className="animate-pulse">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-10 bg-gray-200 rounded mb-2"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-64 p-4 bg-white border-r border-gray-200">
                <div className="text-red-500 p-4">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="w-64 p-4 bg-white border-r border-gray-200">
            <button
                className={`w-full p-2 mb-2 rounded text-left ${
                    !selectedCategory
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100'
                }`}
                onClick={() => onCategoryChange(null)}
            >
                All Categories
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    className={`w-full p-2 mb-2 rounded text-left ${
                        selectedCategory === category.id
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100'
                    }`}
                    onClick={() => onCategoryChange(category.id)}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
};

export default Categories;
