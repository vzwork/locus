import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div>
            <Button
                onClick={() => {navigate('/nodes/root')}}
            >
                go to tree
            </Button>
            <p>sidebar</p>
            <p>sidebar</p>
        </div>
    )
}