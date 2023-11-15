import { createContext, useEffect, useState } from "react";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import ButtonAuthRecognized from "./ButtonAuthRecognized";
import ButtonAuth from "./ButtonAuth";
import { Outlet } from "react-router-dom";

const ContextAuth = createContext({});

const ContextProviderAuth = (props) => {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  onAuthStateChanged(auth, (user) => {
    setUser(user);
  });

  return (
    <ContextAuth.Provider value={undefined}>
      {user ? <ButtonAuthRecognized /> : <ButtonAuth />}
      <Outlet />
    </ContextAuth.Provider>
  );
};

export { ContextProviderAuth, ContextAuth };
