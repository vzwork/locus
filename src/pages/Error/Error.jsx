import { Box, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Error() {
  const navigate = useNavigate();

  return (
    <Box>
      <Container>
        <Box
          sx={{
            display: "flex",
            height: "100vh",
            width: "100vw",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Box bgcolor={"bg.clear"} p="1rem" borderRadius="1rem">
            How did you get here? You are not supposed to be here 🧑‍💻
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              navigate("/");
            }}
          >
            go back to safety
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
