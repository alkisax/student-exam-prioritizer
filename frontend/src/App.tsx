import { Route, Routes } from "react-router-dom";

import Layout from "./layout/layout";
import Login from "./authLogin/Login";
import PrivateRoute from "./authLogin/service/PrivateRoute";
import Protected from "./authLogin/service/Protected";

const Home = () => {
  return (
    <main style={{ padding: 40, color: "white" }}>
      <h1>Student Prioritizer</h1>
      <p>Prioritization of students for examination.</p>
    </main>
  );
};

function App() {
  const url =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3019";

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login url={url} />} />

        <Route element={<PrivateRoute />}>
          <Route path="/student-prioritizer" element={<Protected />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;