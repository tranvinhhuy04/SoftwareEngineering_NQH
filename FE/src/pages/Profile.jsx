import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Profile fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 text-xl">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 p-6 flex justify-center relative">

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 bg-white border border-gray-300 shadow-sm 
                   hover:bg-gray-100 transition rounded-full p-3"
      >
        <ArrowLeft size={22} className="text-gray-700" />
      </button>

      <div className="w-full max-w-2xl bg-white shadow-xl rounded-3xl p-8 border border-gray-100">

        {/* HEADER */}
        <div className="flex flex-col items-center text-center">
          <img
            src={
              user.avatar ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp"
            }
            className="w-28 h-28 rounded-full object-cover border-4 border-green-300 shadow"
          />

          <h2 className="mt-4 text-3xl font-bold text-gray-800">
            {user.name || "Unnamed User"}
          </h2>

          <p className="text-gray-500">{user.role?.toUpperCase()}</p>

          <button
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow"
            onClick={() => alert("Edit coming soon!")}
          >
            Edit Profile
          </button>
        </div>

        {/* INFO SECTION */}
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-gray-800 font-medium">{user.email}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
            <p className="text-gray-400 text-sm">Phone Number</p>
            <p className="text-gray-800 font-medium">
              {user.phone_number || "Not provided"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
            <p className="text-gray-400 text-sm">Address</p>
            <p className="text-gray-800 font-medium">
              {user.address || "Not provided"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl shadow-sm">
            <p className="text-gray-400 text-sm">Member Since</p>
            <p className="text-gray-800 font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
