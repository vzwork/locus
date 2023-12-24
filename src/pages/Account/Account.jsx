import * as React from "react";
import Grid from "@mui/material/Grid";
import { Outlet, useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Account() {
  const navigate = useNavigate();

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Grid item xs={false} sm={4} md={7} />
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
