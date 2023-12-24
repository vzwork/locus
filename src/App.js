import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";

import { Box } from "@mui/material";

import Landing from "./pages/Landing/Landing";
import Error from "./pages/Error/Error";
import Background from "./components/Background/Background";
import Channels from "./pages/Channels/Channels";
import Account from "./pages/Account/Account";
import SignIn from "./pages/Account/SignIn";
import SignUp from "./pages/Account/SignUp";
import PasswordChange from "./pages/Account/PasswordChange";
import AppBarHome from "./components/AppBar/AppBarHome";
import EmailVerify from "./pages/Account/EmailVerify";

import { ContextProviderTheme } from "./contexts/ContextTheme/ContextTheme";
import { ContextProviderOnboardFlow } from "./contexts/ContextOnboardFlow/ContextOnboardFlow";
import SetUp from "./pages/Account/SetUp";
import Home from "./pages/Account/Home";
import { ContextProviderChannels } from "./contexts/ContextChannels/ContextChannels";
import { ContextProviderContent } from "./contexts/ContextContent/ContextContent";
import { ContextProviderQuotes } from "./contexts/ContextQuotes/ContextQuotes";
import { ContextProviderComments } from "./contexts/ContextComments/ContextComments";
import { ContextProviderPhotos } from "./contexts/ContextPhotos/ContextPhotos";
import { ContextProviderArticles } from "./contexts/ContextArticles/ContextArticles";
import { ContextProviderVideos } from "./contexts/ContextVideos/ContextVideos";
import { ContextProviderNotifications } from "./contexts/ContextNotifications/ContextNotifications";
import { ContextProviderChats } from "./contexts/ContextChats/ContextChats";
import Chats from "./pages/Chats/Chats";

function WrapperContextsNavigation() {
  return (
    <ContextProviderOnboardFlow>
      <ContextProviderNotifications>
        <ContextProviderChats>
          <ContextProviderChannels>
            <ContextProviderQuotes>
              <ContextProviderPhotos>
                <ContextProviderArticles>
                  <ContextProviderVideos>
                    <ContextProviderContent>
                      <ContextProviderComments>
                        <Outlet />
                      </ContextProviderComments>
                    </ContextProviderContent>
                  </ContextProviderVideos>
                </ContextProviderArticles>
              </ContextProviderPhotos>
            </ContextProviderQuotes>
          </ContextProviderChannels>
        </ContextProviderChats>
      </ContextProviderNotifications>
    </ContextProviderOnboardFlow>
  );
}

function WrapperHome() {
  return (
    <Box>
      <Background />
      <AppBarHome />
    </Box>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<WrapperContextsNavigation />}>
      <Route element={<WrapperHome />}>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Error />} />
        <Route path="/account" element={<Account />}>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="passwordchange" element={<PasswordChange />} />
          <Route path="emailverify" element={<EmailVerify />} />
          <Route path="setup" element={<SetUp />} />
          <Route path="home" element={<Home />} />
        </Route>
        <Route path="/chats/:chatId" element={<Chats />} />
        <Route path="/chats" element={<Chats />} />
      </Route>
      <Route path="/channels" element={<Channels />} />
      <Route path="/channels/:id" element={<Channels />} />
    </Route>
  )
);

function App() {
  return (
    <div>
      <ContextProviderTheme>
        <RouterProvider router={router} />
      </ContextProviderTheme>
    </div>
  );
}

export default App;
