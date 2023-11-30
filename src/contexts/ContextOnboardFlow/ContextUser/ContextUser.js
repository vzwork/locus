import { createContext, useContext, useEffect, useState } from "react";
import { ContextOnboardFlow } from "../ContextOnboardFlow/ContextOnboardFlow";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const ContextUser = createContext({});

const ContextProviderUser = (props) => {
  const db = getFirestore();

  const contextOnboardFlow = useContext(ContextOnboardFlow);

  const [user, setUser] = useState({});
  const [loadedUser, setLoadedUser] = useState(false);
  const [hashSetUserLikes, setHashSetUserLikes] = useState(new Set([]));

  useEffect(() => {
    if (!loadedUser) {
      if (contextOnboardFlow.complete) {
        loadUser();
      } else {
        setLoadedUser(false);
      }
    }
  }, [contextOnboardFlow]);

  useEffect(() => {
    if (loadedUser) {
      console.log([...hashSetUserLikes]);
      setDoc(doc(db, "users", contextOnboardFlow.user.uid), {
        ...user,
        likes: [...hashSetUserLikes],
      });
    }
  }, [hashSetUserLikes]);

  const loadUser = () => {
    getDoc(doc(db, "users", contextOnboardFlow.user.uid)).then(
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          createUser();
          return;
        }
        const data = docSnapshot.data();
        setUser(data);
        setHashSetUserLikes(new Set(data.likes));
      }
    );
  };

  const createUser = () => {
    const data = {
      id_user: contextOnboardFlow.user.uid,
      likes: [],
    };
    setDoc(doc(db, "users", contextOnboardFlow.user.uid), data);
  };

  const likePost = (id) => {
    setHashSetUserLikes(new Set(hashSetUserLikes.add(id)));
  };

  const likePostCancel = (id) => {
    setHashSetUserLikes(new Set(hashSetUserLikes.delete(id)));
  };

  return (
    <ContextUser.Provider
      value={{
        hashSetUserLikes,
        likePost,
        likePostCancel,
      }}
    >
      {props.children}
      <></>
    </ContextUser.Provider>
  );
};

export { ContextUser, ContextProviderUser };
