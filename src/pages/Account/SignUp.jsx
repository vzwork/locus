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

import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useEffect, useState } from "react";

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

export default function SignUp() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [usedEmails, setUsedEmails] = useState([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordOne, setPasswordOne] = useState("");
  const [passwordOneError, setPasswordOneError] = useState("");
  const [passwordTwo, setPasswordTwo] = useState("");
  const [passwordTwoError, setPasswordTwoError] = useState("");

  useEffect(() => {
    setEmailError("");
    setPasswordOneError("");
    setPasswordTwoError("");

    const timer = setTimeout(() => {
      if (!isValidEmail(email) && email.length > 0) {
        setEmailError("improper email format");
      }
      if (usedEmails.includes(email)) {
        setEmailError("this email is used");
      }
      if (passwordOne.length > 0 && passwordTwo.length > 0) {
        if (passwordOne !== passwordTwo) {
          setPasswordOneError("passwords don't match");
          setPasswordTwoError("passwords don't match");
        } else {
          if (!isValidPassword(passwordOne)) {
            setPasswordOneError("1 special, 1 num, 6+ chars");
          }
          if (!isValidPassword(passwordTwo)) {
            setPasswordTwoError("1 special, 1 num, 6+ chars");
          }
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [email, passwordOne, passwordTwo, usedEmails]);

  const signUp = () => {
    if (usedEmails.includes(email)) {
      setEmailError("this email is used");
      return;
    }
    if (email.length === 0) {
      setEmailError("please input your email");
      return;
    }
    if (!isValidEmail(email)) {
      setEmail("improper email format");
      return;
    }
    if (passwordOne.length === 0) {
      setPasswordOneError("please input your password");
      return;
    }
    if (!isValidPassword(passwordOne)) {
      setPasswordOneError("1 special, 1 num, 6+ chars");
      return;
    }
    if (passwordTwo.length === 0) {
      setPasswordTwoError("please input your password");
      return;
    }
    if (!isValidPassword(passwordTwo)) {
      setPasswordTwoError("1 special, 1 num, 6+ chars");
      return;
    }
    if (passwordOne !== passwordTwo) {
      setPasswordOneError("passwords don't match");
      setPasswordTwoError("passwords don't match");
      return;
    }
    // attempt
    createUserWithEmailAndPassword(auth, email, passwordOne)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        sendEmailVerification(user);
        navigate("/account/emailverify");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === "auth/email-already-in-use") {
          setUsedEmails((old) => [...old, email]);
        }
        // ..
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
        Sign up
      </Typography>
      <Box component="form" sx={{ mt: 1 }}>
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
          content={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          helperText={emailError}
        />
        <TextField
          error={passwordOneError.length > 0}
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          content={passwordOne}
          onChange={(e) => {
            setPasswordOne(e.target.value);
          }}
          helperText={passwordOneError}
        />
        <TextField
          error={passwordTwoError.length > 0}
          margin="normal"
          required
          fullWidth
          name="repeat-password"
          label="Repeat Password"
          type="password"
          id="repeat-password"
          autoComplete="new-password"
          content={passwordTwo}
          onChange={(e) => {
            setPasswordTwo(e.target.value);
          }}
          helperText={passwordTwoError}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={() => signUp()}
        >
          Sign up
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
          <Grid item>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                navigate("/account/signin");
              }}
            >
              Have an account?
            </Link>
          </Grid>
        </Grid>
        <Copyright />
      </Box>
    </Box>
  );
}
