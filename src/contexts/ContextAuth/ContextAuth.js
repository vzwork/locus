import { createContext } from "react";

const ContextAuth = createContext({});

const ContextProviderAuth = (props) => {
  return (
    <ContextAuth.Provider value={undefined}>
      {props.children}
      <></>
    </ContextAuth.Provider>
  );
};

export { ContextProviderAuth, ContextAuth };
