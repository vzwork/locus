import { Box, IconButton } from "@mui/material";
import ButtonAuth from "./ButtonAuth";
import ButtonBrightnessMode from "./ButtonBrightnessMode";
import ButtonNotifications from "./ButtonNotifications";
import { useContext } from "react";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";
import ButtonAuthRecognized from "./ButtonAuthRecognized";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

// used in tree page

export default function AppBar() {
  const navigate = useNavigate();
  const contextOnboardFlow = useContext(ContextOnboardFlow);

  return (
    <Box sx={{ display: "flex" }} bgcolor="bg.clear" borderRadius="1rem">
      <IconButton
        size="medium"
        color="primary"
        onClick={() => {
          navigate("/");
        }}
      >
        <HomeIcon fontSize="inherit" />
      </IconButton>
      <ButtonNotifications />
      {contextOnboardFlow.complete ? <ButtonAuthRecognized /> : <ButtonAuth />}
      <ButtonBrightnessMode />
    </Box>
  );
}
