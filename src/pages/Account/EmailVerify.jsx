import { Avatar, Box, Button, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Copyright from "./Copyright";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { useContext } from "react";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";

export default function EmailVerify() {
  const contextOnboardFlow = useContext(ContextOnboardFlow);

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
        Verify Email
      </Typography>
      <Box sx={{ mt: 10 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={() => {
            contextOnboardFlow.check();
            window.location.reload();
          }}
        >
          check if verified
        </Button>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          color="inherit"
          onClick={() => {
            sendEmailVerification(getAuth().currentUser);
          }}
        >
          send link again
        </Button>
        <Copyright />
      </Box>
    </Box>
  );
}
