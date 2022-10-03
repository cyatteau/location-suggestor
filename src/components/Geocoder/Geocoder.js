import { React, useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { ApiKeyManager } from "@esri/arcgis-rest-request";
import Downshift from "downshift";
import { geocode } from "@esri/arcgis-rest-geocoding";
import { matchSorter } from "match-sorter";
import "./styles.css";

import {
  Label,
  Menu,
  ControllerButton,
  Input,
  Item,
  ArrowIcon,
  XIcon,
  css,
} from "./styles";
import { Suggest } from "./Geocode";

const API_KEY =
  "AAPK15c8893661684d8e9e50ec33288e02e4gAytH4zbf9u7eRrv1pv4W9DTIZM0PRCpmX5KDQ8VRnaroJp9SG6AqcJToLbjV2EZ";
const authentication = new ApiKeyManager({ key: API_KEY });

export default function Search() {
  const [theAddress, setTheAddress] = useState("");
  const [thePostal, setThePostal] = useState("");
  const [theCity, setTheCity] = useState("");
  const [theState, setTheState] = useState("");
  const [theCountry, setTheCountry] = useState("");
  const [latLong, setLatLong] = useState([38.80133, -77.06799]);
  const [map, setMap] = useState(null);

  const geocodeResult = ({ selectedItem }) => {
    if (selectedItem) {
      const { magicKey } = selectedItem;
      geocode({
        magicKey,
        maxLocations: 1,
        outFields: "*",
        authentication,
      }).then((res) => {
        const theResult = res.candidates[0];
        handleTheResult(theResult);
      });
    }
  };

  function handleTheResult(theResult) {
    setTheAddress(theResult.attributes.ShortLabel);
    setTheCity(theResult.attributes.City);
    setTheState(theResult.attributes.Region);
    setTheCountry(theResult.attributes.CntryName);
    setThePostal(theResult.attributes.Postal);
    setLatLong([theResult.location.y, theResult.location.x]);
  }

  const getItems = (allItems, filter) => {
    return filter
      ? matchSorter(allItems, filter, {
          keys: ["text"],
        })
      : allItems;
  };

  function handleSubmit(event) {
    event.preventDefault();
    geocode({
      address: theAddress,
      postal: thePostal,
      countryCode: "USA",
      authentication,
    }).then((res) => {
      //console.log(res.candidates);
    });
  }

  function FlyToButton() {
    console.log(latLong);
    const onClick = () => map.setView(latLong, 13);
    return <button onClick={onClick}>Add marker on click</button>;
  }

  return (
    <div className="box">
      <Downshift
        itemToString={(item) => (item ? item.text : "")}
        onStateChange={geocodeResult}
        onSelect={geocodeResult}
      >
        {({
          selectedItem,
          getInputProps,
          getItemProps,
          highlightedIndex,
          isOpen,
          inputValue,
          getLabelProps,
          clearSelection,
          getToggleButtonProps,
          getMenuProps,
        }) => (
          <div className="column1">
            <Label {...getLabelProps()}>Search Address</Label>
            <div className="form">
              <Input
                {...getInputProps({
                  placeholder: "Search Address",
                })}
              />
              {selectedItem ? (
                <ControllerButton
                  onClick={clearSelection}
                  aria-label="clear selection"
                >
                  <XIcon />
                </ControllerButton>
              ) : (
                <ControllerButton {...getToggleButtonProps()}>
                  <ArrowIcon isOpen={isOpen} />
                </ControllerButton>
              )}
            </div>
            <div {...css({ position: "relative", zIndex: 1000 })}>
              <Menu {...getMenuProps({ isOpen })}>
                {(() => {
                  if (!isOpen) {
                    return null;
                  }

                  if (!inputValue) {
                    return (
                      <Item disabled>You have to enter a search query</Item>
                    );
                  }

                  return (
                    <Suggest address={`${inputValue}`}>
                      {({ loading, error, data = [] }) => {
                        if (loading) {
                          return <Item disabled>Loading...</Item>;
                        }

                        if (error) {
                          return <Item disabled>Error! {error}</Item>;
                        }

                        if (!data.length) {
                          return <Item disabled>No Addresses found</Item>;
                        }

                        return getItems(data, inputValue).map((item, index) => (
                          <Item
                            key={index}
                            {...getItemProps({
                              item,
                              index,
                              isActive: highlightedIndex === index,
                              isSelected: selectedItem === item,
                            })}
                          >
                            {item.text}
                          </Item>
                        ));
                      }}
                    </Suggest>
                  );
                })()}
              </Menu>
              <br />
              <br />
            </div>
            <form onSubmit={handleSubmit} className="form">
              <Input
                placeholder="ADDRESS"
                defaultValue={theAddress}
                onChange={(event) => {
                  setTheAddress(event.target.value);
                }}
              />
              <Input placeholder="Apartment, unit, suite, or floor #" />
              <Input
                placeholder="City"
                defaultValue={theCity}
                onChange={(event) => {
                  setTheCity(event.target.value);
                }}
              />
              <Input
                placeholder="State"
                defaultValue={theState}
                onChange={(event) => {
                  setTheState(event.target.value);
                }}
              />
              <Input
                placeholder="Postal/Zip Code"
                defaultValue={thePostal}
                onChange={(event) => {
                  setThePostal(event.target.value);
                }}
              />
              <Input
                placeholder="Country/Region"
                defaultValue={theCountry}
                onChange={(event) => {
                  setTheCountry(event.target.value);
                }}
              />
              <FlyToButton />
            </form>
          </div>
        )}
      </Downshift>
      <MapContainer ref={setMap} center={latLong} zoom={12}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    </div>
  );
}
