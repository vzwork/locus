import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Collapse,
  Container,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import useAccount from "../data/_1_ManagerAccount/useAccount";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import useThemeMode from "../data/_0_ManagerTheme/useThemeMode";
import ManagerTheme from "../data/_0_ManagerTheme/ManagerTheme";
import { idRoot } from "../data/db";
import { ButtonSignedInBig } from "../components/ButtonSignedIn/ButtonSignedIn";
import test from "./test";
import { useEffect, useState } from "react";

import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import CloseIcon from "@mui/icons-material/Close";
import usePopularChannels from "../data/_7_ManagerChannels/usePopularChannels";
import useReferencesChannels from "../data/_11_ManagerSearch/useReferencesChannels";
import ManagerSearch from "../data/_11_ManagerSearch/ManagerSearch";
import { IReferenceChannel } from "../data/referenceChannel";

export default function Landing() {
  const account = useAccount();
  const theme = useTheme();
  const navigate = useNavigate();
  const themeMode = useThemeMode();
  const managerTheme = ManagerTheme;

  return (
    <Box>
      <Container>
        <Box
          mt='1rem'
          p='0.5rem'
          borderRadius='0.5rem'
          bgcolor={theme.palette.background.transperent}
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxSizing: "border-box",
            backdropFilter: "blur(2px)",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Typography variant='h5'>Locus</Typography>
            <Typography variant='h6' color='info.main'>
              .news
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <IconButton
              color='secondary'
              onClick={() => {
                managerTheme.toggleTheme();
              }}
            >
              {themeMode === "light" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            {account ? (
              <ButtonSignedInBig />
            ) : (
              <ButtonGroup>
                <Button
                  onClick={() => navigate("/signin")}
                  variant='contained'
                >
                  sign in
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  variant='outlined'
                >
                  sign up
                </Button>
              </ButtonGroup>
            )}
          </Box>
        </Box>
      </Container>

      <Box></Box>

      <Container
        sx={{
          paddingY: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <PopularChannels />
        <SearchChannels />
        <ChannelRoot />
      </Container>
    </Box>
  );
}

function PopularChannels() {
  const navigate = useNavigate();
  const popularChannels = usePopularChannels();

  return (
    <>
      <></>
      <></>
      <Container>
        <Box
          padding='1rem'
          borderRadius='0.5rem'
          sx={{ backdropFilter: "blur(2px)" }}
          bgcolor={"background.transperentLight"}
        >
          <Typography variant='h6'>Popular channels</Typography>
          <Box
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: "0.5rem",
              paddingBottom: "1rem",
            }}
          >
            {popularChannels.map((channel) => (
              <Button
                key={channel.id}
                variant={"contained"}
                fullWidth
                color={"primary"}
                size='small'
                sx={{
                  minWidth: "6rem",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  display: "flex",
                  justifyContent: "left",
                  borderRadius: "2rem",
                  gap: "0.2rem",
                }}
                onClick={() => {
                  navigate(`/channels/${channel.id}`);
                }}
              >
                {/* <Box>{channel.statistics.countViewsAll}</Box> */}
                <Box>{channel.name}</Box>
              </Button>
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
}

function SearchChannels() {
  const params = useParams();
  const navigate = useNavigate();
  const referencesChannels = useReferencesChannels();
  const managerSearch = ManagerSearch;
  const [text, setText] = useState("");
  const [referenceChannel, setReferenceChannel] =
    useState<IReferenceChannel | null>(null);

  useEffect(() => {
    // console.log("params.idChannel", params.idChannel);
    // console.log("referenceChannel?.id", referenceChannel?.id);
    // if (params.idChannel === referenceChannel?.id) {
    //   setText("");
    // }
  }, [text, params.idChannel, referenceChannel]);

  return (
    <>
      <></>
      <></>
      <Container>
        <Box
          padding='1rem'
          borderRadius='0.5rem'
          sx={{
            backdropFilter: "blur(2px)",
            position: "relative",
            zIndex: "3",
          }}
          bgcolor={"background.transperentLight"}
        >
          {/* <Typography variant='h6'>Search</Typography> */}
          {/* <Box
            bgcolor='background.transperent'
            sx={{
              width: "100%",
              padding: "0.5rem",
              boxSizing: "border-box",
              backdropFilter: "blur(2px)",
              position: "relative",
              zIndex: "3",
            }}
            borderRadius='0.5rem'
          > */}
          <Autocomplete
            id='search'
            disablePortal
            noOptionsText='(enter) to search database'
            getOptionLabel={(option) => option.name}
            options={referencesChannels}
            // value={referenceChannel}
            onChange={(e, v) => {
              setReferenceChannel(v);
              navigate(`/channels/${v?.id}`);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='standard'
                placeholder='search channel'
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                }}
              />
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                managerSearch.searchChannelsByName(text);
              }
            }}
          />
          {/* </Box> */}
        </Box>
      </Container>
    </>
  );
}

function ChannelRoot() {
  const navigate = useNavigate();
  const popularChannels = usePopularChannels();

  return (
    <>
      <></>
      <></>
      <Container>
        <Box
          padding='1rem'
          borderRadius='0.5rem'
          sx={{ backdropFilter: "blur(2px)" }}
          bgcolor={"background.transperentLight"}
        >
          <Box
            sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <Typography variant='body1'>
              All news are aggregated here
            </Typography>
          </Box>
          <Button
            variant='outlined'
            onClick={() => {
              navigate(`/channels/${idRoot}`);
            }}
          >
            root chanel
          </Button>
        </Box>
      </Container>
    </>
  );
}
