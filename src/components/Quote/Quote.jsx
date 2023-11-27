import { Box, IconButton } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

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

export default function Quote(props) {
  console.log(props);

  const date = new Date(props.data.date);

  return (
    <Box mt="1.5rem">
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

        <IconButton size="small" color="inactive">
          <ChatBubbleOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
