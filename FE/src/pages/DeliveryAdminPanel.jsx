import React, { useState, useEffect } from "react";
import axios from "axios";

const formatVND = (value) => {
  if (!value) return "0 ₫";
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ============================================================
     FETCH ORDERS
  ============================================================ */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:8000/delivery/orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setOrders(response.data.orders || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch delivery orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ============================================================
     FETCH RESTAURANTS
  ============================================================ */
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8000/restaurant/getAllRestaurant",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRestaurants(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRestaurants();
  }, []);

  const getRestaurant = (id) => restaurants.find((r) => r._id === id);

  /* ============================================================
     CLAIM ORDER
  ============================================================ */
  const handleClaimOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:8000/delivery/order/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = response.data.order;

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to claim order");
    }
  };

  /* ============================================================
     MARK AS DELIVERED
  ============================================================ */
  const handleDelivered = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:8000/delivery/order/${orderId}/deliver`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = response.data.order;

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update order");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "accepted":
        return "bg-yellow-500";
      case "in-transit":
        return "bg-purple-600";
      case "delivered":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Delivery Admin Panel</h1>

      {error && <div className="bg-red-500 p-4 text-white">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => {
            const rest = getRestaurant(o.restaurantId);

            return (
              <div key={o._id} className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">
                  Order #{o._id.slice(-6)}
                </h3>

                <span className={`px-3 py-1 rounded-full text-white ${getStatusClass(o.orderStatus)}`}>
                  {o.orderStatus}
                </span>

                <p className="text-gray-300 mt-2">
                  Restaurant: <strong>{rest?.name}</strong>
                </p>

                <p className="text-gray-300">
                  Delivery: {o.deliveryLocation?.address}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  {o.orderStatus === "accepted" && (
                    <button
                      onClick={() => handleClaimOrder(o._id)}
                      className="bg-blue-600 px-4 py-2 text-white rounded"
                    >
                      Claim Order
                    </button>
                  )}

                  {o.orderStatus === "in-transit" && (
                    <button
                      onClick={() => handleDelivered(o._id)}
                      className="bg-green-600 px-4 py-2 text-white rounded"
                    >
                      Delivered
                    </button>
                  )}

                  <strong className="text-yellow-500">
                    {formatVND(o.totalAmount)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllOrders;
