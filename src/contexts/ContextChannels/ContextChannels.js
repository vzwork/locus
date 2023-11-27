import { createContext, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import ChannelCreation from "./ChannelCreation";
import ChannelDeletion from "./ChannelDeletion";
import { getAnalytics, logEvent } from "firebase/analytics";

const ID_CHANNEL_ROOT = "wJwdi4XKGfFV3oTaCYFv";
const FIREBASE_NAME_CHANNELS = "channels";
const CHANNEL_PARENT_ROOT_DEAD_END = {
  id: ID_CHANNEL_ROOT,
  name: "locus",
  id_parent: ID_CHANNEL_ROOT,
  name_parent: "locus",
  children: { [ID_CHANNEL_ROOT]: "locus" },
};

const ContextChannels = createContext({});

const ContextProviderChannels = (props) => {
  const analytics = getAnalytics();
  const navigate = useNavigate();
  const db = getFirestore();

  const [mapCashChannels, setMapCashChannels] = useState(new Map());
  const [channelCurrent, setChannelCurrent] = useState(null);
  const [channelParent, setChannelParent] = useState(null);

  const [dialogAddChannel, setDialogAddChannel] = useState(false);
  const [dialogDeleteChannel, setDialogDeleteChannel] = useState(false);

  useEffect(() => {
    // console.log(channelParent);
    // console.log(channelCurrent);
    if (channelCurrent) {
      let history = JSON.parse(localStorage.getItem("history")) || [];
      history = history.slice(0, 10);
      if (!history.includes(channelCurrent.id)) {
        history.unshift(channelCurrent.id);
        localStorage.setItem("history", JSON.stringify(history));
      }
    }
  }, [channelCurrent]);

  // URL SELECTION
  const initialNavigation = () => {
    const historyLocalStorageId = localStorage.getItem("id");
    if (historyLocalStorageId) {
      navigate(`/channels/${historyLocalStorageId}`);
    } else {
      if (channelCurrent) {
        navigate(`/channels/${channelCurrent.id}`);
      } else {
        navigate(`/channels/${ID_CHANNEL_ROOT}`);
      }
    }
  };

  // CURRENT CHANNEL NAVIGATION
  const processSetChannelCurrent = (id) => {
    logEvent(analytics, "set_channel");

    if (mapCashChannels.has(id)) {
      setChannelCurrent(mapCashChannels.get(id));

      if (id !== ID_CHANNEL_ROOT) {
        processSetChannelParent(mapCashChannels.get(id).id_parent);
      } else {
        setChannelParent(CHANNEL_PARENT_ROOT_DEAD_END);
      }
    } else {
      // LOAD CHANNEL
      const docRef = doc(db, FIREBASE_NAME_CHANNELS, id);
      getDoc(docRef)
        .then((docSnap) => {
          // UPDATE CASH
          const channel_data = docSnap.data();
          setMapCashChannels(new Map(mapCashChannels.set(id, channel_data)));
          setChannelCurrent(channel_data);

          if (id !== ID_CHANNEL_ROOT) {
            processSetChannelParent(channel_data.id_parent);
          } else {
            setChannelParent(CHANNEL_PARENT_ROOT_DEAD_END);
          }
          localStorage.setItem("id", id);

          const cashChannels =
            JSON.parse(localStorage.getItem("cashChannels")) || {};
          cashChannels[channel_data.id] = {
            name: channel_data.name,
            id: channel_data.id,
            name_parent: channel_data.name_parent,
            id_parent: channel_data.name_parent,
          };
          localStorage.setItem("cashChannels", JSON.stringify(cashChannels));
        })
        .catch((err) => {
          // TODO: REMOVE REF FROM LOCAL STORAGE
          const cashChannels =
            JSON.parse(localStorage.getItem("cashChannels")) || {};
          delete cashChannels[id];
          localStorage.setItem("cashChannels", JSON.stringify(cashChannels));

          console.log(err);

          // TODO: CHANNEL DOESN'T EXIST
          navigate(`/channels/${ID_CHANNEL_ROOT}`);
        });
    }
  };

  const processSetChannelParent = (id) => {
    if (mapCashChannels.has(id)) {
      setChannelParent(mapCashChannels.get(id));
    } else {
      const docRef = doc(db, "channels", id);
      getDoc(docRef)
        .then((docSnap) => {
          const dataParent = docSnap.data();
          setMapCashChannels(new Map(mapCashChannels.set(id, dataParent)));
          setChannelParent(dataParent);

          const cashChannels =
            JSON.parse(localStorage.getItem("cashChannels")) || {};
          cashChannels[dataParent.id] = {
            name: dataParent.name,
            id: dataParent.id,
            name_parent: dataParent.name_parent,
            id_parent: dataParent.name_parent,
          };
          localStorage.setItem("cashChannels", JSON.stringify(cashChannels));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <ContextChannels.Provider
      value={{
        channelCurrent,
        channelParent,
        setDialogAddChannel,
        setDialogDeleteChannel,
        initialNavigation,
        processSetChannelCurrent,
      }}
    >
      <ChannelCreation
        channelCurrent={channelCurrent}
        channelParent={channelParent}
        mapCashChannels={mapCashChannels}
        setMapCashChannels={setMapCashChannels}
        dialogAddChannel={dialogAddChannel}
        setDialogAddChannel={setDialogAddChannel}
      />
      <ChannelDeletion
        channelCurrent={channelCurrent}
        channelParent={channelParent}
        mapCashChannels={mapCashChannels}
        setMapCashChannels={setMapCashChannels}
        dialogDeleteChannel={dialogDeleteChannel}
        setDialogDeleteChannel={setDialogDeleteChannel}
      />

      {props.children}
    </ContextChannels.Provider>
  );
};

export { ContextChannels, ContextProviderChannels };
