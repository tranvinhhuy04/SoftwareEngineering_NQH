import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../CartContext";
import "../styles/theme.css";

const HomeAll = () => {
  const navigate = useNavigate();
  const { cart, addToCart } = useContext(CartContext);

  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ==============================
  // CHECK LOGIN
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // ==============================
  // FETCH ALL RESTAURANTS
  // ==============================
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8000/restaurant/getAllRestaurant",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRestaurants(res.data);
      } catch (err) {
        console.error("Restaurant fetch error:", err);
      }
    };

    fetchRestaurants();
  }, []);

  // ==============================
  // LOAD MENU WHEN SELECT RESTAURANT
  // ==============================
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        let url = "";

        if (selectedRestaurant === "all") {
          url = "http://localhost:8000/restaurant/menu/all";
        } else {
          url = `http://localhost:8000/restaurant/${selectedRestaurant}/menu`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMenuItems(res.data);
      } catch (err) {
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [selectedRestaurant]);

  // ==============================
  // SEARCH LOGIC
  // ==============================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(filtered);
  }, [searchQuery, menuItems]);

  // ==============================
  // ADD TO CART
  // ==============================
  const handleAddToCart = (item) => {
    addToCart({ ...item, quantity: 1 });

    const noti = document.getElementById("notification");
    noti.classList.remove("hidden");
    noti.classList.add("flex");

    setTimeout(() => {
      noti.classList.add("hidden");
    }, 1500);
  };

  const cartItemCount = cart.reduce((t, i) => t + i.quantity, 0);

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

return (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">

    {/* Notification */}
    <div 
      id="notification"
      className="hidden fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg items-center z-50"
    >
      ✔ Added to cart!
    </div>

    {/* ================= HEADER ================= */}
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">

        {/* Brand */}
        <h1 onClick={() => navigate('/')} className="text-3xl font-extrabold cursor-pointer">
          <span className="text-black">Fast</span>
          <span className="text-red-600">food</span>
        </h1>

        {/* Actions */}
        <div className="flex items-center space-x-6">

          {/* Search */}
          <button onClick={toggleSearchBar} className="flex items-center text-gray-700 hover:text-green-600">
            <svg className="w-6 h-6 mr-1 text-green-600" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>

          {/* Restaurant Filter */}
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <option value="all">Select Restaurants.....</option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Cart */}
          <div className="relative">
            <button onClick={() => navigate("/create-order")} className="flex items-center hover:text-green-600">
              <svg className="w-6 h-6 mr-1 text-green-600" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 
                    2.293c-.63.63-.184 1.707.707 1.707H17" />
              </svg>
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white 
                  text-xs rounded-full h-5 w-5 flex items-center justify-center shadow">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((p) => !p)}
              className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 
                         hover:border-green-500 transition"
            >
              <img
                src={user?.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                className="w-full h-full object-cover"
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-48 bg-white p-3 rounded-xl shadow-lg ring-1 ring-gray-200">

                <button onClick={() => navigate("/profile")} className="dropdown-item">
                  👤 Profile
                </button>

                <button onClick={() => navigate("/my-orders")} className="dropdown-item">
                  📦 My Orders
                </button>

                <button
                  onClick={handleSignOut}
                  className="dropdown-item text-red-600"
                >
                  🔐 Sign Out
                </button>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* Search Bar */}
      {showSearchBar && (
        <div className="container mx-auto mt-3 px-4 pb-4">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 shadow-inner">
            <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6"/>
            </svg>

            <input
              autoFocus
              type="text"
              className="flex-1 bg-transparent outline-none text-gray-700"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-red-500">
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>

    {/* ================= MAIN ================= */}
    <main className="container mx-auto px-4 py-10">

      {loading ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Search results */}
          {searchQuery && (
            <>
              <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Search Results</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {searchResults.map((item) => (
                  <div className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4" key={item._id}>
                    <img src={item.imageUrl} className="rounded-xl h-40 w-full object-cover" />
                    <h3 className="mt-3 text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-400">{item.restaurantName}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg text-green-600 font-bold">${item.price.toFixed(2)}</span>
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-xl"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Special Offers */}
          {!searchQuery && (
            <>
              <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Special Offers</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {menuItems.slice(0, 6).map((item) => (
                  <div className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4" key={item._id}>
                    <img src={item.imageUrl} className="rounded-xl h-40 w-full object-cover" />

                    <h3 className="mt-3 text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-400">{item.restaurantName}</p>

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg text-green-600 font-bold">${item.price.toFixed(2)}</span>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-xl"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </main>

    {/* FOOTER */}
    <footer className="py-6 text-center text-gray-600">
      © {new Date().getFullYear()} Fastfood. All rights reserved.
    </footer>
  </div>
);
};

export default HomeAll;
