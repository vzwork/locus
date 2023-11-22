import { useContext, useEffect, useState } from "react";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import { ContextChannels } from "../../../contexts/ContextChannels/ContextChannels";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

const FIREBASE_NAME_CHANNELS = "channels";

export default function Search() {
  const db = getFirestore();
  const contextChannels = useContext(ContextChannels);
  const navigate = useNavigate();

  const [nodeRef, setNodeRef] = useState(null);
  const [optionsSearch, setOptionsSearch] = useState([]);
  const [textSearch, setTextSearch] = useState("");
  const [performedQuery, setPerformedQuery] = useState(false);

  useEffect(() => {
    setPerformedQuery(false);
  }, [textSearch]);

  useEffect(() => {
    const step = [];
    const cashChannels = JSON.parse(localStorage.getItem("cashChannels")) || {};
    Object.keys(cashChannels).forEach((key, idx) => {
      const channel_data = cashChannels[key];
      step.push({
        label: `${channel_data.name_parent} / ${channel_data.name}`,
        key: key,
      });
    });
    setOptionsSearch(step);
    // console.log(JSON.parse(localStorage.getItem("cashChannels")));
  }, [contextChannels, performedQuery]);

  const processSearch = () => {
    // local reference
    if (nodeRef) {
      navigate(`/channels/${nodeRef.key}`);
      setNodeRef(null);
      return;
    }
    // firebase query
    console.log("textSearch", textSearch.toLowerCase());
    const q = query(
      collection(db, FIREBASE_NAME_CHANNELS),
      where("name", "==", textSearch.toLowerCase())
    );
    getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc) {
          const channelNew = doc.data();
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
        setPerformedQuery(true);
      });
    });
  };

  return (
    <Box sx={{ display: "flex", width: "100%", alignItems: "end" }}>
      <Autocomplete
        sx={{ flex: 1 }}
        disablePortal
        noOptionsText={
          performedQuery ? "query had no results" : "press enter or (go)"
        }
        id="combo-box-demo"
        onChange={(e, v) => {
          setNodeRef(v);
        }}
        options={optionsSearch}
        value={nodeRef}
        renderInput={(params) => {
          // console.log(params);
          return (
            <TextField
              {...params}
              label="search channel"
              variant="standard"
              onChange={(e) => {
                setTextSearch(e.target.value);
              }}
            />
          );
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            // Prevent's default 'Enter' behavior.
            event.defaultMuiPrevented = true;
            processSearch();
          }
        }}
      />
      <Button
        size="small"
        variant="outlined"
        color={nodeRef ? "primary" : "inherit"}
        onClick={() => {
          processSearch();
        }}
      >
        go
      </Button>
    </Box>
  );
}
