import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";   // << Thêm Bar
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,      // << Thêm BarElement
  Tooltip,
  Legend,
} from "chart.js";

import "../../styles/theme.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,    // << Đăng ký BarElement
  Tooltip,
  Legend
);

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
    startDate: "",
    endDate: "",
  });


  /* ------------------------ LOAD DATA ------------------------ */
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

  /* ------------------------ FILTER DATA ------------------------ */
  const filteredOrders = orders.filter((o) => {
    const f = filters;
    if (f.restaurantId && o.restaurantId !== f.restaurantId) return false;
    if (f.orderStatus && o.orderStatus !== f.orderStatus) return false;
    if (f.paymentStatus && o.paymentStatus !== f.paymentStatus) return false;
    if (f.deliveryMethod && o.deliveryMethod !== f.deliveryMethod) return false;
    if (f.startDate) {
      const orderDate = new Date(o.createdAt);
      const start = new Date(f.startDate);
      if (orderDate < start) return false;
    }

    if (f.endDate) {
      const orderDate = new Date(o.createdAt);
      const end = new Date(f.endDate);
      end.setHours(23,59,59); // lấy hết ngày
      if (orderDate > end) return false;
    }

    return true;
  });

  const filteredStats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    ),
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 text-gray-800">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-green-700 drop-shadow">
          Admin Dashboard
        </h1>

        {/* SUMMARY */}
        <SummaryCards stats={filteredStats} />

        {/* FILTER PANEL */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          restaurants={restaurants}
        />

        {/* CHART ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RevenueChart
            orders={filteredOrders}
            restaurants={restaurants}
            selectedRestaurant={filters.restaurantId}
          />

          <OrdersChart
            orders={filteredOrders}
            restaurants={restaurants}
            selectedRestaurant={filters.restaurantId}
          />
        </div>

        {/* CHART ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OrderStatusChart orders={filteredOrders} />
          <PaymentStatusChart orders={filteredOrders} />
        </div>

        {/* TABLE */}
        <OrderTable
          orders={filteredOrders}
          restaurantMap={restaurantMap}
          selectedRestaurant={filters.restaurantId}
        />

      </div>
    </div>
  );
}

/* ============================================================
   GENERAL COMPONENTS
============================================================ */

function CenteredText({ text }) {
  return (
    <div className="p-6 text-center text-gray-600 text-lg font-medium">
      {text}
    </div>
  );
}

/* ------------------------ SUMMARY CARDS ------------------------ */

function SummaryCards({ stats }) {
  const items = [
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {items.map((item) => (
        <div key={item.label} className="bg-white shadow rounded-xl p-6 text-center border hover:shadow-lg transition">
          <div className="text-gray-500 text-sm">{item.label}</div>
          <div className="text-3xl font-bold text-green-700 mt-1">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   CHART COMPONENTS – AUTO SWITCH LINE ↔ BAR
============================================================ */

function lineOptions(title) {
  return {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: title, color: "#166534", font: { size: 16 } },
    },
    tension: 0.4,
  };
}

/* -------- Revenue -------- */
function RevenueChart({ orders, restaurants, selectedRestaurant }) {
  if (!orders.length) return <EmptyChart title="Revenue" />;

  const isBar = selectedRestaurant !== "";

  const list = isBar
    ? restaurants.filter((r) => r._id === selectedRestaurant)
    : restaurants;

  const labels = list.map((r) => r.name);
  const values = list.map((r) =>
    orders.filter((o) => o.restaurantId === r._id).reduce((s, o) => s + o.totalAmount, 0)
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Revenue (VND)",
        data: values,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.25)",
      },
    ],
  };

  return (
    <ChartWrapper>
      {isBar ? (
        <BarChartStyled data={data} title="Revenue" />
      ) : (
        <Line data={data} options={lineOptions("Revenue by Restaurant")} />
      )}
    </ChartWrapper>
  );
}

/* -------- Orders Count -------- */
function OrdersChart({ orders, restaurants, selectedRestaurant }) {
  if (!orders.length) return <EmptyChart title="Orders Count" />;

  const isBar = selectedRestaurant !== "";

  const list = isBar
    ? restaurants.filter((r) => r._id === selectedRestaurant)
    : restaurants;

  const labels = list.map((r) => r.name);
  const values = list.map((r) =>
    orders.filter((o) => o.restaurantId === r._id).length
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Orders Count",
        data: values,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.25)",
      },
    ],
  };

  return (
    <ChartWrapper>
      {isBar ? (
        <BarChartStyled data={data} title="Orders Count" />
      ) : (
        <Line data={data} options={lineOptions("Orders Count by Restaurant")} />
      )}
    </ChartWrapper>
  );
}

/* -------- Order Status -------- */
function OrderStatusChart({ orders }) {
  if (!orders.length) return <EmptyChart title="Order Status" />;

  const statuses = ["pending", "accepted", "in-transit", "delivered"];
  const values = statuses.map((s) =>
    orders.filter((o) => o.orderStatus === s).length
  );

  const data = {
    labels: statuses,
    datasets: [
      {
        label: "Order Status",
        data: values,
        borderColor: "#fbbf24",
        backgroundColor: "rgba(251,191,36,0.25)",
      },
    ],
  };

  return (
    <ChartWrapper>
      <BarChartStyled data={data} title="Order Status" />
    </ChartWrapper>
  );
}

/* -------- Payment Status -------- */
function PaymentStatusChart({ orders }) {
  if (!orders.length) return <EmptyChart title="Payment Status" />;

  const statuses = ["pending", "paid", "failed"];
  const values = statuses.map((s) =>
    orders.filter((o) => o.paymentStatus === s).length
  );

  const data = {
    labels: statuses,
    datasets: [
      {
        label: "Payment Status",
        data: values,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.25)",
      },
    ],
  };

  return (
    <ChartWrapper>
      <BarChartStyled data={data} title="Payment Status" />
    </ChartWrapper>
  );
}

/* ------------------------ BAR COMPONENT ------------------------ */

function BarChartStyled({ data, title }) {
  return (
    <Bar
      data={data}
      options={{
        plugins: {
          title: { display: true, text: title },
          legend: { position: "bottom" },
        },
      }}
    />
  );
}

/* ------------------------ WRAPPERS ------------------------ */

function ChartWrapper({ children }) {
  return (
    <div className="bg-white shadow rounded-xl p-6 border hover:shadow-lg transition">
      {children}
    </div>
  );
}

function EmptyChart({ title }) {
  return (
    <div className="bg-white shadow rounded-xl p-6 border text-center text-gray-500">
      <h2 className="text-lg font-semibold text-green-700">{title}</h2>
      No data available.
    </div>
  );
}

/* ============================================================
   FILTER PANEL + TABLE
============================================================ */

function FilterPanel({ filters, setFilters, restaurants }) {
  const update = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const clear = () =>
  setFilters({
    restaurantId: "",
    orderStatus: "",
    paymentStatus: "",
    deliveryMethod: "",
    startDate: "",
    endDate: "",
  });


  return (
    <div className="bg-white shadow rounded-xl p-6 border">
      <h2 className="text-xl font-semibold mb-4 text-green-700">Filters</h2>

      {/* GRID 8 FILTERS DEFINED IN 2 ROWS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Restaurant */}
        <Select
          label="Restaurant"
          name="restaurantId"
          value={filters.restaurantId}
          onChange={update}
          options={restaurants.map((r) => ({
            label: r.name,
            value: r._id,
          }))}
        />

        {/* Order Status */}
        <Select
          label="Order Status"
          name="orderStatus"
          value={filters.orderStatus}
          onChange={update}
          options={["pending", "accepted", "in-transit", "delivered"]}
        />

        {/* Payment Status */}
        <Select
          label="Payment Status"
          name="paymentStatus"
          value={filters.paymentStatus}
          onChange={update}
          options={["pending", "paid", "failed"]}
        />

        {/* Method */}
        <Select
          label="Method"
          name="deliveryMethod"
          value={filters.deliveryMethod}
          onChange={update}
          options={["delivery", "drone"]}
        />

        {/* From Date */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">From Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={update}
            className="w-full border px-3 py-2 rounded-lg bg-white shadow-inner focus:ring focus:ring-green-200"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block mb-1 text-sm text-gray-600">To Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={update}
            className="w-full border px-3 py-2 rounded-lg bg-white shadow-inner focus:ring focus:ring-green-200"
          />
        </div>

      </div>

      {/* BUTTON */}
      <div className="text-right mt-5">
        <button
          onClick={clear}
          className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
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
        className="w-full border px-2 py-2 rounded-lg bg-white shadow-inner"
      >
        <option value="">All</option>
        {options.map((o, i) => (
          <option key={i} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------ TABLE ------------------------ */

function OrderTable({ orders, restaurantMap, selectedRestaurant }) {
  // Nếu có restaurant filter → hiển thị bảng bình thường
  const isFiltered = selectedRestaurant !== "";

  // Gom nhóm orders theo restaurant
  const grouped = {};
  if (!isFiltered) {
    orders.forEach((o) => {
      const name = restaurantMap[o.restaurantId] || "Unknown Restaurant";
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(o);
    });
  }

  return (
    <div className="bg-white shadow rounded-xl p-6 border">
      <h2 className="text-xl font-semibold mb-4 text-green-700">All Orders</h2>

      <div className="overflow-x-auto">

        {/* ========================= CASE 1: FILTERED → TABLE NORMAL ========================= */}
        {isFiltered ? (
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
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="border-t hover:bg-gray-50 transition">
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
        ) : (
          /* ========================= CASE 2: NO FILTER → GROUP BY RESTAURANT ========================= */
          <div className="space-y-8">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-center text-gray-500">No orders available.</p>
            ) : (
              Object.keys(grouped).map((restName) => (
                <div key={restName}>
                  <h3 className="text-lg font-bold text-green-700 mb-2">
                    🍽 {restName}
                  </h3>

                  <table className="min-w-full text-sm border rounded-xl overflow-hidden">
                    <thead className="bg-green-500 text-white">
                      <tr>
                        <Th>Order ID</Th>
                        <Th>Customer</Th>
                        <Th>Total</Th>
                        <Th>Status</Th>
                        <Th>Payment</Th>
                        <Th>Method</Th>
                      </tr>
                    </thead>

                    <tbody>
                      {grouped[restName].map((o) => (
                        <tr key={o._id} className="border-b hover:bg-gray-50 transition">
                          <Td>{o._id}</Td>
                          <Td>{o.customerEmail}</Td>
                          <Td>{formatCurrency(o.totalAmount)}</Td>
                          <Td>{badge(o.orderStatus)}</Td>
                          <Td>{badge(o.paymentStatus)}</Td>
                          <Td>{o.deliveryMethod}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        )}
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

/* ------------------------ UTILS ------------------------ */

function formatCurrency(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(n) || 0);
}
