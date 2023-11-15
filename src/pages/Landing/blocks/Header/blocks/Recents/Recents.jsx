import { Box, Container } from "@mui/material";
import { useContext } from "react";
import { ContextTheme } from "../../../../../../contexts/ContextTheme/ContextTheme";
import LabelOutlined from "../../../../../../components/LabelOutlined/LabelOutlined";

export default function Recents() {
  const contextTheme = useContext(ContextTheme);

  return (
    <Box>
      <Container maxWidth="md">
        <Box bgcolor="bg.clear">
          <LabelOutlined
            style={{ width: "100%" }}
            label={"recents"}
            borderColor={contextTheme.darkMode ? "#666" : "#bbb"}
          >
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <Box>hello</Box>
              <Box>hello</Box>
              <Box>hello</Box>
              <Box>hello</Box>
            </Box>
          </LabelOutlined>
        </Box>
      </Container>
    </Box>
  );
}
