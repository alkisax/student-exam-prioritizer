import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        py: { xs: 6, md: 10 },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          width: { xs: 260, md: 420 },
          height: { xs: 260, md: 420 },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,166,35,.24), rgba(245,166,35,0) 70%)",
          top: "8%",
          right: "-8%",
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          width: { xs: 220, md: 360 },
          height: { xs: 220, md: 360 },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,63,53,.16), rgba(74,63,53,0) 70%)",
          bottom: "-12%",
          left: "-10%",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 7 },
            borderRadius: 5,
            textAlign: "center",
            backgroundColor: "rgba(255,253,247,.92)",
            border: "1px solid #e5e0d8",
            boxShadow: "0 24px 70px rgba(74,63,53,.13)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box
            component="img"
            src="/favicon.svg"
            alt=""
            sx={{
              width: { xs: 96, sm: 128 },
              height: { xs: 96, sm: 128 },
              mb: 3,
              filter: "drop-shadow(0 12px 12px rgba(74,63,53,.2))",
            }}
          />

          <Typography
            component="h1"
            variant="h2"
            sx={{
              color: "#4a3f35",
              fontWeight: 800,
              fontSize: { xs: "2.2rem", sm: "3.4rem" },
              letterSpacing: "-.04em",
            }}
          >
            Student Prioritizer
          </Typography>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{
                px: 4,
                py: 1.25,
                borderRadius: 2,
                backgroundColor: "#f5a623",
                color: "#4a3f35",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#df9214" },
              }}
            >
              Παρακαλω καντε login
            </Button>
            <Typography
              component="p"
              sx={{ width: "100%", mt: 1, mb: 0, color: "#6f665e", fontSize: "0.95rem" }}
            >
              Οδηγίες θα βρείτε στο (i) στο navbar
              <br />
              η εφαρμογή βρίσκετε στο 🎓 στο navbar
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
