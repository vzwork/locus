import { Alert, Box, Divider, IconButton, Snackbar } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useContext, useEffect, useState } from "react";
import Comments from "./Comments/Comments";

import { ContextComments } from "../../../../../contexts/ContextComments/ContextComments";

import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";

import { getAuth } from "firebase/auth";
import { ContextContent } from "../../../../../contexts/ContextContent/ContextContent";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Post(props) {
  // console.log(props);
  const { currentOpenId, setCurrentOpenId } = useContext(ContextComments);
  const auth = getAuth();
  const db = getFirestore();
  const contextContent = useContext(ContextContent);

  const [deleteInitiated, setDeleteInitiated] = useState(false);
  // console.log(auth.currentUser.uid == props.data.id_user);

  const date = new Date(props.data.date);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeleteInitiated(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [deleteInitiated]);

  const clickedDelete = () => {
    if (!deleteInitiated) {
      setDeleteInitiated(true);
    } else {
      contextContent.deletePost(props.data);
    }
  };

  return (
    <Box mt="1.5rem">
      <Snackbar open={deleteInitiated}>
        <Alert severity="error">Click again to delete the quote!</Alert>
      </Snackbar>
      <Box
        pt="0rem"
        // pr="1rem"
        // pl="1rem"
        pb="0rem"
        // bgcolor="bg.easy"
        borderRadius="0rem 0rem 1rem 1rem"
        color="inactive.main"
        fontSize="0.9rem"
        sx={{
          display: "flex",
          justifyContent: "right",
          alignItems: "center",
        }}
      >
        {months[date.getMonth()] + " " + date.getDate()}
        {auth.currentUser?.uid === props.data.id_user ? (
          <IconButton
            size="small"
            color={deleteInitiated ? "error" : "inactive"}
            onClick={clickedDelete}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>
      <Box
        // p="1rem"
        // bgcolor="bg.easy"
        borderRadius="1rem 1rem 1rem 1rem"
        // borderRadius="1rem 1rem 1rem 1rem"
        // borderRadius="1rem 1rem 1rem 1rem"
        // color="active.main"
      >
        "{props.data.data.text}"<></>
      </Box>
      <Box
        pt="0rem"
        // pr="1rem"
        // pl="1rem"
        pb="0rem"
        // bgcolor="bg.easy"
        borderRadius="0rem 0rem 1rem 1rem"
        color="inactive.main"
        fontSize="0.9rem"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {props.data.name_user}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            sx={{ padding: 0 }}
            size="small"
            color={
              props.data.dislikes.includes(auth.currentUser.uid)
                ? "error"
                : "inactive"
            }
            onClick={() => contextContent.dislikePost(props.data)}
          >
            <KeyboardDoubleArrowDownIcon fontSize="small" />
          </IconButton>
          {props.data.likes.length - props.data.dislikes.length}
          <IconButton
            sx={{ padding: 0 }}
            size="small"
            color={
              props.data.likes.includes(auth.currentUser.uid)
                ? "success"
                : "inactive"
            }
            onClick={() => contextContent.likePost(props.data)}
          >
            <KeyboardDoubleArrowUpIcon fontSize="small" />
          </IconButton>
          <Box sx={{ paddingRight: "1rem" }} />
          <IconButton
            size="small"
            color="inactive"
            onClick={() => {
              setCurrentOpenId(
                props.data.id == currentOpenId ? "" : props.data.id
              );
            }}
          >
            <ChatBubbleOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Comments id={props.data.id} />
      <Divider />
    </Box>
  );
}
