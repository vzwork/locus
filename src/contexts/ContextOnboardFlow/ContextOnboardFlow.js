import { createContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { getAnalytics, logEvent, setUserId } from "firebase/analytics";

const ContextOnboardFlow = createContext({});

const ContextProviderOnboardFlow = (props) => {
  // step 1 - sign up
  // step 2 - sign in
  // step 3 - verify email
  // step 4 - setup account

  const analytics = getAnalytics();
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (user?.email !== authUser?.email) {
        if (authUser) {
          // analytics, logging
          setUserId(analytics, authUser.uid);
          if (location.pathname === "/account/signin") {
            navigate(-1);
          }
          check();
        }
        setUser(authUser);
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
        logEvent(analytics, "onboard_email_verify");
        return;
      }
      if (!user.displayName) {
        navigate("/account/setup");
        logEvent(analytics, "onboard_account_setup");
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
