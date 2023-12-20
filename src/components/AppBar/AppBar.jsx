import { Box, IconButton, Tooltip } from "@mui/material";
import ButtonAuth from "./ButtonAuth";
import ButtonBrightnessMode from "./ButtonBrightnessMode";
import ButtonNotifications from "./ButtonNotifications";
import { useContext } from "react";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";
import ButtonAuthRecognized from "./ButtonAuthRecognized";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ButtonMessages from "./ButtonMessages";

export default function AppBar() {
  const navigate = useNavigate();
  const contextOnboardFlow = useContext(ContextOnboardFlow);

  return (
    <Box
      sx={{ display: "flex", alignItems: "center" }}
      bgcolor="bg.base"
      borderRadius="1rem"
    >
      <Tooltip title="landing" arrow>
        <IconButton
          size="medium"
          color="primary"
          onClick={() => {
            navigate("/");
          }}
        >
          <HomeIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <ButtonMessages />
      <ButtonNotifications />
      {contextOnboardFlow.complete ? <ButtonAuthRecognized /> : <ButtonAuth />}
      <ButtonBrightnessMode />
    </Box>
  );
}
