import React, { useState } from "react";
import Footer from "../component/footer";
import { Menu, Search } from "lucide-react";

const Home = () => {
  const [address, setAddress] = useState("");

  return (
    <>
      {/* ================== HERO (STYLE A) ================== */}
      <div className="min-h-screen bg-white relative overflow-hidden">

        {/* Background food image */}
        <div
          className="absolute right-0 bottom-0 w-full h-full bg-no-repeat bg-right-bottom opacity-20 hidden md:block"
          style={{
            backgroundImage:
              "url('https://png.pngtree.com/png-clipart/20240705/original/pngtree-group-of-fast-food-products-fast-food-items-hamburger-fries-hotdog-png-image_15492773.png')",
            backgroundSize: "45%",
          }}
        />
{/* ================== NAV ================== */}
<nav className="relative z-10 flex justify-between items-center px-6 py-6">

  {/* LEFT: Menu + Logo */}
  <div className="flex items-center gap-4">

    {/* Menu Button → Dashboard */}
    <button
      onClick={() => (window.location.href = "/dashboard")}
      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl
                 bg-white shadow-md border border-green-200
                 text-gray-800 font-semibold text-sm
                 hover:shadow-lg hover:bg-green-50
                 transition-all duration-200"
    >
      <Menu size={20} className="text-green-600" />
      <span className="hidden md:block">Menu</span>
    </button>

    {/* Logo */}
    <h1
      className="font-extrabold text-3xl tracking-wide cursor-pointer flex items-center gap-1"
      onClick={() => (window.location.href = "/")}
    >
      <span className="text-gray-900">Fast</span>
      <span className="text-green-600">Food</span>
    </h1>
  </div>

  {/* RIGHT: Auth section */}
  <div className="flex gap-3">

    {localStorage.getItem("user") ? (
      /* LOGOUT BUTTON */
      <button
        onClick={() => {
          localStorage.removeItem("user");
          window.location.reload();
        }}
        className="px-5 py-2.5 bg-red-400 hover:bg-red-500 
                   text-white font-semibold rounded-2xl
                   shadow-md hover:shadow-lg transition-all duration-200"
      >
        Log out
      </button>
    ) : (
      <>
        {/* LOGIN */}
        <a
          href="/login"
          className="px-5 py-2.5 rounded-2xl bg-white border border-gray-300 
                     text-gray-700 font-medium shadow-sm
                     hover:bg-gray-100 hover:shadow transition-all"
        >
          Log in
        </a>

        {/* SIGN UP */}
        <a
          href="/register"
          className="px-6 py-2.5 rounded-2xl bg-green-500 text-white 
                     font-semibold shadow-md
                     hover:bg-green-600 hover:shadow-lg
                     transition-all duration-200"
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
            <span className="text-green-600">Food</span> Anytime
          </h2>

          <p className="text-gray-600 mt-4 text-lg mb-6">
            Delivery in minutes — hot, fresh, fast!
          </p>

          {/* Search Input (Style A) */}
          <div className="bg-white border border-gray-300 rounded-2xl shadow-sm 
                          flex items-center px-4 py-3 w-full md:w-4/5">
            <input
              type="text"
              placeholder="Login to start shopping..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-grow outline-none text-gray-700"
            />
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Sign in to view your recent delivery addresses
          </p>
        </main>

        {/* Floating Search Button */}
        <button
          className="absolute bottom-6 left-6 z-20 bg-black text-white p-4 
                     rounded-full shadow-lg hover:bg-gray-900 transition"
        >
          <Search size={26} />
        </button>
      </div>

      {/* ================== DOWNLOAD APP SECTION ================== */}
      <div className="bg-gray-100 py-12 text-center">
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">
          Download Our Mobile App
        </h3>

        <div className="flex justify-center gap-4">
          <a className="bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-xl flex items-center gap-3 transition">
            <span>App Store</span>
          </a>

          <a className="bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-xl flex items-center gap-3 transition">
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
