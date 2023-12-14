import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  collection,
  doc,
  getFirestore,
  limit,
  setDoc,
} from "firebase/firestore";
import { ContextChannels } from "../ContextChannels/ContextChannels";
import { getAuth } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getStorage, ref, uploadBytes } from "firebase/storage";

const { createContext, useState, useEffect, useContext } = require("react");

const ContextPhotos = createContext({});

const DialogAddTextPerformance = (props) => {
  const limitChars = 64;

  const [text, setText] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(limitChars);

  useEffect(() => {
    setCharsRemaining(limitChars - text.length);
  }, [text]);

  useEffect(() => {
    const timer = setTimeout(() => {
      props.setText(text);
    }, 300);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <TextField
      multiline
      fullWidth
      rows={1}
      label={
        charsRemaining == limitChars
          ? "caption"
          : `${charsRemaining} characters left`
      }
      value={text}
      onChange={(e) => {
        if (e.target.value.length <= limitChars) {
          setText(e.target.value);
        }
      }}
    />
  );
};

const DialogAdd = ({ dialogAdd, setDialogAdd }) => {
  const analytics = getAnalytics();
  const db = getFirestore();
  const storage = getStorage();
  const contextChannels = useContext(ContextChannels);
  const auth = getAuth();

  const [selectedImage, setSelectedImage] = useState(null);
  const [text, setText] = useState("");

  const postPhoto = () => {
    if (selectedImage) {
      const newRef = doc(collection(db, "content"));
      setDoc(newRef, {
        data: {
          text: text,
          url: `gs://locus-68ed2.appspot.com/photos/${newRef.id}.jpg`,
        },
        date: Date.now(),
        id: newRef.id,
        id_channel: contextChannels.channelCurrent.id,
        id_user: getAuth().currentUser.uid,
        name_user: getAuth().currentUser.displayName,
        likes: [getAuth().currentUser.uid],
        count_likes: 1,
        dislikes: [],
        count_dislikes: 0,
        type: "photo",
      }).then(() => {
        const photoRef = ref(
          storage,
          `gs://locus-68ed2.appspot.com/photos/${newRef.id}.jpg`
        );
        uploadBytes(photoRef, selectedImage).then(() => {
          setText("");
          setSelectedImage(null);
          logEvent(analytics, "photo_upload");
          setDialogAdd(false);
        });
      });
    }
  };

  return (
    <Dialog
      open={dialogAdd}
      onClose={() => setDialogAdd(false)}
      maxWidth={"80vw"}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        New Photo:{" "}
        <IconButton size="small" onClick={() => setDialogAdd(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box
        p="1rem"
        sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <img
          src={
            selectedImage
              ? URL.createObjectURL(selectedImage)
              : "/placeholder.jpg"
          }
          style={{
            opacity: selectedImage ? "1.0" : "0.2",
            height: "30vh",
            objectFit: "cover",
          }}
        />
        <Button
          size="small"
          variant="contained"
          component="label"
          color={selectedImage ? "inherit" : "primary"}
        >
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
        <DialogAddTextPerformance setText={setText} />
        <Button onClick={postPhoto} variant="outlined">
          post
        </Button>
      </Box>
    </Dialog>
  );
};

const ContextProviderPhotos = (props) => {
  const [dialogAdd, setDialogAdd] = useState(false);

  return (
    <ContextPhotos.Provider
      value={{
        dialogAdd,
        setDialogAdd,
      }}
    >
      <DialogAdd dialogAdd={dialogAdd} setDialogAdd={setDialogAdd} />
      {props.children}
    </ContextPhotos.Provider>
  );
};

export { ContextPhotos, ContextProviderPhotos };
