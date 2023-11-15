import { Box, IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function BrightnessMode(props) {
  const changeMode = async () => {
    props.setDarkMode(!props.darkMode);
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
