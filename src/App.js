import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Saved from "./pages/Saved";
import FolderView from "./pages/FolderView";
import AllSaved from "./pages/AllSaved";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Snackbar, Alert } from "@mui/material";

const PrivateRoute = ({ element }) => {
  const { user } = useAuth();
  const [snackbarOpen, setSnackbarOpen] = useState(!user);
  const [redirect, setRedirect] = useState(false);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setRedirect(true); // Trigger redirection after closing the Snackbar
  };

  if (!user && redirect) {
    return <Navigate to="/" />; // Redirect after Snackbar has been closed
  }

  return (
    <>
      {!user && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="warning"
            sx={{ width: "100%" }}
          >
            You must be logged in to access the Saved tab.
          </Alert>
        </Snackbar>
      )}
      {user ? element : null}{" "}
      {/* Only render the element if user is logged in */}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/saved"
            element={<PrivateRoute element={<Saved />} />}
          />{" "}
          <Route path="/saved/folder/:folderId" element={<FolderView />} />
          <Route path="/saved/all" element={<AllSaved />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
