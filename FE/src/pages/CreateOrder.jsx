import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "./customer/CartContext";
import "../styles/CreateOrder.css";

import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// ================= STRIPE =================
const stripePromise = loadStripe(
  "pk_test_51S8Mu3L5S2BtEXK03ziRNt7qohq6h48nuoVTMg0ibCjD9Oee74NsEtgjUBR4q7Xj3ResfxzKXnGWWgObYJ0CEWHy00bFbGfaXl"
);

// ================ CHILD CHECKOUT FORM ================
const CheckoutForm = ({
  onSuccess,
  onError,
  setLoading,
  selectedPaymentMethod,
  billingDetails,
  clientSecret,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe) return;

    setLoading(true);
    try {
      const confirmParams = { return_url: window.location.origin };

      const result = selectedPaymentMethod
        ? await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: selectedPaymentMethod },
            confirmParams
          )
        : await stripe.confirmPayment({
            elements,
            confirmParams: {
              ...confirmParams,
              payment_method_data: { billing_details: billingDetails },
            },
            redirect: "if_required",
          });

      if (result.error) {
        setPaymentError(result.error.message);
        onError(result.error);
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setPaymentError("Payment failed");
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-white">Payment Details</h3>

      {paymentError && <div className="text-red-500 mb-4">{paymentError}</div>}

      <form onSubmit={handleSubmit}>
        {!selectedPaymentMethod && <PaymentElement />}

        <button
          type="submit"
          disabled={!stripe}
          className="w-full py-3 mt-4 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-70"
        >
          Pay Now
        </button>
      </form>
    </div>
  );
};

// ================= MAIN CREATE ORDER PAGE =================
const CreateOrder = () => {
  const { cart, addToCart, removeFromCart, clearCart } =
    useContext(CartContext);

  const navigate = useNavigate();

  // ================= STATES =================
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");

  const [menuItems, setMenuItems] = useState([]);

  const [billingDetails, setBillingDetails] = useState({
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

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const [clientSecret, setClientSecret] = useState("");
  const [orderData, setOrderData] = useState(null);

  const [address, setAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ================= FETCH RESTAURANTS =================
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:8000/restaurant/api/restaurants",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRestaurants(data);
      } catch (err) {
        setError("Failed to fetch restaurants");
      }
    };

    fetchRestaurants();
  }, []);

  // ================= FETCH MENU =================
  useEffect(() => {
    if (!selectedRestaurant) return setMenuItems([]);

    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:8000/restaurant/${selectedRestaurant}/menu`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMenuItems(data);
      } catch {
        setError("Failed to fetch menu items");
      }
    };

    fetchMenu();
  }, [selectedRestaurant]);

  // ================= ADD TO CART FIXED VERSION =================
  const handleAddToCart = (item) => {
    if (!selectedRestaurant) {
      setError("Please select a restaurant first");
      return;
    }

    const r = restaurants.find((x) => x._id === selectedRestaurant);

    const itemWithRestaurant = {
      ...item,
      restaurantId: selectedRestaurant,
      restaurantName: r ? r.name : "",
    };

    addToCart(itemWithRestaurant);

    const noti = document.getElementById("notification");
    if (!noti) return;
    noti.classList.remove("hidden");
    noti.classList.add("flex");
    setTimeout(() => noti.classList.add("hidden"), 1500);
  };

  // ================= FILTER CART =================
  const displayedCart = selectedRestaurant
    ? cart.filter((i) => i.restaurantId === selectedRestaurant)
    : cart;

  // ================= TOTAL =================
  const calculateTotal = () =>
    displayedCart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ================= LOCATION =================
  const getCurrentLocation = () => {
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return setLoadingLocation(false);
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setDeliveryLocation(coords);
        setLoadingLocation(false);
      },
      () => {
        setError("Failed to get location");
        setLoadingLocation(false);
      }
    );
  };

  // ============================= PAYMENT INIT =============================
  const initiatePayment = async () => {
    if (displayedCart.length === 0)
      return setError("Your cart is empty for this restaurant");

    if (!deliveryLocation)
      return setError("Please provide your delivery location");

    if (!billingDetails.name || !billingDetails.email)
      return setError("Please fill billing details");

    const newOrder = {
      restaurantId: selectedRestaurant,
      items: displayedCart.map((i) => ({
        _id: i.menuId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        restaurantId: i.restaurantId,
      })),
      total: calculateTotal(),
      deliveryLocation,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:8000/payment/create-payment-intent",
        {
          amount: newOrder.total * 100,
          currency: "usd",
          billingDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClientSecret(data.clientSecret);
      setOrderData(newOrder);
      setShowPaymentModal(true);
    } catch {
      setError("Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  // ============================= PAYMENT SUCCESS =============================
  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:8000/order/create",
        {
          ...orderData,
          paymentIntentId,
          deliveryMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      clearCart();
      alert("Order successful!");
      navigate("/orders");
    } catch {
      alert("Payment failed!");
    }
  };

  // ============================= UI RENDER =============================
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
        <h2 className="text-4xl font-bold mb-10 text-center">Create Order</h2>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        

        {/* DELIVERY LOCATION */}
        <div className="mt-10 bg-gray-50 rounded-2xl p-6 shadow">
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
              ✓ Location captured ({deliveryLocation.latitude.toFixed(4)},{" "}
              {deliveryLocation.longitude.toFixed(4)})
            </p>
          )}
        </div>

        {/* BILLING DETAILS */}
        <div className="mt-10 bg-gray-50 rounded-2xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">Billing Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["Full Name", "name"],
              ["Email", "email"],
              ["City", "city"],
              ["State", "state"],
              ["Postal Code", "postal_code"],
              ["Country", "country"],
            ].map(([label, field]) => (
              <div key={field}>
                <label className="block mb-2 font-medium">{label}</label>

                <input
                  type="text"
                  value={
                    field === "name" || field === "email"
                      ? billingDetails[field]
                      : billingDetails.address[field]
                  }
                  onChange={(e) =>
                    setBillingDetails((prev) =>
                      field === "name" || field === "email"
                        ? { ...prev, [field]: e.target.value }
                        : {
                            ...prev,
                            address: {
                              ...prev.address,
                              [field]: e.target.value,
                            },
                          }
                    )
                  }
                  className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="mt-10 bg-gray-50 rounded-2xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">Your Order</h3>

          {/* DELIVERY METHOD */}
          <label className="font-medium">Delivery Method</label>
          <select
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl mt-2 mb-6 bg-white focus:ring-2 focus:ring-green-500"
          >
            <option value="delivery">🚚 Delivery</option>
            <option value="drone">🚁 Drone Delivery</option>
          </select>

          {/* CART ITEMS */}
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
                        ${item.price.toFixed(2)} × {item.quantity}
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
              <div className="mt-6">
                <label className="font-medium">Payment Method</label>

                {loadingPaymentMethods ? (
                  <p className="text-gray-500">Loading...</p>
                ) : paymentMethods.length ? (
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-green-500 mt-2"
                  >
                    <option value="">Add new payment method</option>
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.card.brand.toUpperCase()} ending{" "}
                        {pm.card.last4}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-500">No saved payment methods.</p>
                )}
              </div>

              {/* PAY BUTTON */}
              <button
                onClick={initiatePayment}
                disabled={!deliveryLocation || loading}
                className="mt-6 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition disabled:bg-gray-300"
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </button>

              {!deliveryLocation && displayedCart.length > 0 && (
                <p className="text-green-600 mt-2 text-sm">
                  Please provide your delivery location.
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-500">Your cart is empty.</p>
          )}
        </div>

        {/* PAYMENT MODAL */}
        {showPaymentModal && clientSecret && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white text-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
              >
                ✕
              </button>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => setError(err.message)}
                  setLoading={setLoading}
                  selectedPaymentMethod={selectedPaymentMethod}
                  billingDetails={billingDetails}
                  clientSecret={clientSecret}
                />
              </Elements>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500">
        © {new Date().getFullYear()} Fastfood. All rights reserved.
      </footer>
    </div>
  );
};

export default CreateOrder;
