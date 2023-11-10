import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createContext, useEffect, useState } from "react";
import BrightnessMode from "./BrightnessMode";

const themeLight = createTheme({
  palette: {
    primary: {
      main: "#6F836E",
    },
    bg: {
      base: "#F4F6F6",
      clear: "rgba(240, 240, 240, 0.8)",
    },
  },
});

const themeDark = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6F836E",
    },
    bg: {
      base: "#121212",
      clear: "rgba(40, 40, 40, 0.8)",
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
    <ContextTheme.Provider value={{ darkMode }}>
      <ThemeProvider theme={darkMode ? themeDark : themeLight}>
        <BrightnessMode darkMode={darkMode} setDarkMode={setDarkMode} />
        {props.children}
        <></>
      </ThemeProvider>
    </ContextTheme.Provider>
  );
};

export { ContextProviderTheme, ContextTheme };
