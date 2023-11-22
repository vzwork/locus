import { createContext, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { Box, Button, Dialog, DialogTitle, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
// import ChannelCreation from "./ChannelCreation";

const ID_CHANNEL_ROOT = "wJwdi4XKGfFV3oTaCYFv";
const FIREBASE_NAME_CHANNELS = "channels";
const CHANNEL_PARENT_ROOT_DEAD_END = {
  id: ID_CHANNEL_ROOT,
  name: "locus",
  id_parent: ID_CHANNEL_ROOT,
  name_parent: "locus",
  children: { [ID_CHANNEL_ROOT]: "locus" },
};

export default function ChannelDeletion({
  channelCurrent,
  mapCashChannels,
  setMapCashChannels,
  channelParent,
  dialogDeleteChannel,
  setDialogDeleteChannel,
}) {
  const navigate = useNavigate();
  const db = getFirestore();

  const [nameChannelDelete, setNameChannelDelete] = useState("");
  const [errorNameChannelDelete, setErrorNameChannelDelete] = useState("");

  useEffect(() => {
    setErrorNameChannelDelete("");
    if (!channelCurrent) {
      return;
    }
    if (channelCurrent.id === ID_CHANNEL_ROOT) {
      setErrorNameChannelDelete("cannot delete root channel");
      return;
    }
    if (Object.keys(channelCurrent?.children).length > 0) {
      setErrorNameChannelDelete("channel mustn't have sub channels");
      return;
    }
    const timer = setTimeout(() => {
      if (channelCurrent.name !== nameChannelDelete) {
        setErrorNameChannelDelete("input doesn't match");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [nameChannelDelete]);

  const deleteChannel = () => {
    if (!channelCurrent) {
      return;
    }
    if (channelCurrent.id === ID_CHANNEL_ROOT) {
      setErrorNameChannelDelete("cannot delete root channel");
      return;
    }
    if (Object.keys(channelCurrent?.children).length > 0) {
      setErrorNameChannelDelete("channel mustn't have sub channels");
      return;
    }
    if (channelCurrent.name !== nameChannelDelete) {
      setErrorNameChannelDelete("input doesn't match");
      return;
    }
    // UPDATE PARENT
    const children_updated = channelParent.children;
    delete children_updated[channelCurrent.id];
    channelParent.children = children_updated;

    setMapCashChannels(
      new Map(mapCashChannels.set(channelParent.id, channelParent))
    );
    deleteDoc(doc(db, FIREBASE_NAME_CHANNELS, channelCurrent.id));
    setDoc(doc(db, FIREBASE_NAME_CHANNELS, channelParent.id), channelParent);
    setNameChannelDelete("");
    setDialogDeleteChannel(false);

    // TODO: UDPATE SEARCH CASH
    const cashChannels = JSON.parse(localStorage.getItem("cashChannels")) || {};
    delete cashChannels[channelCurrent.id];
    localStorage.setItem("cashChannels", JSON.stringify(cashChannels));

    navigate(`/channels/${channelCurrent.id_parent}`);
  };

  return (
    <Dialog
      onClose={() => {
        setNameChannelDelete("");
        setDialogDeleteChannel(false);
      }}
      open={dialogDeleteChannel}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", gap: "0.5rem" }}>
          Deleting
          <Box color="primary.main">{channelCurrent?.name}</Box>
        </Box>
      </DialogTitle>
      <Box
        p="1rem"
        sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <TextField
          error={errorNameChannelDelete.length > 0}
          label="name"
          p="1rem"
          value={nameChannelDelete}
          onChange={(e) => {
            setNameChannelDelete(e.target.value);
          }}
          sx={{ minWidth: "300px" }}
          helperText={errorNameChannelDelete}
        />
        <Button variant="contained" onClick={deleteChannel}>
          delete
        </Button>
      </Box>
    </Dialog>
  );
}
