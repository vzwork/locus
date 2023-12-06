import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { deleteUser, getAuth, signOut, updateProfile } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const auth = getAuth();
  const storage = getStorage();

  const [changed, setChanged] = useState(false);

  const [userName, setUserName] = useState("");
  const [userNameInitiated, setUserNameInitiated] = useState(false);
  const [errorUserName, setErrorUserName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imgURL, setImgURL] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      if (auth.currentUser.photoURL) {
        if (auth.currentUser.photoURL.slice(0, 2) == "gs") {
          getDownloadURL(ref(storage, auth.currentUser.photoURL)).then(
            (thisURL) => {
              setImgURL(thisURL);
            }
          );
        } else {
          setImgURL(auth.currentUser.photoURL);
        }
      }
      if (!userNameInitiated) {
        setUserNameInitiated(true);
        setUserName(auth.currentUser.displayName);
      }
    }
  });

  const saveUser = () => {
    if (userName.length < 2 || userName.length > 20) {
      setErrorUserName("please, pick a user name");
      return;
    }
    updateProfile(auth.currentUser, {
      displayName: userName,
    });
    setSelectedImage(null);
    saveImage();
  };

  const saveImage = () => {
    if (selectedImage) {
      const avatarRef = ref(
        storage,
        `gs://locus-68ed2.appspot.com/avatars/${auth.currentUser.uid}.jpg`
      );
      uploadBytes(avatarRef, selectedImage)
        .then(() => {
          updateProfile(auth.currentUser, {
            photoURL: `gs://locus-68ed2.appspot.com/avatars/${auth.currentUser.uid}.jpg`,
          });
          setChanged(!changed);
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      window.location.reload();
    }
  };

  return (
    <Box
      sx={{
        mt: "6vh",
        mx: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "400px",
        gap: 2,
        marginX: "auto",
        paddingX: "2rem",
      }}
    >
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
          src={selectedImage ? URL.createObjectURL(selectedImage) : imgURL}
        />
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
        fullWidth
        label="user name"
        value={userName}
        onChange={(e) => {
          setUserName(e.target.value);
        }}
        helperText={errorUserName}
      />
      <Button
        variant="contained"
        fullWidth
        color={
          userName !== auth?.currentUser?.displayName || selectedImage
            ? "primary"
            : "inherit"
        }
        onClick={saveUser}
      >
        save
      </Button>
      <DeleteAccount />
    </Box>
  );
}

const DeleteAccount = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [openDelete, setOpenDelete] = useState(false);

  const handleClickOpenDelete = () => {
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  return (
    <>
      <Button
        variant="contained"
        fullWidth
        color="error"
        sx={{ marginTop: "6rem" }}
        onClick={handleClickOpenDelete}
      >
        delete account
      </Button>
      <Dialog
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete your account?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            When you delete your account, all personal data associated with your
            profile, including username, preferences, and account information,
            is permanently removed from the system. This process ensures that no
            traces of your identity or usage history are retained, safeguarding
            your privacy. The deletion action is irreversible, and once
            completed, the system no longer stores any information related to
            your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>cancel</Button>
          <Button
            onClick={() => {
              deleteUser(auth.currentUser)
                .then(() => {
                  navigate("/");
                })
                .catch(() => {
                  signOut(auth);
                  navigate("/account/signin");
                });
              handleCloseDelete();
            }}
            autoFocus
            color="error"
          >
            proceed
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
