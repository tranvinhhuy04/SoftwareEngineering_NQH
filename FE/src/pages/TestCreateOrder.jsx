import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateOrder.css";

const TestCreateOrder = () => {
  const navigate = useNavigate();

  // ================= MOCK RESTAURANT & MENU =================
  const mockRestaurants = [
    { _id: "r1", name: "Mc Doner" },
    { _id: "r2", name: "Pizza House" },
  ];

  const mockMenuByRestaurant = {
    r1: [
      { menuId: "m1", name: "Burger Combo", price: 5.99 },
      { menuId: "m2", name: "Fried Chicken", price: 4.49 },
    ],
    r2: [
      { menuId: "m3", name: "Pepperoni Pizza", price: 8.99 },
      { menuId: "m4", name: "Cheese Pizza", price: 7.49 },
    ],
  };

  // ================= STATES =================
  const [restaurants] = useState(mockRestaurants);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);

  const [billingDetails, setBillingDetails] = useState({
    receiver: "",
    phone: "",
    name: "",
    email: "",
    address: {
      line1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
    },
  });

  const [address, setAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ================= FETCH USER INFO =================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBillingDetails((prev) => ({
          ...prev,
          name: data.name || "",
          receiver: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: { ...prev.address, line1: data.address || "" },
        }));

        setAddress(data.address || "");
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };

    fetchUser();
  }, []);

  // ================= RESTAURANT SELECT =================
  const handleSelectRestaurant = (id) => {
    setSelectedRestaurant(id);
    setMenuItems(mockMenuByRestaurant[id] || []);
    setCart([]);
    setError("");
  };

  // ================= CART FUNCTIONS =================
  const handleAddToCart = (item) => {
    if (!selectedRestaurant)
      return setError("Please select a restaurant first");

    const exist = cart.find((c) => c.menuId === item.menuId);

    if (exist) {
      setCart(
        cart.map((c) =>
          c.menuId === item.menuId ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...item,
          restaurantId: selectedRestaurant,
          restaurantName:
            restaurants.find((r) => r._id === selectedRestaurant)?.name || "",
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveFromCart = (menuId) => {
    const exist = cart.find((c) => c.menuId === menuId);

    if (!exist) return;

    if (exist.quantity === 1) {
      setCart(cart.filter((c) => c.menuId !== menuId));
    } else {
      setCart(
        cart.map((c) =>
          c.menuId === menuId ? { ...c, quantity: c.quantity - 1 } : c
        )
      );
    }
  };

  const calculateTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ================= GET CURRENT LOCATION + REVERSE GEOCODING =================
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setError("");

    setTimeout(async () => {
      const mock = {
        latitude: 10.762622,
        longitude: 106.660172,
      };

      setDeliveryLocation(mock);

      try {
        // CALL OPENSTREETMAP REVERSE API (FREE)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${mock.latitude}&lon=${mock.longitude}&format=json`
        );

        const data = await res.json();
        const realAddress = data.display_name || "Unknown location";

        setAddress(realAddress);

        setBillingDetails((prev) => ({
          ...prev,
          address: { ...prev.address, line1: realAddress },
        }));
      } catch (err) {
        console.log("Reverse geocoding failed", err);
        const fallback = `Lat: ${mock.latitude}, Lng: ${mock.longitude}`;

        setAddress(fallback);

        setBillingDetails((prev) => ({
          ...prev,
          address: { ...prev.address, line1: fallback },
        }));
      }

      setLoadingLocation(false);
    }, 800);
  };

  // ================= PLACE ORDER =================
  const handlePlaceOrder = () => {
    setError("");

    if (!selectedRestaurant) return setError("Please select a restaurant.");
    if (!cart.length) return setError("Your cart is empty.");
    if (!deliveryLocation) return setError("Please set your delivery location.");
    if (!billingDetails.receiver || !billingDetails.phone)
      return setError("Please fill receiver name & phone number.");

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert(
        `ORDER SUMMARY (TEST PAGE):\n` +
          `Receiver: ${billingDetails.receiver}\n` +
          `Phone: ${billingDetails.phone}\n` +
          `Email: ${billingDetails.email}\n` +
          `Address: ${billingDetails.address.line1}\n\n` +
          `Restaurant: ${
            restaurants.find((r) => r._id === selectedRestaurant)?.name
          }\n` +
          `Items: ${cart.length}\n` +
          `Total: $${calculateTotal().toFixed(2)}\n` +
          `Delivery: ${deliveryMethod}\n` +
          `Payment Method: ${paymentMethod.toUpperCase()}`
      );
    }, 700);
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-extrabold tracking-wide">
            <span className="text-black">Fast</span>
            <span className="text-green-600">Food</span>
          </h1>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 rounded-full text-sm font-semibold border hover:bg-gray-100 transition"
          >
            Home
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold mb-10 text-center">
          Create Order (TEST UI)
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">
            {/* RESTAURANT */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">Choose Restaurant</h3>

              <select
                value={selectedRestaurant}
                onChange={(e) => handleSelectRestaurant(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select restaurant --</option>
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* MENU */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">Menu</h3>

              {menuItems.length ? (
                menuItems.map((item) => (
                  <div
                    key={item.menuId}
                    className="flex justify-between items-center border-b pb-3 mb-3"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-500 text-sm">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Select a restaurant to view menu.</p>
              )}
            </div>

            {/* DELIVERY LOCATION */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">Delivery Location</h3>

              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={address}
                  placeholder="Enter your delivery address"
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setBillingDetails((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }));
                  }}
                  className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                />

                <button
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  className="px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:bg-gray-300"
                >
                  {loadingLocation ? "Loading..." : "Use Current Location"}
                </button>
              </div>

              {deliveryLocation && (
                <p className="text-green-600 mt-3">
                  ✓ Address detected automatically from GPS
                </p>
              )}
            </div>

            {/* BILLING DETAILS */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">Billing Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Receiver */}
                <div>
                  <label className="block mb-2 font-medium">Receiver Name</label>
                  <input
                    type="text"
                    value={billingDetails.receiver}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        receiver: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-2 font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={billingDetails.phone}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-white"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block mb-2 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={billingDetails.name}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 font-medium">Email</label>
                  <input
                    type="text"
                    value={billingDetails.email}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: ORDER SUMMARY */}
          <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Your Order (Test)</h3>

            {/* DELIVERY METHOD */}
            <label className="font-medium">Delivery Method</label>
            <select
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl mt-2 mb-6"
            >
              <option value="delivery">🚚 Delivery</option>
              <option value="drone">🚁 Drone Delivery</option>
            </select>

            {/* CART ITEMS */}
            {cart.length ? (
              <>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.menuId}
                      className="flex justify-between items-center border-b pb-3"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-gray-500 text-sm">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveFromCart(item.menuId)}
                          className="px-3 py-1 border rounded-lg hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-3 py-1 border rounded-lg hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTAL */}
                <div className="flex justify-between items-center text-xl font-bold mt-6">
                  <span>Total:</span>
                  <span className="text-green-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>

                {/* PAYMENT METHODS */}
                <div className="mt-8">
                  <label className="font-medium text-lg">Payment Method</label>

                  <div className="flex flex-col gap-4 mt-4">
                    {/* VNPay */}
                    <div
                      className={`border rounded-xl p-4 cursor-pointer flex items-center gap-4 transition-all ${
                        paymentMethod === "vnpay"
                          ? "border-blue-600 bg-blue-50"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => setPaymentMethod("vnpay")}
                    >
                      <img
                        src="https://vinadesign.vn/uploads/thumbnails/800/2023/05/vnpay-logo-vinadesign-25-12-59-16.jpg"
                        alt="VNPay"
                        className="w-14 h-14 object-contain"
                      />
                      <div>
                        <p className="font-semibold text-lg">VNPay</p>
                        <p className="text-sm text-gray-500">
                          Thanh toán qua VNPay
                        </p>
                      </div>
                    </div>

                    {/* COD */}
                    <div
                      className={`border rounded-xl p-4 cursor-pointer flex items-center gap-4 transition-all ${
                        paymentMethod === "cod"
                          ? "border-yellow-500 bg-yellow-50"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <img
                        src="https://uxwing.com/wp-content/themes/uxwing/download/banking-finance/money-notes-receiving-vietnamese-dong-color-icon.png"
                        alt="COD"
                        className="w-14 h-14 object-contain"
                      />
                      <div>
                        <p className="font-semibold text-lg">
                          Cash On Delivery (COD)
                        </p>
                        <p className="text-sm text-gray-500">
                          Thanh toán khi nhận hàng
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PLACE ORDER */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="mt-6 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition disabled:bg-gray-300"
                >
                  {loading ? "Processing..." : "Place Order (Test)"}
                </button>
              </>
            ) : (
              <p className="text-gray-500">Your cart is empty.</p>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500">
        © {new Date().getFullYear()} Fastfood. All rights reserved. (TEST PAGE)
      </footer>
    </div>
  );
};

export default TestCreateOrder;
