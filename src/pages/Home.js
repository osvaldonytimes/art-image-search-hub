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
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
      updateRecentSearches(searchTerm);
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleRecentSearchClick = (query) => {
    setSearchTerm(query);
    navigate(`/search?query=${encodeURIComponent(query)}`);
    updateRecentSearches(query);
  };

  const updateRecentSearches = (query) => {
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    searches = searches.filter((search) => search !== query);
    searches.unshift(query);
    if (searches.length > 10) searches = searches.slice(0, 10);
    localStorage.setItem("recentSearches", JSON.stringify(searches));
    setRecentSearches(searches);
  };

  const handleDeleteRecentSearch = (query) => {
    const updatedSearches = recentSearches.filter((search) => search !== query);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    setRecentSearches(updatedSearches);
  };

  const handleEnterKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        height: "100vh",
        px: { xs: 2, sm: 4, md: 8 },
        py: { xs: 4, sm: 6, md: 10 },
      }}
    >
      <Typography variant="h4" mb={2} textAlign="center">
        Discover Art Across the World
      </Typography>
      <Typography variant="body1" mb={4} textAlign="center">
        Use this app to search and explore artwork from a wide range of renowned
        museums and galleries.
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        width="100%"
        maxWidth="600px"
        mb={3}
      >
        <TextField
          placeholder="Search for artists, works, or museums"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleEnterKeyPress}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={searchTerm.length < 3}
          sx={{
            ml: 2,
            height: "100%", // Match button height to input
            fontWeight: "bold", // Make font bold
          }}
        >
          Search
        </Button>
      </Box>

      {recentSearches.length > 0 && (
        <Box width="100%" maxWidth="600px">
          <Typography variant="h6" mb={1}>
            Recent Searches
          </Typography>
          <List>
            {recentSearches.map((search, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteRecentSearch(search)}
                  >
                    <CloseIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={search}
                  onClick={() => handleRecentSearchClick(search)}
                  sx={{ cursor: "pointer" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default Home;
