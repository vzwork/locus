import { Box, IconButton } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

export default function Quote(props) {
  return (
    <Box>
      <Box
        pt="0.5rem"
        pr="1rem"
        pl="1rem"
        pb="0.5rem"
        bgcolor="bg.hard"
        borderRadius="1rem 1rem 0rem 0rem"
      >
        {props.data.data.text}
        <></>
      </Box>
      <Box
        pt="0rem"
        pr="1rem"
        pl="1rem"
        pb="00rem"
        bgcolor="bg.easy"
        borderRadius="0rem 0rem 1rem 1rem"
        color="inactive.main"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {props.data.name_user}

        <IconButton size="small" color="inactive">
          <ChatBubbleOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
