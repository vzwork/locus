import { useEffect, useState } from "react";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";
import { Box, Button, Dialog, DialogTitle, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

// const ID_CHANNEL_ROOT = "wJwdi4XKGfFV3oTaCYFv";
const FIREBASE_NAME_CHANNELS = "channels";
// const CHANNEL_PARENT_ROOT_DEAD_END = {
//   id: ID_CHANNEL_ROOT,
//   name: "locus",
//   id_parent: ID_CHANNEL_ROOT,
//   name_parent: "locus",
//   children: { [ID_CHANNEL_ROOT]: "locus" },
// };

export default function ChannelCreation({
  channelCurrent,
  mapCashChannels,
  setMapCashChannels,
  channelParent,
  dialogAddChannel,
  setDialogAddChannel,
}) {
  const navigate = useNavigate();
  const db = getFirestore();

  const [nameChannel, setNameChannel] = useState("");
  const [errorNameChannel, setErrorNameChannel] = useState("");

  useEffect(() => {
    setErrorNameChannel("");
    const timer = setTimeout(() => {
      if (nameChannel.length > 0) {
        if (nameChannel.length < 3) {
          setErrorNameChannel("3+ characters");
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [nameChannel]);

  const createChannel = () => {
    if (nameChannel.length < 3) {
      setErrorNameChannel("3+ characters");
      return;
    }
    const refChannelNew = doc(collection(db, "channels"));
    const channelNew = {
      name: nameChannel.toLowerCase(),
      id: refChannelNew.id,
      name_parent: channelCurrent.name,
      id_parent: channelCurrent.id,
      children: {},
    };
    const channelCurrentUpdated = {
      ...channelCurrent,
      children: {
        ...channelCurrent.children,
        [channelNew.id]: channelNew.name,
      },
    };

    // FIREBASE UPDATE CHANNEL CURRENT
    setDoc(
      doc(db, FIREBASE_NAME_CHANNELS, channelCurrent.id),
      channelCurrentUpdated
    )
      .then(() => {
        // LOCAL UPDATE CHANNEL CURRENT
        mapCashChannels.set(channelCurrent.id, channelCurrentUpdated);
        setMapCashChannels(new Map(mapCashChannels));
        // FIREBASE UPDATE CHANNEL NEW
        setDoc(doc(db, FIREBASE_NAME_CHANNELS, channelNew.id), channelNew).then(
          () => {
            // LOCAL UPDATE CHANNEL NEW
            mapCashChannels.set(channelNew.id, channelNew);
            setMapCashChannels(new Map(mapCashChannels));
            setDialogAddChannel(false);
            setNameChannel("");

            // CASH SEARCH UPDATE
            const cashChannels =
              JSON.parse(localStorage.getItem("cashChannels")) || {};
            cashChannels[channelNew.id] = {
              name: channelNew.name,
              id: channelNew.id,
              name_parent: channelNew.name_parent,
              id_parent: channelNew.name_parent,
            };
            localStorage.setItem("cashChannels", JSON.stringify(cashChannels));
          }
        );
      })
      .catch(() => {
        // TODO: CHANNEL CURRENT DOESN'T EXIST
        navigate(`/channels/${channelParent.id}`);
        // OTHER ERROR
      });
  };

  return (
    <Dialog
      onClose={() => {
        setNameChannel("");
        setDialogAddChannel(false);
      }}
      open={dialogAddChannel}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", gap: "0.5rem" }}>
          Create sub channel for
          <Box color="primary.main">{channelCurrent?.name}</Box>
        </Box>
      </DialogTitle>
      <Box
        p="1rem"
        sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <TextField
          error={errorNameChannel.length > 0}
          label="name"
          p="1rem"
          value={nameChannel}
          onChange={(e) => {
            setNameChannel(e.target.value);
          }}
          sx={{ minWidth: "300px" }}
          helperText={errorNameChannel}
        />
        <Button variant="contained" onClick={createChannel}>
          create
        </Button>
      </Box>
    </Dialog>
  );
}
