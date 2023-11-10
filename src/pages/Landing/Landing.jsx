import { Box } from "@mui/material";
import Header from "./blocks/Header/Header";
import { useContext } from "react";
import { ContextTheme } from "../../contexts/ContextTheme/ContextTheme";

export default function Landing() {
  const contextTheme = useContext(ContextTheme);

  return (
    <Box>
      <Header />
    </Box>
  );
}
