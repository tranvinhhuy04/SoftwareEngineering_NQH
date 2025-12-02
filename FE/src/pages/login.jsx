// src/pages/Login.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" }); // Changed from username/password to single identifier
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Form gửi lên:", form);
      const res = await axios.post("http://localhost:8000/auth/login",form);
      const { token, role } = res.data;
      localStorage.setItem("token", token);
      const user = { role: role };
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(`Welcome ${role}`);
      if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (role === "customer") {
        window.location.href = "/home";
      } else if (role === "restaurant") {
        window.location.href = "/restaurant/orders";
      } else if (role === "delivery") {
        window.location.href = "/delivery/orders/all";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-green-400 via-green-300 to-yellow-200 
                    p-6">

      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl shadow-xl 
                      rounded-2xl p-8 border border-white/40">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="text-gray-700 mt-2">Log in to continue your food journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              What's your email?
            </label>

            <div className="flex items-center bg-white rounded-lg px-4 py-3 
                            border border-gray-300 shadow-sm 
                            focus-within:ring-2 focus-within:ring-green-400">
              
              <svg
                className="w-5 h-5 text-green-600 mr-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 12H8m8 0l-4 4m4-4l-4-4"
                />
              </svg>

              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full outline-none bg-transparent text-gray-800"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              What's your password?
            </label>

            <div className="flex items-center bg-white rounded-lg px-4 py-3
                            border border-gray-300 shadow-sm
                            focus-within:ring-2 focus-within:ring-green-400">

              <svg
                className="w-5 h-5 text-green-600 mr-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 11c1.1 0 2-.9 2-2s-.9-2-2-2
                    -2 .9-2 2 .9 2 2 2zm0 0
                    c-4.4 0-8 2.2-8 5v2h16v-2
                    c0-2.8-3.6-5-8-5z"
                />
              </svg>

              <input
                type="password"
                name="password"
                value={form.password || ""}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full outline-none bg-transparent text-gray-800"
                required
              />
            </div>

            <div className="text-right mt-2">
              <a href="/forgot-password"
                className="text-sm text-green-700 hover:text-green-900 transition">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-lg font-semibold text-white
                      bg-black hover:bg-gray-900 transition shadow"
            disabled={loading}
          >
            {loading ? "Continuing..." : "Continue"}
          </button>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <span className="text-gray-500 text-sm bg-white/80 px-2 relative z-10">
              or continue with
            </span>
            <div className="absolute top-3 left-0 right-0 h-px bg-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center gap-4">
            <button className="w-12 h-12 bg-white shadow-md rounded-full 
                              flex items-center justify-center hover:bg-gray-100 transition">
              <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" className="w-7" />
            </button>
            <button className="w-12 h-12 bg-white shadow-md rounded-full 
                              flex items-center justify-center hover:bg-gray-100 transition">
              <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" className="w-7" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );


}
