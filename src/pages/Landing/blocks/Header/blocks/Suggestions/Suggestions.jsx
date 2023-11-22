import { Box, Container, TextField } from "@mui/material";
import { useContext } from "react";
import { ContextTheme } from "../../../../../../contexts/ContextTheme/ContextTheme";
import LabelOutlined from "../../../../../../components/LabelOutlined/LabelOutlined";

export default function Suggestions() {
  const contextTheme = useContext(ContextTheme);

  return (
    <Box>
      <Container maxWidth="md">
        <Box bgcolor="bg.clear">
          <LabelOutlined
            style={{ width: "100%" }}
            label={"suggestions"}
            borderColor={contextTheme.darkMode ? "#666" : "#bbb"}
          >
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              to be implemented...
            </Box>
          </LabelOutlined>
        </Box>
      </Container>
    </Box>
  );
}
