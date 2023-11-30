import { createContext, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ContextComments = createContext({});

const ContextProviderComments = (props) => {
  const db = getFirestore();

  const auth = getAuth();
  const [currentOpenId, setCurrentOpenId] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // subscribe
    if (currentOpenId !== "") {
      setComments([]);
      const unsub = onSnapshot(
        doc(db, "comments", currentOpenId),
        (docSnapshot) => {
          if (!docSnapshot.exists()) {
            console.log("comments are empty");
            setDoc(doc(db, "comments", currentOpenId), {
              data: [],
            });
          } else {
            setComments(docSnapshot.data().data.reverse());
          }
        }
      );
      return () => unsub();
    }
  }, [currentOpenId]);

  const newComment = (text) => {
    const data = {
      text,
      date: Date.now(),
      id_user: auth.currentUser.uid,
      name_user: auth.currentUser.displayName,
    };
    comments.unshift(data);
    const new_comments = comments;
    setComments(new_comments);
    setDoc(doc(db, "comments", currentOpenId), {
      data: new_comments.reverse(),
    });
  };

  return (
    <ContextComments.Provider
      value={{ currentOpenId, setCurrentOpenId, comments, newComment }}
    >
      {props.children}
      <></>
    </ContextComments.Provider>
  );
};

export { ContextComments, ContextProviderComments };
