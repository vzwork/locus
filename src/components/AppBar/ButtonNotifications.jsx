import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import { useContext, useState } from "react";
import { ContextNotifications } from "../../contexts/ContextNotifications/ContextNotifications";

import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";

export default function ButtonNotifications() {
  const contextNotifications = useContext(ContextNotifications);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
        <NotificationsIcon fontSize="inherit" />
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
        {contextNotifications.notifications?.comments?.length === 0 ? (
          <MenuItem>you don't have any notifications</MenuItem>
        ) : (
          contextNotifications.notifications?.comments?.map((val, idx) => {
            return (
              <MenuItem key={idx} sx={{ padding: 0 }} divider>
                <ListItemIcon
                  color="inactive.main"
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  {val.type_post === "quote" ? <FormatQuoteIcon /> : null}
                  {val.type_post === "article" ? <NewspaperIcon /> : null}
                  {val.type_post === "video" ? <OndemandVideoIcon /> : null}
                  {val.type_post === "photo" ? <PhotoCameraIcon /> : null}
                </ListItemIcon>
                <ListItemText sx={{ span: { lineHeight: "0.5rem" } }}>
                  <Typography color="active.main" lineHeight="0.8rem">
                    {val.name_user}:
                  </Typography>
                  <Typography color="inactive.main" lineHeight="0.8rem">
                    {val.text.slice(0, 14)}...
                  </Typography>
                </ListItemText>

                <IconButton
                  onClick={() => {
                    contextNotifications.removeCommentNotification(val);
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </MenuItem>
            );
          })
        )}
        {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem
          onClick={() => {
            signOut(auth);
            handleClose();
          }}
        >
          Logout
        </MenuItem> */}
      </Menu>
    </>
  );
}
