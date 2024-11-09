import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import axios from "axios";
import ArtCard from "../components/ArtCard";

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
        const authorMatch = item.author
          ? item.author.toLowerCase().includes(query.toLowerCase())
          : false;
        return titleMatch || authorMatch;
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
        const aAuthor = a.author ? a.author.toLowerCase() : "";
        const bAuthor = b.author ? b.author.toLowerCase() : "";
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

  const fetchArtInstitute = async (query) => {
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks/search`,
      {
        params: {
          q: query,
          fields: "id,title,image_id,artist_title", // Requesting artist_title along with id, title, and image_id
        },
      }
    );
    return response.data.data
      .filter((item) => item.image_id)
      .map((item) => {
        // console.log("ArtInstitute", item);
        return {
          id: item.id.toString(),
          title: item.title,
          artist: item.artist_title,
          imageUrl: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
          source: "Art Institute of Chicago",
          sourceUrl: `https://www.artic.edu/artworks/${item.id}`,
        };
      });
  };

  const fetchHarvardArtMuseums = async (query) => {
    const apiKey = process.env.REACT_APP_HARVARD_API_KEY;
    const response = await axios.get(
      `https://api.harvardartmuseums.org/object?apikey=${apiKey}&title=${query}`
    );
    return response.data.records
      .filter((item) => item.primaryimageurl)
      .map((item) => {
        // console.log('HarvardArtMuseums', item);
        return {
          id: item.id.toString(),
          title: item.title,
          artist: item.people ? item.people[0].name : "",
          imageUrl: item.primaryimageurl,
          source: "Harvard Art Museums",
          sourceUrl:
            item.url ||
            `https://www.harvardartmuseums.org/collections/object/${item.id}`,
        };
      });
  };

  const fetchMetMuseum = async (query) => {
    try {
      const searchResponse = await axios.get(
        `https://collectionapi.metmuseum.org/public/collection/v1/search`,
        {
          params: {
            q: query,
            hasImages: true,
          },
        }
      );

      if (searchResponse.data.objectIDs) {
        const objectIds = searchResponse.data.objectIDs.slice(0, 10); // Limit to 10 results for simplicity
        const objectDetailsPromises = objectIds.map((id) =>
          axios.get(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
          )
        );

        const objectsResponses = await Promise.all(objectDetailsPromises);
        return objectsResponses
          .map((response) => response.data)
          .filter((item) => item.primaryImage)
          .map((item) => {
            // console.log("MET Museum", item);
            return {
              id: item.objectID.toString(),
              title: item.title,
              artist: item.artistDisplayName || "",
              imageUrl: item.primaryImage,
              source: "The MET Museum",
              sourceUrl: `https://www.metmuseum.org/art/collection/search/${item.objectID}`,
            };
          });
      }
      return [];
    } catch (error) {
      console.error("Error fetching MET Museum data:", error);
      throw error;
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
      ) : error ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          height="100vh"
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/")}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" color="error" textAlign="center">
            An error occurred while fetching the results. Please try again
            later.
          </Typography>
        </Box>
      ) : results.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          height="100vh"
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/")}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" textAlign="center">
            No results found for: {query}
          </Typography>
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
            Showing results for: {query}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {results.map((item) => (
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
        </>
      )}
    </Box>
  );
};

export default Search;
