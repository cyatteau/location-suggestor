import { React, useState } from "react";
import { ApiKeyManager } from "@esri/arcgis-rest-request";
import Downshift from "downshift";
import { geocode } from "@esri/arcgis-rest-geocoding";
import { matchSorter } from "match-sorter";
import Map from "./Map";
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
  const geocodeResult = ({ selectedItem }) => {
    if (selectedItem) {
      const { magicKey } = selectedItem;
      geocode({
        magicKey,
        maxLocations: 1,
        outFields: "*",
        authentication,
      }).then((res) => {
        //console.log(res.candidates[0]);
        const theResult = res.candidates[0];
        handleTheResult(theResult.attributes);
      });
    }
  };

  function handleTheResult(theResult) {
    setTheAddress(theResult.ShortLabel);
    setTheCity(theResult.City);
    setTheState(theResult.Region);
    setTheCountry(theResult.CntryName);
    setThePostal(theResult.Postal);
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
      console.log(res.candidates);
    });
  }

  return (
    <div className="box">
      <Downshift
        itemToString={(item) => (item ? item.text : "")}
        onStateChange={geocodeResult}
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
            <div {...css({ position: "relative" })}>
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
              <form onSubmit={handleSubmit}>
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
                <Input type="submit" value="Submit" />
              </form>
            </div>
          </div>
        )}
      </Downshift>
      <Map />
    </div>
  );
}
