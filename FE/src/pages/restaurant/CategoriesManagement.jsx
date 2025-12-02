import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/theme.css";

const AddCategory = () => {
  const [category, setCategory] = useState({
    name: "",
    description: "",
    restaurantId: "",
  });

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // ==========================================================
  // LOAD RESTAURANTS CỦA OWNER (API trả về 1 object → ép thành array)
  // ==========================================================
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8000/restaurant/api/restaurants-id",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // ⭐ nếu API trả 1 object → ép thành array
        const arr = Array.isArray(res.data) ? res.data : [res.data];

        setRestaurants(arr);
      } catch (err) {
        console.error(err);
        setError("Failed to load restaurants.");
      }
    };

    fetchRestaurants();
  }, []);


  // ==========================================================
  // HANDLE INPUT
  // ==========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Log giá trị user chọn
    if (name === "restaurantId") {
      console.log("👉 Selected Restaurant ID:", value);
    }

    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ==========================================================
  // SUBMIT
  // ==========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category.restaurantId) {
      setError("Please select your restaurant.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8000/restaurant/category",
        {
          name: category.name,
          description: category.description,
          restaurantId: category.restaurantId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Category added successfully!");
      setCategory({
        name: "",
        description: "",
        restaurantId: "",
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add category. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">

      {/* HEADER */}
      <header className="w-full bg-white shadow-sm border-b border-gray-200 py-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <h1
            className="text-3xl font-extrabold cursor-pointer flex items-center gap-1"
            onClick={() => navigate("/")}
          >
            <span className="text-gray-900">Fast</span>
            <span className="text-green-600">Food</span>
          </h1>

          <nav className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => navigate("/restaurant/menu/categories")}
              className="px-5 py-2 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              View Categories
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
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-lg p-8 border border-gray-200">

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            Add Category
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

            {/* RESTAURANT SELECT */}
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-semibold text-gray-900">
                Restaurant
              </label>

              <select
                name="restaurantId"
                value={category.restaurantId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white border"
                required
              >
                <option value="">-- Select restaurant --</option>

                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>

            </div>

            {/* NAME */}
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-semibold text-gray-900">
                Category Name
              </label>

              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleChange}
                placeholder="e.g., Pizza, Drinks..."
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 
                           text-gray-900 placeholder-green-600 focus:ring-green-400"
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
                value={category.description}
                onChange={handleChange}
                rows="3"
                placeholder="Short description..."
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 
                           text-gray-900 placeholder-green-600 focus:ring-green-400"
                required
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-full font-semibold 
                         hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-600 mt-10">
        © {new Date().getFullYear()} Fastfood. All rights reserved.
      </footer>

    </div>
  );
};

export default AddCategory;
