import { React, useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer} from "react-leaflet";

import "./styles.css";
export default function Map(lat) {
  const mapRef = useRef();
  const [latitude, setLat] = useState(lat.lat);
  const [longitude, setLong] = useState(lat.long);

  useEffect(() => {
    setLat(latitude);
    setLong(longitude);
  }, [latitude, longitude]);
  console.log(lat.lat);
  console.log(lat.long);
  return (
    <MapContainer ref={mapRef} center={[latitude, longitude]} zoom={12}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  );
}
