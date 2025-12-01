import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/theme.css";

const MenuManagement = () => {
  const [menuItem, setMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // LOAD ALL CATEGORIES THEO RESTAURANTID
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Lấy restaurantId
        const resRestaurant = await axios.get(
          "http://localhost:8000/restaurant/api/restaurants-id",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const restaurantId = resRestaurant.data[0]?._id;
        console.log("Using restaurantId:", restaurantId);

        // 2. Lấy category theo restaurantId
        const api = `http://localhost:8000/restaurant/${restaurantId}/category`;
        const catRes = await axios.get(api, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched menu categories:", catRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // ---------------------------------------------------------
  // 🟨 HANDLE INPUT CHANGE
  // ---------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem({ ...menuItem, [name]: value });
  };

  // ---------------------------------------------------------
  // 🟧 HANDLE IMAGE UPLOAD
  // ---------------------------------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ---------------------------------------------------------
  // 🟥 SUBMIT MENU ITEM
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", menuItem.name);
      formData.append("description", menuItem.description);
      formData.append("price", parseFloat(menuItem.price));
      formData.append("categoryId", menuItem.category);

      console.log("Submitting menu item:", menuItem);
      
      if (image) formData.append("image", image);

      const response = await axios.post(
        "http://localhost:8000/restaurant/menu",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    
      console.log("Menu item added:", response.data);
      setSuccess("Menu item added successfully!");

      setMenuItem({
        name: "",
        description: "",
        price: "",
        category: "",
      });
      setImage(null);
      setImagePreview(null);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add menu item");
      console.error("Add menu item error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 🟩 UI HIỂN THỊ
  // ---------------------------------------------------------
  return (
    <div className="app-root">
      <header className="header">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="brand" onClick={() => navigate("/")}>
            <span className="brand-main">Fast</span>
            <span className="brand-accent">food</span>
          </h1>
          <nav className="actions">
            <button
              onClick={() => navigate("/restaurant/menu")}
              className="px-4 py-2 hover:underline"
            >
              View Menu
            </button>
            <button onClick={() => navigate("/")} className="px-4 py-2 hover:underline">
              Home
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Add Menu Item
          </h2>

          {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-500 text-white p-3 rounded mb-4">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Item Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={menuItem.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={menuItem.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white"
                required
              />
            </div>

            {/* Price */}
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={menuItem.price}
                step="0.01"
                min="0"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white"
                required
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category
              </label>

              <select
                id="category"
                name="category"
                value={menuItem.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white"
                required
              >
                <option value="">-- Select a category --</option>

                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image */}
            <div className="mb-6">
              <label htmlFor="image" className="block text-sm font-medium mb-2">
                Item Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white"
              />

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded font-medium btn-add ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Adding..." : "Add Menu Item"}
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
