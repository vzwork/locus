import { IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useContext } from "react";
import { ContextTheme } from "../../contexts/ContextTheme/ContextTheme";

export default function ButtonBrightnessMode() {
  const contextTheme = useContext(ContextTheme);

  const changeMode = async () => {
    contextTheme.setDarkMode(!contextTheme.darkMode);
  };

  return (
    <IconButton
      color="primary"
      size="medium"
      onClick={() => {
        changeMode();
      }}
    >
      {contextTheme.darkMode ? (
        <DarkModeIcon fontSize="inherit" />
      ) : (
        <LightModeIcon fontSize="inherit" />
      )}
    </IconButton>
  );
}
