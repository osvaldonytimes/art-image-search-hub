import React, { useState, useEffect } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { db, collection, doc } from "../firebase";
import { onSnapshot, deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import ArtCard from "../components/ArtCard";

const AllSaved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedImages, setSavedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSavedImages = () => {
      setLoading(true);
      setError(false);

      if (!user) return;

      const savedResultsCollection = collection(
        db,
        "users",
        user.uid,
        "savedResults"
      );

      try {
        const unsubscribe = onSnapshot(savedResultsCollection, (snapshot) => {
          const savedResults = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSavedImages(savedResults);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching saved images:", error);
        setError(true);
        setLoading(false);
      }
    };

    const unsubscribe = fetchSavedImages();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleImageRemove = async (imageId) => {
    try {
      if (user) {
        const imageRef = doc(db, "users", user.uid, "savedResults", imageId);
        await deleteDoc(imageRef);
        setSavedImages((prevImages) =>
          prevImages.filter((image) => image.id !== imageId)
        );
      }
    } catch (error) {
      console.error("Error unsaving image:", error);
    }
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
          <Button
            variant="outlined"
            onClick={() => navigate("/saved")}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" mb={2}>
            All Saved Images
          </Typography>
          {error ? (
            <Typography variant="body2" color="textSecondary">
              An error occurred while fetching your saved images. Please try
              again later.{" "}
            </Typography>
          ) : savedImages.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No saved images found.
            </Typography>
          ) : (
            <Box display="flex" flexWrap="wrap" gap={2}>
              {savedImages.map((image) => (
                <ArtCard
                  key={image.id}
                  title={image.title}
                  artist={image.artist}
                  imageUrl={image.imageUrl}
                  source={image.source}
                  sourceUrl={image.sourceUrl}
                  resultId={image.id}
                  onRemove={handleImageRemove}
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AllSaved;
