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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<Background />}>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Error />} />
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
          sx={{ position: "fixed", width: "100vw", height: "100vh" }}
          bgcolor="bg.base"
          color="text.base"
        >
          <RouterProvider router={router} />
        </Box>
      </ContextProviderTheme>
    </div>
  );
}

export default App;
