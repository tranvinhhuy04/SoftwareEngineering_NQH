import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";

const ShoppingCart = () => {
  const { cart, addToCart, removeFromCart, clearCart } =
    useContext(CartContext);

  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 text-gray-900 flex flex-col">

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <h1
            onClick={() => navigate("/")}
            className="text-3xl font-extrabold tracking-wide cursor-pointer"
          >
            <span className="text-gray-900">Fast</span>
            <span className="text-green-600">Food</span>
          </h1>

          <button
            onClick={() => navigate("/create-order")}
            className="px-5 py-2 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition shadow"
          >
            Create Order
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-6 py-10 flex-grow">
        <h2 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
          Your Shopping Cart
        </h2>

        {/* EMPTY CART */}
        {cart.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow max-w-2xl mx-auto border border-gray-200">
            <p className="text-xl font-semibold text-gray-700">Your cart is empty.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition shadow"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* CART ITEMS */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow p-5 border hover:shadow-lg transition flex gap-5"
                >
                  {/* IMAGE */}
                  <img
                    src={
                      item.imageUrl ||
                      item.image_url ||
                      "https://via.placeholder.com/150"
                    }
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded-xl"
                  />

                  {/* DETAILS */}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold">{item.name}</h4>
                    <p className="text-gray-500 text-sm">{item.restaurantName}</p>

                    <p className="text-green-600 font-bold text-lg mt-1">
                      ${item.price.toFixed(2)}
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                      >
                        -
                      </button>

                      <span className="font-semibold">{item.quantity}</span>

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

              {/* CLEAR CART */}
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
                <span>{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
              </div>

              <div className="flex justify-between text-xl font-bold mt-4">
                <span>Total Price:</span>
                <span className="text-green-600">${totalPrice.toFixed(2)}</span>
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
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-600">
        © {new Date().getFullYear()} Fastfood. All rights reserved.
      </footer>
    </div>
  );
};

export default ShoppingCart;
