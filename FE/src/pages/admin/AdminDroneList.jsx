import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function AdminDroneList() {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState("create");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    code: "",
    name: "",
    capacityKg: 5,
    baseLat: "",
    baseLng: "",
    baseAddress: "",
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchDrones = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/drone/admin/");
      setDrones(res.data || []);
    } catch (err) {
      console.error("Fetch drones error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrones();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      code: form.code,
      name: form.name,
      capacityKg: Number(form.capacityKg),
      isActive: form.isActive,
      baseLocation: {
        latitude: form.baseLat || undefined,
        longitude: form.baseLng || undefined,
        address: form.baseAddress || undefined,
      },
    };

    try {
      if (formMode === "create") {
        await axiosInstance.post("/drone/admin/", payload);
      } else {
        await axiosInstance.put(`/drone/admin/${editingId}`, payload);
      }

      setForm(emptyForm);
      setFormMode("create");
      setEditingId(null);
      fetchDrones();
    } catch (err) {
      console.error("Save drone error:", err);
    }
  };

  const handleEdit = (drone) => {
    setFormMode("edit");
    setEditingId(drone._id);
    setForm({
      code: drone.code ?? "",
      name: drone.name ?? "",
      capacityKg: drone.capacityKg ?? 5,
      baseLat: drone.baseLocation?.latitude ?? "",
      baseLng: drone.baseLocation?.longitude ?? "",
      baseAddress: drone.baseLocation?.address ?? "",
      isActive: drone.isActive ?? true,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Disable this drone?")) return;

    try {
      await axiosInstance.delete(`/drone/admin/${id}`);
      fetchDrones();
    } catch (err) {
      console.error("Delete drone error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-10">
      <div className="container mx-auto max-w-6xl">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
          Drone Management
        </h1>

        {/* FORM */}
        <div className="bg-white border rounded-3xl shadow p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4 text-green-700">
            {formMode === "create" ? "Create Drone" : "Edit Drone"}
          </h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-green-700" onSubmit={handleSubmit}>
            <div>
              <label className="font-medium">Code</label>
              <input
                className="w-full px-4 py-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-400 text-gray-700"
                name="code" value={form.code} onChange={handleChange} required placeholder="DRN1..."
              />
            </div>

            <div>
              <label className="font-medium">Name</label>
              <input
                className="w-full px-4 py-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-400"
                name="name" value={form.name} onChange={handleChange} required placeholder="Delivery Drone 1"
              />
            </div>

            <div>
              <label className="font-medium">Capacity (kg)</label>
              <input
                type="number"
                className="w-full px-4 py-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-400"
                name="capacityKg" value={form.capacityKg} onChange={handleChange} min="1" required placeholder="5"
              />
            </div>

            <div className="flex items-center mt-7">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-green-600"
              />
              <span className="font-medium">Active</span>
            </div>

            <div>
              <label className="font-medium">Base Latitude</label>
              <input
                name="baseLat"
                className="w-full px-4 py-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-400 text-gray-700"
                value={form.baseLat}
                onChange={handleChange}
                placeholder="37.7749"
              />
            </div>

            <div>
              <label className="font-medium">Base Longitude</label>
              <input
                name="baseLng"
                className="w-full px-4 py-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-400 text-gray-700"
                value={form.baseLng}
                onChange={handleChange}
                placeholder="-122.4194"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-medium">Base Address</label>
              <input
                name="baseAddress"
                className="w-full px-4 py-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-400 text-gray-700"
                value={form.baseAddress}
                placeholder="123 Main St, City, Country"
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3">
              {formMode === "edit" && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyForm);
                    setFormMode("create");
                    setEditingId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow"
              >
                {formMode === "create" ? "Create" : "Update"}
              </button>
            </div>
          </form>
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded-3xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Drone List</h2>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading...</div>
          ) : (
            <table className="w-full border rounded-xl overflow-hidden text-gray-700">
              <thead className="bg-green-600 text-black">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Capacity</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {drones.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      No drones found.
                    </td>
                  </tr>
                ) : (
                  drones.map((d) => (
                    <tr key={d._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{d.code}</td>
                      <td className="px-4 py-3">{d.name}</td>
                      <td className="px-4 py-3">{d.status || "-"}</td>
                      <td className="px-4 py-3">{d.capacityKg} kg</td>
                      <td className="px-4 py-3">
                        <span className={d.isActive ? "text-green-600" : "text-red-500"}>
                          {d.isActive ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleEdit(d)}
                          className="px-3 py-1 rounded-xl bg-blue-500 text-white text-sm hover:bg-blue-600"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(d._id)}
                          className="px-3 py-1 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600"
                        >
                          Disable
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
