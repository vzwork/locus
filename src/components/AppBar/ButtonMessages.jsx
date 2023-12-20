import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Box, IconButton } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useContext, useState } from "react";
import { ContextOnboardFlow } from "../../contexts/ContextOnboardFlow/ContextOnboardFlow";
import { useNavigate } from "react-router-dom";
import { ContextChats } from "../../contexts/ContextChats/ContextChats";

export default function ButtonMessages() {
  const navigate = useNavigate();
  const contextChats = useContext(ContextChats);

  // ---- ---- ---- ---- ---- ----
  // ----  Auth Restriction   ----
  const contextOnboardFlow = useContext(ContextOnboardFlow);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    if (!contextOnboardFlow.complete) {
      contextOnboardFlow.check();
      return;
    }
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // ----  Auth Restriction   ----
  // ---- ---- ---- ---- ---- ----

  return (
    <>
      <IconButton
        color="primary"
        id="basic-button"
        size="medium"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <ChatBubbleOutlineIcon fontSize="inherit" />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={() => navigate("/chats")} divider>
          all chats
        </MenuItem>
        <Box color="inactive.main" pl="1rem">
          recents
        </Box>
        {contextChats.chats?.slice(0, 4).map((val, idx) => {
          return (
            <MenuItem
              key={idx}
              onClick={() => navigate(`/chats/${val.id}`)}
              divider
            >
              {val.name}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
