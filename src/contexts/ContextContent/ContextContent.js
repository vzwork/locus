import { Button, Dialog, DialogTitle } from "@mui/material";
import { createContext, useContext, useEffect, useState } from "react";

import { ContextChannels } from "../ContextChannels/ContextChannels";

import { ContextQuotes } from "../ContextQuotes/ContextQuotes";

import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const ContextContent = createContext({});

const ContextProviderContent = (props) => {
  const db = getFirestore();

  const contextChannels = useContext(ContextChannels);
  const contextQuotes = useContext(ContextQuotes);

  const [quote, setQuote] = useState(true);
  const [article, setArticle] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [video, setVideo] = useState(false);
  const [stream, setStream] = useState(false);

  const [dialogAdd, setDialogAdd] = useState(false);

  const [contentFormatsActive, setContentFormatsActive] = useState([]);
  const [lastQueriedChannel, setLastQueriedChannel] = useState("");
  const [content, setContent] = useState([]);

  useEffect(() => {
    const out = [];
    if (quote) {
      out.push("quote");
    }
    if (article) {
      out.push("article");
    }
    if (photo) {
      out.push("photo");
    }
    if (video) {
      out.push("video");
    }
    if (stream) {
      out.push("stream");
    }
    setContentFormatsActive(out);
  }, [quote, article, photo, video, stream]);

  useEffect(() => {
    if (contextChannels.channelCurrent?.id) {
      if (contextChannels.channelCurrent?.id !== lastQueriedChannel) {
        setLastQueriedChannel(contextChannels.channelCurrent?.id);
      }
    }
  }, [contextChannels]);

  useEffect(() => {
    // console.log(contentFormatsActive);

    if (contextQuotes.dialogAdd) {
      return;
    }

    const q = query(
      collection(db, "content"),
      where("id_channel", "==", lastQueriedChannel),
      orderBy("date", "desc"),
      limit(10)
    );
    getDocs(q).then((querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        // console.log(doc.data());
        docs.push(doc.data());
      });
      setContent(docs);
    });
  }, [contentFormatsActive, lastQueriedChannel, contextQuotes]);

  return (
    <ContextContent.Provider
      value={{
        quote,
        setQuote,
        article,
        setArticle,
        photo,
        setPhoto,
        video,
        setVideo,
        stream,
        setStream,
        setDialogAdd,
        content,
      }}
    >
      <Dialog open={dialogAdd} onClose={() => setDialogAdd(false)}>
        <DialogTitle>Add Content:</DialogTitle>
        <Button
          startIcon={<FormatQuoteIcon />}
          onClick={() => {
            setDialogAdd(false);
            contextQuotes.setDialogAdd(true);
          }}
        >
          quote
        </Button>
        <Button startIcon={<NewspaperIcon />} color="active">
          article
        </Button>
        <Button startIcon={<PhotoCameraIcon />} color="active">
          picture
        </Button>
        <Button startIcon={<OndemandVideoIcon />} color="active">
          video
        </Button>
        <Button startIcon={<PhotoCameraFrontIcon />} color="active">
          stream
        </Button>
      </Dialog>
      {props.children}
    </ContextContent.Provider>
  );
};

export { ContextContent, ContextProviderContent };
