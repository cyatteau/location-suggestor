import React from "react";
import Geocoder from "./components/Geocoder/Geocoder";
import "./App.css";

function App() {
  return (
    <div className="container">
      <h2>Location Suggestor</h2>
      <Geocoder />
    </div>
  );
}

export default App;
