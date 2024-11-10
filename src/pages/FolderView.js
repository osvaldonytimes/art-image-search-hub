import React, { useState, useEffect } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db, doc, getDoc, updateDoc } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ArtCard from "../components/ArtCard";

const FolderView = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [folder, setFolder] = useState(null);
  const [folderImages, setFolderImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchFolder();
  }, [folderId, user]);

  const fetchFolder = async () => {
    setLoading(true);
    setError(false);
    try {
      if (user) {
        const folderRef = doc(db, "users", user.uid, "folders", folderId);
        const folderSnapshot = await getDoc(folderRef);
        if (folderSnapshot.exists()) {
          const folderData = folderSnapshot.data();
          setFolder({ id: folderId, ...folderData });

          // Fetch images for the folder
          const savedImages = folderData.images || [];
          const imageDetailsPromises = savedImages.map(async (imageId) => {
            const imageRef = doc(
              db,
              "users",
              user.uid,
              "savedResults",
              imageId
            );
            const imageSnapshot = await getDoc(imageRef);
            if (imageSnapshot.exists()) {
              return { id: imageId, ...imageSnapshot.data() };
            }
            return null;
          });

          const imageDetails = await Promise.all(imageDetailsPromises);
          setFolderImages(imageDetails.filter((image) => image !== null));
        }
      }
    } catch (error) {
      console.error("Error fetching folder:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemoved = async (imageId) => {
    try {
      // Remove the image from the folder state
      setFolderImages((prevImages) =>
        prevImages.filter((img) => img.id !== imageId)
      );

      // Update the folder in the database
      if (user) {
        const folderRef = doc(db, "users", user.uid, "folders", folderId);
        await updateDoc(folderRef, {
          images: folderImages
            .filter((img) => img.id !== imageId)
            .map((img) => img.id),
        });
      }
    } catch (error) {
      console.error("Error updating folder:", error);
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
            {folder?.name}
          </Typography>
          {error ? (
            <Typography variant="body2" color="textSecondary">
              An error occurred while fetching this folder. Please try again
              later.{" "}
            </Typography>
          ) : (
            folder && (
              <>
                {folderImages.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    This folder is empty. Add some images to see them here.
                  </Typography>
                ) : (
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    {folderImages.map((image) => (
                      <ArtCard
                        key={image.id}
                        title={image.title}
                        artist={image.artist}
                        imageUrl={image.imageUrl}
                        source={image.source}
                        sourceUrl={image.sourceUrl}
                        resultId={image.id}
                        onRemove={handleImageRemoved}
                      />
                    ))}
                  </Box>
                )}
              </>
            )
          )}
        </>
      )}
    </Box>
  );
};

export default FolderView;
