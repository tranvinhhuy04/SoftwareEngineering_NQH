import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:8000/order/orders/details/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setOrder(res.data.order || {});
        setItems(res.data.items || []);
      } catch (err) {
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="text-center mt-20">
        <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 mt-4 text-lg">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center mt-20 text-red-600 text-xl">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 p-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-5 py-2 bg-gray-200 rounded-xl text-gray-700 hover:bg-gray-300 transition"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r 
        from-green-600 to-yellow-500 bg-clip-text text-transparent">
        🧾 Order Details
      </h1>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 border">

        {/* ORDER HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="px-2 py-1 bg-gray-200 rounded-lg text-gray-700 text-sm font-semibold">
                #{order?._id?.slice(-6) || "??????"}
              </span>
              Order Overview
            </h3>

            <p className="text-gray-500 mt-1">{formatDate(order?.createdAt)}</p>

            <p className="text-gray-600 mt-1">
              Customer: <strong>{order?.customerEmail}</strong>
            </p>
          </div>

          <span className={getStatusClass(order?.orderStatus)}>
            {order?.orderStatus
              ? order.orderStatus.charAt(0).toUpperCase() +
                order.orderStatus.slice(1)
              : "Unknown"}
          </span>
        </div>

        {/* LOCATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* DELIVERY LOCATION */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              Delivery Location:
            </h4>
            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm">
              📍 {order?.deliveryLocation?.address || "No address provided"}
              <br />
              ({order?.deliveryLocation?.latitude?.toFixed(4) || "?"},{" "}
              {order?.deliveryLocation?.longitude?.toFixed(4) || "?"})
            </div>
          </div>

          {/* RESTAURANT LOCATION */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Restaurant:</h4>
            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm">
              🍽 {order?.restaurantLocation?.address || "No restaurant address"}
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-3">Items Ordered</h3>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"
              >
                <div className="text-gray-800 font-medium">
                  {item.quantity}x {item.menuId}
                </div>

                <div className="text-green-600 font-bold">
                  ${(item.subtotal / 1000).toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOTAL */}
        <div className="mt-10 flex justify-between items-center text-2xl">
          <span className="font-semibold text-gray-700">Total:</span>
          <span className="text-green-600 font-extrabold">
            ${(order?.totalAmount / 1000).toFixed(3)}
          </span>
        </div>

        {/* DRONE TRACKING */}
        {order?.deliveryMethod === "drone" && (
          <button
            className="mt-8 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
            onClick={() => navigate(`/orders/${order._id}/drone-tracking`)}
          >
            🚁 Track Drone Delivery
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
