import { Box } from "@mui/material";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useEffect, useState } from "react";

export default function Photo(props) {
  const storage = getStorage();

  const [imgURL, setImgURL] = useState(null);

  useEffect(() => {
    if (!imgURL) {
      getDownloadURL(ref(storage, props.data.data.url)).then((thisURL) => {
        setImgURL(thisURL);
      });
    }
  });

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <img
        src={imgURL}
        style={{
          height: "min-content",
          width: "100%",
          objectFit: "contain",
        }}
      />
    </Box>
  );
}
