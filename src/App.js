import logo from "./logo.svg";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ContextProviderTheme } from "./contexts/ContextTheme/ContextTheme";
import Landing from "./pages/Landing/Landing";
import Error from "./pages/Error/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "*",
    element: <Error />,
  },
]);

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
