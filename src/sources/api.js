/**
 * This file contains functions to fetch data from different art sources.
 * The functions return an array of objects with the following properties:
 * - id: string - Unique identifier for the artwork.
 * - title: string - Title of the artwork.
 * - artist: string - Name of the artist.
 * - imageUrl: string - URL of the image of the artwork.
 * - source: string - Name of the art source.
 * - sourceUrl: string - URL of the artwork on the source website.
 */
import axios from "axios";

export const fetchArtInstitute = async (query) => {
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

export const fetchHarvardArtMuseums = async (query) => {
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

export const fetchMetMuseum = async (query) => {
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

export const fetchClevelandMuseumOfArt = async (query) => {
  const response = await axios.get(
    `https://openaccess-api.clevelandart.org/api/artworks/`,
    {
      params: {
        q: query,
        has_image: 1,
      },
    }
  );
  return response.data.data.map((item) => {
    // console.log("Cleveland Museum of Art", item);
    return {
      id: item.id.toString(),
      title: item.title,
      artist: item.creators.length > 0 ? item.creators[0].description : "",
      imageUrl: item.images.web.url,
      source: "Cleveland Museum of Art",
      sourceUrl: `https://www.clevelandart.org/art/${item.id}`,
    };
  });
};

// export const fetchRijksmuseum = async (query) => {
//   const apiKey = process.env.REACT_APP_RIJKS_API_KEY;
//   const response = await axios.get(
//     `https://www.rijksmuseum.nl/api/en/collection`,
//     {
//       params: {
//         key: apiKey,
//         q: query,
//         imgonly: true,
//       },
//     }
//   );
//   return response.data.artObjects.map((item) => {
//     return {
//       id: item.objectNumber,
//       title: item.title,
//       artist: item.principalOrFirstMaker,
//       imageUrl: item.webImage.url,
//       source: "Rijksmuseum",
//       sourceUrl: `https://www.rijksmuseum.nl/en/collection/${item.objectNumber}`,
//     };
//   });
// };

export const fetchVictoriaAndAlbertMuseum = async (query) => {
  const response = await axios.get(`https://api.vam.ac.uk/v2/objects/search`, {
    params: {
      q: query,
      images: 1,
    },
  });
  return response.data.records.map((item) => {
    // console.log("VictoriaAndAlbertMuseum", item);
    return {
      id: item.systemNumber,
      title: item._primaryTitle,
      artist: item._primaryMaker ? item._primaryMaker.name : "",
      imageUrl: item._primaryImageId
        ? `https://media.vam.ac.uk/media/thira/collection_images/${item._primaryImageId.slice(
            0,
            6
          )}/${item._primaryImageId}.jpg`
        : "",
      source: "Victoria and Albert Museum",
      sourceUrl: `https://collections.vam.ac.uk/item/${item.systemNumber}`,
    };
  });
};

export const fetchSmithsonianInstitution = async (query) => {
  const apiKey = process.env.REACT_APP_SMITHSONIAN_API_KEY;
  const response = await axios.get(
    `https://api.si.edu/openaccess/api/v1.0/search`,
    {
      params: {
        api_key: apiKey,
        q: query,
        rows: 10,
      },
    }
  );
  return response.data.response.rows
    .map((item) => {
      // console.log("SmithsonianInstitution", item);
      const imageUrl = item.content.descriptiveNonRepeating.online_media
        ? item.content.descriptiveNonRepeating.online_media.media[0].content
        : "";
      return {
        id: item.id,
        title: item.title,
        artist: item.content.freetext.name
          ? item.content.freetext.name[0].content
          : "",
        imageUrl: imageUrl,
        source: "Smithsonian Institution",
        sourceUrl: item.content.descriptiveNonRepeating.record_link,
      };
    })
    .filter((item) => item.imageUrl);
};
