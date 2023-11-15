import { Box, IconButton } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";

export default function ButtonAuth(props) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "fixed",
        zIndex: 999,
        right: "52px",
        top: "0",
      }}
    >
      <IconButton
        color="primary"
        size="large"
        onClick={() => {
          navigate("/auth/signin");
        }}
      >
        <PersonAddIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
}
