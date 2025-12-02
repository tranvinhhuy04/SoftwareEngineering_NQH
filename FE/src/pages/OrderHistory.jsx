import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================= FETCH ORDERS =========================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:8000/order/orders/customer",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ========================= STATUS BADGE =========================
  const getStatusClass = (status) => {
    const base =
      "px-3 py-1 text-sm font-semibold rounded-full shadow-sm border";

    switch (status) {
      case "pending":
        return `${base} bg-yellow-50 text-yellow-700 border-yellow-300`;
      case "accepted":
        return `${base} bg-blue-50 text-blue-700 border-blue-300`;
      case "in-transit":
        return `${base} bg-purple-50 text-purple-700 border-purple-300`;
      case "delivered":
        return `${base} bg-green-50 text-green-700 border-green-300`;
      case "cancelled":
        return `${base} bg-red-50 text-red-700 border-red-300`;
      default:
        return `${base} bg-gray-100 text-gray-600 border-gray-300`;
    }
  };

  // ========================= FORMAT DATE =========================
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 p-10">
      {/* HEADER */}
      <h1 className="text-4xl font-extrabold text-center mb-4 bg-gradient-to-r 
        from-green-600 to-yellow-500 bg-clip-text text-transparent">
        📦 Your Orders
      </h1>
      <p className="text-center text-gray-600 mb-10 text-lg">
        Track and manage all your orders
      </p>

      {/* ERROR */}
      {error && (
        <div className="max-w-2xl mx-auto bg-red-100 text-red-600 py-3 px-5 rounded-xl text-center mb-6">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="text-center mt-20">
          <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-xl text-gray-600">
            You don’t have any orders yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}`)}
              className="bg-white rounded-3xl shadow-lg border hover:shadow-xl transition p-6"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-200 rounded-lg text-gray-700 text-sm font-semibold">
                      #{order?._id?.slice(-6)}
                    </span>
                    Order Details
                  </h3>

                  <p className="text-gray-500 mt-1 text-sm">
                    {formatDate(order?.orderDate)}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    Customer: <strong>{order.customerEmail}</strong>
                  </p>
                </div>

                <span className={getStatusClass(order?.orderStatus)}>
                  {order?.orderStatus
                    ? order.orderStatus.charAt(0).toUpperCase() +
                      order.orderStatus.slice(1)
                    : "Unknown"}
                </span>
              </div>

              {/* DELIVERY LOCATION */}
              <div className="mt-3">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Delivery Location:
                </h4>
                <div className="bg-gray-50 p-3 rounded-xl text-gray-700 text-sm">
                  📍 {order?.deliveryLocation?.address}
                  <br />
                  ({order?.deliveryLocation?.latitude?.toFixed(4)},{" "}
                  {order?.deliveryLocation?.longitude?.toFixed(4)})
                </div>
              </div>

              {/* RESTAURANT LOCATION */}
              <div className="mt-3">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Restaurant:
                </h4>
                <div className="bg-gray-50 p-3 rounded-xl text-gray-700 text-sm">
                  🍽 {order?.restaurantLocation?.address}
                </div>
              </div>

              {/* TOTAL */}
              <div className="mt-5 flex justify-between items-center text-xl">
                <span className="text-gray-700 font-semibold">Total:</span>
                <span className="text-green-600 font-extrabold">
                  ${(order.totalAmount / 1000).toFixed(3)}
                </span>
              </div>

              {/* DRONE BUTTON */}
              {order?.deliveryMethod === "drone" && (
                <button
                  className="mt-5 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                  onClick={() =>
                    navigate(`/orders/${order._id}/drone-tracking`)
                  }
                >
                  🚁 Track Drone Delivery
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
