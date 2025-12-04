import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/theme.css";

const API_BASE = "http://localhost:8000";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantMap, setRestaurantMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    restaurantId: "",
    orderStatus: "",
    paymentStatus: "",
    deliveryMethod: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");

        const [statsRes, ordersRes, restRes] = await Promise.all([
          axios.get(`${API_BASE}/order/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/order/admin/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/restaurant/getAllRestaurant`),
        ]);

        const restMap = {};
        restRes.data.forEach((r) => (restMap[r._id] = r.name));

        setStats(statsRes.data);
        setOrders(ordersRes.data || []);
        setRestaurants(restRes.data || []);
        setRestaurantMap(restMap);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <CenteredText text="Loading dashboard..." />;
  if (!stats) return <CenteredText text="No statistics available." />;

  /* ============================================================
      APPLY FILTER
  ============================================================ */
  const filteredOrders = orders.filter((o) => {
    const f = filters;
    if (f.restaurantId && o.restaurantId !== f.restaurantId) return false;
    if (f.orderStatus && o.orderStatus !== f.orderStatus) return false;
    if (f.paymentStatus && o.paymentStatus !== f.paymentStatus) return false;
    if (f.deliveryMethod && o.deliveryMethod !== f.deliveryMethod) return false;
    return true;
  });

  /* ============================================================
      COMPUTE STATS BASED ON FILTERED ORDERS
  ============================================================ */
  const filteredStats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-10">

        <h1 className="text-3xl font-bold text-center text-green-700">
          Admin Dashboard
        </h1>

        {/* SUMMARY */}
        <SummaryCards stats={filteredStats} />

        {/* FILTERS */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          restaurants={restaurants}
        />

        {/* FULL ORDER TABLE */}
        <OrderTable orders={filteredOrders} restaurantMap={restaurantMap} />
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function CenteredText({ text }) {
  return (
    <div className="p-6 text-center text-gray-600 text-lg">{text}</div>
  );
}

function SummaryCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Card label="Total Orders" value={stats.totalOrders} />
      <Card label="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white shadow rounded-xl p-5 text-center border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-green-700">{value}</div>
    </div>
  );
}

function FilterPanel({ filters, setFilters, restaurants }) {
  const update = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const clear = () =>
    setFilters({
      restaurantId: "",
      orderStatus: "",
      paymentStatus: "",
      deliveryMethod: "",
    });

  return (
    <div className="bg-white shadow rounded-xl p-6 border">
      <h2 className="text-xl font-semibold mb-4 text-green-700">
        Filters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="Restaurant"
          name="restaurantId"
          value={filters.restaurantId}
          onChange={update}
          options={restaurants.map((r) => ({ label: r.name, value: r._id }))}
        />

        <Select
          label="Order Status"
          name="orderStatus"
          value={filters.orderStatus}
          onChange={update}
          options={[
            "pending",
            "accepted",
            "in-transit",
            "delivered",
          ]}
        />

        <Select
          label="Payment Status"
          name="paymentStatus"
          value={filters.paymentStatus}
          onChange={update}
          options={["pending", "paid", "failed"]}
        />

        <Select
          label="Method"
          name="deliveryMethod"
          value={filters.deliveryMethod}
          onChange={update}
          options={["delivery", "drone"]}
        />
      </div>

      <div className="text-right mt-3">
        <button
          onClick={clear}
          className="px-4 py-2 text-sm rounded bg-gray-100 border hover:bg-gray-200"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block mb-1 text-sm text-gray-600">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border px-2 py-2 rounded-lg bg-white"
      >
        <option value="">All</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function OrderTable({ orders, restaurantMap }) {
  return (
    <div className="bg-white shadow rounded-xl p-6 border">
      <h2 className="text-xl font-semibold mb-4 text-green-700">
        All Orders
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Restaurant</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Payment</Th>
              <Th>Method</Th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-4 text-center text-gray-500"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <Td>{o._id}</Td>
                  <Td>{o.customerEmail}</Td>
                  <Td>{restaurantMap[o.restaurantId] || o.restaurantId}</Td>
                  <Td>{formatCurrency(o.totalAmount)}</Td>
                  <Td>{badge(o.orderStatus)}</Td>
                  <Td>{badge(o.paymentStatus)}</Td>
                  <Td>{o.deliveryMethod}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-3 py-2 text-left">{children}</th>;
}

function Td({ children }) {
  return <td className="px-3 py-2">{children}</td>;
}

function badge(value) {
  const colors = {
    delivered: "bg-green-100 text-green-700",
    paid: "bg-green-100 text-green-700",
    accepted: "bg-yellow-100 text-yellow-700",
    "in-transit": "bg-blue-100 text-blue-700",
    pending: "bg-gray-200 text-gray-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[value] || "bg-gray-200 text-gray-700"
      }`}
    >
      {value}
    </span>
  );
}

function formatCurrency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(n) || 0);
}
