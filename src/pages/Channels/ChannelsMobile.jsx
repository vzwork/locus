import { Box, Button, Container, Dialog, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";
import { ContextContent } from "../../contexts/ContextContent/ContextContent";
import { useContext, useState } from "react";

import ButtonNotifications from "../../components/AppBar/ButtonNotifications";
import ButtonBrightnessMode from "../../components/AppBar/ButtonBrightnessMode";
import ButtonAuthRecognized from "../../components/AppBar/ButtonAuthRecognized";
import ButtonAuth from "../../components/AppBar/ButtonAuth";
import HomeIcon from "@mui/icons-material/Home";

import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import ContentBar from "../../components/ContentBar/ContentBar";
import CloseIcon from "@mui/icons-material/Close";
import Navigation from "./components/Navigation";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Content from "../../components/Content/Content";

function NavigationMobile({ navigationOpen, setNavigationOpen }) {
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
        <Box sx={{ flex: 1, paddingX: "0.5rem" }} bgcolor="bg.clear">
          <Navigation />
        </Box>
        <Button
          variant="outlined"
          color="active"
          style={{ minWidth: "30px", maxWidth: "36px", marginLeft: "0.4rem" }}
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
  const contextContent = useContext(ContextContent);
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <Box>
      <NavigationMobile
        navigationOpen={navigationOpen}
        setNavigationOpen={setNavigationOpen}
      />
      <Box
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          display: "flex",
          zIndex: "998",
        }}
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
      <Content />
      <Box
        sx={{
          position: "fixed",
          zIndex: "998",
          bottom: "0",
          display: "flex",
          width: "100vw",
          justifyContent: "space-between",
        }}
        bgcolor="bg.clear"
      >
        <Box>
          <IconButton
            size="large"
            onClick={() => setNavigationOpen(true)}
            color="active"
          >
            <ManageSearchIcon fontSize="inherit" />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ContentBar />
        </Box>
        <Box>
          <IconButton
            size="large"
            onClick={() => contextContent.setDialogAdd(true)}
            color="active"
          >
            <AddCircleOutlineIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
