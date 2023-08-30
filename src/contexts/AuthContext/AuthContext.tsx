import { createContext, useMemo, useState } from "react";
import { Dialog } from "@mui/material";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext({});

function AuthProvider(props: any) {
  const { children } = props;
  
  // local
  const auth = useMemo(() => getAuth(), [])
  const [authInitialized, setAuthInitialized] = useState(false)
  // global
  const [openAuth, setOpenAuth] = useState(false);
  const [user, setUser] = useState({});

  // automatic auth update
  if (!authInitialized) {
    onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(prev => ({...authUser}))
      } else {
        if (Object.keys(user).length !== 0) {
          setUser(prev => ({}))
        }
      }
    })
    setAuthInitialized(true);
  }

  return (
    <AuthContext.Provider value={{ openAuth, setOpenAuth, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export {AuthProvider, AuthContext};