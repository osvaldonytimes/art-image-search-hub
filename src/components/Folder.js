import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { db, doc, updateDoc } from "../firebase";
import { deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const Folder = ({ id, name, imageCount, onClick }) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleRenameDialogOpen = (event) => {
    event.stopPropagation();
    setRenameDialogOpen(true);
    handleMenuClose(event);
  };

  const handleRenameDialogClose = (event) => {
    event.stopPropagation();
    setRenameDialogOpen(false);
    setNewName(name);
  };

  const handleDeleteDialogOpen = (event) => {
    event.stopPropagation();
    setDeleteDialogOpen(true);
    handleMenuClose(event);
  };

  const handleDeleteDialogClose = (event) => {
    event.stopPropagation();
    setDeleteDialogOpen(false);
  };

  const handleRenameFolder = async (event) => {
    event.stopPropagation();
    if (newName.trim().length === 0) return;

    try {
      const folderRef = doc(db, "users", user.uid, "folders", id);
      await updateDoc(folderRef, {
        name: newName,
      });
      setRenameDialogOpen(false);
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  const handleDeleteFolder = async (event) => {
    event.stopPropagation();
    try {
      const folderRef = doc(db, "users", user.uid, "folders", id);
      await deleteDoc(folderRef);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
      p={1}
      border={1}
      borderRadius={2}
      onClick={onClick}
      sx={{ cursor: "pointer", width: "200px" }} // Reduced width
    >
      <Box>
        <Typography variant="body1">{name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {imageCount === 0
            ? "Empty"
            : imageCount === 1
            ? "1 image"
            : `${imageCount} images`}
        </Typography>
      </Box>
      <IconButton onClick={handleMenuOpen}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleRenameDialogOpen}>Rename Folder</MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen}>Delete Folder</MenuItem>
      </Menu>

      {/* Rename Folder Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={handleRenameDialogClose}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameDialogClose}>Cancel</Button>
          <Button
            onClick={handleRenameFolder}
            variant="contained"
            disabled={newName.trim().length === 0}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this folder?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button
            onClick={handleDeleteFolder}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Folder;
