import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Copyright from "./Copyright";
import { useContext, useEffect, useState } from "react";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";
import { getAuth, updateProfile } from "firebase/auth";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export default function SetUp() {
  const contextOnboardFlow = useContext(ContextOnboardFlow);
  const auth = getAuth();
  const storage = getStorage();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [errorUserName, setErrorUserName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setErrorUserName("");
    const timer = setTimeout(() => {
      // validation
      if (userName.length === 1) {
        setErrorUserName("2+ characters");
      }
      if (userName.length > 10) {
        setErrorUserName("-10 characters");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [userName]);

  const saveUser = () => {
    if (selectedImage) {
      const avatarRef = ref(
        storage,
        `gs://locus-68ed2.appspot.com/avatars/${auth.currentUser.uid}.jpg`
      );
      uploadBytes(avatarRef, selectedImage).then(() => {
        updateProfile(auth.currentUser, {
          photoURL: `gs://locus-68ed2.appspot.com/avatars/${auth.currentUser.uid}.jpg`,
        });
      });
    }

    if (userName.length < 2 || userName.length > 20) {
      setErrorUserName("please, pick a user name");
      return;
    }

    updateProfile(auth.currentUser, {
      displayName: userName,
    }).then(() => {
      navigate("/");
      contextOnboardFlow.check();
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
        Setup Account
      </Typography>
      <Box sx={{ mt: 8 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            justifyContent: "space-between",
          }}
        >
          Your Picture:
          <Avatar
            src={selectedImage ? URL.createObjectURL(selectedImage) : null}
          >
            {selectedImage ? "" : <SentimentVerySatisfiedIcon />}
          </Avatar>
          <Button size="small" variant="contained" component="label">
            upload
            <input
              accept="image/*"
              type="file"
              name="myPicture"
              hidden
              onChange={(e) => {
                setSelectedImage(e.target.files[0]);
              }}
            />
          </Button>
        </Box>
        <TextField
          error={errorUserName.length > 0}
          margin="normal"
          required
          fullWidth
          id="email"
          label="user name"
          name="email"
          // autoComplete="email"
          autoFocus
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
          }}
          helperText={errorUserName}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={() => saveUser()}
        >
          continue
        </Button>
        <Copyright />
      </Box>
    </Box>
  );
}
