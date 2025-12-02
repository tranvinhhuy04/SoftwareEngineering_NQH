import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "./CartContext";

const ShoppingCart = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [restaurants, setRestaurants] = useState([]);

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

  // Lọc giỏ hàng theo nhà hàng
  const displayedCart = selectedRestaurant
    ? cart.filter((i) => i.restaurantId === selectedRestaurant)
    : cart;

  const totalPrice = displayedCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 p-10">

      {/* Title */}
      <h2 className="text-5xl font-extrabold text-center mb-12 
      bg-gradient-to-r from-green-700 to-yellow-500 bg-clip-text text-transparent tracking-wide">
        🛒 Your Shopping Cart
      </h2>

      {/* FILTER BY RESTAURANT */}
      {restaurants.length > 0 && (
        <div className="max-w-xl mx-auto mb-10">
          <label className="font-semibold text-gray-900 text-lg">
            Filter by restaurant
          </label>

          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl mt-3 
            bg-white shadow-sm text-gray-900
            focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
          >
            <option value="" className="text-gray-900">
              All restaurants
            </option>

            {restaurants.map((r) => (
              <option
                key={r._id}
                value={r._id}
                className="text-gray-900"
              >
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* EMPTY CART */}
      {displayedCart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto border">
          <p className="text-2xl font-semibold text-gray-700">
            Your cart is empty
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-8 py-4 bg-green-600 text-white rounded-full 
            hover:bg-green-700 transition shadow-lg font-semibold text-lg"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            {displayedCart.map((item) => (
              <div
                key={item.menuId}
                className="bg-white rounded-3xl shadow-md p-6 border hover:shadow-xl transition-all flex gap-6"
              >
                <img
                  src={item.imageUrl || item.image_url || "https://via.placeholder.com/150"}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-2xl shadow-md"
                />

                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">{item.name}</h4>

                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      {item.restaurantName}
                    </span>
                  </p>

                  <p className="text-green-600 font-bold text-2xl mt-3">
                    ${item.price.toFixed(2)}
                  </p>

                  {/* Quantity control */}
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => removeFromCart(item.menuId)}
                      className="w-10 h-10 flex items-center justify-center 
                      bg-gray-100 border rounded-xl hover:bg-gray-200 transition text-xl font-bold"
                    >
                      –
                    </button>

                    <span className="text-xl font-semibold text-gray-900">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => addToCart(item)}
                      className="w-10 h-10 flex items-center justify-center 
                      bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-xl font-bold shadow"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="w-full py-4 bg-red-500 text-white rounded-2xl 
              hover:bg-red-600 transition shadow-lg font-bold text-lg mt-6"
            >
              🗑️ Clear Cart
            </button>
          </div>

          {/* SUMMARY BOX */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border h-fit sticky top-10">
            <h3 className="text-3xl font-extrabold mb-6 text-gray-900">
              Order Summary
            </h3>

            <div className="flex justify-between text-lg font-semibold text-gray-700 mt-4">
              <span>Total Items:</span>
              <span>{displayedCart.reduce((sum, i) => sum + i.quantity, 0)}</span>
            </div>

            <div className="flex justify-between text-2xl font-bold mt-6">
              <span>Total Price:</span>
              <span className="text-green-600">${totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate("/create-order")}
              className="mt-8 w-full py-4 bg-green-600 text-white rounded-2xl 
              hover:bg-green-700 transition font-semibold text-lg shadow-lg"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
