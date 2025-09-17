import GhantChart from "./ghant-chart";
import { Button } from "../components/ui/button";
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
      <Button onClick={() => navigate("/gantt")}>Gantt Chart</Button>
    </div>
  );
};

export default App;
