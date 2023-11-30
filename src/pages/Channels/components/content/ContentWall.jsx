import { Box } from "@mui/material";
import { useContext } from "react";
import { ContextContent } from "../../../../contexts/ContextContent/ContextContent";
import Post from "./post/Post";

export default function ContentWall() {
  const contextContent = useContext(ContextContent);

  return (
    <Box>
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
                <Post data={data} />
              </Box>
            );
          }
        })}
      </Box>
    </Box>
  );
}
