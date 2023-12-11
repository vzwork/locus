import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import { ContextChannels } from "../ContextChannels/ContextChannels";
import { getAuth } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";

const { createContext, useState, useEffect, useContext } = require("react");

const apiKey = "AIzaSyD29hxSTwTWZhpKG315tda47fy2HOny2v8";

async function isYouTubeVideoValid(videoId) {
  // Construct the API request URL
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

  try {
    // Make the API request using fetch
    const response = await fetch(apiUrl);

    if (!response.ok) {
      // Handle API request error
      console.error("YouTube API request failed");
      return false;
    }

    const data = await response.json();

    // Check if the API response contains information about the video
    if (data.items && data.items.length > 0) {
      // Video exists
      return true;
    } else {
      // Video does not exist
      return false;
    }
  } catch (error) {
    // Handle network error
    console.error("Network error", error);
    return false;
  }
}

const ContextVideos = createContext({});

const DialogAdd = ({ dialogAdd, setDialogAdd }) => {
  const analytics = getAnalytics();
  const db = getFirestore();
  const contextChannels = useContext(ContextChannels);
  const limitChars = 128;

  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(limitChars);

  useEffect(() => {
    setCharsRemaining(limitChars - text.length);
    setTextError("");
  }, [text]);

  useEffect(() => {
    setUrlError("");
  }, [url]);

  const postVideo = async () => {
    // error handling
    const youTubeVideoId = url.split("=")[1]
      ? url.split("=")[1]
      : url.split("=")[0];

    if (!(await isYouTubeVideoValid(youTubeVideoId))) {
      setUrlError("invalid url");
    } else {
      const newRef = doc(collection(db, "content"));
      setDoc(newRef, {
        data: {
          text: text,
          id_video: youTubeVideoId,
        },
        date: Date.now(),
        id: newRef.id,
        id_channel: contextChannels.channelCurrent.id,
        id_user: getAuth().currentUser.uid,
        name_user: getAuth().currentUser.displayName,
        likes: [getAuth().currentUser.uid],
        dislikes: [],
        type: "video",
      }).then(() => {
        logEvent(analytics, "video_creation");
        setText("");
        setUrl("");
        setDialogAdd(false);
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
        New Video:{" "}
        <IconButton size="small" onClick={() => setDialogAdd(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box
        p="1rem"
        sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <TextField
          error={urlError.length > 0}
          multiline
          rows={1}
          sx={{ width: "70vw" }}
          label={"YouTube link or ID"}
          value={url}
          onChange={(e) => {
            if (e.target.value.length <= limitChars) {
              setUrl(e.target.value);
            }
          }}
          helperText={urlError}
        />
        <TextField
          error={textError.length > 0}
          multiline
          rows={1}
          sx={{ width: "70vw" }}
          label={
            text.length == 0 ? "caption" : `${charsRemaining} characters left`
          }
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= limitChars) {
              setText(e.target.value);
            }
          }}
          helperText={textError}
        />
        <Button onClick={postVideo}>post</Button>
      </Box>
    </Dialog>
  );
};

const ContextProviderVideos = (props) => {
  const [dialogAdd, setDialogAdd] = useState(false);

  return (
    <ContextVideos.Provider
      value={{
        dialogAdd,
        setDialogAdd,
      }}
    >
      <DialogAdd dialogAdd={dialogAdd} setDialogAdd={setDialogAdd} />
      {props.children}
    </ContextVideos.Provider>
  );
};

export { ContextVideos, ContextProviderVideos };
