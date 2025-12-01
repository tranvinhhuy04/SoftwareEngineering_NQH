import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/theme.css';

const MenuManagement = () => {
  const [categories, setcategories] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setcategories({
      ...categories,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('Submitting category:', categories);
      const response = await axios.post('http://localhost:8000/restaurant/category', categories, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'application/json'
        }
      });

      console.log('Menu Category added:', response.data); // Debug: Log response
      setSuccess('Menu Category added successfully!');
      setcategories({ name: '', description: ''});
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
      console.error('Add category error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      <header className="header">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="brand" onClick={() => navigate('/')}>
            <span className="brand-main">Fast</span>
            <span className="brand-accent">food</span>
          </h1>
          <nav className="actions">
            <button onClick={() => navigate('/restaurant/menu/categories')} className="px-4 py-2 hover:underline">View Menu Categories</button>
            <button onClick={() => navigate('/')} className="px-4 py-2 hover:underline">Home</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Add Menu Category</h2>

          {error && (
            <div className="bg-red-500 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500 text-white p-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={categories.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                placeholder="e.g. Margherita Pizza"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={categories.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                placeholder="Describe your dish"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded font-medium btn-add ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Fastfood. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MenuManagement;