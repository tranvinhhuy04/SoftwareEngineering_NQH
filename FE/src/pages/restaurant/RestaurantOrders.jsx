import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function RestaurantOrders() {
  const [restaurants, setRestaurants] = useState([]); // 🔥 nhiều nhà hàng
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ============================================================
     LOAD LIST RESTAURANTS OF OWNER
  ============================================================ */
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE}/restaurant/api/restaurants-id`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.data || res.data.length === 0) {
          setError("You do not own any restaurant.");
          setLoading(false);
          return;
        }

        setRestaurants(res.data);

        // Chọn restaurant đầu tiên nếu có
        const first = res.data[0];
        setSelectedRestaurant(first._id);
        loadOrders(first._id);

      } catch (err) {
        console.error("LOAD RESTAURANTS ERROR:", err);
        setError("Failed to load restaurants.");
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  /* ============================================================
     LOAD ORDERS FOR SELECTED RESTAURANT
  ============================================================ */
  const loadOrders = async (restaurantId) => {
    try {
      const token = localStorage.getItem("token");

      const orderRes = await axios.get(
        `${API_BASE}/order/orders/restaurant/${restaurantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(orderRes.data || []);
    } catch (err) {
      console.error("LOAD ORDERS ERROR:", err);
      setError("Failed to load orders.");
    }
  };

  /* ============================================================
     ON SELECT RESTAURANT CHANGE
  ============================================================ */
  const handleChangeRestaurant = (e) => {
    const restId = e.target.value;
    setSelectedRestaurant(restId);
    loadOrders(restId);
  };

  /* ============================================================
     UPDATE ORDER STATUS
  ============================================================ */
  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_BASE}/order/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);
      setError("Failed to update order status.");
    }
  };

  /* ---------------- HELPERS ---------------- */
  const currency = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(n) || 0);

  const fmt = (d) =>
    new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(d));

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 p-10">
      <h1 className="text-center text-4xl font-bold text-green-700 mb-10">
        Incoming Orders
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center max-w-xl mx-auto mb-6">
          {error}
        </div>
      )}

      {/* SELECT RESTAURANT */}
      <div className="max-w-xl mx-auto mb-8 bg-white p-6 rounded-xl shadow border">
        <label className="font-semibold text-gray-700 mb-2 block">
          Select Restaurant:
        </label>

        <select
          value={selectedRestaurant || ""}
          onChange={handleChangeRestaurant}
          className="w-full border px-4 py-2 rounded-lg bg-gray-50 text-gray-900"
        >
          {restaurants.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-center text-gray-600 text-lg">Loading orders...</p>
      )}

      {!loading && orders.length === 0 && (
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-10 text-center">
          <p className="text-gray-500 text-lg mb-4">No incoming orders yet.</p>
        </div>
      )}

      {/* LIST ORDERS */}
      <div className="max-w-3xl mx-auto space-y-6">
        {orders.map((o) => (
          <div
            key={o._id}
            className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100"
          >
            {/* HEADER */}
            <div className="flex justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-green-700">
                  Order #{o._id.slice(-6)}
                </h2>
                <p className="text-gray-500 text-sm">{fmt(o.createdAt)}</p>
                <p className="text-gray-500 text-sm">{o.customerEmail}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  {
                    pending: "bg-gray-200 text-gray-700",
                    accepted: "bg-yellow-300 text-yellow-900",
                    "in-transit": "bg-blue-300 text-blue-900",
                    delivered: "bg-green-300 text-green-900",
                  }[o.orderStatus]
                }`}
              >
                {o.orderStatus}
              </span>
            </div>

            {/* ITEMS */}
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              {o.items?.map((it, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-gray-700 text-sm"
                >
                  <span>
                    {it.quantity}× {it.name}
                  </span>
                  <span>{currency(it.price_per_unit * it.quantity)}</span>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold text-green-700">
                Total: {currency(o.totalAmount)}
              </div>

              <div>
                {o.orderStatus === "pending" && (
                  <button
                    onClick={() => updateStatus(o._id, "accepted")}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold"
                  >
                    Accept Order
                  </button>
                )}

                {o.orderStatus === "accepted" && (
                  <button
                    onClick={() => updateStatus(o._id, "in-transit")}
                    className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Send Delivery
                  </button>
                )}

                {o.orderStatus === "in-transit" && (
                  <button
                    onClick={() => updateStatus(o._id, "delivered")}
                    className="ml-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
