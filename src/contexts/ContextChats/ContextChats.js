import { getAuth } from "firebase/auth";
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
import { createContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ContextChats = createContext({});

const ContextProviderChats = (props) => {
  const params = useParams();
  const navigate = useNavigate();

  const db = getFirestore();
  const auth = getAuth();

  const [chatsIds, setChatsIds] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatsRaw, setChatsRaw] = useState([]);
  const [requestsIds, setRequestsIds] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestsRaw, setRequestsRaw] = useState([]);
  const [currentChatId, setCurrentChatId] = useState("");
  const [currentChat, setCurrentChat] = useState({});
  const [messages, setMessages] = useState([{}]);

  // ---- ---- ---- ---- ---- ---- ---- ----
  // ----        User Linked Data       ----
  useEffect(() => {
    setTimeout(() => {
      if (!auth.currentUser) {
        return;
      }
      getDoc(doc(db, "chats", auth.currentUser.uid)).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          processChatData(docSnapshot.data());
        }
      });
    }, 500);
  }, [auth]);
  // ----        User Linked Data       ----
  // ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ----
  // ----   Current Chat Maintenance    ----
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    if (!params.chatId) {
      setCurrentChatId("");
      return;
    }

    onSnapshot(doc(db, "chats", auth.currentUser.uid), (docSnapshot) => {
      if (!docSnapshot.exists()) {
        return;
      }

      processChatData(docSnapshot.data());
    });
  }, [params.chatId, auth.currentUser]);

  const processChatData = (data) => {
    const chats = [];
    const requests = [];

    data.chats.forEach((chat) => {
      if (chat.id_a + chat.id_b === params.chatId) {
        setCurrentChat({
          id_me: auth.currentUser.uid,
          id_them: chat.id_a == auth.currentUser.uid ? chat.id_b : chat.id_a,
          name_me: auth.currentUser.displayName,
          name_them:
            chat.id_a == auth.currentUser.uid ? chat.name_b : chat.name_a,
        });
      }
      if (chat.id_a == auth.currentUser.uid) {
        chats.push({
          id: chat.id_a + chat.id_b,
          name: chat.name_b,
        });
      } else {
        chats.push({
          id: chat.id_a + chat.id_b,
          name: chat.name_a,
        });
      }
    });
    data.requests.forEach((request) => {
      if (request.id_a + request.id_b === params.chatId) {
        setCurrentChat({
          id_me: auth.currentUser.uid,
          id_them:
            request.id_a == auth.currentUser.uid ? request.id_b : request.id_a,
          name_me: auth.currentUser.displayName,
          name_them:
            request.id_a == auth.currentUser.uid
              ? request.name_b
              : request.name_a,
        });
      }
      if (request.id_a == auth.currentUser.uid) {
        requests.push({
          id: request.id_a + request.id_b,
          name: request.name_b,
        });
      } else {
        requests.push({
          id: request.id_a + request.id_b,
          name: request.name_a,
        });
      }
    });

    setChatsIds(chats.map((chat) => chat.id));
    setChats(chats);
    setChatsRaw(data.chats);
    setRequestsIds(requests.map((request) => request.id));
    setRequests(requests);
    setRequestsRaw(data.requests);

    setCurrentChatId(params.chatId);
  };
  // ----   Current Chat Maintenance    ----
  // ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ----
  // ----    Recent Chats Maintenance   ----

  // we keep track of current chat id to move it to the top of the list
  // this applies to both chats and requests

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    if (!currentChatId) {
      return;
    }
    if (chatsIds.includes(currentChatId)) {
      const chatsCopy = [...chats];
      const chatsRawCopy = [...chatsRaw];
      const index = chatsCopy.findIndex((chat) => chat.id == currentChatId);
      const chat = chatsCopy[index];
      const chatRaw = chatsRawCopy[index];
      chatsCopy.splice(index, 1);
      chatsRawCopy.splice(index, 1);
      chatsCopy.unshift(chat);
      chatsRawCopy.unshift(chatRaw);
      setChats(chatsCopy);
      setChatsRaw(chatsRawCopy);
    } else if (requestsIds.includes(currentChatId)) {
      const requestsCopy = [...requests];
      const requestsRawCopy = [...requestsRaw];
      const index = requestsCopy.findIndex(
        (request) => request.id == currentChatId
      );
      const request = requestsCopy[index];
      const requestRaw = requestsRawCopy[index];
      requestsCopy.splice(index, 1);
      requestsRawCopy.splice(index, 1);
      requestsCopy.unshift(request);
      requestsRawCopy.unshift(requestRaw);
      setRequests(requestsCopy);
      setRequestsRaw(requestsRawCopy);
    }
  }, [currentChatId]);

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    if (chatsRaw.length === 0) {
      return;
    }
    updateDoc(doc(db, "chats", auth.currentUser.uid), {
      chats: chatsRaw,
    });
  }, [chatsRaw]);

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    if (requestsRaw.length === 0) {
      return;
    }
    updateDoc(doc(db, "chats", auth.currentUser.uid), {
      requests: requestsRaw,
    });
  }, [requestsRaw]);
  // ----    Recent Chats Maintenance   ----
  // ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ----
  // ----     Messages Maintenance      ----
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }
    if (!currentChatId) {
      return;
    }
    onSnapshot(doc(db, "messages", currentChatId), (docSnapshot) => {
      if (!docSnapshot.exists()) {
        return;
      }
      setMessages(docSnapshot.data().data);
    });
  }, [currentChatId]);
  // ----     Messages Maintenance      ----
  // ---- ---- ---- ---- ---- ---- ---- ----

  // ---- ---- ---- ---- ---- ---- ---- ----
  // ----         Interactions          ----
  const initiateChat = async (id_initiator, id_target, name_target) => {
    // Interactions between users is based on order of their ids
    // Alphabetically sorted string of ids is used as chat id

    let user_a, user_b;
    let id_messages;
    if (id_initiator.localeCompare(id_target) <= 0) {
      id_messages = id_initiator + id_target;
      user_a = { id: id_initiator, name: auth.currentUser.displayName };
      user_b = { id: id_target, name: name_target };
    } else {
      user_a = { id: id_target, name: name_target };
      user_b = { id: id_initiator, name: auth.currentUser.displayName };
    }

    // Create new chat reference for current user
    // Don't use update with arrayUnion, because it will create a new document
    await updateDoc(doc(db, "chats", auth.currentUser.uid), {
      chats: arrayUnion({
        id_a: user_a.id,
        name_a: user_a.name,
        id_b: user_b.id,
        name_b: user_b.name,
      }),
    });

    // Check if chat already exists, by checking messages collection
    const docSnapshot = await getDoc(doc(db, "messages", id_messages));
    if (!docSnapshot.exists()) {
      await updateDoc(doc(db, "chats", id_target), {
        chats: arrayUnion({
          id_a: user_a.id,
          name_a: user_a.name,
          id_b: user_b.id,
          name_b: user_b.name,
        }),
      });
      await setDoc(doc(db, "messages", id_messages), {
        data: [],
        accepted: false,
      });
    } else {
      if (docSnapshot.data().accepted) {
        await updateDoc(doc(db, "chats", id_target), {
          chats: arrayUnion({
            id_a: user_a.id,
            name_a: user_a.name,
            id_b: user_b.id,
            name_b: user_b.name,
          }),
          requests: arrayRemove({
            id_a: user_a.id,
            name_a: user_a.name,
            id_b: user_b.id,
            name_b: user_b.name,
          }),
        });
      } else {
        await updateDoc(doc(db, "chats", id_target), {
          requests: arrayUnion({
            id_a: user_a.id,
            name_a: user_a.name,
            id_b: user_b.id,
            name_b: user_b.name,
          }),
        });
      }
    }
    navigate(`/chats/${id_messages}`);
  };

  const acceptChat = (requestId) => {
    const requestRaw = requestsRaw.find(
      (request) => request.id_a + request.id_b === requestId
    );
    const chatId = requestRaw.id_a + requestRaw.id_b;
    updateDoc(doc(db, "chats", auth.currentUser.uid), {
      chats: arrayUnion(requestRaw),
      requests: arrayRemove(requestRaw),
    });
    updateDoc(doc(db, "messages", chatId), {
      accepted: true,
    });
    navigate(`/chats/${chatId}`);
  };

  // ----         Interactions          ----
  // ---- ---- ---- ---- ---- ---- ---- ----

  return (
    <ContextChats.Provider
      value={{
        initiateChat,
        setCurrentChatId,
        currentChatId,
        messages,
        chats,
        requests,
        currentChat,
        acceptChat,
      }}
    >
      <></>
      {props.children}
    </ContextChats.Provider>
  );
};

export { ContextChats, ContextProviderChats };
