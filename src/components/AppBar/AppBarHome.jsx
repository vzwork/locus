import { useContext } from "react";
import { Box } from "@mui/material";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";

import ButtonAuth from "./ButtonAuth";
import ButtonBrightnessMode from "./ButtonBrightnessMode";
import ButtonNotifications from "./ButtonNotifications";
import ButtonAuthRecognized from "./ButtonAuthRecognized";

export default function AppBarHome() {
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
    </Box>
  );
}
