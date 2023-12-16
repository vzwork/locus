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
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { ContextPhotos } from "../ContextPhotos/ContextPhotos";
import { ContextArticles } from "../ContextArticles/ContextArticles";
import { ContextVideos } from "../ContextVideos/ContextVideos";
import { deleteObject, getStorage, ref } from "firebase/storage";

const LIMIT_LIKES_DISLIKES = 300;
const LIMIT_COMMENTS = 30;

const ContextContent = createContext({});

const ContextProviderContent = (props) => {
  const navigate = useNavigate();
  const analytics = getAnalytics();
  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();

  const contextOnboardFlow = useContext(ContextOnboardFlow);
  const contextChannels = useContext(ContextChannels);
  const contextQuotes = useContext(ContextQuotes);
  const contextPhotos = useContext(ContextPhotos);
  const contextArticles = useContext(ContextArticles);
  const contextVideos = useContext(ContextVideos);

  const [quote, setQuote] = useState(true);
  const [article, setArticle] = useState(true);
  const [photo, setPhoto] = useState(true);
  const [video, setVideo] = useState(true);
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
    if (contextArticles.dialogAdd) {
      return;
    }
    if (contextPhotos.dialogAdd) {
      return;
    }
    if (contextVideos.dialogAdd) {
      return;
    }

    if (contentFormatsActive.length > 0) {
      const q = query(
        collection(db, "content"),
        where("id_channel", "==", lastQueriedChannel),
        where("type", "in", contentFormatsActive),
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
    }
  }, [
    contentFormatsActive,
    lastQueriedChannel,
    contextQuotes,
    contextArticles,
    contextPhotos,
    contextVideos,
  ]);

  const deletePost = (data) => {
    const docs = [];
    content.forEach((doc, idx) => {
      if (doc.id != data.id) {
        docs.push(doc);
      }
    });
    setContent(docs);
    deleteDoc(doc(db, "content", data.id))
      .then((res) => {
        deleteDoc(doc(db, "comments", data.id));
        if (data.type === "article") {
          deleteObject(ref(storage, `articles/${data.id}.pdf`));
        } else if (data.type === "photo") {
          deleteObject(ref(storage, `photos/${data.id}.jpg`));
        }
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

    if (data.likes.length > LIMIT_LIKES_DISLIKES) {
      return;
    }

    if (data.likes.includes(auth.currentUser.uid)) {
      return;
    }

    const updated_doc = {
      ...data,
      dislikes: arrayRemove(auth.currentUser.uid),
      count_dislikes: increment(
        data.dislikes.includes(auth.currentUser.uid) ? -1 : 0
      ),
      likes: arrayUnion(auth.currentUser.uid),
      count_likes: increment(1),
    };

    maintenance_doc_changed(updated_doc);
  };

  const dislikePost = (data) => {
    if (!contextOnboardFlow.complete) {
      navigate("/account/signin");
      // TODO: log attempted like
      return;
    }

    if (data.dislikes.length > LIMIT_LIKES_DISLIKES) {
      return;
    }

    if (data.dislikes.includes(auth.currentUser.uid)) {
      return;
    }

    const updated_doc = {
      ...data,
      dislikes: arrayUnion(auth.currentUser.uid),
      count_dislikes: increment(1),
      likes: arrayRemove(auth.currentUser.uid),
      count_likes: increment(
        data.likes.includes(auth.currentUser.uid) ? -1 : 0
      ),
    };

    maintenance_doc_changed(updated_doc);
  };

  const maintenance_doc_changed = (updated_doc) => {
    setDoc(doc(db, "content", updated_doc.id), updated_doc)
      .then(() => {
        getDoc(doc(db, "content", updated_doc.id)).then((docSnap) => {
          const new_doc = docSnap.data();
          const docs = [];
          content.forEach((doc) => {
            // console.log(doc.data());
            if (doc.id !== new_doc.id) {
              docs.push(doc);
            } else {
              docs.push(new_doc);
            }
          });
          setContent(docs);
        });
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
        <Button
          startIcon={<NewspaperIcon />}
          onClick={() => {
            setDialogAdd(false);
            contextArticles.setDialogAdd(true);
          }}
        >
          article
        </Button>
        <Button
          startIcon={<PhotoCameraIcon />}
          onClick={() => {
            setDialogAdd(false);
            contextPhotos.setDialogAdd(true);
          }}
        >
          photo
        </Button>
        <Button
          startIcon={<OndemandVideoIcon />}
          onClick={() => {
            setDialogAdd(false);
            contextVideos.setDialogAdd(true);
          }}
        >
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
