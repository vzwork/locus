import { Button, Dialog, DialogTitle } from "@mui/material";
import { createContext, useContext, useEffect, useState } from "react";

import { ContextChannels } from "../ContextChannels/ContextChannels";
import { ContextQuotes } from "../ContextQuotes/ContextQuotes";
import { ContextOnboardFlow } from "../ContextOnboardFlow/ContextOnboardFlow";

import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useNavigate } from "react-router-dom";

const ContextContent = createContext({});

const ContextProviderContent = (props) => {
  const navigate = useNavigate();
  const analytics = getAnalytics();
  const db = getFirestore();

  const contextOnboardFlow = useContext(ContextOnboardFlow);
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
        logEvent(analytics, "content_query");
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

  const deletePost = (data) => {
    deleteDoc(doc(db, "content", data.id))
      .then((res) => {
        const docs = [];
        content.forEach((doc, idx) => {
          if (doc.id != data.id) {
            docs.push(data);
          }
        });
        setContent(docs);
        deleteDoc(doc(db, "comments", data.id));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const likePost = (data) => {
    if (!contextOnboardFlow.complete) {
      navigate("/account/signin");
      // TODO: log attempted like
      return;
    }

    if (data.likes.length > 10) {
      return;
    }

    const likes = data.likes;
    removeItemByValue(likes, data.id_user);
    const dislikes = data.dislikes;
    removeItemByValue(dislikes, data.id_user);

    const updated_doc = {
      ...data,
      likes: [...likes, data.id_user],
      dislikes,
    };

    maintenance_doc_changed(updated_doc);
  };

  const dislikePost = (data) => {
    if (!contextOnboardFlow.complete) {
      navigate("/account/signin");
      // TODO: log attempted like
      return;
    }

    if (data.dislikes.length > 10) {
      return;
    }

    const likes = data.likes;
    removeItemByValue(likes, data.id_user);
    const dislikes = data.dislikes;
    removeItemByValue(dislikes, data.id_user);

    const updated_doc = {
      ...data,
      dislikes: [...dislikes, data.id_user],
      likes,
    };

    maintenance_doc_changed(updated_doc);
  };

  const maintenance_doc_changed = (updated_doc) => {
    setDoc(doc(db, "content", updated_doc.id), updated_doc)
      .then(() => {
        const docs = [];
        content.forEach((doc) => {
          // console.log(doc.data());
          if (doc.id !== updated_doc.id) {
            docs.push(doc);
          } else {
            docs.push(updated_doc);
          }
        });
        setContent(docs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

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
        deletePost,
        likePost,
        dislikePost,
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

function removeItemByValue(array, value) {
  const index = array.indexOf(value);

  if (index !== -1) {
    array.splice(index, 1);
  }

  // If you want to return the modified array, you can do so
  // return array;
}
