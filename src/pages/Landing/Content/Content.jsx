import { Box, Container } from "@mui/material";

export default function Content() {
  return (
    <Box>
      <Container maxWidth="md">
        <Box
          pt={"10vh"}
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                zIndex: "2",
                position: "absolute",
                left: "0",
                right: "0",
                top: "0",
                bottom: "0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box bgcolor={"bg.clear"} p="1rem" borderRadius="1rem">
                Welcome / guide video.
              </Box>
            </Box>
            <img
              src="/Explaining.png"
              alt="explaining"
              style={{
                objectFit: "cover",
                width: "100%",
                filter: "blur(5px)",
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
