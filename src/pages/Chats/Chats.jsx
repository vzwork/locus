import {
  Box,
  Button,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  MenuList,
  TextField,
} from "@mui/material";
import { useContext, useLayoutEffect, useState } from "react";
import { ContextChats } from "../../contexts/ContextChats/ContextChats";
import { useNavigate } from "react-router-dom";

import CheckIcon from "@mui/icons-material/Check";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { arrayUnion, doc, getFirestore, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const MUI_XS_BREAKPOINT = 600;

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

export default function Chats() {
  const contextChats = useContext(ContextChats);
  const navigate = useNavigate();

  const [width] = useWindowSize();

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Grid item xs={12} sm={4} md={3} xl={2} bgcolor={"bg.clear"}>
        {width > MUI_XS_BREAKPOINT ? (
          <ChatsOptions />
        ) : contextChats.currentChatId ? (
          <Box>
            <IconButton
              onClick={() => navigate("/chats")}
              sx={{ position: "absolute", top: "0", left: "0" }}
            >
              <ArrowBackIosIcon />
            </IconButton>
            <ChatContent />
          </Box>
        ) : (
          <ChatsOptions />
        )}
      </Grid>
      <Grid item xs={false} sm={8} md={9} xl={10} bgcolor={"bg.clear"}>
        {width > MUI_XS_BREAKPOINT && contextChats.currentChatId ? (
          <ChatContent />
        ) : null}
      </Grid>
    </Grid>
  );
}

const ChatsOptions = () => {
  const navigate = useNavigate();

  const contextChats = useContext(ContextChats);

  return (
    <Box p="1rem">
      <Box>Chats:</Box>
      <MenuList>
        {contextChats.chats?.map((val, idx) => {
          return (
            <MenuItem
              divider
              selected={contextChats.currentChatId === val.id}
              key={idx}
              onClick={() => {
                navigate(`/chats/${val.id}`);
              }}
            >
              {val.name}
            </MenuItem>
          );
        })}
      </MenuList>
      <Box>Requests:</Box>
      <MenuList>
        {contextChats.requests?.map((val, idx) => {
          return (
            <MenuItem
              divider
              key={idx}
              onClick={() => {
                contextChats.setCurrentChatId(val.id);
              }}
            >
              <ListItemText>{val.name}</ListItemText>
              <IconButton onClick={() => contextChats.acceptChat(val.id)}>
                <CheckIcon />
              </IconButton>
              {/* <IconButton>
                <CloseIcon />
              </IconButton> */}
            </MenuItem>
          );
        })}
      </MenuList>
    </Box>
  );
};

const ChatContent = () => {
  const auth = getAuth();
  const db = getFirestore();

  const contextChats = useContext(ContextChats);

  const [text, setText] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (text.trim() === "") return;

    const newMessage = {
      text,
      timestamp: Date.now(),
      sender: auth.currentUser.uid,
    };

    updateDoc(doc(db, "messages", contextChats.currentChatId), {
      data: arrayUnion(newMessage),
    });

    setText("");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column-reverse",
      }}
    >
      <Box pb="1rem" sx={{ display: "flex", alignItems: "flex-start" }}>
        <TextField
          onKeyDown={handleKeyDown}
          placeholder="Your message..."
          fullWidth
          multiline
          maxRows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          size="small"
        />
        <Button variant="outlined" onClick={sendMessage}>
          enter
        </Button>
      </Box>
      <Box
        pb="1rem"
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column-reverse" }}
      >
        {contextChats.messages?.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            color="active.main"
          >
            -- no messages --
          </Box>
        ) : (
          [...contextChats.messages].reverse().map((val, idx) => {
            const datetime = new Date(val.timestamp);
            return (
              <Box key={idx}>
                <Box
                  color="inactive.main"
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Box fontSize="0.8rem">
                    {val.sender === contextChats.currentChat?.id_me
                      ? contextChats.currentChat?.name_me
                      : contextChats.currentChat?.name_them}
                  </Box>
                  <Box fontSize="0.8rem">
                    {`${datetime.getFullYear()}-${datetime.getMonth()}-${datetime.getDate()} ${datetime.getHours()}:${datetime.getMinutes()}`}
                  </Box>
                </Box>
                {val.text}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};
