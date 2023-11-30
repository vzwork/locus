import { Box, Container, Link } from "@mui/material";
import { useContext, useEffect } from "react";
import { ContextTheme } from "../../../contexts/ContextTheme/ContextTheme";
import LabelOutlined from "../../../components/LabelOutlined/LabelOutlined";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";

export default function Recents() {
  const contextTheme = useContext(ContextTheme);
  const theme = useTheme();
  const navigate = useNavigate();

  const cashChannels = JSON.parse(localStorage.getItem("cashChannels"));
  const history = JSON.parse(localStorage.getItem("history")) || [];

  useEffect(() => {});

  return (
    <Box>
      <Container maxWidth="md">
        <Box bgcolor="bg.clear">
          <LabelOutlined
            style={{ width: "100%" }}
            label={"recent channels"}
            borderColor={contextTheme.darkMode ? "#666" : "#888"}
          >
            <Box sx={{ display: "flex", gap: "0.5rem", overflow: "hidden" }}>
              {history.map((key, idx) => {
                if (cashChannels[key]) {
                  return (
                    <Link
                      key={idx}
                      component="button"
                      color="inherit"
                      sx={{
                        "&:hover": {
                          color: `${theme.palette.primary.main}`,
                        },
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => {
                        navigate(`/channels/${key}`);
                      }}
                    >
                      {cashChannels[key].name}
                    </Link>
                  );
                }
              })}
            </Box>
          </LabelOutlined>
        </Box>
      </Container>
    </Box>
  );
}
