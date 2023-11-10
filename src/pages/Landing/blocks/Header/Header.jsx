import { Box } from "@mui/material";
import Background from "../../../../components/Background/Background";
import Content from "./blocks/Content/Content";
import Search from "./blocks/Search/Search";
import Recents from "./blocks/Recents/Recents";
import Suggestions from "./blocks/Suggestions/Suggestions";

export default function Header() {
  return (
    <Box bgcolor="bg.base" sx={{ height: "100vh", gap: "5px" }}>
      <Background />
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
      </Box>
    </Box>
  );
}
