import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    phone_number: "",
    address: "",
    avatar: "",
    role: "customer",
  });
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
      const res = await axios.post("http://localhost:8000/auth/register", form);
      toast.success(res.data.message);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
return (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white">

    <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl shadow-xl
                    rounded-2xl p-10 border border-white/40">

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">Register</h1>
        <p className="text-gray-700 mt-2">Create your new account</p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* GRID 2 CỘT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Full name */}
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold text-gray-900">Full name</label>
            <input
              type="text"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full bg-white px-4 py-3 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold text-gray-900">Email</label>
            <input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full bg-white px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold text-gray-900">Phone number</label>
            <input
              type="text"
              name="phone_number"
              value={form.phone_number || ""}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full bg-white px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold text-gray-900">Address</label>
            <input
              type="text"
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              placeholder="Enter your address"
              className="w-full bg-white px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

{/* Avatar Upload */}
<div className="flex flex-col space-y-2">
  <label className="text-lg font-semibold text-gray-900">Avatar</label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm((prev) => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }}
    className="w-full bg-white px-4 py-3 border border-gray-300 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-green-400"
  />

  {/* Preview */}
  {form.avatar && (
    <div className="mt-2 flex justify-center">
      <img
        src={form.avatar}
        alt="Avatar preview"
        className="w-24 h-24 object-cover rounded-full shadow-md border"
      />
    </div>
  )}
</div>


          {/* Password */}
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold text-gray-900">Password</label>
            <input
              type="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full bg-white px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col space-y-2 md:col-span-2">
            <label className="text-lg font-semibold text-gray-900">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword || ""}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full bg-white px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full mt-8 py-3 rounded-xl text-lg font-semibold text-white
                     bg-black hover:bg-gray-900 transition shadow"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        {error && (
          <p className="text-sm text-red-500 text-center mt-3">{error}</p>
        )}
      </form>
    </div>
  </div>
);


}
