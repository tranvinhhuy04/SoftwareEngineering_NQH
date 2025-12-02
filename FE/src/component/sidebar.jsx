import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  User,
  Coffee,
  ShoppingBag,
  LogOut,
  FileText,
  ShoppingCart,
  Truck,
} from "lucide-react";

const Sidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const role = user?.role || localStorage.getItem("role");

  const isRestaurant = role === "restaurant";
  const isCustomer = role === "customer";
  const isDelivery = role === "delivery";
  const isAdmin = role === "admin";

  const isActive = (path) => location.pathname === path;

  // 🟢 STYLE A CLASS SET
  const linkClass = (path) =>
    `flex items-center px-4 py-3 rounded-xl transition 
     border ${isActive(path)
       ? "bg-green-500 text-white border-green-600 shadow"
       : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
     }`;

  const labelClass = `ml-3 font-medium`;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-white shadow border hover:bg-gray-100 transition"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white border-r shadow-lg z-30
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0 md:w-64"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="bg-green-500 p-2 rounded-lg">
            <Coffee className="text-white" size={24} />
          </div>
          <h1
              className="font-extrabold text-2xl tracking-wide cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              <span className="text-black">Fast</span>
              <span className="text-green-600">Food</span>
            </h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-3">

          {/* HOME */}
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            <Home size={20} />
            <span className={labelClass}>Home</span>
          </Link>

          {/* RESTAURANT */}
          {isRestaurant && (
            <>
              <Link to="/restaurant/profile" className={linkClass("/restaurant/profile")}>
                <User size={20} />
                <span className={labelClass}>Restaurant Profile</span>
              </Link>

              <Link to="/restaurant/menu" className={linkClass("/restaurant/menu")}>
                <Coffee size={20} />
                <span className={labelClass}>Menu Items</span>
              </Link>

              <Link to="/restaurant/menu/categories" className={linkClass("/restaurant/menu/categories")}>
                <Coffee size={20} />
                <span className={labelClass}>Menu Categories</span>
              </Link>

              <Link to="/restaurant/orders" className={linkClass("/restaurant/orders")}>
                <FileText size={20} />
                <span className={labelClass}>Incoming Orders</span>
              </Link>
            </>
          )}

          {/* CUSTOMER */}
          {isCustomer && (
            <>
              <Link to="/create-order" className={linkClass("/create-order")}>
                <ShoppingCart size={20} />
                <span className={labelClass}>Place Order</span>
              </Link>

              <Link to="/orders" className={linkClass("/orders")}>
                <FileText size={20} />
                <span className={labelClass}>My Orders</span>
              </Link>

              <Link to="/shopping_cart" className={linkClass("/shopping_cart")}>
                <FileText size={20} />
                <span className={labelClass}>My Cart</span>
              </Link>
            </>
          )}

          {/* DELIVERY */}
          {isDelivery && (
            <Link to="/delivery-admin" className={linkClass("/delivery-admin")}>
              <Truck size={20} />
              <span className={labelClass}>My Orders</span>
            </Link>
          )}

          {/* ADMIN */}
          {isAdmin && (
            <>
              <Link to="/admin/dashboard" className={linkClass("/admin/dashboard")}>
                <Home size={20} />
                <span className={labelClass}>Admin Dashboard</span>
              </Link>

              <Link to="/admin/drones" className={linkClass("/admin/drones")}>
                <Truck size={20} />
                <span className={labelClass}>Drone Management</span>
              </Link>
            </>
          )}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl border bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            <LogOut size={20} />
            <span className={labelClass}>Logout</span>
          </button>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
