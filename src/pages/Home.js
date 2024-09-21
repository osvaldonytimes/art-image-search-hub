import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box } from "@mui/material";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchTerm.length >= 3) {
      // Pass the search term as a query parameter to the search route
      navigate(`/search?query=${searchTerm}`);
    }
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
    </Box>
  );
};

export default Home;
