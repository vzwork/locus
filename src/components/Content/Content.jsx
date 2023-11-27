import { Box, Button, Divider } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { ContextContent } from "../../contexts/ContextContent/ContextContent";
import Quote from "../Quote/Quote";

export default function Content() {
  const contextContent = useContext(ContextContent);
  const [text, setText] = useState("");

  return (
    <Box>
      <Box
        p="1rem"
        m="0.5rem"
        border="1px solid"
        borderColor={"primary.main"}
        borderRadius={"1rem"}
        sx={{ height: "5vh" }}
        color="active.main"
      >
        Live Chat: to be implemented
      </Box>
      <Box
        m="0.5rem"
        // pt="1rem"
        // pt="1rem"
        // border="1px solid"
        borderColor={"inactive.main"}
        borderRadius={"1rem"}
        sx={{
          height: "200vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {contextContent.content.map((data, idx) => {
          if (data.type == "quote") {
            return (
              <Box key={idx}>
                <Quote data={data} />
                <Box py="0rem">
                  <Divider />
                </Box>
              </Box>
            );
          }
        })}
      </Box>
    </Box>
  );
}
