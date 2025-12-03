import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/theme.css";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState({
    name: "",
    description: "",
    restaurantId: "",
  });

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // load page state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ============================================================
     LOAD RESTAURANTS OF OWNER
  ============================================================ */
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8000/restaurant/api/restaurants-id",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const arr = Array.isArray(res.data) ? res.data : [res.data];
        setRestaurants(arr);
      } catch (err) {
        setError("Failed to load your restaurants.");
      }
    };

    loadRestaurants();
  }, []);

  /* ============================================================
     LOAD CATEGORY BY ID
  ============================================================ */
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:8000/restaurant/category/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCategory({
          name: res.data.name,
          description: res.data.description,
          restaurantId: res.data.restaurantId,
        });
      } catch (err) {
        setError("Failed to load category details.");
      } finally {
        setFetching(false);
      }
    };

    loadCategory();
  }, [id]);

  /* ============================================================
     HANDLE INPUT CHANGE
  ============================================================ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ============================================================
     SUBMIT UPDATE
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category.restaurantId) {
      setError("Please select a restaurant.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:8000/restaurant/category/${id}`,
        { ...category },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Category updated successfully!");

      setTimeout(() => {
        navigate("/restaurant/menu/categories");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-gray-600">
        Loading category…
      </div>
    );
  }

  /* ============================================================
     UI
  ============================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">

      {/* HEADER */}
      <header className="w-full bg-white shadow-sm border-b py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1
            className="text-3xl font-extrabold cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="text-gray-900">Fast</span>
            <span className="text-green-600">Food</span>
          </h1>

          <button
            onClick={() => navigate("/restaurant/menu/categories")}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition font-semibold"
          >
            Back to Categories
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-lg p-8 border">

          <h2 className="text-3xl font-bold text-center mb-8 text-green-700">
            Edit Category
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

          <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">

            {/* RESTAURANT SELECT */}
            <div>
              <label className="font-semibold">Restaurant</label>
              <select
                name="restaurantId"
                value={category.restaurantId}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg text-gray-700"
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
            <div>
              <label className="font-semibold">Category Name</label>
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg text-gray-700"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="font-semibold">Description</label>
              <textarea
                name="description"
                value={category.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border rounded-lg text-gray-700"
                placeholder="Short description…"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600"
            >
              {loading ? "Updating…" : "Update Category"}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center py-6 text-gray-600 mt-10">
        © {new Date().getFullYear()} Fastfood. All rights reserved.
      </footer>
    </div>
  );
};

export default EditCategory;
