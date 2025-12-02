// src/pages/Home.jsx
import React, { useState } from 'react';
import Footer from '../component/footer';
import { Menu, MapPin, Search } from 'lucide-react';

const Home = () => {
  const [address, setAddress] = useState('');

  return (
    <>
      {/* ================== HERO SECTION ================== */}
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-300 to-yellow-200 relative overflow-hidden">

        {/* Background food image (blur) */}
        <div
          className="absolute right-0 bottom-0 w-full h-full bg-no-repeat bg-right-bottom opacity-30 hidden md:block"
          style={{
            backgroundImage:
              "url('https://png.pngtree.com/png-clipart/20240705/original/pngtree-group-of-fast-food-products-fast-food-items-hamburger-fries-hotdog-png-image_15492773.png')",
            backgroundSize: '48%',
          }}
        />

        {/* ================== NAV ================== */}
        <nav className="relative z-10 flex justify-between items-center px-6 py-6">

          {/* Logo + Menu Button */}
          <div className="flex items-center gap-4">
            {/* Menu Button → chuyển đến trang HomeAll */}
            <button
              onClick={() => window.location.href = "/home"}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-900 transition"
            >
              <Menu size={20} />
              Menu
            </button>

            {/* Logo */}
            <h1 className="font-extrabold text-2xl tracking-wide cursor-pointer"
                onClick={() => window.location.href = "/"}>
              <span className="text-black">Fast</span>
              <span className="text-red-600">Food</span>
            </h1>
          </div>

          {/* Auth Section */}
          <div className="flex gap-3">
            {localStorage.getItem('user') ? (
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.reload();
                }}
                className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-900 transition"
              >
                Log out
              </button>
            ) : (
              <>
                <a
                  href="/login"
                  className="bg-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition"
                >
                  Log in
                </a>
                <a
                  href="/register"
                  className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-900 transition"
                >
                  Sign up
                </a>
              </>
            )}
          </div>

        </nav>


        {/* ================== HERO CONTENT ================== */}
        <main className="relative z-10 px-6 pt-12 w-full md:w-1/2 text-center md:text-left">

          <h2 className="font-extrabold text-5xl md:text-7xl leading-tight text-gray-900">
            Order Your Favorite <br />
            <span className="text-red-600">Food</span> Anytime
          </h2>

          <p className="text-gray-700 mt-4 text-lg mb-6">
            Delivery in just a few minutes. Fresh, hot and fast!
          </p>

          {/* Search Input */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="bg-white rounded-xl shadow-md flex items-center px-3 py-3 border border-gray-200 w-full">
              
              <input
                type="text"
                placeholder="login to start shopping"
                className="flex-grow outline-none text-gray-700"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-10">
            Sign in to view your recent delivery addresses
          </p>
        </main>

        {/* ================== FLOATING SEARCH ICON ================== */}
        <div className="absolute bottom-6 left-6 z-20">
          <button className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-900 transition">
            <Search size={26} />
          </button>
        </div>
      </div>

      {/* ================== DOWNLOAD APP SECTION ================== */}
      <div className="bg-gray-100 py-12 text-center">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">
          Download Our Mobile App
        </h3>

        <div className="flex justify-center gap-4">
          {/* App Store Btn */}
          <a
            href="#"
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl flex items-center gap-3 transition"
          >
            <svg
              className="w-7 h-7"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
            >
              <path
                fill="currentColor"
                d="M318.7..."
              />
            </svg>
            <span>App Store</span>
          </a>

          {/* Play Store Btn */}
          <a
            href="#"
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl flex items-center gap-3 transition"
          >
            <svg
              className="w-7 h-7"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path fill="currentColor" d="M325.3..." />
            </svg>
            <span>Google Play</span>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
};

export default Home;
