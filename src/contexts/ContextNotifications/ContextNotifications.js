import { createContext, useEffect, useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const DEFAULT_NOTIFICATIONS_DOC = {
  chats: [],
  comments: [],
};

const ContextNotifications = createContext({});

const ContextProviderNotifications = (props) => {
  const db = getFirestore();
  const auth = getAuth();

  const [notifications, setNotificaitons] = useState({});

  // ---- ---- ---- ---- ---- ---- ---- ----
  // ---- ----     Maintenance     ---- ----
  useEffect(() => {
    setTimeout(() => {
      if (!auth.currentUser) {
        return;
      }
      onSnapshot(
        doc(db, "notifications", auth.currentUser.uid),
        (docSnapshot) => {
          if (!docSnapshot.exists()) {
            setupNotificationsStorage();
            setNotificaitons(DEFAULT_NOTIFICATIONS_DOC);
          } else {
            setNotificaitons(docSnapshot.data());
          }
        }
      );
    }, 500);
  }, [auth]);

  const setupNotificationsStorage = async () => {
    await setDoc(
      doc(db, "notifications", auth.currentUser.uid),
      DEFAULT_NOTIFICATIONS_DOC
    );
  };
  // ---- ----     Maintenance     ---- ----
  // ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ----
  // ----          Interactions         ----
  const removeCommentNotification = (notification) => {
    updateDoc(doc(db, "notifications", auth.currentUser.uid), {
      comments: arrayRemove(notification),
    });
  };

  const notifyUserAboutComment = (
    id_post_owner,
    id_post,
    type_post,
    id_user,
    name_user,
    text
  ) => {
    if (id_post_owner === id_user) {
      return;
    }

    updateDoc(doc(db, "notifications", id_post_owner), {
      comments: arrayUnion({
        id_post,
        type_post,
        id_user,
        name_user,
        text,
      }),
    });
  };
  // ----          Interactions         ----
  // ---- ---- ---- ---- ---- ---- ---- ----

  return (
    <ContextNotifications.Provider
      value={{
        notifications,
        notifyUserAboutComment,
        removeCommentNotification,
      }}
    >
      {props.children}
    </ContextNotifications.Provider>
  );
};

export { ContextNotifications, ContextProviderNotifications };
