import React, { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { db, collection, doc } from "../firebase";
import { onSnapshot, deleteDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import ArtCard from "../components/ArtCard";

const AllSaved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedImages, setSavedImages] = useState([]);

  useEffect(() => {
    const fetchSavedImages = () => {
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
        setSavedImages(savedResults);
      });

      return unsubscribe;
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
    <Box p={3}>
      <Button variant="outlined" onClick={() => navigate("/saved")} mb={2}>
        Back
      </Button>
      <Typography variant="h4" mb={2}>
        All Saved Images
      </Typography>
      {savedImages.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          No saved images found.
        </Typography>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={2}
        >
          {savedImages.map((image) => (
            <ArtCard
              key={image.id}
              title={image.title}
              imageUrl={image.imageUrl}
              source={image.source}
              sourceUrl={image.sourceUrl}
              resultId={image.id}
              onRemove={handleImageRemove}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AllSaved;
