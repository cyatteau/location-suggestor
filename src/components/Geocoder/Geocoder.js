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

const API_KEY = "YOUR_API_KEY";
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
        console.log(res.candidates[0]);
        const theResult = res.candidates[0];
        setLatLong([theResult.location.y, theResult.location.x]);
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

  useEffect(() => {
    if (map) {
      map.setView(latLong, 12);
    }
  }, [latLong]);

  const getItems = (allItems, filter) => {
    return filter
      ? matchSorter(allItems, filter, {
          keys: ["text"],
        })
      : allItems;
  };

  const [stuff, setStuff] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    geocode({
      address: theAddress,
      city: theCity,
      region: theState,
      postal: thePostal,
      countryCode: theCountry,
      authentication,
    }).then((res) => {
      console.log(res.candidates[0].score);
      if (res.candidates[0].score < 99) {
        setStuff("Please check address");
        ShowWarning();
      }
      map.setView(
        [res.candidates[0].location.y, res.candidates[0].location.x],
        12
      );
    });
  }

  function ShowWarning() {
    return <div>{stuff}</div>;
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
            <Label {...getLabelProps()}>Address Form</Label>
            <div className="form">
              <Input
                {...getInputProps({
                  placeholder: "Search Address",
                })}
              />
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
                placeholder="State/Region"
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
              <button>Submit</button>
            </form>
            <ShowWarning />
          </div>
        )}
      </Downshift>
      <MapContainer ref={setMap} center={latLong} zoom={1}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    </div>
  );
}
