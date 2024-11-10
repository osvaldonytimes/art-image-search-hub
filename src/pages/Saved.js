import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { db, collection, setDoc, doc } from "../firebase";
import { onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import ArtCard from "../components/ArtCard";
import Folder from "../components/Folder";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const Saved = () => {
  const { user } = useAuth();
  const [recentlySaved, setRecentlySaved] = useState([]);
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchRecentlySaved = useCallback(() => {
    if (!user) return;

    const savedResultsCollection = collection(
      db,
      "users",
      user.uid,
      "savedResults"
    );
    const unsubscribe = onSnapshot(savedResultsCollection, (snapshot) => {
      const savedResults = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedResults = savedResults
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      setRecentlySaved(sortedResults);
    });

    return unsubscribe;
  }, [user]);

  const fetchFolders = useCallback(() => {
    if (!user) return;

    const foldersCollection = collection(db, "users", user.uid, "folders");
    const unsubscribe = onSnapshot(foldersCollection, (snapshot) => {
      const fetchedFolders = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        images: doc.data().images || [],
      }));
      setFolders(fetchedFolders);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    let unsubscribeSaved;
    let unsubscribeFolders;
    setLoading(true);
    setError(false);
    try {
      if (user) {
        unsubscribeSaved = fetchRecentlySaved();
        unsubscribeFolders = fetchFolders();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
    return () => {
      if (unsubscribeSaved) unsubscribeSaved();
      if (unsubscribeFolders) unsubscribeFolders();
    };
  }, [user, fetchRecentlySaved, fetchFolders]);

  const handleCreateFolder = async () => {
    if (!user || !newFolderName.trim()) return;

    try {
      const folderId = newFolderName.toLowerCase().replace(/\s+/g, "-");
      const folderRef = doc(db, "users", user.uid, "folders", folderId);

      await setDoc(folderRef, {
        name: newFolderName,
        images: [], // Initialize the folder with an empty images array
      });

      setSnackbarMessage(`${newFolderName} successfully created`);
      setSnackbarOpen(true);
      setNewFolderName("");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewFolderName("");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleFolderClick = (folderId) => {
    navigate(`/saved/folder/${folderId}`);
  };

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4, md: 8 },
        pt: 6,
      }}
    >
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Recently Saved</Typography>
            <Button variant="outlined" onClick={() => navigate("/saved/all")}>
              See all
            </Button>
          </Box>
          {error ? (
            <Typography variant="body2" color="textSecondary">
              An error occurred while fetching your saved data. Please try again
              later.
            </Typography>
          ) : (
            <>
              <Swiper
                spaceBetween={10}
                slidesPerView={"auto"}
                style={{ padding: "1px 0" }}
              >
                {recentlySaved.map((item) => (
                  <SwiperSlide key={item.id} style={{ width: "300px" }}>
                    <ArtCard
                      title={item.title}
                      artist={item.artist}
                      imageUrl={item.imageUrl}
                      source={item.source}
                      sourceUrl={item.sourceUrl}
                      resultId={item.id}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              <Box mt={4}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" mb={2}>
                    Folders
                  </Typography>
                  <Button variant="outlined" onClick={handleOpenDialog}>
                    New Folder
                  </Button>
                </Box>
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
                  gap={2}
                >
                  {folders.length > 0 ? (
                    folders.map((folder) => (
                      <Folder
                        key={folder.id}
                        id={folder.id}
                        name={folder.name}
                        imageCount={folder.images.length}
                        onClick={() => handleFolderClick(folder.id)}
                      />
                    ))
                  ) : (
                    <Typography variant="body2">
                      No folders created yet.
                    </Typography>
                  )}
                </Box>

                <Dialog open={dialogOpen} onClose={handleCloseDialog}>
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
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleCreateFolder} variant="contained">
                      Save
                    </Button>
                  </DialogActions>
                </Dialog>

                <Snackbar
                  open={snackbarOpen}
                  autoHideDuration={4000}
                  onClose={handleCloseSnackbar}
                >
                  <Alert
                    onClose={handleCloseSnackbar}
                    severity="success"
                    sx={{
                      width: "100%",
                      bgcolor: "grey.900",
                      color: "grey.100",
                    }}
                    iconMapping={{
                      success: <span style={{ color: "white" }}>✔</span>,
                    }}
                  >
                    {snackbarMessage}
                  </Alert>
                </Snackbar>
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Saved;
