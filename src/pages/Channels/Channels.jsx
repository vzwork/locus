import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { ContextChannels } from "../../contexts/ContextChannels/ContextChannels";
import ChannelsDesktop from "./ChannelsDesktop";
import ChannelsMobile from "./ChannelsMobile";

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

export default function Channels() {
  const contextChannels = useContext(ContextChannels);
  const params = useParams();

  const [width, height] = useWindowSize();

  useEffect(() => {
    if (!params.id) {
      contextChannels.initialNavigation();
    } else {
      contextChannels.processSetChannelCurrent(params.id);
    }
  });

  return (
    <Box sx={{ width: "100vw", height: "100vh", position: "fixed" }}>
      {width > 660 ? <ChannelsDesktop /> : <ChannelsMobile />}
      <></>
    </Box>
  );
}
