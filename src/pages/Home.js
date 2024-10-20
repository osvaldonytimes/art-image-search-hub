import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch recent searches from local storage when the component mounts
    const storedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(storedSearches);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim().length >= 3) {
      // Save the search term to local storage
      updateRecentSearches(searchTerm);

      // Navigate to the search page with the search term
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleRecentSearchClick = (query) => {
    setSearchTerm(query);

    // Navigate to the search page with the selected query
    navigate(`/search?query=${encodeURIComponent(query)}`);

    // Update recent searches order
    updateRecentSearches(query);
  };

  const updateRecentSearches = (query) => {
    // Retrieve existing searches from local storage
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    // Remove the query if it already exists to avoid duplication
    searches = searches.filter((search) => search !== query);

    // Add the new search term at the beginning of the array
    searches.unshift(query);

    // Limit to the last 10 searches
    if (searches.length > 10) {
      searches = searches.slice(0, 10);
    }

    // Update local storage and state
    localStorage.setItem("recentSearches", JSON.stringify(searches));
    setRecentSearches(searches);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <TextField
        label="Search"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        helperText={searchTerm.length < 3 ? "Enter at least 3 characters" : ""}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        disabled={searchTerm.length < 3}
        style={{ marginTop: "20px" }}
      >
        Search
      </Button>
      {recentSearches.length > 0 && (
        <Box mt={4} width="100%" maxWidth="400px">
          <Typography variant="h6">Recent Searches</Typography>
          <List>
            {recentSearches.map((search, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleRecentSearchClick(search)}
              >
                <ListItemText primary={search} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default Home;
