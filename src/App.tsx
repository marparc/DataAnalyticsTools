import GhantChart from "./ghant-chart";
import { Button } from "../components/ui/button";
import { Route, Routes, useNavigate } from "react-router-dom";
import StandardDev from "./standard-deviation";
import OneSampleTTest from "./one-sample-t-test";

const App = () => {
  return (
    <Routes>
      <Route path="/gantt" element={<GhantChart />} />
      <Route path="/" element={<MainMenu />} />
      <Route path="/sd" element={<StandardDev />} />
      <Route path="/onesamplettest" element={<OneSampleTTest />} />
    </Routes>
  );
};

const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="p-20">
      <Button className="mr-10" onClick={() => navigate("/gantt")}>
        Gantt Chart
      </Button>
      <Button className="mr-10" onClick={() => navigate("/sd")}>
        Standard Dev And Mean
      </Button>
      <Button onClick={() => navigate("/onesamplettest")}>
        One Sample T-Test
      </Button>
    </div>
  );
};

export default App;
