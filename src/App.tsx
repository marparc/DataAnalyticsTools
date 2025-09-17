import GhantChart from "./ghant-chart";
import { Route, Routes, useNavigate } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route path="/gantt" element={<GhantChart />} />
      <Route path="/" element={<MainMenu />} />
    </Routes>
  );
};

const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/gantt")}>Go to Gantt Chart</button>
    </div>
  );
};

export default App;
