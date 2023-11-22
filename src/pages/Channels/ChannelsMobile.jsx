import { Box, Button, Container, Dialog, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";
import { useContext, useState } from "react";
import ButtonNotifications from "../../components/AppBar/ButtonNotifications";
import ButtonBrightnessMode from "../../components/AppBar/ButtonBrightnessMode";
import ButtonAuthRecognized from "../../components/AppBar/ButtonAuthRecognized";
import ButtonAuth from "../../components/AppBar/ButtonAuth";
import HomeIcon from "@mui/icons-material/Home";

import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ContentBar from "../../components/ContentBar/ContentBar";
import CloseIcon from "@mui/icons-material/Close";
import NavigationDesktop from "./components/NavigationDesktop";

function Navigation({ navigationOpen, setNavigationOpen }) {
  return (
    <Dialog
      open={navigationOpen}
      onClose={() => setNavigationOpen(false)}
      PaperProps={{
        style: { background: "none" },
      }}
    >
      <Box
        sx={{
          width: "82vw",
          height: "90vh",
          display: "flex",
        }}
      >
        <Box sx={{ flex: 1 }} bgcolor="bg.clear">
          <NavigationDesktop />
        </Box>
        <Button
          variant="outlined"
          color="inherit"
          style={{ minWidth: "30px", maxWidth: "40px", marginLeft: "0.4rem" }}
          onClick={() => {
            setNavigationOpen(false);
          }}
        >
          <CloseIcon />
        </Button>
      </Box>
    </Dialog>
  );
}

export default function ChannelsMobile() {
  const navigate = useNavigate();
  const contextOnboardFlow = useContext(ContextOnboardFlow);
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navigation
        navigationOpen={navigationOpen}
        setNavigationOpen={setNavigationOpen}
      />
      <Box
        sx={{ position: "fixed", top: 0, right: 0, display: "flex" }}
        bgcolor="bg.clear"
        borderRadius="1rem"
      >
        <IconButton
          size="large"
          color="primary"
          onClick={() => {
            navigate("/");
          }}
        >
          <HomeIcon fontSize="inherit" />
        </IconButton>
        <ButtonNotifications />
        {contextOnboardFlow.complete ? (
          <ButtonAuthRecognized />
        ) : (
          <ButtonAuth />
        )}
        <ButtonBrightnessMode />
      </Box>
      <Box sx={{ flex: 1, marginTop: "2rem" }} bgcolor="primary.main">
        content
      </Box>
      <Box
        sx={{ position: "fixed", bottom: "0", display: "flex", width: "100vw" }}
        bgcolor="bg.clear"
      >
        <Box>
          <IconButton size="large" onClick={() => setNavigationOpen(true)}>
            <ManageSearchIcon fontSize="inherit" />
          </IconButton>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ContentBar />
        </Box>
      </Box>
    </Box>
  );
}
