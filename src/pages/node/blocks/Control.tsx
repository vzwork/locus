import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

import { ThemeContext } from "../../../contexts/ThemeContext";
import { InputAdornment, TextField } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { AuthContext } from "../../../contexts/AuthContext/AuthContext";

const drawerWidth = 300;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function Control(props: any) {
  const { children } = props;

  const theme = useTheme();
  const [openTree, setOpenTree] = React.useState(false);
  const [openSettings, setOpenSettings] = React.useState(false);
  const { setOpenAuth }: any = React.useContext(AuthContext);
  const themeContext: any = React.useContext(ThemeContext);
  const authContext: any = React.useContext(AuthContext);

  const handleDrawerOpen = () => {
    setOpenTree(true);
  };

  const handleDrawerClose = () => {
    setOpenTree(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* <CssBaseline /> */}
      <Drawer
        open={openSettings}
        anchor="right"
        onClose={() => setOpenSettings(false)}
        PaperProps={{
          sx: {
            backgroundColor: "secondary.main",
          },
        }}
      >
        options
      </Drawer>
      <AppBar position="fixed" open={openTree} color="secondary">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            height: "min-content",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(openTree && { display: "none" }) }}
            >
              <FormatListBulletedIcon />
            </IconButton>
            <TextField
              variant="standard"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box>
            <IconButton
              color="inherit"
              onClick={() => {
                themeContext.setUseLightTheme(!themeContext.useLightTheme);
              }}
              sx={{ marginRight: "0rem" }}
            >
              <LightModeIcon />
            </IconButton>

            {Object.keys(authContext.user).length === 0 ? (
              <IconButton
                color="inherit"
                onClick={() => {
                  setOpenAuth(true);
                }}
                sx={{ marginRight: "0rem" }}
              >
                <AccountCircleIcon />
              </IconButton>
            ) : (
              <IconButton
                color="primary"
                onClick={() => {
                  setOpenAuth(true);
                }}
                sx={{ marginRight: "0rem" }}
              >
                <AccountCircleIcon />
              </IconButton>
            )}
            {/* <IconButton
              color="inherit"
              onClick={() => {
                setOpenSettings(!openSettings);
              }}
              edge="end"
            >
              <TuneIcon />
            </IconButton> */}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={openTree}
        PaperProps={{
          sx: {
            backgroundColor: "secondary.dark",
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {["All mail", "Trash", "Spam"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={openTree}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}
