import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { db, collection, getDocs } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ArtCard from "../components/ArtCard";

const Saved = () => {
  const { user } = useAuth();
  const [recentlySaved, setRecentlySaved] = useState([]);

  // Memoize fetchRecentlySaved using useCallback
  const fetchRecentlySaved = useCallback(async () => {
    if (!user) return;

    try {
      const savedResultsCollection = collection(
        db,
        "users",
        user.uid,
        "savedResults"
      );
      const savedResultsSnapshot = await getDocs(savedResultsCollection);

      const savedResults = savedResultsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item) => item.id); // Ensure that resultId is defined

      const sortedResults = savedResults
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      setRecentlySaved(sortedResults);
    } catch (error) {
      console.error("Error fetching saved results:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRecentlySaved();
    }
  }, [user, fetchRecentlySaved]);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Recently Saved
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {recentlySaved.map((item) => (
          <ArtCard
            key={item.id}
            title={item.title}
            imageUrl={item.imageUrl}
            source={item.source}
            sourceUrl={item.sourceUrl}
            resultId={item.id}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Saved;
