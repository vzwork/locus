import { Box, IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useContext } from "react";
// import { PageColorContext } from "../PageColorContext/PageColorContext";

export default function BrightnessMode(props) {
  // const pageColorContext = useContext(PageColorContext);

  const changeMode = async () => {
    if (props.darkMode) {
      // pageColorContext.setDarkToLightTransition(true);
    } else {
      // pageColorContext.setDarkToLightTransition(false);
    }
    // await pageColorContext.animateInColor();
    props.setDarkMode(!props.darkMode);
    // await pageColorContext.animateOutColor();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        zIndex: 998,
        right: "0",
        top: "0",
      }}
    >
      <IconButton
        color="primary"
        size="large"
        onClick={() => {
          changeMode();
        }}
      >
        {props.darkMode ? (
          <DarkModeIcon fontSize="inherit" />
        ) : (
          <LightModeIcon fontSize="inherit" />
        )}
      </IconButton>
    </Box>
  );
}
