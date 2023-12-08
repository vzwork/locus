import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { ContextChannels } from "../../contexts/ContextChannels/ContextChannels";
import ChannelsDesktop from "./ChannelsDesktop";
import ChannelsMobile from "./ChannelsMobile";
import ChannelsDesktopCompact from "./ChannelsDesktopCompact";

import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url
// ).toString();

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
    contextChannels.processSetChannelCurrent(params.id);
  });

  return (
    <Box sx={{ overflowY: "auto", height: "100vh" }}>
      {width > 700 ? (
        <>{width > 1100 ? <ChannelsDesktop /> : <ChannelsDesktopCompact />}</>
      ) : (
        <ChannelsMobile />
      )}
    </Box>
  );
}
