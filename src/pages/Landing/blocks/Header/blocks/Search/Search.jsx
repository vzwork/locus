import { Autocomplete, Box, Container, TextField } from "@mui/material";

const top100Films = [
  { label: "The Shawshank Redemption", year: 1994 },
  { label: "The Godfather", year: 1972 },
  { label: "The Godfather: Part II", year: 1974 },
  { label: "The Dark Knight", year: 2008 },
  { label: "12 Angry Men", year: 1957 },
  { label: "Schindler's List", year: 1993 },
  { label: "Pulp Fiction", year: 1994 },
];

export default function Search() {
  return (
    <Box>
      <Container maxWidth={"md"}>
        <Autocomplete
          disablePortal
          id="search-channel"
          options={top100Films}
          sx={{ width: "100%" }}
          renderInput={(params) => (
            <Box bgcolor={"bg.clear"}>
              <TextField {...params} label="Search" variant="outlined" />
            </Box>
          )}
        />
      </Container>
    </Box>
  );
}
