import { Box, Button } from "@mui/material";
import Content from "./Content/Content";
import Search from "./Search/Search";
import Recents from "./Recents/Recents";
import Suggestions from "./Suggestions/Suggestions";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ContextChannels } from "../../contexts/ContextChannels/ContextChannels";

import { getAnalytics, logEvent } from "firebase/analytics";

export default function Landing() {
  const analytics = getAnalytics();
  const contextChannels = useContext(ContextChannels);

  return (
    <Box sx={{ height: "100vh", gap: "5px" }}>
      <Box
        sx={{
          position: "relative",
          zIndex: "2",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Content />
        <Search />
        <Recents />
        <Suggestions />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="outlined"
            onClick={() => {
              contextChannels.initialNavigation();
            }}
          >
            channels
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
