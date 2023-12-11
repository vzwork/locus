import { Box } from "@mui/material";
import YouTube from "react-youtube";

export default function Video(props) {
  const opts = {
    height: "400",
    width: "100%",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
  };

  return (
    <Box>
      <YouTube
        videoId={props.data.data.id_video}
        opts={opts}
        id="video"
        //
      />
      <Box color="active.main">{props.data.data.text}</Box>
    </Box>
  );
}
