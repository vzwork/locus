import { Box, Container, Grid } from "@mui/material";
import { useLayoutEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import ContentBar from "../../components/ContentBar/ContentBar";
import NavigationDesktop from "./components/NavigationDesktop";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

export default function ChannelsDesktop() {
  const [width, height] = useWindowSize();

  return (
    <Container maxWidth="xl" sx={{ paddingTop: "0.5rem" }}>
      {width > 1100 ? (
        // big desktop
        <Grid container>
          <Grid item md={3}>
            <Box sx={{ height: "100vh" }}>
              <Box sx={{ paddingX: "0.5rem" }}>
                <NavigationDesktop />
              </Box>
            </Box>
          </Grid>
          <Grid item md={6}>
            <Box sx={{ height: "100vh" }} bgcolor="primary.main">
              <Box sx={{ padding: "1rem" }}>content</Box>
            </Box>
          </Grid>
          <Grid item md={3}>
            <Box sx={{ height: "100vh" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "end",
                }}
              >
                <AppBar />
                <ContentBar />
              </Box>
            </Box>
          </Grid>
        </Grid>
      ) : (
        // compact desktop
        <Grid container>
          <Grid item xs={4}>
            <Box sx={{ height: "100vh" }}>
              <Box sx={{ paddingX: "0.5rem" }}>
                <NavigationDesktop />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Box sx={{ display: "flex", flexFlow: "column", height: "100vh" }}>
              <Box sx={{ flex: "0 1 auto" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ContentBar />
                  <AppBar />
                </Box>
              </Box>
              <Box bgcolor={"primary.main"} sx={{ flex: "1 1 auto" }}>
                <Box sx={{ padding: "1rem" }}>content</Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
