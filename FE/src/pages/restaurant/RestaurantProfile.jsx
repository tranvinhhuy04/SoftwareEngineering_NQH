import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/theme.css";

const RestaurantProfile = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);

  const [form, setForm] = useState({
    name: "",
    avatar: "",
    address: "",
    phone_number: "",
    isOpen: true,
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Suggestions for FREE address autocomplete
  const [suggestions, setSuggestions] = useState([]);

  /* ============================
        LOAD RESTAURANTS
  ============================ */
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8000/restaurant/api/restaurants-id",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRestaurants(res.data);
      } catch {
        setError("Failed to load restaurants");
      }
    };
    load();
  }, []);

  /* ============================
        FETCH FREE ADDRESS
  ============================ */
  const fetchAddressSuggestions = async (query) => {
    if (!query) return setSuggestions([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Address error", err);
    }
  };

  /* ============================
        CREATE RESTAURANT
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/restaurant/profile",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRestaurants((prev) => [...prev, res.data.restaurant]);
      setSuccess("Restaurant created successfully!");

      setForm({
        name: "",
        avatar: "",
        address: "",
        phone_number: "",
        isOpen: true,
      });
      setSuggestions([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create restaurant");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  /* ============================
        DELETE RESTAURANT
  ============================ */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this restaurant permanently?")) return;

    setDeleteLoading(id);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/restaurant/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRestaurants((prev) => prev.filter((r) => r._id !== id));
      setSuccess("Restaurant deleted");
    } catch (err) {
      setError("Failed to delete");
    } finally {
      setDeleteLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  /* ============================
        UI
  ============================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex flex-col text-gray-900">

      {/* HEADER */}
      <header className="bg-white shadow-sm py-4 border-b">
        <div className="container mx-auto flex justify-between px-4">
          <h1
            className="text-3xl font-extrabold cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="text-gray-900">Fast</span>
            <span className="text-green-600">Food</span>
          </h1>

          <button
            onClick={() => navigate("/home")}
            className="px-6 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            Home
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-12 flex-1">

        <h2 className="text-4xl font-extrabold text-center mb-10">
          Restaurant Management
        </h2>

        {error && <div className="bg-red-500 text-white p-4 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-500 text-white p-4 rounded mb-4">{success}</div>}

        {/* CREATE FORM */}
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-3xl p-8 border mb-12">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div>
              <label className="font-semibold">Restaurant Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
            </div>

            {/* AVATAR */}
            <div>
              <label className="font-semibold">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onloadend = () =>
                    setForm((prev) => ({ ...prev, avatar: reader.result }));
                  reader.readAsDataURL(file);
                }}
                className="w-full px-4 py-3 border rounded-lg"
              />

              {form.avatar && (
                <img
                  src={form.avatar}
                  className="w-24 h-24 object-cover rounded-full mt-2 mx-auto shadow"
                />
              )}
            </div>

            {/* ADDRESS AUTOCOMPLETE (FREE) */}
            <div className="relative">
              <label className="font-semibold">Address</label>

              <input
                type="text"
                value={form.address}
                onChange={(e) => {
                  setForm({ ...form, address: e.target.value });
                  fetchAddressSuggestions(e.target.value);
                }}
                placeholder="Search address..."
                className="w-full px-4 py-3 border rounded-lg"
              />

              {suggestions.length > 0 && (
                <ul className="absolute w-full bg-white border rounded-lg shadow mt-1 z-20">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setForm({ ...form, address: s.display_name });
                        setSuggestions([]);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="font-semibold">Phone</label>
              <input
                type="text"
                value={form.phone_number}
                onChange={(e) =>
                  setForm({ ...form, phone_number: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="font-semibold">Status</label>
              <select
                value={form.isOpen}
                onChange={(e) =>
                  setForm({ ...form, isOpen: e.target.value === "true" })
                }
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="true">Open</option>
                <option value="false">Closed</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-full hover:bg-green-600"
            >
              {loading ? "Creating..." : "Create Restaurant"}
            </button>
          </form>
        </div>

        {/* RESTAURANTS LIST */}
        <h3 className="text-3xl text-center font-bold mb-6">Your Restaurants</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {restaurants.map((r) => (
            <div key={r._id} className="p-6 bg-white rounded-3xl shadow border">
              <h3 className="text-2xl font-bold text-green-600">{r.name}</h3>

              {r.avatar && (
                <img className="w-full h-40 rounded-lg object-cover mt-3" src={r.avatar} />
              )}

              <p className="mt-3">📍 {r.address}</p>
              <p>📞 {r.phone_number}</p>
              <p>Status: {r.isOpen ? "Open" : "Closed"}</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => navigate(`/restaurant/menu/${r._id}`)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  View Menu →
                </button>

                <button
                  onClick={() => handleDelete(r._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  {deleteLoading === r._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-gray-600 mt-12">
        © {new Date().getFullYear()} Fastfood.
      </footer>
    </div>
  );
};

export default RestaurantProfile;
