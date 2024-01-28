import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Collapse,
  Container,
  Grid,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAccount from "../data/_1_ManagerAccount/useAccount";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import useThemeMode from "../data/_0_ManagerTheme/useThemeMode";
import ManagerTheme from "../data/_0_ManagerTheme/ManagerTheme";
import { idRoot } from "../data/db";
import { ButtonSignedInBig } from "../components/ButtonSignedIn/ButtonSignedIn";
import test from "./test";
import { useEffect, useState } from "react";

import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import CloseIcon from "@mui/icons-material/Close";

export default function Landing() {
  const account = useAccount();
  const theme = useTheme();
  const navigate = useNavigate();
  const themeMode = useThemeMode();
  const managerTheme = ManagerTheme;

  const [showPresentation, setShowPresentation] = useState(
    localStorage.getItem("showPresentation") === "false" ? false : true
  );

  const handleTriggerFunction = () => {
    fetch(
      "http://127.0.0.1:5001/locus-68ed2/us-central1/testCounterInteractionsUpdateDaily"
    ).then((res) => {
      res.json().then((data) => console.log(data));
    });
  };

  const handleTriggerFunctionRebalance = () => {
    fetch(
      "http://127.0.0.1:5001/locus-68ed2/us-central1/testRebalanceTreeDaily"
    ).then((res) => {
      res.json().then((data) => console.log(data));
    });
  };

  const handleTestQuery = async () => {
    // console.log("hello");
    test();
  };

  useEffect(() => {
    if (showPresentation) {
      localStorage.setItem("showPresentation", "true");
    } else {
      localStorage.setItem("showPresentation", "false");
    }
  }, [showPresentation]);

  return (
    <Box>
      <Container>
        <Box
          mt="1rem"
          p="0.5rem"
          borderRadius="0.5rem"
          bgcolor={theme.palette.background.transperent}
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box",
            backdropFilter: "blur(2px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "bottom" }}>
            <Typography variant="h5">Locus</Typography>
            <Typography variant="h6" color="info.main">
              .news
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Collapse in={!showPresentation}>
              {/* <Box
              // borderRadius="0.5rem"
              // bgcolor={theme.palette.background.transperentLight}
              // sx={{ width: "min-content" }}
              > */}
              <IconButton
                onClick={() => {
                  setShowPresentation(true);
                }}
              >
                <QuestionMarkIcon />
              </IconButton>
              {/* </Box> */}
            </Collapse>
            <IconButton
              color="secondary"
              onClick={() => {
                managerTheme.toggleTheme();
              }}
            >
              {themeMode === "light" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            {account ? (
              <ButtonSignedInBig />
            ) : (
              <ButtonGroup>
                <Button onClick={() => navigate("/signin")} variant="contained">
                  sign in
                </Button>
                <Button onClick={() => navigate("/signup")} variant="outlined">
                  sign up
                </Button>
              </ButtonGroup>
            )}
          </Box>
        </Box>
      </Container>

      <Box></Box>

      <Container sx={{ paddingY: "2rem" }}>
        <Collapse in={showPresentation}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "right",
            }}
          >
            <Box
              borderRadius="0.5rem"
              bgcolor={theme.palette.background.transperentLight}
              sx={{ width: "min-content" }}
            >
              <IconButton
                onClick={() => {
                  setShowPresentation(false);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Box
            px="2rem"
            sx={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            <Grid
              container
              bgcolor={"background.transperentLight"}
              borderRadius="0.5rem"
              padding="0.5rem"
              sx={{ backdropFilter: "blur(2px)" }}
            >
              <Grid item xs={12}>
                <Typography variant="h4">What is locus?</Typography>
              </Grid>
              <Grid item xs={12} md={6} p="0.5rem">
                <Box>Locus - a news sharing platform.</Box>
                <Box>Supporting different types of content.</Box>
                <Box p="0.3rem" />
                <Box>Providing an outlet for all sorts of ideas.</Box>
              </Grid>
              <Grid item xs={12} md={6} p="0.5rem">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <Button variant="outlined" startIcon={<FormatQuoteIcon />}>
                    quotes
                  </Button>
                  <Button variant="outlined" startIcon={<NewspaperIcon />}>
                    articles
                  </Button>
                  <Button variant="outlined" startIcon={<PhotoCameraIcon />}>
                    photos
                  </Button>
                  <Button variant="outlined" startIcon={<OndemandVideoIcon />}>
                    videos
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraFrontIcon />}
                    color="info"
                  >
                    streaming
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Grid
              container
              bgcolor={"background.transperentLight"}
              borderRadius="0.5rem"
              padding="0.5rem"
              sx={{ backdropFilter: "blur(2px)" }}
            >
              <Grid item xs={12}>
                <Typography variant="h4">Channels...</Typography>
              </Grid>
              <Grid item xs={12} md={6} p="0.5rem">
                <Box>Thanks to a "tree-like" structure</Box>
                <Box>You can find a channel for any topic.</Box>
                <Box p="0.3rem" />
                <Box>You can use search to find any channel.</Box>
                <Box>Or you can use navigation window.</Box>
              </Grid>
              <Grid item xs={12} md={6} p="0.5rem">
                <img
                  alt="tree"
                  src="/channels.png"
                  width="100%"
                  height="160px"
                />
              </Grid>
            </Grid>
            <Grid
              container
              bgcolor={"background.transperentLight"}
              borderRadius="0.5rem"
              padding="0.5rem"
              sx={{ backdropFilter: "blur(2px)" }}
            >
              <Grid item xs={12}>
                <Typography variant="h4">Content...</Typography>
              </Grid>
              <Grid item xs={12} md={6} p="0.5rem">
                <Box>Thanks to the tree structure</Box>
                <Box>We can rebalance content.</Box>
                <Box p="0.3rem" />
                <Box>That means at the very top you will see</Box>
                <Box>Only the most important news.</Box>
                <Box p="0.3rem" />
                <Box>3 best posts are promoted from each channel up.</Box>
              </Grid>
              <Grid item xs={12} md={6} p="0.5rem">
                <img
                  alt="promotion"
                  src="/promotion.png"
                  width="100%"
                  height="160px"
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Container>

      <Button
        onClick={() => {
          navigate(`/channels/${idRoot}`);
        }}
      >
        root channel
      </Button>
      <Button onClick={handleTriggerFunction}>trigger function</Button>
      <Button
        onClick={() => {
          handleTriggerFunctionRebalance();
        }}
      >
        trigger function rebalance
      </Button>
      <Button onClick={handleTestQuery}>test query</Button>
    </Box>
  );
}
