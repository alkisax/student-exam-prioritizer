import { Route, Routes } from "react-router-dom";

import Layout from "./layout/layout";
import Login from "./authLogin/Login";
import PrivateRoute from "./authLogin/service/PrivateRoute";
import StudentPrioritizer from "./pages/StudentPrioritizer";
import { backendUrl } from "./constants/constants";
import Home from "./pages/Home"


function App() {

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login url={backendUrl} />} />

        <Route element={<PrivateRoute />}>
          <Route path="/student-prioritizer" element={<StudentPrioritizer  />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;