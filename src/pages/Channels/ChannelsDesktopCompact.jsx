import { Box, Button, Container, Grid } from "@mui/material";
import AppBar from "../../components/AppBar/AppBar";
import ContentBar from "../../components/ContentBar/ContentBar";
import Navigation from "./components/navigation/Navigation";
import { useContext } from "react";
import { ContextContent } from "../../contexts/ContextContent/ContextContent";
import { useNavigate } from "react-router-dom";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";
import ContentWall from "./components/content/ContentWall";

export default function ChannelsDesktopCompact() {
  const navigate = useNavigate();
  const contextOnboardFlow = useContext(ContextOnboardFlow);
  const contextContent = useContext(ContextContent);

  return (
    <Container
      maxWidth="xl"
      sx={{ paddingTop: "0.5rem", alignItems: "stretch" }}
    >
      <Grid container>
        <Grid item xs={5} md={4}>
          <Box
            sx={{
              paddingX: "0.5rem",
              position: "sticky",
              top: "0.5rem",
            }}
          >
            <Navigation />
          </Box>
        </Grid>
        <Grid item xs={7} md={8}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              position: "sticky",
              top: "1rem",
              paddingX: "0.5rem",
              zIndex: 998,
            }}
          >
            <ContentBar />
            <AppBar />
          </Box>

          <Box sx={{ marginTop: "1rem" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row-reverse",
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  if (!contextOnboardFlow.complete) {
                    navigate("/account/signin");
                    return;
                  }
                  contextContent.setDialogAdd(true);
                }}
              >
                add content
              </Button>
            </Box>
            <ContentWall />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
