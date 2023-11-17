import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import Copyright from "./Copyright";
import { useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";

const isValidEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function isValidPassword(password) {
  const pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
  return pattern.test(password);
}

export default function SignIn() {
  const navigate = useNavigate();
  const auth = getAuth();
  const contextOnboardFlow = useContext(ContextOnboardFlow);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setEmailError("");
    setPasswordError("");

    const timer = setTimeout(() => {
      if (!isValidEmail(email) && email.length > 0) {
        setEmailError("improper email format");
      }
      if (!isValidPassword(password) && password.length > 0) {
        setPasswordError("1 special, 1 num, 6+ chars");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [email, password]);

  const signIn = () => {
    if (email.length === 0) {
      setEmailError("please input your email");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("imporper email format");
      return;
    }
    if (password === 0) {
      setPasswordError("please input your password");
      return;
    }
    if (!isValidPassword(password)) {
      setPasswordError("1 special, 1 num, 6+ chars");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate("/");
        contextOnboardFlow.check();
      })
      .catch((err) => {
        console.log(err);
        setPasswordError("wrong email or password");
      });
  };

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
        Sign in
      </Typography>
      <Box sx={{ mt: 1 }}>
        <TextField
          error={emailError.length > 0}
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          // autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          helperText={emailError}
        />
        <TextField
          error={passwordError.length > 0}
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          helperText={passwordError}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={() => signIn()}
        >
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                navigate("/account/passwordchange");
              }}
            >
              Forgot password?
            </Link>
          </Grid>
          <Grid item xs>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                navigate("/account/signup");
              }}
            >
              {"Don't have an account?"}
            </Link>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            color="inherit"
            onClick={() => {
              const provider = new GoogleAuthProvider();
              signInWithPopup(auth, provider).then((res) => {
                console.log(res);
              });
            }}
          >
            <img
              src="/Google__G__Logo.svg.png"
              alt="google"
              width="20px"
              style={{ paddingRight: "0.6rem" }}
            />
            account
          </Button>
        </Grid>
        <Copyright />
      </Box>
    </Box>
  );
}
