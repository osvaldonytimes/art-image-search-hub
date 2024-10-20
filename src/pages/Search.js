import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import axios from "axios";
import ArtCard from "../components/ArtCard";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query"); // Get the query parameter from the URL
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (!query || query.length < 3) {
      navigate("/"); // Redirect to home if the query is missing or too short
    } else {
      fetchSearchResults(query);
    }
  }, [query, navigate]);

  const fetchSearchResults = async (query) => {
    setLoading(true);
    setError(false);
    const apiResults = [];

    const apiRequests = [
      fetchArtInstitute(query),
      fetchHarvardArtMuseums(query),
      fetchMetMuseum(query), // Add the MET Museum API request
    ];

    try {
      const results = await Promise.allSettled(apiRequests);

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          apiResults.push(...result.value);
        } else {
          setSnackbarMessage(`Error fetching results from API ${index + 1}`);
          setSnackbarOpen(true);
        }
      });
      setResults(apiResults);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtInstitute = async (query) => {
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks/search?q=${query}`
    );
    return response.data.data
      .filter((item) => item.image_id)
      .map((item) => ({
        id: item.id.toString(),
        title: item.title,
        imageUrl: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
        source: "Art Institute of Chicago",
        sourceUrl: `https://www.artic.edu/artworks/${item.id}`,
      }));
  };

  const fetchHarvardArtMuseums = async (query) => {
    const apiKey = process.env.REACT_APP_HARVARD_API_KEY;
    const response = await axios.get(
      `https://api.harvardartmuseums.org/object?apikey=${apiKey}&title=${query}`
    );
    return response.data.records
      .filter((item) => item.primaryimageurl)
      .map((item) => ({
        id: item.id.toString(),
        title: item.title,
        imageUrl: item.primaryimageurl,
        source: "Harvard Art Museums",
        sourceUrl:
          item.url ||
          `https://www.harvardartmuseums.org/collections/object/${item.id}`,
      }));
  };

  const fetchMetMuseum = async (query) => {
    try {
      // Fetch object IDs matching the query
      const searchResponse = await axios.get(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}&hasImages=true`
      );

      if (searchResponse.data.objectIDs) {
        const objectIds = searchResponse.data.objectIDs.slice(0, 10); // Limit to 10 results for simplicity
        const objectDetailsPromises = objectIds.map((id) =>
          axios.get(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
          )
        );

        const objectsResponses = await Promise.all(objectDetailsPromises);
        return objectsResponses
          .map((response) => response.data)
          .filter((item) => item.primaryImage) // Filter items that have a primary image
          .map((item) => ({
            id: item.objectID.toString(),
            title: item.title,
            imageUrl: item.primaryImage,
            source: "The MET Museum",
            sourceUrl: `https://www.metmuseum.org/art/collection/search/${item.objectID}`,
          }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching MET Museum data:", error);
      throw error;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box p={3}>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <>
          <Button variant="outlined" onClick={() => navigate("/")} mb={2}>
            Back
          </Button>
          <Typography variant="h4">
            An error occurred while fetching the results. Please try again
            later.
          </Typography>
        </>
      ) : (
        <>
          <Button variant="outlined" onClick={() => navigate("/")} mb={2}>
            Back
          </Button>
          <Typography variant="h5" mb={2}>
            Showing results for: {query}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {results.map((item) => (
              <ArtCard
                key={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                source={item.source}
                sourceUrl={item.sourceUrl}
                resultId={item.id}
              />
            ))}
          </Box>
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Search;
