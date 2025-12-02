import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/theme.css";

const MenuItemsList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  /* ------------------- LOAD RESTAURANTS THE USER OWNS ------------------- */
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8000/restaurant/api/restaurants-id",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRestaurants(res.data);
        if (res.data.length > 0) {
          setSelectedRestaurant(res.data[0]._id); // auto select first
        }
      } catch (err) {
        console.error("Fetch restaurants error:", err);
        setError("Failed to load your restaurants");
      }
    };

    fetchRestaurants();
  }, []);

  /* ----------------------- LOAD MENU ITEMS WHEN RESTAURANT CHANGES ----------------------- */
  useEffect(() => {
    if (!selectedRestaurant) return;

    const fetchMenuItems = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/restaurant/${selectedRestaurant}/menu`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMenuItems(response.data);
      } catch (err) {
        setError("Failed to fetch menu items");
        console.error("Fetch menu error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedRestaurant]);

  /* --------------------------- DELETE MENU ITEM --------------------------- */
  const handleDelete = async (id) => {
    setDeleteLoading(id);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/restaurant/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMenuItems(menuItems.filter((item) => item._id !== id));
    } catch (err) {
      setError("Failed to delete menu item");
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

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
              onClick={() => navigate("/restaurant/menu/add")}
              className="px-5 py-2 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition shadow"
            >
              + Add Menu Item
            </button>

            <button
              onClick={() => navigate("/home")}
              className="px-5 py-2 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              Home
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-10">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Your Menu Items
        </h2>
{/* ------------------ SELECT RESTAURANT ------------------ */}
<div className="max-w-md mx-auto mb-10">

  {/* Label đẹp hơn */}
  <div className="inline-block px-4 py-1 rounded-full bg-green-100 border border-green-300 mb-3">
    <span className="text-green-700 font-semibold tracking-wide text-sm">
      Choose Your Restaurant
    </span>
  </div>

  <select
    value={selectedRestaurant}
    onChange={(e) => setSelectedRestaurant(e.target.value)}
    className="
        w-full px-4 py-3 rounded-xl bg-gray-50 
        border border-gray-300 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-green-400 
        text-gray-800 font-medium tracking-wide
      "
  >
    {/* Grey text when empty */}
    {restaurants.length === 0 && (
      <option className="text-gray-500">No restaurants found</option>
    )}

    {restaurants.map((r) => (
      <option
        key={r._id}
        value={r._id}
        className="text-gray-800 font-semibold"
      >
        🍽️ {r.name}
      </option>
    ))}
  </select>
</div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-xl shadow mb-6 text-center">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading menu items...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow max-w-xl mx-auto border border-gray-200">
            <p className="text-xl font-medium text-gray-700 mb-4">No menu items for this restaurant.</p>
            <button
              onClick={() => navigate("/restaurant/menu/add")}
              className="px-6 py-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          /* ITEMS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {menuItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition overflow-hidden"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-3xl"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-3xl">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 mb-3">{item.description || "No description."}</p>

                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-extrabold text-lg">
                      ${item.price.toFixed(2)}
                    </span>

                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleteLoading === item._id}
                      className={`px-4 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition
                        ${deleteLoading === item._id ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {deleteLoading === item._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-600 mt-10">
        © {new Date().getFullYear()} Fastfood. All rights reserved.
      </footer>
    </div>
  );
};


export default MenuItemsList;
