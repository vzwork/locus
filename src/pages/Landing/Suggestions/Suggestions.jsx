import { Box, Container, Link } from "@mui/material";
import { useContext } from "react";
import { ContextTheme } from "../../../contexts/ContextTheme/ContextTheme";
import LabelOutlined from "../../../components/LabelOutlined/LabelOutlined";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";

export default function Suggestions() {
  const contextTheme = useContext(ContextTheme);
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box>
      <Container maxWidth="md">
        <Box bgcolor="bg.clear">
          <LabelOutlined
            style={{ width: "100%" }}
            label={"popular channels"}
            borderColor={contextTheme.darkMode ? "#666" : "#888"}
          >
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <Link
                component="button"
                color="inherit"
                sx={{
                  "&:hover": {
                    color: `${theme.palette.primary.main}`,
                  },
                  whiteSpace: "nowrap",
                }}
                onClick={() => {
                  navigate(`/channels/wJwdi4XKGfFV3oTaCYFv`);
                }}
              >
                locus
              </Link>
            </Box>
          </LabelOutlined>
        </Box>
      </Container>
    </Box>
  );
}
