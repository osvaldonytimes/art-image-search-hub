import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Button,
  CardActions,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const ArtCard = ({ title, imageUrl, source, sourceUrl }) => {
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
        {/* Save/Unsave Button */}
        <Button variant="outlined" size="small">
          Save
        </Button>

        {/* Open in new tab button */}
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
    </Card>
  );
};

export default ArtCard;
