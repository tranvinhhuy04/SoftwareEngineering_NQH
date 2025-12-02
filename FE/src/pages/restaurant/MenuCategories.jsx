// src/pages/restaurant/MenuCategories.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/theme.css";

const MenuCategories = () => {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* ============================================================
     🟩 Load Restaurants của owner
  ============================================================ */
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8000/restaurant/api/restaurants-id",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRestaurants(res.data);

        // Auto-chọn restaurant đầu tiên
        if (res.data.length > 0) {
          setSelectedRestaurant(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load restaurants.");
      }
    };

    fetchRestaurants();
  }, []);

  /* ============================================================
     🟨 Fetch Categories khi selectedRestaurant thay đổi
  ============================================================ */
  useEffect(() => {
    if (!selectedRestaurant) return;

    const fetchCategories = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:8000/restaurant/${selectedRestaurant}/category`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCategories(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedRestaurant]);

  /* ============================================================
     🟥 Delete Category
  ============================================================ */
  const handleDelete = async (id) => {
    setDeleteLoading(id);
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:8000/restaurant/category/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete category");
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ============================================================
     🟦 UI RENDER
  ============================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex flex-col text-gray-900">

      {/* HEADER */}
      <header className="bg-white/70 backdrop-blur-md shadow-md py-4 border-b border-green-200">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">

          <h1
            className="font-extrabold text-3xl cursor-pointer flex items-center gap-1"
            onClick={() => navigate("/")}
          >
            <span className="text-gray-900">Fast</span>
            <span className="text-green-600">food</span>
          </h1>

          <nav className="flex gap-3 mt-3 md:mt-0">
            <button
              onClick={() => navigate("/restaurant/menu/categories/add")}
              className="px-5 py-2 bg-green-500 text-white font-semibold rounded-2xl shadow hover:bg-green-600 transition"
            >
              + Add Category
            </button>

            <button
              onClick={() => navigate("/home")}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition"
            >
              Home
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 container mx-auto px-6 py-10">

        <h2 className="text-4xl font-extrabold text-center mb-10 
                       bg-gradient-to-r from-green-500 to-yellow-400 
                       bg-clip-text text-transparent">
          Your Menu Categories
        </h2>

        {/* RESTAURANT SELECT */}
        <div className="max-w-md mx-auto mb-10">
          <label className="inline-block px-4 py-1 rounded-full bg-green-100 border border-green-300 mb-3">
            <span className="text-green-700 font-semibold tracking-wide text-sm">
              Choose Restaurant
            </span>
          </label>

          <select
            value={selectedRestaurant}
            onChange={(e) => {
              console.log("🔽 Selected Restaurant:", e.target.value);
              setSelectedRestaurant(e.target.value);
            }}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 
                       border border-gray-300 shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-green-400 
                       text-gray-800 font-medium tracking-wide"
          >
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>
                🍽️ {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-400 text-white p-4 rounded-2xl mb-6 shadow-md text-center">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full border-4 border-green-400 border-t-transparent animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl max-w-xl mx-auto shadow-lg border border-gray-200">
            <p className="text-xl mb-4 text-gray-700">
              No categories for this restaurant.
            </p>
            <button
              onClick={() => navigate("/restaurant/menu/categories/add")}
              className="px-5 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition"
            >
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {categories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl 
                           transition duration-300 border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  {cat.name}
                </h3>

                <p className="text-gray-600 mb-6">{cat.description}</p>

                <div className="flex justify-between items-center">

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(cat._id)}
                    disabled={deleteLoading === cat._id}
                    className={`px-4 py-2 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition ${
                      deleteLoading === cat._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {deleteLoading === cat._id ? "Deleting..." : "Delete"}
                  </button>

                  {/* EDIT */}
                  <button
                    onClick={() =>
                      navigate(`/restaurant/menu/categories/edit/${cat._id}`)
                    }
                    className="px-4 py-2 rounded-2xl bg-yellow-300 text-gray-900 font-semibold hover:bg-yellow-200 transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-6 text-center bg-white/70 backdrop-blur-md border-t border-gray-200 text-gray-600 mt-10">
        © {new Date().getFullYear()} Fastfood — All rights reserved.
      </footer>
    </div>
  );
};

export default MenuCategories;
