// ================= HOMEALL (FINAL VERSION USING BACKEND CART) ==================

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "./customer/CartContext"; 
import "../styles/theme.css";

const HomeAll = () => {
  const navigate = useNavigate();
  const { cart, addToCart } = useContext(CartContext);

  const cartItemCount = cart.reduce((t, i) => t + (i.quantity || 0), 0);

  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const formatVND = (value) => {
  if (!value) return "0 ₫";
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

  // ========================= CHECK LOGIN =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // ========================= GET RESTAURANTS =========================
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

  // ========================= LOAD MENU =========================
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        const url =
          selectedRestaurant === "all"
            ? "http://localhost:8000/restaurant/menu/all"
            : `http://localhost:8000/restaurant/${selectedRestaurant}/menu`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMenuItems(res.data);
      } catch (err) {
        console.log("Load menu failed");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [selectedRestaurant]);

  // ========================= SEARCH FILTER =========================
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurantName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(filtered);
  }, [searchQuery, menuItems]);

  // =====================================================
  // 🔥 FIXED: ADD ITEM WITH CORRECT RESTAURANT ID + NAME
  // =====================================================
  const handleAddToCart = (item) => {
    let restaurant = null;

    // Khi đang trong 1 nhà hàng
    if (selectedRestaurant !== "all") {
      restaurant = restaurants.find((r) => r._id === selectedRestaurant);
    }

    // Khi ở all menu → tìm nhà hàng theo item.restaurantId (BE trả)
    if (!restaurant && item.restaurantId) {
      restaurant = restaurants.find((r) => r._id === item.restaurantId);
    }

    // Khi search menu
    if (!restaurant && item.restaurantName) {
      restaurant = restaurants.find((r) => r.name === item.restaurantName);
    }

    const fixedItem = {
      ...item,
      restaurantId: item.restaurantId || restaurant?._id || "",
      restaurantName: item.restaurantName || restaurant?.name || "",
    };

    addToCart(fixedItem);

    const noti = document.getElementById("notification");
    if (!noti) return;
    noti.classList.remove("hidden");
    noti.classList.add("flex");
    setTimeout(() => noti.classList.add("hidden"), 1500);
  };

  // ========================= UI BELOW =========================
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

  const RestaurantGrid = ({ restaurants, onSelect }) => (
    <div className="mt-10">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
        Choose a Restaurant
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {restaurants.map((r) => (
          <div
            key={r._id}
            onClick={() => onSelect(r._id)}
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer p-4"
          >
            <img
              src={r.avatar || "https://via.placeholder.com/300"}
              className="rounded-xl h-40 w-full object-cover"
              alt={r.name}
            />

            <h3 className="mt-3 text-lg font-semibold">{r.name}</h3>
            <p className="text-gray-500 text-sm">
              {r.address || "No address"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // ========================= RENDER UI =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">
      
      {/* Notification */}
      <div
        id="notification"
        className="hidden fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg items-center z-50"
      >
        ✔ Added to cart!
      </div>

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <div
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer select-none group"
          >
            <span className="text-3xl font-extrabold text-gray-900 group-hover:text-green-600 transition">
              Fast
            </span>
            <span className="text-3xl font-extrabold text-green-600 group-hover:text-yellow-500 transition">
              Food
            </span>
          </div>

          <div className="flex items-center space-x-4">

            {/* Search */}
            <button
              onClick={toggleSearchBar}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm hover:shadow-md transition-all"
            >
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </button>

            {/* Filter */}
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="px-4 py-2 rounded-full bg-white text-gray-700 border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer"
            >
              <option value="all">Select Restaurants...</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Cart */}
            <div className="relative">
              <button
                onClick={() => navigate("/shopping_cart")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 font-medium shadow-sm hover:shadow-md transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17"
                  />
                </svg>
                Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((p) => !p)}
                className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shadow-sm hover:shadow-md border border-gray-300 hover:border-green-500 transition"
              >
                <img
                  src={
                    user?.avatar ||
                    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                  }
                  className="w-full h-full object-cover"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white p-3 rounded-2xl shadow-xl ring-1 ring-gray-200 z-20 animate-fade-in">
                  {!user ? (
                    <>
                      <button
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition"
                      >
                        🔑 Sign In
                      </button>
                      <button
                        onClick={() => navigate("/register")}
                        className="flex items-center gap-2 w-full px-3 py-2 text-green-600 hover:bg-green-50 rounded-xl font-semibold transition"
                      >
                        ✨ Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition"
                      >
                        👤 Profile
                      </button>

                      <button
                        onClick={() => navigate("/orders")}
                        className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition"
                      >
                        📦 My Orders
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition"
                      >
                        🔐 Sign Out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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
                <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
                  Search Results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {searchResults.map((item) => (
                    <div
                      className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4"
                      key={item._id}
                    >
                      <img
                        src={
                          item.image_url || "https://via.placeholder.com/400"
                        }
                        className="rounded-xl h-40 w-full object-cover"
                        alt={item.name}
                      />

                      <h3 className="mt-3 text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-400">{item.restaurantName}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg text-green-600 font-bold">
                          {formatVND(item.price)}
                        </span>
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
            {selectedRestaurant === "all" ? (
              <RestaurantGrid
                restaurants={restaurants}
                onSelect={(id) => setSelectedRestaurant(id)}
              />
            ) : (
              <>
                {!searchQuery && (
                  <>
                    <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
                      Special Offers
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {menuItems.slice(0, 6).map((item) => (
                        <div
                          className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4"
                          key={item._id}
                        >
                          <img
                            src={
                              item.image_url ||
                              "https://via.placeholder.com/400"
                            }
                            className="rounded-xl h-40 w-full object-cover"
                            alt={item.name}
                          />

                          <h3 className="mt-3 text-lg font-semibold">
                            {item.name}
                          </h3>
                          <p className="text-gray-400">{item.restaurantName}</p>

                          <div className="flex justify-between items-center mt-3">
                            <span className="text-lg text-green-600 font-bold">
                              {formatVND(item.price)}
                            </span>

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
          </>
        )}
      </main>

      <footer className="py-6 text-center text-gray-600">
        © {new Date().getFullYear()} Fastfood. All rights reserved.
      </footer>
    </div>
  );
};

export default HomeAll;
