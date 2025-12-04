import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "./customer/CartContext";
import "../styles/CreateOrder.css";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// ==========================
//  PUBLISHABLE KEY STRIPE
// ==========================
const stripePromise = loadStripe(
  "pk_test_51S8Mu3L5S2BtEXK03ziRNt7qohq6h48nuoVTMg0ibCjD9Oee74NsEtgjUBR4q7Xj3ResfxzKXnGWWgObYJ0CEWHy00bFbGfaXl"
);

const API_BASE = "http://localhost:8000";

function OrderContent() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart } =
    useContext(CartContext);

  const stripe = useStripe();
  const elements = useElements();

  // ================= STATES =================
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");

  const [menuItems, setMenuItems] = useState([]);

  const [billingDetails, setBillingDetails] = useState({
    receiver: "",
    phone_number: "",
    email: "",
  });

  const [address, setAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  // ================= FETCH RESTAURANTS =================
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${API_BASE}/restaurant/getAllRestaurant`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRestaurants(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch restaurants");
      }
    };

    fetchRestaurants();
  }, []);

  // ================= FETCH MENU =================
  useEffect(() => {
    if (!selectedRestaurant) {
      setMenuItems([]);
      return;
    }

    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${API_BASE}/restaurant/${selectedRestaurant}/menu`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMenuItems(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch menu items");
      }
    };

    fetchMenu();
  }, [selectedRestaurant]);

  // ================= FETCH USER FOR BILLING =================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const { data } = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBillingDetails({
          receiver: data.name || "",
          phone_number: data.phone_number || "",
          email: data.email || "",
        });

        if (data.address) setAddress(data.address);
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };

    fetchUser();
  }, []);

  // ================= ADD TO CART =================
  const handleAddToCart = (item) => {
    if (!selectedRestaurant)
      return setError("Please select a restaurant first");

    const r = restaurants.find((x) => x._id === selectedRestaurant);

    addToCart({
      ...item,
      restaurantId: selectedRestaurant,
      restaurantName: r ? r.name : "",
    });

    const noti = document.getElementById("notification");
    if (noti) {
      noti.classList.remove("hidden");
      noti.classList.add("flex");
      setTimeout(() => noti.classList.add("hidden"), 1500);
    }
  };

  // ================= CART FILTER =================
  const displayedCart = selectedRestaurant
    ? cart.filter((i) => i.restaurantId === selectedRestaurant)
    : cart;

  const calculateTotal = () =>
    displayedCart.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

  // ================= LOCATION HANDLER =================
  const getCurrentLocation = () => {
    if (!navigator.geolocation)
      return setError("Geolocation not supported");

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          const realAddress = data.display_name || "Unknown location";

          setDeliveryLocation({
            latitude,
            longitude,
            address: realAddress,
          });

          setAddress(realAddress);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        setError("Failed to get location");
        setLoadingLocation(false);
      }
    );
  };
  // ================= PLACE ORDER (COD + STRIPE) =================
  const handlePlaceOrder = async () => {
    setError("");

    if (!selectedRestaurant)
      return setError("Please select a restaurant");

    if (!displayedCart.length)
      return setError("Your cart is empty");

    if (!deliveryLocation)
      return setError("Please provide your delivery location");

    if (!billingDetails.receiver || !billingDetails.phone_number)
      return setError("Please fill receiver info");

    const newOrder = {
      restaurantId: selectedRestaurant,
      items: displayedCart.map((i) => ({
        menuId: i.menuId,
        name: i.name,
        price_per_unit: i.price,
        quantity: i.quantity,
        restaurantId: i.restaurantId,
      })),
      total: calculateTotal(),
      deliveryLocation,
      deliveryMethod,
      receiverName: billingDetails.receiver,
      phone_number: billingDetails.phone_number,
      email: billingDetails.email,
      address,
      paymentMethod,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1) Tạo order trước
      const { data } = await axios.post(
        `${API_BASE}/order/orders/create`,
        newOrder,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdOrder = data.order || data;
      const orderId =
        createdOrder._id || createdOrder.id || createdOrder.orderId;

      if (!orderId)
        return setError("Cannot determine created order ID");

      // ================= COD =================
      if (paymentMethod === "cod") {
        clearCart();
        alert("Order created with COD!");
        return navigate("/orders");
      }

      // ================= STRIPE =================
      if (!stripe || !elements) {
        return setError("Stripe is not ready yet. Please try again.");
      }

      // Lấy thẻ từ Stripe Elements
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        return setError("Card element not found");
      }

      // 2) Gọi BE tạo PaymentIntent
      const { data: paymentIntentRes } = await axios.post(
        `${API_BASE}/payment/stripe/create`,
        {
          orderId,
          amount: calculateTotal() * 100, // USD cents
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3) Confirm payment với thẻ người dùng nhập
      const confirmResult = await stripe.confirmCardPayment(
        paymentIntentRes.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: billingDetails.receiver,
              email: billingDetails.email,
            },
          },
        }
      );

      if (confirmResult.error) {
        console.error(confirmResult.error);
        return setError(confirmResult.error.message || "Stripe payment error");
      }

      if (confirmResult.paymentIntent.status === "succeeded") {
        // 4) Gọi verify để update DB + publish event
        await axios.get(
          `${API_BASE}/payment/stripe/verify/${confirmResult.paymentIntent.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        clearCart();
        alert("Payment successful!");
        return navigate("/orders");
      } else {
        return setError("Payment not completed.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI RENDER =================
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Notification */}
      <div
        id="notification"
        className="hidden fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg items-center z-50"
      >
        ✔ Added to cart!
      </div>

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

      {/* MAIN */}
      <main className="container mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold mb-10 text-center">
          Create Order
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* RESTAURANT SELECT */}
        <div className="bg-gray-50 rounded-2xl p-6 shadow mb-8">
          <h3 className="text-xl font-semibold mb-4">Choose Restaurant</h3>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
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

        {/* 3 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">
            {/* MENU */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">Menu</h3>

              {menuItems.length ? (
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center border-b pb-3"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-gray-500 text-sm">
                          {item.price.toLocaleString("vi-VN")}₫
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleAddToCart({
                            menuId: item._id,
                            name: item.name,
                            price: item.price,
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  Select a restaurant to see menu.
                </p>
              )}
            </div>

            {/* DELIVERY LOCATION */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">
                Delivery Location
              </h3>

              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={address}
                  placeholder="Enter your delivery address"
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                />

                <button
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  className="px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300"
                >
                  {loadingLocation ? "Loading..." : "Use Current Location"}
                </button>
              </div>

              {deliveryLocation && (
                <p className="text-green-600 mt-3 text-sm">
                  ✓ Address detected automatically from GPS
                </p>
              )}
            </div>

            {/* BILLING DETAILS */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">
                Billing Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Receiver Name</label>
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

                <div>
                  <label className="font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={billingDetails.phone_number}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-medium">Email</label>
                  <input
                    type="email"
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

          {/* RIGHT SIDE */}
          <div className="bg-gray-50 rounded-2xl p-6 shadow">
            <h3 className="text-xl font-semibold mb-4">Your Order</h3>

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

            {displayedCart.length ? (
              <>
                <div className="space-y-4">
                  {displayedCart.map((item) => (
                    <div
                      key={item.menuId}
                      className="flex justify-between items-center border-b pb-3"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-gray-500 text-sm">
                          {item.price.toLocaleString("vi-VN")}₫ ×{" "}
                          {item.quantity}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {item.restaurantName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.menuId)}
                          className="px-3 py-1 border rounded-lg hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="font-semibold">
                          {item.quantity}
                        </span>
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
                <div className="text-xl font-bold mt-6 flex justify-between">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {calculateTotal().toLocaleString("vi-VN")}₫
                  </span>
                </div>

                {/* PAYMENT METHOD */}
                <div className="mt-8">
                  <label className="font-medium text-lg">
                    Payment Method
                  </label>

                  <div className="flex flex-col gap-4 mt-4">
                    {/* Stripe */}
                    <div
                      className={`border rounded-xl p-4 cursor-pointer flex items-center gap-4 transition-all 
                        ${
                          paymentMethod === "stripe"
                            ? "border-blue-600 bg-blue-50"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      onClick={() => setPaymentMethod("stripe")}
                    >
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXVX71WNylmOuKOOmadMbHiYbSdtyD7GtSNg&s"
                        alt="Stripe"
                        className="w-14 h-14 object-contain"
                      />
                      <div>
                        <p className="font-semibold text-lg">Stripe</p>
                        <p className="text-sm text-gray-500">
                          Thanh toán online qua Stripe
                        </p>
                      </div>
                    </div>

                    {/* COD */}
                    <div
                      className={`border rounded-xl p-4 cursor-pointer flex items-center gap-4 transition-all 
                        ${
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

                {/* STRIPE CARD ELEMENT */}
                {paymentMethod === "stripe" && (
                  <div className="mt-6">
                    <label className="font-medium mb-2 block">
                      Card Information
                    </label>
                    <div className="border rounded-xl px-3 py-3 bg-white">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#32325d",
                              "::placeholder": { color: "#a0aec0" },
                            },
                            invalid: { color: "#e53e3e" },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* BUTTON */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !displayedCart.length}
                  className="mt-6 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold disabled:bg-gray-300"
                >
                  {loading
                    ? "Processing..."
                    : paymentMethod === "cod"
                    ? "Place Order (COD)"
                    : "Pay with Stripe"}
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
        © {new Date().getFullYear()} Fastfood. All rights reserved.
      </footer>
    </div>
  );
}

// ================= WRAPPER WITH <Elements> =================
const CreateOrder = () => {
  return (
    <Elements stripe={stripePromise}>
      <OrderContent />
    </Elements>
  );
};

export default CreateOrder;
