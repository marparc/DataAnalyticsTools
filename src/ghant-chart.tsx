import React, { useState, useMemo } from "react";
import "./GhantChart.css";

const GhantChart = () => {
  const [chartData, setChartData] = useState<
    (string | number | Date | null)[][]
  >([
    [
      "Task ID",
      "Task Name",
      "Resource",
      "Start Date",
      "End Date",
      "Duration",
      "Percent Complete",
      "Dependencies",
    ],
  ]);

  const [formData, setFormData] = useState({
    activity: "",
    predecessor: "",
    et: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTask = () => {
    const { activity, predecessor, et } = formData;

    if (!activity || !et) return;

    const duration = parseInt(et);
    let startDate = new Date(2024, 0, 1); // Default start date

    // Calculate start date based on prerequisites
    if (
      predecessor &&
      predecessor.trim() !== "" &&
      predecessor.toLowerCase() !== "none"
    ) {
      const prerequisites = predecessor.split(",").map((p) => p.trim());
      let latestEndDate = new Date(2024, 0, 1);

      // Find the latest end date among all prerequisites
      prerequisites.forEach((prereq) => {
        // Find the prerequisite task in existing chart data
        const prereqTask = chartData.find((task) => task[0] === prereq);
        if (prereqTask && prereqTask[4] instanceof Date) {
          const prereqEndDate = prereqTask[4] as Date;
          if (prereqEndDate > latestEndDate) {
            latestEndDate = prereqEndDate;
          }
        }
      });

      startDate = new Date(latestEndDate);
      // Remove the extra day - start immediately after prerequisite ends
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    // Calculate duration in milliseconds
    const durationMs = endDate.getTime() - startDate.getTime();

    const newTask = [
      activity,
      activity,
      null,
      startDate,
      endDate,
      durationMs,
      100,
      predecessor.trim() === "" || predecessor.toLowerCase() === "none"
        ? null
        : predecessor,
    ];

    setChartData((prevData) => [...prevData, newTask]);
    setFormData({
      activity: "",
      predecessor: "",
      et: "",
    });
  };

  // Calculate the maximum end date to determine chart width
  const getMaxDays = () => {
    if (chartData.length <= 1) return 20;

    let maxEndDate = new Date(2024, 0, 1);
    chartData.slice(1).forEach((task) => {
      if (task[4] instanceof Date && task[4] > maxEndDate) {
        maxEndDate = task[4] as Date;
      }
    });

    const startDate = new Date(2024, 0, 1);
    return Math.max(
      20,
      Math.ceil(
        (maxEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  };

  const maxDays = getMaxDays();

  // Add critical path finding function with proper types
  interface Task {
    activity: string;
    predecessors: string;
    et: number;
  }

  interface PathResult {
    path: string[];
    duration: number;
  }

  interface CriticalPathAnalysis {
    criticalPaths: PathResult[];
    otherPaths: PathResult[];
    maxDuration: number;
  }

  const findCriticalPaths = (tasks: Task[]): CriticalPathAnalysis => {
    // Convert list to a lookup map for quick access
    const taskMap: { [key: string]: Task } = {};
    tasks.forEach((t: Task) => {
      taskMap[t.activity] = { ...t };
    });

    // Build adjacency list (graph)
    const graph: { [key: string]: string[] } = {};
    tasks.forEach((t: Task) => {
      if (!graph[t.activity]) graph[t.activity] = [];
      const preds = t.predecessors
        ? t.predecessors.split(",").map((p: string) => p.trim())
        : [];
      preds.forEach((pred: string) => {
        if (!graph[pred]) graph[pred] = [];
        graph[pred].push(t.activity);
      });
    });

    // Find all start nodes (those with no predecessors)
    const starts = tasks
      .filter((t: Task) => !t.predecessors || t.predecessors.trim() === "")
      .map((t: Task) => t.activity);

    let allPaths: PathResult[] = [];

    function dfs(node: string, path: string[], duration: number): void {
      const successors = graph[node] || [];
      if (successors.length === 0) {
        // End of path
        allPaths.push({
          path: [...path, node],
          duration: duration + taskMap[node].et,
        });
        return;
      }
      successors.forEach((next: string) => {
        dfs(next, [...path, node], duration + taskMap[node].et);
      });
    }

    starts.forEach((start: string) => dfs(start, [], 0));

    // Find the max duration
    const maxDuration = Math.max(
      ...allPaths.map((p: PathResult) => p.duration)
    );

    const criticalPaths = allPaths.filter(
      (p: PathResult) => p.duration === maxDuration
    );
    const otherPaths = allPaths.filter(
      (p: PathResult) => p.duration !== maxDuration
    );

    return { criticalPaths, otherPaths, maxDuration };
  };

  // Calculate critical paths when chart data changes
  const pathAnalysis = useMemo((): CriticalPathAnalysis | null => {
    if (chartData.length <= 1) return null;

    // Convert chart data to the format expected by findCriticalPaths
    const tasks: Task[] = chartData.slice(1).map((task) => ({
      activity: String(task[0]),
      predecessors: task[7] ? String(task[7]) : "",
      et: Math.round((task[5] as number) / (1000 * 60 * 60 * 24)),
    }));

    return findCriticalPaths(tasks);
  }, [chartData]);

  return (
    <div
      className="gantt-container"
      style={{ backgroundColor: "white", boxShadow: "none" }}
    >
      <div className="header">
        <h1 className="title">Gantt Chart Creator</h1>
        <p className="subtitle">
          Enter PERT analysis data to generate your Gantt chart
        </p>
      </div>

      <div className="form-section">
        <table className="input-table" style={{ boxShadow: "none" }}>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Predecessor</th>
              <th>ET</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  type="text"
                  name="activity"
                  placeholder="A, B, C..."
                  value={formData.activity}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ boxShadow: "none" }}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="predecessor"
                  placeholder="None or A,B"
                  value={formData.predecessor}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ boxShadow: "none" }}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="et"
                  placeholder="Days"
                  value={formData.et}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ boxShadow: "none" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button
          onClick={handleAddTask}
          className="add-button"
          style={{ boxShadow: "none" }}
        >
          Add Task
        </button>
      </div>

      {chartData.length > 1 && (
        <div className="tasks-section">
          <h2 className="tasks-title">Added Tasks</h2>
          <table className="tasks-table" style={{ boxShadow: "none" }}>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Predecessor</th>
                <th>ET</th>
              </tr>
            </thead>
            <tbody>
              {chartData.slice(1).map((task, index) => (
                <tr key={index}>
                  <td>{String(task[0])}</td>
                  <td>{task[7] ? String(task[7]) : "None"}</td>
                  <td>
                    {Math.round((task[5] as number) / (1000 * 60 * 60 * 24))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pathAnalysis && (
        <div
          className="path-analysis-section"
          style={{
            margin: "20px 0",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        >
          <h2 style={{ color: "#333", marginBottom: "15px" }}>Path Analysis</h2>

          <div style={{ marginBottom: "15px" }}>
            <h3 style={{ color: "#d32f2f", marginBottom: "10px" }}>
              Critical Path(s) (Duration: {pathAnalysis.maxDuration} days):
            </h3>
            {pathAnalysis.criticalPaths.map((path, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "5px",
                  padding: "5px",
                  backgroundColor: "#ffebee",
                  borderRadius: "3px",
                }}
              >
                <strong>{path.path.join(" → ")}</strong>
              </div>
            ))}
          </div>

          {pathAnalysis.otherPaths.length > 0 && (
            <div>
              <h3 style={{ color: "#1976d2", marginBottom: "10px" }}>
                Other Paths:
              </h3>
              {pathAnalysis.otherPaths.map((path, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "5px",
                    padding: "5px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "3px",
                  }}
                >
                  <strong>{path.path.join(" → ")}</strong> (Duration:{" "}
                  {path.duration} days)
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {chartData.length > 1 && (
        <div className="chart-section">
          <h2 className="chart-title">Your Gantt Chart</h2>
          <div className="chart-wrapper">
            <div className="custom-gantt">
              <div className="gantt-header">
                <div className="task-column-header">Activities</div>
                <div className="duration-column-header">Duration</div>
                <div className="timeline-header">
                  {Array.from({ length: maxDays }, (_, i) => (
                    <div key={i} className="day-cell">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {chartData.slice(1).map((task, index) => {
                const startDate = task[3] as Date;

                const projectStart = new Date(2024, 0, 1);

                const startDay = Math.floor(
                  (startDate.getTime() - projectStart.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const duration = Math.round(
                  (task[5] as number) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div key={index} className="gantt-row">
                    <div className="task-name">{String(task[0])}</div>
                    <div className="task-duration">{duration}</div>
                    <div className="timeline-row">
                      {Array.from({ length: maxDays }, (_, dayIndex) => {
                        const isTaskDay =
                          dayIndex >= startDay &&
                          dayIndex < startDay + duration;
                        return (
                          <div
                            key={dayIndex}
                            className={`timeline-cell ${
                              isTaskDay ? "task-active" : ""
                            }`}
                          >
                            {isTaskDay ? "█" : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="day-numbers">
                <div className="task-column-spacer"></div>
                <div className="duration-column-spacer"></div>
                <div className="timeline-numbers">
                  {Array.from({ length: maxDays }, (_, i) => (
                    <div key={i} className="day-number">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GhantChart;
