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

const ContextQuotes = createContext({});

const DialogAdd = ({ dialogAdd, setDialogAdd }) => {
  const analytics = getAnalytics();
  const db = getFirestore();
  const contextChannels = useContext(ContextChannels);
  const limitChars = 128;

  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(limitChars);

  useEffect(() => {
    setCharsRemaining(limitChars - text.length);
    setTextError("");
  }, [text]);

  const postQuote = () => {
    if (text.length === 0) {
      setTextError("bruh");
      return;
    }
    const newRef = doc(collection(db, "content"));
    setDoc(newRef, {
      data: {
        text: text,
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
      type: "quote",
    }).then(() => {
      logEvent(analytics, "quote_creation");
      setText("");
      setDialogAdd(false);
      contextChannels.rebalanceContent(newRef.id);
    });
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
        New Quote:{" "}
        <IconButton size="small" onClick={() => setDialogAdd(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box
        p="1rem"
        sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <TextField
          error={textError.length > 0}
          multiline
          rows={4}
          sx={{ width: "70vw" }}
          label={`${charsRemaining} characters left`}
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= limitChars) {
              setText(e.target.value);
            }
          }}
          helperText={textError}
        />
        <Button onClick={postQuote}>post</Button>
      </Box>
    </Dialog>
  );
};

const ContextProviderQuotes = (props) => {
  const [dialogAdd, setDialogAdd] = useState(false);

  return (
    <ContextQuotes.Provider
      value={{
        dialogAdd,
        setDialogAdd,
      }}
    >
      <DialogAdd dialogAdd={dialogAdd} setDialogAdd={setDialogAdd} />
      {props.children}
    </ContextQuotes.Provider>
  );
};

export { ContextQuotes, ContextProviderQuotes };
