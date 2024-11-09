import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginWithGoogle, logout } from "../firebase";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "#F7F7F7", color: "#333333" }}>
      <Toolbar sx={{ justifyContent: "center" }}>
        <Box display="flex" gap={2}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ fontWeight: "bold" }} // Make button text bold
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/saved"
            sx={{ fontWeight: "bold" }} // Make button text bold
          >
            Saved
          </Button>

          {user ? (
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ fontWeight: "bold" }} // Make button text bold
            >
              Logout
            </Button>
          ) : (
            <Button
              color="inherit"
              onClick={handleLogin}
              sx={{ fontWeight: "bold" }} // Make button text bold
            >
              Login with Google
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
