import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/theme.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("stats"); // "stats" or "accounts"

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  const [closureRequests, setClosureRequests] = useState([]);

  // Date filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ------------------------------------------------
  // Fetch STATS (có filter ngày)
  // ------------------------------------------------
  const fetchStats = async ({ from, to } = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const urls = ["http://localhost:8000/order/admin/stats"];
      let res = null;

      for (const url of urls) {
        try {
          res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 4000,
            params: {
              ...(from ? { from } : {}),
              ...(to ? { to } : {}),
            },
          });
          if (res && res.status === 200) break;
        } catch (_err) {
          void _err;
        }
      }

      if (!res) throw new Error("All stats endpoints failed");
      setStats(res.data);
    } catch (err) {
      console.error("Admin stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load lần đầu: full dữ liệu (không filter)
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "accounts") {
      fetchCustomers();
      fetchRestaurants();
    }
  }, [activeTab]);

  // ------------------------------------------------
  // Customers
  // ------------------------------------------------
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/auth/admin/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const customerIds = res.data.map((c) => c._id);
      let orderCounts = {};
      if (customerIds.length > 0) {
        try {
          const countsRes = await axios.post(
            "http://localhost:8000/order/admin/customers/order-counts",
            { customerIds },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          orderCounts = countsRes.data;
        } catch (err) {
          console.warn("Failed to fetch customer order counts:", err);
        }
      }

      const customersWithCounts = res.data.map((customer) => ({
        ...customer,
        orderCount: orderCounts[customer._id] || 0,
      }));

      setCustomers(customersWithCounts);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      alert("Không thể tải danh sách khách hàng");
    } finally {
      setLoadingCustomers(false);
    }
  };

  // ------------------------------------------------
  // Restaurants
  // ------------------------------------------------
  const fetchRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8000/restaurant/api/restaurants",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const restaurantIds = res.data.map((r) => r._id);
      let orderCounts = {};
      if (restaurantIds.length > 0) {
        try {
          const countsRes = await axios.post(
            "http://localhost:8000/order/admin/restaurants/order-counts",
            { restaurantIds },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          orderCounts = countsRes.data;
        } catch (err) {
          console.warn("Failed to fetch restaurant order counts:", err);
        }
      }

      const restaurantsWithCounts = res.data.map((restaurant) => ({
        ...restaurant,
        orderCount: orderCounts[restaurant._id] || 0,
      }));

      setRestaurants(restaurantsWithCounts);

      const allClosureRequests = [];
      restaurantsWithCounts.forEach((restaurant) => {
        if (restaurant.closureRequests && restaurant.closureRequests.length > 0) {
          restaurant.closureRequests.forEach((request) => {
            if (request.status === "pending") {
              allClosureRequests.push({
                ...request,
                restaurantId: restaurant._id,
                restaurantName: restaurant.name,
              });
            }
          });
        }
      });
      setClosureRequests(allClosureRequests);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
      alert("Không thể tải danh sách nhà hàng");
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // ------------------------------------------------
  // Handlers: delete / lock
  // ------------------------------------------------
  const handleDeleteCustomer = async (customerId, username) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${username}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8000/auth/admin/customers/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Xóa tài khoản thành công!");
      fetchCustomers();
    } catch (err) {
      console.error("Failed to delete customer:", err);
      const message = err.response?.data?.message || "Không thể xóa tài khoản";
      alert(message);
    }
  };

  const handleLockCustomer = async (customerId, username, currentLockStatus) => {
    const action = currentLockStatus ? "mở khóa" : "khóa";

    let reason = "";
    if (!currentLockStatus) {
      reason = window.prompt(`Nhập lý do ${action} tài khoản "${username}":`);
      if (reason === null) return;
      if (!reason.trim()) {
        alert("Vui lòng nhập lý do khóa tài khoản!");
        return;
      }
    } else {
      if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${username}"?`)) {
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8000/auth/admin/customers/${customerId}/lock`,
        { isLocked: !currentLockStatus, reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công!`);
      fetchCustomers();
    } catch (err) {
      console.error("Failed to lock/unlock customer:", err);
      const message =
        err.response?.data?.message || `Không thể ${action} tài khoản`;
      alert(message);
    }
  };

  const handleDeleteRestaurant = async (restaurantId, restaurantName) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn XÓA VĨNH VIỄN nhà hàng "${restaurantName}"?\n\nHành động này sẽ xóa:\n- Nhà hàng\n- Tất cả menu items\n- Tài khoản owner\n\nHành động này không thể hoàn tác!`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8000/restaurant/admin/restaurants/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Xóa nhà hàng thành công!");
      fetchRestaurants();
    } catch (err) {
      console.error("Failed to delete restaurant:", err);
      const message =
        err.response?.data?.message || "Không thể xóa nhà hàng";
      alert(message);
    }
  };

  const handleLockRestaurant = async (
    restaurantId,
    restaurantName,
    currentLockStatus
  ) => {
    const action = currentLockStatus ? "mở khóa" : "khóa";

    let reason = "";
    if (!currentLockStatus) {
      reason = window.prompt(`Nhập lý do ${action} nhà hàng "${restaurantName}":`);
      if (reason === null) return;
      if (!reason.trim()) {
        alert("Vui lòng nhập lý do khóa nhà hàng!");
        return;
      }
    } else {
      if (!window.confirm(`Bạn có chắc muốn ${action} nhà hàng "${restaurantName}"?`)) {
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8000/restaurant/admin/restaurants/${restaurantId}/lock`,
        { isLocked: !currentLockStatus, reason: reason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${action.charAt(0).toUpperCase() + action.slice(1)} nhà hàng thành công!`);
      fetchRestaurants();
    } catch (err) {
      console.error("Failed to lock/unlock restaurant:", err);
      const message =
        err.response?.data?.message || `Không thể ${action} nhà hàng`;
      alert(message);
    }
  };

  const handleApplyFilter = () => {
    fetchStats({ from: fromDate, to: toDate });
  };

  if (loading && !stats) {
    return <div className="p-6 text-white text-lg">Loading dashboard...</div>;
  }

  return (
    <div className="app-root py-8">
      <div className="flex-1 bg-gray-50 py-10 text-gray-800 px-8">
        <h1 className="text-3xl font-bold text-center text-green-700">
          Admin Dashboard
        </h1>


        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 font-semibold transition-colors ${activeTab === "stats"
              ? "text-green-400 border-b-2 border-green-400"
              : "text-gray-400 hover:text-gray-200"
              }`}
          >
            📊 Thống kê
          </button>

        </div>

        {/* Stats Tab */}
        {activeTab === "stats" && stats && (
          <StatsView
            stats={stats}
            fromDate={fromDate}
            toDate={toDate}
            onChangeDate={(field, val) =>
              field === "from" ? setFromDate(val) : setToDate(val)
            }
            onApplyFilter={handleApplyFilter}
            loading={loading}
          />
        )}

        {/* Accounts Tab */}
        {activeTab === "accounts" && (
          <>
            {closureRequests.length > 0 && (
              <ClosureRequestsView
                requests={closureRequests}
                onRefresh={() => {
                  fetchRestaurants();
                }}
              />
            )}
            <AccountsView
              customers={customers}
              loading={loadingCustomers}
              onDelete={handleDeleteCustomer}
              onLock={handleLockCustomer}
            />
            <RestaurantsView
              restaurants={restaurants}
              loading={loadingRestaurants}
              onDelete={handleDeleteRestaurant}
              onLock={handleLockRestaurant}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* --- Date Filter + Stats View --- */
function StatsView({
  stats,
  fromDate,
  toDate,
  onChangeDate,
  onApplyFilter,
  loading,
}) {
  const {
    totalOrders,
    totalRevenue,
    restaurantAgg: restaurantBreakdown,
    deliveryAgg: deliveryBreakdown,
    customerAgg: customerBreakdown,
    dailyAgg = [],
  } = stats;

  // ----- Chart datasets -----
  const dailyLabels = dailyAgg.map((d) => d._id);
  const dailyRevenue = dailyAgg.map((d) => d.revenue);
  const dailyOrders = dailyAgg.map((d) => d.orders);

  const restaurantLabels = restaurantBreakdown.map((r) => r.restaurantName);
  const restaurantOrders = restaurantBreakdown.map((r) => r.orders);

  const revenueByDayData = {
    labels: dailyLabels,
    datasets: [
      {
        label: "Revenue by Day",
        data: dailyRevenue,
        backgroundColor: "rgba(34,197,94,0.6)",       // green-500 (rực)
        borderColor: "rgb(34,197,94)",                // green-500
        borderWidth: 2,
        hoverBackgroundColor: "rgba(34,197,94,0.8)",
        borderRadius: 6,
      },
    ],
  };


  const ordersByRestaurantData = {
    labels: restaurantLabels,
    datasets: [
      {
        data: restaurantOrders,
        backgroundColor: [
          "rgba(34,197,94,0.8)",   // green
          "rgba(59,130,246,0.8)",  // blue
          "rgba(168,85,247,0.8)",  // purple
          "rgba(245,158,11,0.8)",  // amber
          "rgba(244,63,94,0.8)",   // rose
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };


  const ordersTimelineData = {
    labels: dailyLabels,
    datasets: [
      {
        label: "Orders per Day",
        data: dailyOrders,
        borderColor: "#3b82f6",         // blue
        backgroundColor: "rgba(59,130,246,0.3)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#1d4ed8",
        pointBorderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  };

  const basicOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#1e293b", font: { size: 14 } } },
    },
    scales: {
      x: {
        ticks: { color: "#334155", font: { size: 12 } },
        grid: { color: "rgba(100,116,139,0.1)" },
      },
      y: {
        ticks: { color: "#334155", font: { size: 12 } },
        grid: { color: "rgba(100,116,139,0.1)" },
      },
    },
  };


  return (
    <>
      <div className="container mx-auto">
        {/* Date Filter */}
<section className="bg-white border rounded-xl shadow-sm p-5 mb-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
    <span>📅</span> Bộ lọc thời gian
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

    <div>
      <label className="text-gray-500 text-sm mb-1 block">Từ ngày</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => onChangeDate("from", e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white 
        text-gray-700 shadow-sm focus:ring-2 focus:ring-green-500"
      />
    </div>

    <div>
      <label className="text-gray-500 text-sm mb-1 block">Đến ngày</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => onChangeDate("to", e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white 
        text-gray-700 shadow-sm focus:ring-2 focus:ring-green-500"
      />
    </div>

    <button
      onClick={onApplyFilter}
      className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white 
      font-semibold shadow-md transition w-full md:w-auto"
    >
      Apply
    </button>
  </div>
</section>

        {/* Summary cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          <div className="bg-white shadow rounded-xl p-5 text-center border">
            <div className="text-sm text-gray-500">Total Orders</div>
            <div className="text-2xl font-bold mt-2">{totalOrders}</div>
          </div>

          <div className="bg-white shadow rounded-xl p-5 text-center border">
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold mt-2">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
        </section>

        {/* Tables */}
        <BreakdownTable
          title="📦 By Restaurant"
          data={restaurantBreakdown}
          columns={[
            { key: "restaurantName", label: "Restaurant" },
            { key: "orders", label: "Orders" },
            { key: "revenue", label: "Revenue" },
            { key: "shares.restaurant", label: "Restaurant Share" },
            { key: "shares.delivery", label: "Delivery Share" },
            { key: "shares.platform", label: "Platform Share" },
          ]}
        />

        <BreakdownTable
          title="🚚 By Delivery"
          data={deliveryBreakdown}
          columns={[
            { key: "deliveryName", label: "DeliveryId" },
            { key: "orders", label: "Orders" },
            { key: "revenue", label: "Revenue" },
            { key: "shares.restaurant", label: "Restaurant Share" },
            { key: "shares.delivery", label: "Delivery Share" },
            { key: "shares.platform", label: "Platform Share" },
          ]}
        />

        <BreakdownTable
          title="🧍‍♂️ By Customer"
          data={customerBreakdown}
          columns={[
            { key: "customerName", label: "CustomerId" },
            { key: "email", label: "Email" },
            { key: "orders", label: "Orders" },
            { key: "totalSpent", label: "Total Spent" },
          ]}
        />

        {/* Charts (dưới bảng) */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card h-80">
            <h2 className="text-xl font-semibold mb-3 orders-subtitle">
              📈 Revenue by Day
            </h2>
            <Bar data={revenueByDayData} options={basicOptions} />
          </div>

          <div className="card h-80">
            <h2 className="text-xl font-semibold mb-3 orders-subtitle">
              🥧 Orders by Restaurant
            </h2>
            <Pie
              data={ordersByRestaurantData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#e5e7eb" },
                  },
                },
              }}
            />
          </div>
        </section>

        <section className="mt-6">
          <div className="card h-80">
            <h2 className="text-xl font-semibold mb-3 orders-subtitle">
              📊 Orders Timeline
            </h2>
            <Line data={ordersTimelineData} options={basicOptions} />
          </div>
        </section>
      </div>
    </>
  );
}

/* --- Closure Requests View --- */
function ClosureRequestsView({ requests, onRefresh }) {
  const handleApprove = async (restaurantId, requestId) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn CHẤP THUẬN yêu cầu đóng tài khoản này?\n\nNhà hàng sẽ bị XÓA VĨNH VIỄN!"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8000/restaurant/admin/restaurants/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Đã chấp thuận và xóa nhà hàng thành công!");
      onRefresh();
    } catch (err) {
      console.error("Failed to approve closure request:", err);
      const message =
        err.response?.data?.message || "Không thể xử lý yêu cầu";
      alert(message);
    }
  };

  const handleReject = async (restaurantId, requestId) => {
    const reason = window.prompt("Nhập lý do từ chối:");
    if (reason === null) return;

    try {
      const token = localStorage.getItem("token");
      // TODO: implement reject endpoint
      alert("Tính năng từ chối đang được phát triển");
      onRefresh();
    } catch (err) {
      console.error("Failed to reject closure request:", err);
      alert("Không thể từ chối yêu cầu");
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-3 orders-subtitle">
        ⚠️ Yêu cầu đóng tài khoản ({requests.length})
      </h2>
      <div className="overflow-x-auto card">
        <table className="min-w-full text-sm">
          <thead className="bg-orange-900 text-gray-300">
            <tr>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Nhà hàng
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Lý do
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Thời gian yêu cầu
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
              >
                <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                  {request.restaurantName}
                </td>
                <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                  {request.reason}
                </td>
                <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                  {new Date(request.requestedAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-2 border-b border-gray-800 space-x-2">
                  <button
                    onClick={() =>
                      handleApprove(request.restaurantId, request._id)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    ✅ Chấp thuận
                  </button>
                  <button
                    onClick={() =>
                      handleReject(request.restaurantId, request._id)
                    }
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    ❌ Từ chối
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* --- Accounts View --- */
function AccountsView({ customers, loading, onDelete, onLock }) {
  if (loading) {
    return (
      <div className="text-white text-lg">Đang tải danh sách khách hàng...</div>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 orders-subtitle">
        👥 Danh sách khách hàng
      </h2>
      <div className="overflow-x-auto card">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Username
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Tổng đơn hàng
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Trạng thái
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Lý do khóa
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {customers && customers.length > 0 ? (
              customers.map((customer, i) => (
                <tr
                  key={customer._id}
                  className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
                >
                  <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                    {customer.username}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                    {customer.orderCount || 0}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                    {customer.isLocked ? "🔒 Đã khóa" : "🔓 Hoạt động"}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                    {customer.isLocked && customer.lockReason ? (
                      <span
                        className="text-yellow-400"
                        title={customer.lockReason}
                      >
                        {customer.lockReason.length > 30
                          ? customer.lockReason.substring(0, 30) + "..."
                          : customer.lockReason}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800 space-x-2">
                    <button
                      onClick={() =>
                        onLock(
                          customer._id,
                          customer.username,
                          customer.isLocked
                        )
                      }
                      className={`${customer.isLocked
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                        } text-white px-3 py-1 rounded transition-colors`}
                    >
                      {customer.isLocked ? "🔓 Mở khóa" : "🔒 Khóa"}
                    </button>
                    <button
                      onClick={() => onDelete(customer._id, customer.username)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Không có khách hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* --- Restaurants View --- */
function RestaurantsView({ restaurants, loading, onDelete, onLock }) {
  if (loading) {
    return (
      <div className="text-white text-lg mt-6">
        Đang tải danh sách nhà hàng...
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-3 orders-subtitle">
        🏪 Danh sách nhà hàng
      </h2>
      <div className="overflow-x-auto card">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Tên nhà hàng
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Owner ID
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Tổng đơn hàng
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Trạng thái tài khoản
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Lý do khóa
              </th>
              <th className="px-4 py-2 font-semibold border-b border-gray-800 text-left">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {restaurants && restaurants.length > 0 ? (
              restaurants.map((restaurant, i) => (
                <tr
                  key={restaurant._id}
                  className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
                >
                  <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                    {restaurant.name}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                    {restaurant.ownerId}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                    {restaurant.orderCount || 0}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                    {restaurant.isLocked ? "🔒 Đã khóa" : "🔓 Hoạt động"}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800 text-gray-200">
                    {restaurant.isLocked && restaurant.lockReason ? (
                      <span
                        className="text-yellow-400"
                        title={restaurant.lockReason}
                      >
                        {restaurant.lockReason.length > 30
                          ? restaurant.lockReason.substring(0, 30) + "..."
                          : restaurant.lockReason}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800 space-x-2">
                    <button
                      onClick={() =>
                        onLock(
                          restaurant._id,
                          restaurant.name,
                          restaurant.isLocked
                        )
                      }
                      className={`${restaurant.isLocked
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                        } text-white px-3 py-1 rounded transition-colors`}
                    >
                      {restaurant.isLocked ? "🔓 Mở khóa" : "🔒 Khóa"}
                    </button>
                    <button
                      onClick={() => onDelete(restaurant._id, restaurant.name)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Chưa có nhà hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* --- Shared Helpers --- */
function BreakdownTable({ title, data = [], columns = [] }) {
  return (
    <section className="mt-10">
      {/* FIX tiêu đề bị ẩn → đổi sang text-gray-800 */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        {title}
      </h2>

      {/* CARD đẹp */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">

          {/* HEADER – màu sáng hiện đại */}
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-semibold border-b border-gray-300 text-left"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY – alternating row + hover đẹp */}
          <tbody>
            {data && data.length > 0 ? (
              data.map((item, i) => (
                <tr
                  key={i}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 border-b border-gray-200 text-gray-800"
                    >
                      {formatCell(item, col.key)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-4 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatCell(item, keyPath) {
  const value =
    keyPath.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), item) ??
    "-";

  if (typeof value === "number") return value.toLocaleString("en-US");
  return value;
}



function getNestedValue(obj, keyPath) {
  return keyPath.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj) ?? "-";
}

function formatCurrency(n) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(n) || 0);
  } catch {
    return `${n}`;
  }
}
