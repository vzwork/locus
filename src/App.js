import logo from "./logo.svg";
import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ContextProviderTheme } from "./contexts/ContextTheme/ContextTheme";
import Landing from "./pages/Landing/Landing";
import Error from "./pages/Error/Error";
import { Box } from "@mui/material";
import Background from "./components/Background/Background";
import Tree from "./pages/Tree/Tree";
import Auth from "./pages/Auth/Auth";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import Reset from "./pages/Auth/Reset";
import { ContextProviderAuth } from "./contexts/ContextAuth/ContextAuth";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<ContextProviderAuth />}>
      <Route element={<Background />}>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Error />} />
        <Route path="/auth" element={<Auth />}>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="reset" element={<Reset />} />
        </Route>
      </Route>
      <Route path="/tree" element={<Tree />} />
    </Route>
  )
);

function App() {
  return (
    <div>
      <ContextProviderTheme>
        <Box
          sx={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            zIndex: "-999",
          }}
          bgcolor="bg.base"
        />
        <Box color="text.base">
          <RouterProvider router={router} />
        </Box>
      </ContextProviderTheme>
    </div>
  );
}

export default App;
