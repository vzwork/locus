import { Box } from "@mui/material";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useEffect, useState } from "react";

export default function Photo(props) {
  const storage = getStorage();

  const [imgURL, setImgURL] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!imgURL && error === "") {
      getDownloadURL(ref(storage, props.data.data.url))
        .then((thisURL) => {
          setImgURL(thisURL);
        })
        .catch((err) => {
          console.log(err);
          setError(err);
        });
    }
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <img
        alt="img"
        src={imgURL}
        style={{
          width: "100%",
          objectFit: "contain",
        }}
      />
      <Box color="active.main">{props.data.data.text}</Box>
    </Box>
  );
}
