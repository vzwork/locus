import { useContext } from "react";
import { Box, IconButton } from "@mui/material";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";

import ButtonAuth from "./ButtonAuth";
import ButtonBrightnessMode from "./ButtonBrightnessMode";
import ButtonNotifications from "./ButtonNotifications";
import ButtonAuthRecognized from "./ButtonAuthRecognized";
import { useLocation, useNavigate } from "react-router-dom";
import ButtonMessages from "./ButtonMessages";

import HomeIcon from "@mui/icons-material/Home";

export default function AppBarHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const contextOnboardFlow = useContext(ContextOnboardFlow);

  return (
    <Box
      sx={{
        position: "absolute",
        top: "0",
        right: "0",
        width: "minContent",
        display: "flex",
        flexDirection: "row-reverse",
        zIndex: "998",
      }}
    >
      <ButtonBrightnessMode />
      {contextOnboardFlow.complete ? <ButtonAuthRecognized /> : <ButtonAuth />}
      <ButtonNotifications />
      {location.pathname.slice(0, 6) !== "/chats" ? <ButtonMessages /> : null}
      {location.pathname.slice(0, 6) !== "/" ? (
        <IconButton
          size="medium"
          color="primary"
          onClick={() => {
            navigate("/");
          }}
        >
          <HomeIcon fontSize="inherit" />
        </IconButton>
      ) : null}
    </Box>
  );
}
