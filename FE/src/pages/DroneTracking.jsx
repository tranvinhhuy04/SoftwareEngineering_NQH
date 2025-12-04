import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import dronePng from "../assets/icons/drone.png";

// ⭐ Icon nhà hàng
const restaurantIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// ⭐ Icon khách hàng
const customerIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// ⭐ Icon drone
const droneIcon = L.icon({
  iconUrl: dronePng,
  iconSize: [70, 70],
  iconAnchor: [35, 35],
});

// Fix icon mặc định Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function DroneTracking() {
  const { orderId } = useParams();

  const [tracking, setTracking] = useState(null);
  const [dronePos, setDronePos] = useState(null);

  // ================================
  // 🛰 GET tracking
  // ================================
  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await axios.get(`/drone/tracking/${orderId}`);
        setTracking(res.data);
      } catch (err) {
        console.log("Fail load tracking", err);
      }
    };

    fetchTracking();
  }, [orderId]);

  // ================================
  // ❗ Kiểm tra dữ liệu trước khi render
  // ================================
  if (
    !tracking ||
    !tracking.restaurant ||
    !tracking.customer ||
    tracking.restaurant.latitude === undefined ||
    tracking.customer.latitude === undefined
  ) {
    return (
      <div style={{ color: "white", padding: 20 }}>
        Đang tải dữ liệu drone...
      </div>
    );
  }

  const restaurantPos = [
    tracking.restaurant.latitude,
    tracking.restaurant.longitude,
  ];
  const customerPos = [
    tracking.customer.latitude,
    tracking.customer.longitude,
  ];

  // ================================
  // 🛫 Animation Drone
  // ================================
  useEffect(() => {
    if (!tracking) return;

    const steps = 100;
    const speed = 120;

    const latStep = (customerPos[0] - restaurantPos[0]) / steps;
    const lngStep = (customerPos[1] - restaurantPos[1]) / steps;

    let step = 0;

    setDronePos(restaurantPos); // bắt đầu tại nhà hàng

    const interval = setInterval(() => {
      step++;

      if (step >= steps) {
        setDronePos(customerPos);
        clearInterval(interval);
        return;
      }

      setDronePos((prev) => {
        const [lat, lng] = prev ?? restaurantPos;
        return [lat + latStep, lng + lngStep];
      });
    }, speed);

    return () => clearInterval(interval);
  }, [tracking]);

  if (!dronePos)
    return <div style={{ color: "white", padding: 20 }}>Loading drone...</div>;

  // ================================
  // ⭐ MAP UI
  // ================================
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "white" }}>🚁 Drone Delivery Tracking</h2>

      <div style={{ width: "100%", height: "600px" }}>
        <MapContainer
          center={restaurantPos}
          zoom={15}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          <Marker position={restaurantPos} icon={restaurantIcon} />
          <Marker position={customerPos} icon={customerIcon} />
          <Marker position={dronePos} icon={droneIcon} />

          <Polyline
            positions={[restaurantPos, dronePos, customerPos]}
            color="red"
          />
        </MapContainer>
      </div>
    </div>
  );
}
