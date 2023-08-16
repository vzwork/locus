import { useState, createContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material";

declare module "@mui/material/styles" {
  interface Theme {
    palette: {
      main: string;
    };
  }
  // allow configuration using `createTheme`
  interface PaletteOptions {
    palette?: {
      main?: string;
    };
  }
}

const themeLight = createTheme({
  palette: {
    primary: {
      light: "#48b0b5",
      main: "#48b0b5",
      dark: "#34625e",
      contrastText: "#e2f8f7",
    },
    secondary: {
      light: "#e4eceb",
      main: "#b1b9b7",
      dark: "#929998",
      contrastText: "#181e1d",
    },
  },
});

const themeDark = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: "#b5851d",
      main: "#ac6f11",
      dark: "#995008",
      contrastText: "#000",
    },
    secondary: {
      light: "#100c08",
      main: "#302d2b",
      dark: "#2c2826",
      contrastText: "#cfccc9",
    },
  },
});

const ThemeContext = createContext({});

function MyThemeProvider(props: any) {
  let now = new Date();
  let darkOutside = now.getHours() > 18 || now.getHours() < 6;

  const [useLightTheme, setUseLightTheme] = useState(!darkOutside);

  const { children } = props;

  return (
    <ThemeContext.Provider
        value={{useLightTheme, setUseLightTheme}}
    >
        <ThemeProvider theme={useLightTheme ? themeLight : themeDark}>
            {children}
        </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export {MyThemeProvider, ThemeContext}