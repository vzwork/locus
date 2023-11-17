const { createContext } = require("react");
const { Outlet, useNavigate } = require("react-router-dom");

const ContextNavigation = createContext({});

const ContextProviderNavigation = () => {
  const navigate = useNavigate();

  return (
    <ContextNavigation.Provider value={{}}>
      <Outlet />
    </ContextNavigation.Provider>
  );
};

export { ContextNavigation, ContextProviderNavigation };
