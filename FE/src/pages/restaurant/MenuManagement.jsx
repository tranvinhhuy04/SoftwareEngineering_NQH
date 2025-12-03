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

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  /* ================= LOAD RESTAURANTS CỦA OWNER ================= */
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
        setError(err.response?.data?.message || err.message || "Unknown error");

      }
    };

    fetchRestaurants();
  }, []);

  /* ================= LOAD CATEGORY THEO RESTAURANT ================= */
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
      setError(err.response?.data?.message || err.message || "Unknown error");
    } finally {
      setLoadingCategory(false);
    }
  };

  /* ================= HANDLE INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "restaurant") {
      loadCategoriesByRestaurant(value);
      setMenuItem((prev) => ({ ...prev, restaurant: value, category: "" }));
      return;
    }

    setMenuItem((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= HANDLE IMAGE UPLOAD ================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= SUBMIT FORM ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!menuItem.restaurant) return setError("Please select a restaurant");
    if (!menuItem.category) return setError("Please select a category");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Text fields
      formData.append("name", menuItem.name);
      formData.append("description", menuItem.description);
      formData.append("price", parseFloat(menuItem.price));
      formData.append("categoryId", menuItem.category);

      // 🔥 BACKEND BẮT BUỘC CẦN restaurantId
      formData.append("restaurantId", menuItem.restaurant);

      // File image
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
      setError(err.response?.data?.message || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
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
              className="px-5 py-2 rounded-full bg-gray-200 text-gray-700"
            >
              View Menu
            </button>

            <button
              onClick={() => navigate("/home")}
              className="px-5 py-2 rounded-full bg-green-500 text-white"
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

          {error && <div className="bg-red-500 text-white p-3 mb-4">{error}</div>}
          {success && <div className="bg-green-500 text-white p-3 mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* RESTAURANT */}
            <div>
              <label className="text-lg font-semibold text-gray-900">
                Restaurant
              </label>
              <select
                name="restaurant"
                value={menuItem.restaurant}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border rounded-lg text-gray-900"
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
            <div>
              <label className="text-lg font-semibold text-gray-900">
                Category
              </label>
              <select
                name="category"
                value={menuItem.category}
                onChange={handleChange}
                disabled={!menuItem.restaurant || loadingCategory}
                required
                className="w-full px-4 py-3 bg-white border rounded-lg text-gray-900"
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
            <div>
              <label className="text-lg font-semibold text-gray-900">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Name of the dish"
                value={menuItem.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border rounded-lg text-gray-900"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-lg font-semibold text-gray-900">
                Description
              </label>
              <textarea
                name="description"
                value={menuItem.description}
                placeholder="Description of the dish"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border rounded-lg text-gray-900"
                rows={3}
              />
            </div>

            {/* PRICE */}
            <div>
              <label className="text-lg font-semibold text-gray-900">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={menuItem.price}
                placeholder="1.0$"
                onChange={handleChange}
                required
                step="0.01"
                className="w-full px-4 py-3 bg-white border rounded-lg text-gray-900"
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="text-lg font-semibold text-gray-900">
                Dish Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 bg-white border rounded-lg text-gray-900"
              />

              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-24 h-24 rounded-full object-cover mt-3 mx-auto"
                />
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-full"
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
