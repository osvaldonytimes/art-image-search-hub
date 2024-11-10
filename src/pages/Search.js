import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import ArtCard from "../components/ArtCard";
import {
  fetchArtInstitute,
  fetchClevelandMuseumOfArt,
  fetchHarvardArtMuseums,
  fetchMetMuseum,
  fetchSmithsonianInstitution,
  fetchVictoriaAndAlbertMuseum,
} from "../sources/api";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query || query.length < 3) {
      navigate("/");
    } else {
      fetchSearchResults(query);
    }
  }, [query, navigate]);

  const fetchSearchResults = async (query) => {
    setLoading(true);
    setError(false);
    const apiResults = [];

    const apiRequests = [
      fetchArtInstitute(query),
      fetchHarvardArtMuseums(query),
      fetchMetMuseum(query),
      fetchClevelandMuseumOfArt(query),
      fetchVictoriaAndAlbertMuseum(query),
      fetchSmithsonianInstitution(query),
    ];

    try {
      const results = await Promise.allSettled(apiRequests);

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          apiResults.push(...result.value);
        } else {
          console.log(`Error fetching results from API ${index + 1}`);
        }
      });

      // Filter results to only include those with the query in either title or author
      const filteredResults = apiResults.filter((item) => {
        const titleMatch = item.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const artistMatch = item.artist
          ? item.artist.toLowerCase().includes(query.toLowerCase())
          : false;
        return titleMatch || artistMatch;
      });

      // Sort results by relevance in title (exact matches prioritized)
      const rankedResults = filteredResults.sort((a, b) => {
        const queryLower = query.toLowerCase();
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        const aExactMatch = aTitle === queryLower ? 1 : 0;
        const bExactMatch = bTitle === queryLower ? 1 : 0;

        // First prioritize exact title matches
        if (bExactMatch - aExactMatch !== 0) {
          return bExactMatch - aExactMatch;
        }

        // Then prioritize partial title matches
        const aTitleMatch = aTitle.includes(queryLower) ? 1 : 0;
        const bTitleMatch = bTitle.includes(queryLower) ? 1 : 0;
        if (bTitleMatch - aTitleMatch !== 0) {
          return bTitleMatch - aTitleMatch;
        }

        // If title matches are the same, prioritize by artist match if available
        const aAuthor = a.artist ? a.artist.toLowerCase() : "";
        const bAuthor = b.artist ? b.artist.toLowerCase() : "";
        const aAuthorMatch = aAuthor.includes(queryLower) ? 1 : 0;
        const bAuthorMatch = bAuthor.includes(queryLower) ? 1 : 0;

        return bAuthorMatch - aAuthorMatch;
      });

      setResults(rankedResults);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
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
            onClick={() => navigate("/")}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" mb={2}>
            Search: {query}
          </Typography>
          {error ? (
            <Typography variant="body2" color="textSecondary">
              An error occurred while fetching the results. Please try again
              later.{" "}
            </Typography>
          ) : results.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No results found for: {query}
            </Typography>
          ) : (
            <Box display="flex" flexWrap="wrap" gap={2}>
              {results.map((item) => (
                <ArtCard
                  key={item.id}
                  title={item.title}
                  artist={item.artist}
                  imageUrl={item.imageUrl}
                  source={item.source}
                  sourceUrl={item.sourceUrl}
                  resultId={item.id}
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Search;
