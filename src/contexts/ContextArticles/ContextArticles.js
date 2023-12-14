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
import { getStorage, ref, uploadBytes } from "firebase/storage";

const { createContext, useState, useEffect, useContext } = require("react");

const ContextArticles = createContext({});

const DialogAdd = ({ dialogAdd, setDialogAdd }) => {
  const analytics = getAnalytics();
  const db = getFirestore();
  const storage = getStorage();
  const contextChannels = useContext(ContextChannels);
  const limitChars = 64;

  const [selectedArticle, setSelectedArticle] = useState(null);

  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(limitChars);

  useEffect(() => {
    setCharsRemaining(limitChars - text.length);
    setTextError("");
  }, [text]);

  const postArticle = () => {
    if (selectedArticle) {
      const newRef = doc(collection(db, "content"));
      setDoc(newRef, {
        data: {
          text: text,
          url: `gs://locus-68ed2.appspot.com/articles/${newRef.id}.pdf`,
          name: selectedArticle.name,
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
        type: "article",
      }).then(() => {
        const articleRef = ref(
          storage,
          `gs://locus-68ed2.appspot.com/articles/${newRef.id}.pdf`
        );
        uploadBytes(articleRef, selectedArticle).then(() => {
          logEvent(analytics, "article_upload");
          setText("");
          setSelectedArticle(null);
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
        New Article (pdf):{" "}
        <IconButton size="small" onClick={() => setDialogAdd(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box
        p="1rem"
        sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        {selectedArticle?.name}
        <Button
          size="small"
          variant="contained"
          component="label"
          color={selectedArticle ? "inherit" : "primary"}
        >
          upload
          <input
            accept="application/pdf"
            type="file"
            name="myArticle"
            hidden
            onChange={(e) => {
              setSelectedArticle(e.target.files[0]);
            }}
          />
        </Button>
        <TextField
          error={textError.length > 0}
          multiline
          rows={1}
          sx={{ width: "70vw" }}
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
          helperText={textError}
        />
        <Button onClick={postArticle}>post</Button>
      </Box>
    </Dialog>
  );
};

const ContextProviderArticles = (props) => {
  const [dialogAdd, setDialogAdd] = useState(false);

  return (
    <ContextArticles.Provider
      value={{
        dialogAdd,
        setDialogAdd,
      }}
    >
      <DialogAdd dialogAdd={dialogAdd} setDialogAdd={setDialogAdd} />
      {props.children}
    </ContextArticles.Provider>
  );
};

export { ContextArticles, ContextProviderArticles };
