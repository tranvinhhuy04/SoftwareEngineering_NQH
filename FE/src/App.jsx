import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/registar";
import RestaurantProfile from "./pages/restaurant/RestaurantProfile";
import MenuManagement from "./pages/restaurant/MenuManagement";
import MenuItemsList from "./pages/restaurant/MenuItemsList";
import MenuCategories from "./pages/restaurant/MenuCategories";
import CategoriesManagement from "./pages/restaurant/CategoriesManagement";
import ShoppingCart from "./pages/customer/ShoppingCart";
import CreateOrder from "./pages/CreateOrder";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import DeliveryAdminPanel from "./pages/DeliveryAdminPanel";
import AllOrders from "./pages/AllOrders";
import RestaurantOrders from "./pages/restaurant/RestaurantOrders";
import EditCategory from "./pages/restaurant/EditCategory";
import HomeAll from "./pages/HomeAll";
import Profile from "./pages/Profile";
import ProtectedLayout from "./component/protectedLayout";
import { CartProvider } from "./pages/customer/CartContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDroneList from "./pages/admin/AdminDroneList";
import DroneTracking from "./pages/DroneTracking";


import TestCreateOrder from "./pages/TestCreateOrder";
import Test from "./pages/admin/test";   

const App = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<HomeAll />} />
          <Route path="/profile" element={<Profile />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Route>
          <Route element={<ProtectedLayout allowedRoles={["restaurant"]} />}>
            <Route path="/restaurant/menu/categories/edit/:id" element={<EditCategory />} />
            <Route path="/restaurant/profile" element={<RestaurantProfile />} />
            <Route path="/restaurant/menu/add" element={<MenuManagement />} />
            <Route path="/restaurant/menu" element={<MenuItemsList />} />
            <Route path="/restaurant/menu/categories" element={<MenuCategories />} />
            <Route path="/restaurant/menu/categories/add" element={<CategoriesManagement />} />
            <Route path="/restaurant/orders" element={<RestaurantOrders />} />
          </Route>
          <Route element={<ProtectedLayout allowedRoles={["customer"]} />}>
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/test-create-order" element={<TestCreateOrder />} />
            <Route path="/shopping_cart" element={<ShoppingCart />} />

            <Route
              path="/orders/:orderId/drone-tracking"
              element={<DroneTracking />}
            />
          </Route>

          <Route element={<ProtectedLayout allowedRoles={["delivery"]} />}>
            <Route path="/delivery-admin" element={<DeliveryAdminPanel />} />
            <Route path="/delivery/orders/all" element={<AllOrders />} />
          </Route>

          <Route element={<ProtectedLayout allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/drones" element={<AdminDroneList />} />
            <Route path="/test" element={<Test />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
