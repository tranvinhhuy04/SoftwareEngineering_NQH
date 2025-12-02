import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";

const ShoppingCart = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useContext(CartContext);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const navigate = useNavigate();

  // Lọc giỏ hàng theo nhà hàng
  const displayedCart = selectedRestaurant
    ? cart.filter((i) => i.restaurantId === selectedRestaurant)
    : cart;

  const totalPrice = displayedCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Lấy danh sách nhà hàng trong giỏ
  const uniqueRestaurants = [
    ...new Map(cart.map((i) => [i.restaurantId, i.restaurantName])).entries(),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 p-10">
      <h2
        className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r
        from-green-600 to-yellow-500 bg-clip-text text-transparent"
      >
        Your Shopping Cart
      </h2>

      {/* FILTER BY RESTAURANT */}
      {cart.length > 0 && (
        <div className="max-w-xl mx-auto mb-8">
          <label className="font-semibold text-gray-700">
            Filter by restaurant
          </label>

          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl mt-2 bg-white shadow-sm"
          >
            <option value="">All restaurants</option>
            {uniqueRestaurants.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* EMPTY CART */}
      {displayedCart.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow max-w-2xl mx-auto border">
          <p className="text-xl font-semibold text-gray-700">
            Your cart is empty.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition shadow"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            {displayedCart.map((item) => (
              <div
                key={item.menuId} // ✅ dùng menuId, backend remove theo menuId
                className="bg-white rounded-2xl shadow p-5 border hover:shadow-lg transition flex gap-5"
              >
                <img
                  src={
                    item.imageUrl ||
                    item.image_url ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item.name}
                  className="w-28 h-28 object-cover rounded-xl"
                />

                <div className="flex-1">
                  <h4 className="text-xl font-bold">{item.name}</h4>
                  <p className="text-gray-500 text-sm">
                    {item.restaurantName}
                  </p>

                  <p className="text-green-600 font-bold text-lg mt-1">
                    ${item.price.toFixed(2)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => removeFromCart(item.menuId)}
                      className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                    >
                      -
                    </button>

                    <span className="font-semibold">{item.quantity}</span>

                    {/* addToCart nhận lại item, CartContext sẽ normalize và gọi /order/cart/add */}
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="w-full py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold mt-4"
            >
              Clear Cart
            </button>
          </div>

          {/* SUMMARY BOX */}
          <div className="bg-white rounded-3xl shadow p-6 border h-fit">
            <h3 className="text-2xl font-bold mb-4">Order Summary</h3>

            <div className="flex justify-between text-lg font-semibold mt-2">
              <span>Total Items:</span>
              <span>
                {displayedCart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            </div>

            <div className="flex justify-between text-xl font-bold mt-4">
              <span>Total Price:</span>
              <span className="text-green-600">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate("/create-order")}
              className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold shadow"
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
