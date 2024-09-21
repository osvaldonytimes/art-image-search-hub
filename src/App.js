import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search"; // Import the Search component
import Navbar from "./components/Navbar"; // Import the Navbar component

const App = () => {
  return (
    <Router>
      <Navbar /> {/* Include the Navbar */}
      <Routes>
        {/* Route for Home */}
        <Route path="/" element={<Home />} />

        {/* Route for Search */}
        <Route path="/search" element={<Search />} />

        {/* Redirect any unknown paths to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
