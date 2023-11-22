import { createContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ContextOnboardFlow = createContext({});

const ContextProviderOnboardFlow = (props) => {
  // step 1 - sign up
  // step 2 - sign in
  // step 3 - verify email
  // step 4 - setup account
  // step 5 - all other

  const auth = getAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (user?.email != authUser?.email) {
        setUser(authUser);
        if (authUser) {
          check();
        }
      }
    });
  });

  useEffect(() => {
    setComplete(user && user.emailVerified && user.displayName);
  }, [user]);

  const check = () => {
    setTimeout(() => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/account/signin");
        return;
      }
      if (!user.emailVerified) {
        navigate("/account/emailverify");
        return;
      }
      if (!user.displayName) {
        navigate("/account/setup");
        return;
      }
      if (!(user && user.emailVerified && user.displayName)) {
        navigate("/");
      }
    }, 200);
  };

  return (
    <ContextOnboardFlow.Provider value={{ check, user, complete }}>
      {props.children}
    </ContextOnboardFlow.Provider>
  );
};

export { ContextOnboardFlow, ContextProviderOnboardFlow };
