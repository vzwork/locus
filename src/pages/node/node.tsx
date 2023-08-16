import { Box } from "@mui/material";
import Control from "./blocks/Control";

export default function Node() {
    return (
        <Box
            sx={{
              position: "fixed",
              height: "100vh",
              width: "100vw",
              backgroundColor: "secondary.light",
              color: "secondary.contrastText",
            }}
          >
            <Control>
                Hello! This is great!
            </Control>
        </Box>
    )
}