import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Saved from "./pages/Saved";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <Router>
      <div>
        <Navbar /> {/* Add the Navbar here */}
        <Routes>
          {/* Home (Root) */}
          <Route path="/" element={<Home />} />

          {/* Search */}
          <Route path="/search" element={<Search />} />

          {/* Saved */}
          <Route path="/saved" element={<Saved />} />

          {/* Redirect any unknown paths to root */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
