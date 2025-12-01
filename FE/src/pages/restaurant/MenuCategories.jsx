import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/theme.css';


const MenuItemsList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1) Lấy restaurantId của người đăng nhập
        const temp = await axios.get(
          "http://localhost:8000/restaurant/api/restaurants-id",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log("Fetched restaurants:", temp.data);

        const restaurantId = temp.data[0]?._id;
        console.log("Using restaurantId:", restaurantId);

        // 2) Lấy category theo restaurantId
        const response = await axios.get(
          `http://localhost:8000/restaurant/${restaurantId}/category`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log("Fetched categories:", response.data);

        setCategories(response.data);  // <-- gán vào state
      } catch (err) {
        console.error("Fetch categories error:", err);
      }
    };

    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    setError('');
    
    try {
      const temp = await axios.get('http://localhost:8000/restaurant/api/restaurants-id', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Fetched restaurants:', temp.data);
      const restaurantId = temp.data[0]?._id;
      console.log('Using restaurantId:', restaurantId);
      const token = localStorage.getItem('token');
      const api = `http://localhost:8000/restaurant/${restaurantId}/category`;
      const response = await axios.get(api, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched menu categories:', response.data); // Debug: Log full response
      response.data.forEach(item => {
        if (item.imageUrl) {
          console.log('Image URL for', item.name, ':', item.imageUrl);
        }
      });
      setMenuItems(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch menu items');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteLoading(id);
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/restaurant/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMenuItems(menuItems.filter(item => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete menu item');
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(null);
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
            <button onClick={() => navigate('/restaurant/menu/categories/add')} className="btn-add">Add Menu Category</button>
            <button onClick={() => navigate('/home')} className="px-4 py-2 hover:underline">Home</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Your Menu Categories</h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading menu items...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-8 bg-gray-900 rounded-lg max-w-xl mx-auto">
            <p className="text-xl mb-4">You haven't added any menu items yet.</p>
            <button onClick={() => navigate('/restaurant/menu/add')} className="btn-add">Add Your First Item</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <div 
                key={item._id} 
                className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-200"
              >
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-gray-400 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleteLoading === item._id}
                      className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 ${deleteLoading === item._id ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {deleteLoading === item._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Fastfood. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MenuItemsList;