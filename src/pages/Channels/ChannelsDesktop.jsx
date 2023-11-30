import { Box, Button, Container, Grid } from "@mui/material";
import AppBar from "../../components/AppBar/AppBar";
import ContentBar from "../../components/ContentBar/ContentBar";
import Navigation from "./components/navigation/Navigation";
import { useContext } from "react";
import { ContextContent } from "../../contexts/ContextContent/ContextContent";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";
import { useNavigate } from "react-router-dom";
import ContentWall from "./components/content/ContentWall";

export default function ChannelsDesktop() {
  const navigate = useNavigate();
  const contextContent = useContext(ContextContent);
  const contextOnboardFlow = useContext(ContextOnboardFlow);

  return (
    <Container
      maxWidth="xl"
      sx={{ paddingTop: "0.5rem", alignItems: "stretch" }}
    >
      <Grid container>
        <Grid item md={3}>
          <Box sx={{ paddingX: "0.5rem", position: "sticky", top: "0.5rem" }}>
            <Navigation />
          </Box>
        </Grid>
        <Grid item md={6}>
          <Box sx={{ marginTop: "1rem" }}>
            <Box sx={{ display: "flex", flexDirection: "row-reverse" }}>
              <Button
                variant="outlined"
                size="small"
                color="primary"
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
        <Grid item md={3}>
          <Box
            sx={{
              position: "sticky",
              top: "0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
            }}
          >
            <AppBar />
            <ContentBar />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
