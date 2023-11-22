import {
  Box,
  Breadcrumbs,
  Button,
  Grid,
  IconButton,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useEffect } from "react";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";

import { ContextChannels } from "../../../contexts/ContextChannels/ContextChannels";

import Search from "./Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function NavigationDesktop() {
  const theme = useTheme();
  const navigate = useNavigate();
  const contextChannels = useContext(ContextChannels);

  useEffect(() => {
    // console.log(theme);
    // console.log(contextChannels.channelParent);
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Search />
      <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <IconButton
          size="small"
          onClick={() => {
            navigate(`/channels/${contextChannels.channelParent?.id}`);
          }}
        >
          <ArrowBackIcon fontSize="inherit" />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            component="button"
            onClick={() => {
              navigate(`/channels/${contextChannels.channelParent?.id_parent}`);
            }}
          >
            {contextChannels.channelParent?.name_parent}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            component="button"
            onClick={() => {
              navigate(`/channels/${contextChannels.channelParent?.id}`);
            }}
          >
            {contextChannels.channelParent?.name}
          </Link>
          <Link color="text.primary" underline="hover" component="button">
            {contextChannels.channelCurrent?.name}
          </Link>
        </Breadcrumbs>
      </Box>
      <Grid container>
        <Grid item xs={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              paddingY: "1rem",
            }}
          >
            {contextChannels.channelParent
              ? Object.keys(contextChannels.channelParent.children).map(
                  (key, idx) => {
                    return (
                      <Box
                        sx={{
                          padding: "0.3rem",
                          boxSizing: "border-box",
                          overflow: "hidden",
                        }}
                        key={idx}
                        borderColor="inherit"
                        borderRadius="1rem 0 0 1rem"
                        width="100%"
                        borderLeft={
                          contextChannels.channelCurrent?.id === key
                            ? "solid 1px"
                            : ""
                        }
                        borderTop={
                          contextChannels.channelCurrent?.id === key
                            ? "solid 1px"
                            : ""
                        }
                        borderBottom={
                          contextChannels.channelCurrent?.id === key
                            ? "solid 1px"
                            : ""
                        }
                      >
                        <Link
                          component="button"
                          color="inherit"
                          // underline="hover"
                          sx={{
                            "&:hover": {
                              color: `${theme.palette.primary.main}`,
                            },
                            marginLeft: "0.5rem",
                          }}
                          onClick={() => {
                            navigate(`/channels/${key}`);
                          }}
                        >
                          {contextChannels.channelParent.children[key]}
                        </Link>
                      </Box>
                    );
                  }
                )
              : null}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              height: "100%",
              overflow: "hidden",
              // width: "min-content",
            }}
            borderColor="inherit"
            border="1px solid"
            borderRadius="1rem"
          >
            <Box paddingY="1rem" sx={{ overflow: "hidden" }}>
              {contextChannels.channelCurrent
                ? Object.keys(contextChannels.channelCurrent.children).map(
                    (key, idx) => {
                      return (
                        <Box
                          sx={{ padding: "0.3rem", overflow: "hidden" }}
                          key={idx}
                        >
                          <Link
                            // underline="hover"
                            component="button"
                            color="inherit"
                            sx={{
                              "&:hover": {
                                color: `${theme.palette.primary.main}`,
                              },
                              overflow: "hidden",
                            }}
                            onClick={() => {
                              navigate(`/channels/${key}`);
                            }}
                          >
                            {contextChannels.channelCurrent.children[key]}
                          </Link>
                        </Box>
                      );
                    }
                  )
                : null}
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={6}>
          <Button
            fullWidth
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => contextChannels.setDialogDeleteChannel(true)}
          >
            {contextChannels.channelCurrent?.name}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            size="small"
            endIcon={<AddCircleOutlineIcon />}
            onClick={() => contextChannels.setDialogAddChannel(true)}
          >
            channel
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
