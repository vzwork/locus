import { createContext, useState } from "react";

const ContextContent = createContext({});

const ContextProviderContent = (props) => {
  const [quote, setQuote] = useState(true);
  const [article, setArticle] = useState(true);
  const [photo, setPhoto] = useState(true);
  const [video, setVideo] = useState(true);
  const [stream, setStream] = useState(true);

  return (
    <ContextContent.Provider
      value={{
        quote,
        setQuote,
        article,
        setArticle,
        photo,
        setPhoto,
        video,
        setVideo,
        stream,
        setStream,
      }}
    >
      {props.children}
    </ContextContent.Provider>
  );
};

export { ContextContent, ContextProviderContent };
