import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Button,
  CardActions,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { db, doc, getDoc, setDoc } from "../firebase";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const ArtCard = ({ title, imageUrl, source, sourceUrl, resultId }) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Add a check for valid resultId
  const checkIfSaved = useCallback(
    async (resultId) => {
      if (!resultId || typeof resultId !== "string") {
        console.error("Invalid resultId:", resultId);
        return;
      }

      if (user) {
        try {
          const userDoc = doc(db, "users", user.uid, "savedResults", resultId);
          const userSavedResult = await getDoc(userDoc);

          if (userSavedResult.exists()) {
            setSaved(true);
          }
        } catch (error) {
          console.error("Error checking saved status:", error);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    if (user && resultId) {
      checkIfSaved(resultId);
    }
  }, [user, resultId, checkIfSaved]);

  const handleSave = async () => {
    if (!user) {
      setSnackbarMessage("You must be logged in to save results.");
      setSnackbarOpen(true);
      return;
    }

    if (!resultId || typeof resultId !== "string") {
      console.error("Invalid resultId:", resultId);
      setSnackbarMessage("Cannot save, invalid result.");
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
        timestamp: new Date(), // Add timestamp for "Recently Saved"
      });

      setSaved(true);
      setSnackbarMessage("Result saved successfully.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

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
          onClick={handleSave}
          disabled={saved}
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
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ArtCard;
