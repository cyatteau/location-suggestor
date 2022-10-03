import { ApiKeyManager } from "@esri/arcgis-rest-request";
import { suggest } from "@esri/arcgis-rest-geocoding";
import debounce from "lodash.debounce";
import { useEffect, useReducer } from "react";

// Replace with your API key from the ArcgGIS for Developers' dashboard. This example is for demo purposes only - do not include your API Key in production code.
const API_KEY =
  "AAPK15c8893661684d8e9e50ec33288e02e4gAytH4zbf9u7eRrv1pv4W9DTIZM0PRCpmX5KDQ8VRnaroJp9SG6AqcJToLbjV2EZ";

const initialState = {
  data: undefined,
  loading: true,
  error: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return {
        data: action.payload,
        loading: false,
        error: false,
      };
    case "FETCH_ERROR":
      return {
        data: undefined,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

const authentication = new ApiKeyManager({ key: API_KEY });

export function Suggest({ address, children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    const fetchData = debounce(async () => {
      try {
        const res = await suggest(address, {
          params: { location: [-76.6162, 39.3043], maxSuggestions: 5 },
          authentication,
        });
        dispatch({ type: "FETCH_SUCCESS", payload: res.suggestions });
      } catch (e) {
        dispatch({ type: "FETCH_ERROR", payload: e.message });

        console.error(e);
      }
    });
    fetchData();
  }, [address]);

  const { data, loading, error } = state;

  return children({
    data,
    loading,
    error,
  });
}
