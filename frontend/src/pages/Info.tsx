import { Box, Container, Paper, Typography } from "@mui/material";

const Info = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          backgroundColor: "#fffdf7",
          color: "#4a3f35",
          border: "1px solid #e5e0d8",
          borderRadius: 3,
          textAlign: "left",
        }}
      >
        <Typography component="h1" variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          About Student Prioritizer
        </Typography>

        <Typography component="p" sx={{ mb: 2 }}>
          Student Prioritizer helps teachers organize which students should be
          examined next, based on their available assessment data.
        </Typography>

        <Box component="section" sx={{ mt: 3 }}>
          <Typography component="h2" variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            How it works
          </Typography>
          <Typography component="p" sx={{ mb: 2 }}>
            Teachers can import student grades from an Excel file and save them
            for a course and school year. The application then produces a
            suggested order of examination.
          </Typography>
        </Box>

        <Box component="section" sx={{ mt: 3 }}>
          <Typography component="h2" variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            How priority is calculated
          </Typography>
          <Typography component="p" sx={{ mb: 2 }}>
            Higher priority is given to students who have not yet been examined,
            have missing assessment criteria, or may need improvement. Students
            who have already been examined several times receive lower priority.
          </Typography>
        </Box>

        <Typography sx={{ mt: 3, fontStyle: "italic" }}>
          The generated ranking is a supporting tool and does not replace the
          teacher&apos;s professional judgment.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Info;
