import { Box, IconButton } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useContext } from "react";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";

export default function ButtonAuth(props) {
  const contextOnboardFlow = useContext(ContextOnboardFlow);

  return (
    <IconButton
      color="primary"
      size="large"
      onClick={() => contextOnboardFlow.check()}
    >
      <PersonAddIcon fontSize="inherit" />
    </IconButton>
  );
}
