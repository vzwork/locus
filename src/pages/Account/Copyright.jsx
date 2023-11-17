import { Link, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Copyright(props) {
  const navigate = useNavigate();

  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      mt={"7vh"}
      {...props}
    >
      {"Copyright © "}
      <Link
        component={"button"}
        color="inherit"
        // href="https://locus.news"
        onClick={() => {
          navigate("/");
        }}
      >
        locus.news
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
