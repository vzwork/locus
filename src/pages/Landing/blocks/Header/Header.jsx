import { Box, Button } from "@mui/material";
import Content from "./blocks/Content/Content";
import Search from "./blocks/Search/Search";
import Recents from "./blocks/Recents/Recents";
import Suggestions from "./blocks/Suggestions/Suggestions";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

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
              navigate("/tree");
            }}
          >
            tree
          </Button>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="outlined"
            onClick={() => {
              navigate("/auth/signin");
            }}
          >
            auth
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
