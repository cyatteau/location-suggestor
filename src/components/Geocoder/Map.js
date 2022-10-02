import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "./styles.css";

export default function Map() {
  return (
    <MapContainer center={[38.80133, -77.06799]} zoom={12}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
}
