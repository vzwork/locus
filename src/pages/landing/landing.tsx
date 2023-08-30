import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      <Button
        onClick={() => {
          navigate("/signin");
        }}
      >
        sign in
      </Button>
      <Button
        onClick={() => {
          navigate("/signup");
        }}
      >
        sign up
      </Button>
      <Button
        onClick={() => {
          navigate("/reset");
        }}
      >
        reset
      </Button>
    </div>
  );
}
