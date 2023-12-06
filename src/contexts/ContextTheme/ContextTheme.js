import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createContext, useEffect, useState } from "react";
import { Box } from "@mui/material";

const themeLight = createTheme({
  palette: {
    primary: {
      main: "#3f6e59",
    },
    text: {
      base: "#000",
    },
    inactive: {
      main: "#999195",
    },
    active: {
      main: "#756e72",
    },
    background: {
      default: "#dae3e3",
      paper: "#dae3e3",
    },
    bg: {
      base: "#c8cfcf",
      clear: "rgba(200, 207, 207, 0.8)",
      hard: "rgba(180, 187, 187, 0.8)",
      easy: "rgba(190, 197, 197, 0.8)",
      comments: "rgba(200, 207, 207, 0.8)",
    },
  },
});

const themeDark = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6F836E",
    },
    secondary: {
      main: "#6b506a",
    },
    inactive: {
      main: "#4d494b",
    },
    active: {
      main: "#ada6a9",
    },
    text: {
      base: "#fff",
    },
    bg: {
      base: "#121212",
      clear: "rgba(18, 18, 18, 0.8)",
      hard: "rgba(48, 48, 48, 0.8)",
      easy: "rgba(28, 28, 28, 0.8)",
      comments: "rgba(48, 48, 48, 0.8)",
    },
  },
});

const ContextTheme = createContext({});

const ContextProviderTheme = (props) => {
  const now = new Date();
  const isNight = now.getHours() >= 18 || now.getHours() <= 6;
  const [darkMode, setDarkMode] = useState(isNight);
  const [localStartup, setLocalStartup] = useState(true);

  useEffect(() => {
    if (localStartup) {
      if (localStorage.getItem("darkMode") !== null) {
        setDarkMode(localStorage.getItem("darkMode") == "true");
      }
      setLocalStartup(false);
    }
  });

  useEffect(() => {
    if (!localStartup) {
      localStorage.setItem("darkMode", darkMode);
    }
  }, [darkMode]);

  return (
    <ContextTheme.Provider value={{ darkMode, setDarkMode }}>
      <ThemeProvider theme={darkMode ? themeDark : themeLight}>
        <Box
          sx={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            zIndex: "-999",
          }}
          bgcolor="bg.base"
          color="text.base"
        >
          {props.children}
        </Box>
      </ThemeProvider>
    </ContextTheme.Provider>
  );
};

export { ContextProviderTheme, ContextTheme };
