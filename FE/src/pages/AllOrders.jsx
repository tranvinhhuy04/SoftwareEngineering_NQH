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
     FETCH ORDERS READY FOR DELIVERY
  ============================================================ */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/delivery/orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Fetched orders:", response.data);

        setOrders(
          Array.isArray(response.data.orders)
            ? response.data.orders
            : []
        );
      } catch (err) {
        console.error("Error fetching orders:", err.message);
        setError("Failed to fetch delivery orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ============================================================
     FETCH RESTAURANTS (FOR NAME + ADDRESS)
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
        console.error("Failed to load restaurants", err);
      }
    };

    fetchRestaurants();
  }, []);

  const getRestaurant = (id) => restaurants.find((r) => r._id === id);

  /* ============================================================
     CLAIM ORDER (accepted → in-transit)
  ============================================================ */
  const handleClaimOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:8000/delivery/order/${orderId}`,
        { orderStatus: "in-transit" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Claim response:", response.data);

      setOrders(
        orders.map((o) =>
          o._id === orderId
            ? {
                ...o,
                orderStatus: "in-transit",
                deliveryPersonName: response.data.order?.deliveryPersonName,
                deliveryPersonId: response.data.order?.deliveryPersonId,
              }
            : o
        )
      );

      setError("");
    } catch (err) {
      console.error("Error claiming:", err.message);
      setError("Failed to claim order");
    }
  };

  /* ============================================================
     UPDATE STATUS (in-transit → delivered)
  ============================================================ */
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:8000/delivery/order/${orderId}`,
        { status: "delivered" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Status update:", response.data);

      setOrders(
        orders.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );

      setError("");
    } catch (err) {
      console.error("Error updating status:", err.message);
      setError("Failed to update order status");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-blue-600 text-white";
      case "accepted":
        return "bg-yellow-500 text-black";
      case "in-transit":
        return "bg-purple-600 text-white";
      case "delivered":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Delivery Admin Panel</h1>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent animate-spin mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-400">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-900 p-8 rounded text-center text-xl">
          No available or assigned orders.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const restaurant = getRestaurant(order.restaurantId);

            return (
              <div
                key={order._id}
                className="bg-gray-900 rounded-lg shadow-lg p-6"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      Order #{order._id?.slice(-6)}
                    </h3>

                    <p className="text-gray-400 text-sm">
                      {formatDate(order.createdAt)}
                    </p>

                    <p className="text-gray-400 text-sm">
                      Status: {order.orderStatus}
                    </p>

                    {order.deliveryPersonName && (
                      <p className="text-gray-400 text-sm">
                        Assigned to: {order.deliveryPersonName}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* RESTAURANT INFO */}
                <div className="mb-4 text-gray-300 text-sm">
                  <p className="font-semibold">Restaurant:</p>

                  {restaurant ? (
                    <>
                      🍽 <strong>{restaurant.name}</strong>
                      <br />
                      📍 {restaurant.address}
                    </>
                  ) : (
                    <>Unknown restaurant</>
                  )}
                </div>

                {/* DELIVERY LOCATION */}
                <div className="mb-4 text-gray-300 text-sm">
                  <p className="font-semibold">Delivery Location:</p>
                  <p>📍 {order.deliveryLocation?.address}</p>
                  <p>
                    ({order.deliveryLocation?.latitude?.toFixed(4)},{" "}
                    {order.deliveryLocation?.longitude?.toFixed(4)})
                  </p>
                </div>

                {/* ACTIONS + TOTAL */}
                <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                  <div>
                    {order.orderStatus === "accepted" &&
                    !order.deliveryPersonId ? (
                      <button
                        onClick={() => handleClaimOrder(order._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Claim Order
                      </button>
                    ) : order.orderStatus === "in-transit" ? (
                      <button
                        onClick={() =>
                          handleStatusUpdate(order._id, "delivered")
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Mark as Delivered
                      </button>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No actions available
                      </p>
                    )}
                  </div>

                  <div className="font-bold text-yellow-500">
                    {formatVND(order.totalAmount)}
                  </div>
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
