import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  IconButton,
  Link,
  Menu,
  Snackbar,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useContext, useEffect, useState } from "react";
import Comments from "./Comments/Comments";

import { ContextComments } from "../../../../../contexts/ContextComments/ContextComments";

import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";

import { getAuth } from "firebase/auth";
import { ContextContent } from "../../../../../contexts/ContextContent/ContextContent";
import { ContextChats } from "../../../../../contexts/ContextChats/ContextChats";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import Photo from "./Photo/Photo";
import Article from "./Article/Article";
import Video from "./Video/Video";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  // console.log(props);
  const {
    currentOpenId,
    setCurrentOpenId,
    setCurrentOpenType,
    setCurrentOpenOwnerId,
  } = useContext(ContextComments);
  const auth = getAuth();
  const db = getFirestore();
  const contextContent = useContext(ContextContent);
  const contextChats = useContext(ContextChats);

  const [deleteInitiated, setDeleteInitiated] = useState(false);
  // console.log(auth.currentUser.uid == props.data.id_user);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const date = new Date(props.data.date);

  const handleAuthorClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // console.log(props);
  });

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
      setDeleteInitiated(false);
    }
  };

  return (
    <Box mt="1.5rem">
      <Snackbar open={deleteInitiated}>
        <Alert severity="error">
          Click again to delete the {props.data.type}!
        </Alert>
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          {props.data.name_channel_origin ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Origin:{" "}
              <Breadcrumbs aria-label="breadcrumb">
                <Link
                  underline="hover"
                  color="active.main"
                  component="button"
                  onClick={() => {
                    navigate(
                      `/channels/${props.data.id_channel_origin_parent}`
                    );
                  }}
                >
                  {props.data.name_channel_origin_parent}
                </Link>
                <Link
                  underline="hover"
                  color="primary.main"
                  component="button"
                  onClick={() => {
                    navigate(`/channels/${props.data.id_channel_origin}`);
                  }}
                >
                  {props.data.name_channel_origin}
                </Link>
              </Breadcrumbs>
            </Box>
          ) : null}
        </Box>
        <Box>
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
      </Box>
      {props.data.type == "quote" ? <Box>{props.data.data.text}</Box> : null}
      {props.data.type == "article" ? <Article data={props.data} /> : null}
      {props.data.type == "photo" ? <Photo data={props.data} /> : null}
      {props.data.type == "video" ? <Video data={props.data} /> : null}
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
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <Box p="1">
            <Button
              size="small"
              onClick={() => {
                contextChats.initiateChat(
                  auth.currentUser.uid,
                  props.data.id_user,
                  props.data.name_user
                );
              }}
            >
              send message
            </Button>
          </Box>
        </Menu>
        <Box onClick={handleAuthorClick} sx={{ cursor: "pointer" }}>
          {props.data.name_user}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            sx={{ padding: 0 }}
            size="small"
            color={
              props.data.dislikes.includes(auth.currentUser?.uid)
                ? "error"
                : "inactive"
            }
            onClick={() => contextContent.dislikePost(props.data)}
          >
            <KeyboardDoubleArrowDownIcon fontSize="small" />
          </IconButton>
          {props.data.likes?.length - props.data.dislikes?.length}
          <IconButton
            sx={{ padding: 0 }}
            size="small"
            color={
              props.data.likes.includes(auth.currentUser?.uid)
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
              setCurrentOpenType(props.data.type);
              setCurrentOpenOwnerId(props.data.id_user);
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
