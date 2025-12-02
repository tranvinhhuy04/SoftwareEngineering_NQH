// src/pages/restaurant/MenuManagement.jsx
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
    restaurant: "",
  });

  const [imageFile, setImageFile] = useState(null);   // file ảnh
  const [preview, setPreview] = useState(null);       // ảnh preview

  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // ================= LOAD RESTAURANTS CỦA OWNER =================
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8000/restaurant/api/restaurants-id",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRestaurants(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load restaurants");
      }
    };

    fetchRestaurants();
  }, []);

  // ================= LOAD CATEGORY THEO RESTAURANT =================
  const loadCategoriesByRestaurant = async (restaurantId) => {
    if (!restaurantId) return;

    setLoadingCategory(true);
    setCategories([]);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:8000/restaurant/${restaurantId}/category`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCategories(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    } finally {
      setLoadingCategory(false);
    }
  };

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Khi đổi restaurant → load lại category
    if (name === "restaurant") {
      loadCategoriesByRestaurant(value);
      setMenuItem((prev) => ({ ...prev, restaurant: value, category: "" }));
      return;
    }

    setMenuItem((prev) => ({ ...prev, [name]: value }));
  };

  // ================= HANDLE IMAGE UPLOAD (FILE) =================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= SUBMIT FORM (FormData + file) =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!menuItem.restaurant) {
      setError("Please select a restaurant first!");
      return;
    }

    if (!menuItem.category) {
      setError("Please select a category!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Các field text
      formData.append("name", menuItem.name);
      formData.append("description", menuItem.description);
      formData.append("price", parseFloat(menuItem.price));
      formData.append("categoryId", menuItem.category);

      // ⚠️ restaurantId backend đang lấy từ token (owner),
      // nếu route của bạn không cần thì KHÔNG cần append.
      // Nếu bạn có sửa route để nhận restaurantId:
      // formData.append("restaurantId", menuItem.restaurant);

      // File ảnh – tên field PHẢI trùng với backend: req.files.image
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await axios.post(
        "http://localhost:8000/restaurant/menu",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Created menu item:", res.data);
      setSuccess("Menu item added successfully!");

      // Reset form
      setMenuItem({
        name: "",
        description: "",
        price: "",
        category: "",
        restaurant: "",
      });
      setImageFile(null);
      setPreview(null);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI STYLE A + PASTEL =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm border-b border-gray-200 py-4">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1
            className="text-3xl font-extrabold cursor-pointer flex items-center gap-1"
            onClick={() => navigate("/")}
          >
            <span className="text-gray-900">Fast</span>
            <span className="text-green-600">Food</span>
          </h1>

          <nav className="flex gap-3">
            <button
              onClick={() => navigate("/restaurant/menu")}
              className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
            >
              View Menu
            </button>
            <button
              onClick={() => navigate("/home")}
              className="px-5 py-2 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition"
            >
              Home
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Add Menu Item
          </h2>

          {error && (
            <div className="bg-red-500 text-white p-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500 text-white p-3 rounded-xl mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* RESTAURANT */}
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-semibold text-gray-900">
                Restaurant
              </label>
              <select
                name="restaurant"
                value={menuItem.restaurant}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              >
                <option value="">-- Select your restaurant --</option>
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-semibold text-gray-900">
                Category
              </label>
              <select
                name="category"
                value={menuItem.category}
                onChange={handleChange}
                disabled={!menuItem.restaurant || loadingCategory}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 
                           disabled:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              >
                <option value="">
                  {loadingCategory ? "Loading..." : "-- Select category --"}
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* NAME */}
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-semibold text-gray-900">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                value={menuItem.name}
                onChange={handleChange}
                placeholder="Enter item name..."
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-green-600
                           border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-semibold text-gray-900">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={menuItem.description}
                onChange={handleChange}
                placeholder="Short description..."
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-green-600
                           border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* PRICE */}
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-semibold text-gray-900">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={menuItem.price}
                step="0.01"
                min="0"
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-green-600
                           border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            {/* DISH IMAGE UPLOAD (FILE) */}
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-semibold text-gray-900">
                Dish Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full bg-white px-4 py-3 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-green-400"
              />

              {preview && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={preview}
                    alt="Dish preview"
                    className="w-24 h-24 object-cover rounded-full shadow-md border"
                  />
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-full font-semibold
                         hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Menu Item"}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center py-6 text-gray-600">
        © {new Date().getFullYear()} Fastfood. All rights reserved.
      </footer>
    </div>
  );
};

export default MenuManagement;
