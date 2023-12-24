import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";

import Copyright from "./Copyright";

import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useEffect, useState } from "react";

const isValidEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export default function PasswordChange() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailHelper, setEmailHelper] = useState("");

  useEffect(() => {
    setEmailError("");

    const timer = setTimeout(() => {
      if (!isValidEmail(email) && email.length > 0) {
        setEmailError("improper email format");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [email]);

  return (
    <Box
      sx={{
        mt: "6vh",
        mx: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Reset password
      </Typography>
      <Box component="form" noValidate sx={{ mt: 1 }}>
        <TextField
          error={emailError.length > 0}
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          helperText={emailError || emailHelper}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={() => {
            sendPasswordResetEmail(auth, email)
              .then((res) => {})
              .catch((err) => {
                console.log(err);
              });
            setEmailHelper("if account exists, check your email");
          }}
        >
          send reset link
        </Button>
        <Grid container>
          <Grid item xs>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                navigate("/account/signin");
              }}
              sx={{ textAlign: "start" }}
            >
              Remembered password?
            </Link>
          </Grid>

          <Grid item xs>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                navigate("/account/signup");
              }}
              sx={{ textAlign: "start" }}
            >
              Don't have an account?
            </Link>
          </Grid>
        </Grid>
      </Box>

      <Copyright />
    </Box>
  );
}
