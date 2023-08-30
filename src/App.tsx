import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Landing from "./pages/landing/landing";
import { MyThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext/AuthContext";
import Node from "./pages/node/node";
import Auth from "./pages/auth/auth";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Reset from "./pages/auth/Reset";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />
  },
  {
    path: "/nodes/:id",
    element: <Node />
  },
  {
    path: "/signin",
    element: <SignIn />
  },
  {
    path: '/signup',
    element: <SignUp />
  },
  {
    path: '/reset',
    element: <Reset />
  }
]);

function App() {
  return (
    <div className="App">
      <MyThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </MyThemeProvider>
    </div>
  );
}

export default App;
