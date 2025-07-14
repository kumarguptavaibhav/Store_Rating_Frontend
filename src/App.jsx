import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import StoreOwnerDashboard from "./Pages/StoreOwnerDashboard";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./Pages/AdminDashboard";
import Sidebar from "./Components/Sidebar";
import { user } from "./Utilities/utils.js";
import UpdatePassword from "./Pages/UpdatePassword.jsx";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Sidebar />
      <Outlet />
    </>
  );
};

const RoleBasedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user_detail = user();
  const { role } = user_detail.user;

  if (!allowedRoles.includes(role)) {
    if (role === "user") {
      return <Navigate to="/dashboard" replace />;
    } else if (role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (role === "store_owner") {
      return <Navigate to="/store-owner-dashboard" replace />;
    }
  }

  return element;
};

const AuthRoute = ({ element }) => {
  const token = localStorage.getItem("token");

  if (token) {
    const user_detail = user();
    const { role } = user_detail.user;

    if (role === "user") {
      return <Navigate to="/dashboard" replace />;
    } else if (role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (role === "store_owner") {
      return <Navigate to="/store-owner-dashboard" replace />;
    }
  }

  return element;
};

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthRoute element={<Login />} />} />
          <Route
            path="/register"
            element={<AuthRoute element={<Register />} />}
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <RoleBasedRoute
                  element={<Dashboard />}
                  allowedRoles={["user"]}
                />
              }
            />
            <Route
              path="/store-owner-dashboard"
              element={
                <RoleBasedRoute
                  element={<StoreOwnerDashboard />}
                  allowedRoles={["store_owner"]}
                />
              }
            />
            <Route
              path="/admin"
              element={
                <RoleBasedRoute
                  element={<AdminDashboard />}
                  allowedRoles={["admin"]}
                />
              }
            />
            <Route
              path="/update-password"
              element={
                <RoleBasedRoute
                  element={<UpdatePassword />}
                  allowedRoles={["user", "store_owner"]}
                />
              }
            />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
