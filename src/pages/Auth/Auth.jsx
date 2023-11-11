import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export default function Auth() {
  const [value, setValue] = React.useState(0);

  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      {/* <CssBaseline /> */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={
          {
            // backgroundImage: "url(https://source.unsplash.com/random?wallpapers)",
            // backgroundRepeat: "no-repeat",
            // backgroundColor: (t) =>
            // t.palette.mode === "light"
            //     ? t.palette.grey[50]
            //     : t.palette.grey[900],
            // backgroundSize: "cover",
            // backgroundPosition: "center",
          }
        }
      />
      <Grid item xs={12} sm={8} md={5} square bgcolor={"bg.clear"}>
        <Outlet />
      </Grid>
    </Grid>
  );
}
