import { useContext } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";

import { ContextContent } from "../../contexts/ContextContent/ContextContent";

import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export default function ContentBar() {
  const contextContent = useContext(ContextContent);

  return (
    <Box bgcolor="bg.base" borderRadius="1rem">
      <Tooltip title="quotes" arrow>
        <IconButton
          fontSize="inherit"
          color={contextContent.quote ? "primary" : "inactive"}
          onClick={() => {
            contextContent.setQuote(!contextContent.quote);
          }}
        >
          <FormatQuoteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title="articles" arrow>
        <IconButton
          color={contextContent.article ? "primary" : "inactive"}
          onClick={() => {
            contextContent.setArticle(!contextContent.article);
          }}
        >
          <NewspaperIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title="photos" arrow>
        <IconButton
          color={contextContent.photo ? "primary" : "inactive"}
          onClick={() => {
            contextContent.setPhoto(!contextContent.photo);
          }}
        >
          <PhotoCameraIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title="videos" arrow>
        <IconButton
          color={contextContent.video ? "primary" : "inactive"}
          onClick={() => {
            contextContent.setVideo(!contextContent.video);
          }}
        >
          <OndemandVideoIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title="streams - developing..." arrow>
        <IconButton
          color={contextContent.stream ? "primary" : "inactive"}
          onClick={() => {
            // contextContent.setStream(!contextContent.stream);
          }}
        >
          <PhotoCameraFrontIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
