import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/theme.css";

const RestaurantProfile = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  /* =============================================================
     LOAD RESTAURANTS OF OWNER
  ============================================================= */
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
        setError("Failed to load restaurants.");
      }
    };

    fetchRestaurants();
  }, []);

  /* =============================================================
     CREATE NEW RESTAURANT
  ============================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/restaurant/profile",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const restaurant = res.data.restaurant;

      // Update UI
      setRestaurants((prev) => [...prev, restaurant]);
      setSuccess("Restaurant created successfully!");
      setName("");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  /* =============================================================
     DELETE RESTAURANT
  ============================================================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this restaurant permanently?")) return;

    setDeleteLoading(id);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:8000/restaurant/profile/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRestaurants((prev) => prev.filter((rest) => rest._id !== id));
      setSuccess("Restaurant deleted successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete restaurant");
    } finally {
      setDeleteLoading(null);
    }
  };

  /* =============================================================
     RENDER UI
  ============================================================= */
 return (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex flex-col text-gray-900">

    {/* HEADER */}
    <header className="bg-white shadow-sm py-4 border-b border-gray-200 backdrop-blur-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">

        <h1
          className="text-3xl font-extrabold cursor-pointer flex items-center gap-1"
          onClick={() => navigate("/")}
        >
          <span className="text-gray-900">Fast</span>
          <span className="text-green-600">Food</span>
        </h1>

        <nav className="flex gap-3 mt-3 md:mt-0">
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition font-medium"
          >
            Home
          </button>
        </nav>
      </div>
    </header>

    {/* MAIN */}
    <main className="container mx-auto px-4 py-12 flex-1">

      <h2 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
        Restaurant Management
      </h2>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-xl mb-6 shadow text-center">
          {error}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="bg-green-500 text-white p-4 rounded-xl mb-6 shadow text-center">
          {success}
        </div>
      )}

      {/* CREATE RESTAURANT FIRST */}
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-lg p-8 border border-gray-200 mb-12">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Restaurant Profile
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold text-gray-900">Restaurant Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter restaurant name"
              className="w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Restaurant"}
          </button>
        </form>
      </div>

      {/* LIST RESTAURANTS BELOW */}
      <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Restaurants</h3>

      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {restaurants.map((rest) => (
            <div
              key={rest._id}
              className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition"
            >
              <h3 className="text-2xl font-bold text-green-600 mb-2">{rest.name}</h3>

              <p className="text-gray-500 text-sm mb-4 font-mono">
                ID: {rest._id}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/restaurant/menu/${rest._id}`)}
                  className="px-5 py-2 bg-green-500 text-white rounded-2xl shadow hover:bg-green-600 transition font-semibold"
                >
                  View Menu →
                </button>

                <button
                  onClick={() => handleDelete(rest._id)}
                  className={`px-5 py-2 bg-red-500 text-white rounded-2xl shadow hover:bg-red-600 transition font-semibold ${
                    deleteLoading === rest._id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {deleteLoading === rest._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-3xl max-w-lg mx-auto shadow border mb-12">
          <p className="text-gray-600 text-lg">You haven't created any restaurants yet.</p>
        </div>
      )}

    </main>

    {/* FOOTER */}
    <footer className="text-center py-6 text-gray-600 bg-white/60 border-t border-gray-200 mt-10">
      © {new Date().getFullYear()} Fastfood. All rights reserved.
    </footer>
  </div>
);

};

export default RestaurantProfile;
