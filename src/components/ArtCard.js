import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Button,
  CardActions,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  Box,
  TextField,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  db,
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  arrayUnion,
} from "../firebase";
import { deleteDoc, arrayRemove, getDoc } from "firebase/firestore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const ArtCard = ({
  title,
  imageUrl,
  source,
  sourceUrl,
  resultId,
  onUpdateFolders,
}) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unsaveDialogOpen, setUnsaveDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const fetchFolders = useCallback(async () => {
    if (!user) return;

    const foldersCollection = collection(db, "users", user.uid, "folders");
    const foldersSnapshot = await getDocs(foldersCollection);
    const fetchedFolders = foldersSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      images: doc.data().images || [],
    }));

    setFolders(fetchedFolders);
  }, [user]);

  const checkIfSaved = useCallback(async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid, "savedResults", resultId);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        setSaved(true);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  }, [user, resultId]);

  useEffect(() => {
    if (user) {
      fetchFolders();
      checkIfSaved();
    }
  }, [user, fetchFolders, checkIfSaved]);

  const handleSave = async () => {
    if (!user) {
      setSnackbarMessage("You must be logged in to save results.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid, "savedResults", resultId);
      await setDoc(userDocRef, {
        title,
        imageUrl,
        source,
        sourceUrl,
        timestamp: new Date(),
      });

      setSaved(true);
      setSnackbarMessage("Image saved");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  const handleOpenDialog = async () => {
    await fetchFolders();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setUnsaveDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleUnsaveConfirmation = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid, "savedResults", resultId);
      await deleteDoc(userDocRef);

      const updates = folders.map((folder) =>
        updateDoc(doc(db, "users", user.uid, "folders", folder.id), {
          images: arrayRemove(resultId),
        })
      );
      await Promise.all(updates);

      setSaved(false);
      setDialogOpen(false);
      setUnsaveDialogOpen(false);
    } catch (error) {
      console.error("Error removing saved result:", error);
    }
  };

  const handleToggleFolder = async (folderId) => {
    try {
      const folderRef = doc(db, "users", user.uid, "folders", folderId);
      if (!selectedFolders[folderId]) {
        // Add the image to the folder
        await updateDoc(folderRef, {
          images: arrayUnion(resultId),
        });

        // Update the folders state to reflect the new image count
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === folderId
              ? { ...folder, images: [...folder.images, resultId] }
              : folder
          )
        );
      } else {
        // Remove the image from the folder
        await updateDoc(folderRef, {
          images: arrayRemove(resultId),
        });

        // Update the folders state to reflect the new image count
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === folderId
              ? {
                  ...folder,
                  images: folder.images.filter((id) => id !== resultId),
                }
              : folder
          )
        );
      }

      setSelectedFolders((prev) => ({
        ...prev,
        [folderId]: !prev[folderId],
      }));

      // Notify parent component (e.g., Saved.js) to update global state
      if (onUpdateFolders) {
        onUpdateFolders(folderId, selectedFolders[folderId] ? -1 : 1);
      }
    } catch (error) {
      console.error("Error updating folder:", error);
    }
  };

  const handleOpenNewFolderDialog = () => {
    setNewFolderDialogOpen(true);
  };

  const handleCloseNewFolderDialog = () => {
    setNewFolderDialogOpen(false);
    setNewFolderName("");
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const folderId = newFolderName.toLowerCase().replace(/\s+/g, "-");
      const folderRef = doc(db, "users", user.uid, "folders", folderId);

      await setDoc(folderRef, {
        name: newFolderName,
        images: [],
        timestamp: new Date(),
      });

      await fetchFolders();
      setNewFolderDialogOpen(false);
      setNewFolderName("");
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  useEffect(() => {
    if (saved) {
      const checkFolders = async () => {
        const folderState = {};
        const folderPromises = folders.map(async (folder) => {
          const folderRef = doc(db, "users", user.uid, "folders", folder.id);
          const folderSnapshot = await getDoc(folderRef);
          const folderData = folderSnapshot.data();

          if (
            folderSnapshot.exists() &&
            folderData.images &&
            folderData.images.includes(resultId)
          ) {
            folderState[folder.id] = true;
          }
        });

        await Promise.all(folderPromises);
        setSelectedFolders(folderState);
      };

      checkFolders();
    }
  }, [saved, folders, user, resultId]);

  return (
    <Card
      sx={{
        width: 300,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {imageUrl && (
        <CardMedia component="img" height="200" image={imageUrl} alt={title} />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Source: {source}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={saved ? handleOpenDialog : handleSave}
        >
          {saved ? "Saved" : "Save"}
        </Button>
        <Button
          variant="contained"
          size="small"
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon />}
        >
          View
        </Button>
      </CardActions>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
          action={
            <Button color="inherit" size="small" onClick={handleOpenDialog}>
              Add to Folder
            </Button>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          Image saved
          <Button
            variant="text"
            color="error"
            onClick={() => setUnsaveDialogOpen(true)}
            sx={{ marginLeft: 2 }}
          >
            Unsave
          </Button>
        </DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="subtitle1">Add to your folder</Typography>
            <Button onClick={handleOpenNewFolderDialog}>New</Button>
          </Box>
          {folders.map((folder) => (
            <Box key={folder.id} display="flex" flexDirection="column" mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!selectedFolders[folder.id]}
                    onChange={() => handleToggleFolder(folder.id)}
                  />
                }
                label={
                  <Box>
                    <Typography>{folder.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {folder.images.length === 0
                        ? "Empty"
                        : folder.images.length === 1
                        ? "1 image"
                        : `${folder.images.length} images`}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Done</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={newFolderDialogOpen} onClose={handleCloseNewFolderDialog}>
        <DialogTitle>Create Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewFolderDialog}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={unsaveDialogOpen}
        onClose={() => setUnsaveDialogOpen(false)}
      >
        <DialogTitle>Unsave Image</DialogTitle>
        <DialogContent>
          <Typography>
            Un-saving will remove this image from all of your folders.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnsaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUnsaveConfirmation}
            variant="contained"
            color="error"
          >
            Unsave
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ArtCard;
