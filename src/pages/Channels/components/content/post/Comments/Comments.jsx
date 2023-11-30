import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  TextField,
  useTheme,
} from "@mui/material";
import { useContext, useState } from "react";
import { ContextComments } from "../../../../../../contexts/ContextComments/ContextComments";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

export default function Comments({ id }) {
  const theme = useTheme();
  const contextComments = useContext(ContextComments);

  const [text, setText] = useState("");

  return (
    <Box>
      <Accordion
        expanded={contextComments.currentOpenId === id}
        sx={{
          boxShadow: "none",
          borderRadius: "0.5rem",
        }}
      >
        <AccordionSummary sx={{ display: "none" }}></AccordionSummary>
        <AccordionDetails
          sx={{
            padding: "0.5rem",
            background: theme.palette.bg.comments,
            // boxShadow: "-1px -8px 4px rgba(10,10,10,.10) inset;",
          }}
        >
          {contextComments.comments.length === 0 ? (
            <Box textAlign="center" fontSize="0.8rem" color="active.main">
              Be first to comment!
            </Box>
          ) : (
            <Box
              maxHeight="300px"
              overflow="auto"
              sx={{ display: "flex", flexDirection: "column-reverse" }}
            >
              {contextComments?.comments.map((data, idx) => (
                <Box key={idx}>
                  <Comment data={data} />
                </Box>
              ))}
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "end" }}>
            <TextField
              label="..."
              variant="standard"
              size="small"
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(ev) => {
                // console.log(`Pressed keyCode ${ev.key}`);
                if (ev.key === "Enter") {
                  // Do code here
                  ev.preventDefault();
                  contextComments.newComment(text);
                  setText("");
                }
              }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                contextComments.newComment(text);
                setText("");
              }}
            >
              <KeyboardArrowRightIcon />
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

const Comment = ({ data }) => {
  const date = new Date(data.date);

  return (
    <Box
      color="active.main"
      sx={{ display: "flex", flexDirection: "column" }}
      pt="0.2rem"
    >
      <Box fontSize="0.7rem" color="inactive.main">
        {data.name_user} - {date.getHours()}:{date.getMinutes()}
      </Box>
      <Box pl="0.5rem">{data.text}</Box>
      <Divider />
    </Box>
  );
};
