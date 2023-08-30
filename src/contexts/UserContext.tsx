import { Dialog } from "@mui/material";
import { createContext, useState } from "react";

const UserContext = createContext({});

function UserProvider(props: any) {
  const { children } = props;

  const [openUser, setOpenUser] = useState(false);

  return (
    <UserContext.Provider value={{}}>
      <Dialog
        color="secondary"
        onClose={() => setOpenUser(false)}
        open={openUser}
      ></Dialog>
      {children}
    </UserContext.Provider>
  );
}

export { UserProvider, UserContext };