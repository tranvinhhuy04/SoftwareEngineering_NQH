import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "./customer/CartContext";
import "../styles/CreateOrder.css";

const API_BASE = "http://localhost:8000";

// ================= MAIN CREATE ORDER PAGE =================
const CreateOrder = () => {
  const { cart, addToCart, removeFromCart, clearCart } =
    useContext(CartContext);

  const navigate = useNavigate();

  // ================= STATES =================
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");

  const [menuItems, setMenuItems] = useState([]);

  // chỉ cần 3 field: receiver, phone_number, email
  const [billingDetails, setBillingDetails] = useState({
    receiver: "",
    phone_number: "",
    email: "",
  });

  const [address, setAddress] = useState(""); // địa chỉ giao hàng
  const [deliveryLocation, setDeliveryLocation] = useState(null); // { latitude, longitude }

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "vnpay"

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

  // ================= FETCH USER (/auth/me) FOR BILLING =================
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

  // ================= LOCATION (GPS + REVERSE GEOCODING) =================
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported in this browser");
      return;
    }

    setLoadingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          // Reverse geocoding
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const realAddress = data.display_name || "Unknown location";

          // Lưu cả tọa độ + address vào state
          setDeliveryLocation({
            latitude,
            longitude,
            address: realAddress,
          });

          setAddress(realAddress);
        } catch (err) {
          console.error("Reverse geocoding failed:", err);

          const fallback = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;

          setDeliveryLocation({
            latitude,
            longitude,
            address: fallback,
          });

          setAddress(fallback);
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error("GPS error:", err);
        setError("Failed to get location");
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };


  // ================= PLACE ORDER (COD + VNPAY) =================
  const handlePlaceOrder = async () => {
    setError("");

    if (!selectedRestaurant) {
      return setError("Please select a restaurant");
    }

    if (!displayedCart.length) {
      return setError("Your cart is empty for this restaurant");
    }

    if (!deliveryLocation) {
      return setError("Please provide your delivery location");
    }

    if (!billingDetails.receiver || !billingDetails.phone_number) {
      return setError("Please fill receiver name & phone number");
    }

    if (!billingDetails.email) {
      return setError("Please fill email");
    }

    const newOrder = {
      restaurantId: selectedRestaurant,
      items: displayedCart.map((i) => ({
        menuId: i.menuId,
        name: i.name,
        price_per_unit: i.price,
        quantity: i.quantity,
        restaurantId: i.restaurantId,
      })),
      total: calculateTotal(), // giả sử VND
      deliveryLocation, // { latitude, longitude }
      deliveryMethod,
      receiverName: billingDetails.receiver,
      phone_number: billingDetails.phone_number,
      email: billingDetails.email,
      address,
      paymentMethod, // "cod" | "vnpay"
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // 1) Tạo Order trước
      const { data } = await axios.post(
        `${API_BASE}/order/orders/create`,
        newOrder,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const createdOrder = data.order || data;
      const orderId =
        createdOrder._id || createdOrder.id || createdOrder.orderId;

      if (!orderId) {
        setError("Cannot determine created order ID");
        return;
      }

      // 2) Nếu COD → xong tại đây
      if (paymentMethod === "cod") {
        clearCart();
        alert("Order created with COD successfully!");
        navigate("/orders");
        return;
      }

      // 3) Nếu VNPay → gọi Payment Service tạo payUrl
      const vnpAmount = Math.round(newOrder.total);

      const { data: payRes } = await axios.post(
        `${API_BASE}/payment/vnpay/create`,
        {
          orderId,
          amount: vnpAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (payRes && payRes.payUrl) {
        window.location.href = payRes.payUrl; // redirect sang VNPay
      } else {
        setError("Failed to create VNPay payment link");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to place order");
    } finally {
      setLoading(false);
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

        {/* CHỌN NHÀ HÀNG */}
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

        {/* MENU + ORDER SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: MENU + LOCATION + BILLING */}
          <div className="lg:col-span-2 space-y-8">
            {/* MENU ITEMS */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">Menu</h3>

              {menuItems.length ? (
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div
                      key={item._id || item.menuId}
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
                            menuId: item._id || item.menuId,
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
                  Please select a restaurant to view menu.
                </p>
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
                  onChange={(e) => setAddress(e.target.value)}
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
                <p className="text-green-600 mt-3 text-sm">
                  ✓ Address detected automatically from GPS
                </p>
              )}
            </div>

            {/* BILLING DETAILS */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h3 className="text-xl font-semibold mb-4">Billing Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Receiver Name */}
                <div>
                  <label className="block mb-2 font-medium">
                    Receiver Name
                  </label>
                  <input
                    type="text"
                    value={billingDetails.receiver}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        receiver: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block mb-2 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={billingDetails.phone_number}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) =>
                      setBillingDetails((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="bg-gray-50 rounded-2xl p-6 shadow">
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
                    {calculateTotal().toLocaleString("vi-VN")}₫
                  </span>
                </div>

                {/* PAYMENT METHOD - VNPay + COD (UI A) */}
                <div className="mt-8">
                  <label className="font-medium text-lg">Payment Method</label>

                  <div className="flex flex-col gap-4 mt-4">
                    {/* VNPay */}
                    <div
                      className={`border rounded-xl p-4 w-full cursor-pointer flex items-center gap-4 transition-all ${paymentMethod === "vnpay"
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
                          Thanh toán online qua cổng VNPay
                        </p>
                      </div>
                    </div>

                    {/* COD */}
                    <div
                      className={`border rounded-xl p-4 w-full cursor-pointer flex items-center gap-4 transition-all ${paymentMethod === "cod"
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
                          Thanh toán tiền mặt khi nhận hàng
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PLACE ORDER BUTTON */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !displayedCart.length}
                  className="mt-6 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition disabled:bg-gray-300"
                >
                  {loading
                    ? "Processing..."
                    : paymentMethod === "cod"
                      ? "Place Order (COD)"
                      : "Proceed with VNPay"}
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
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500">
        © {new Date().getFullYear()} Fastfood. All rights reserved.
      </footer>
    </div>
  );
};

export default CreateOrder;
