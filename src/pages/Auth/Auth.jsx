import * as React from "react";
import Grid from "@mui/material/Grid";
import { Outlet, useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
      <Grid item xs={12} sm={8} md={5} bgcolor={"bg.clear"}>
        <IconButton
          size="large"
          color="primary"
          onClick={() => {
            navigate("/");
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Outlet />
      </Grid>
    </Grid>
  );
}
