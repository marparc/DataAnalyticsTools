import React, { useState } from "react";

const IndependentTtest = () => {
  const [group1Input, setGroup1Input] = useState("");
  const [group2Input, setGroup2Input] = useState("");
  const [alpha, setAlpha] = useState(0.05);

  // Parse input strings to number arrays
  const parseGroup = (input: string): number[] => {
    return input
      .split(",")
      .map((val) => parseFloat(val.trim()))
      .filter((val) => !isNaN(val));
  };

  const group1 = parseGroup(group1Input);
  const group2 = parseGroup(group2Input);

  // Only calculate if both groups have data
  const canCalculate = group1.length > 1 && group2.length > 1;

  let results = null;
  if (canCalculate) {
    // Calculate means
    const mean1 = group1.reduce((sum, x) => sum + x, 0) / group1.length;
    const mean2 = group2.reduce((sum, x) => sum + x, 0) / group2.length;

    // Calculate sample standard deviations
    const variance1 =
      group1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) /
      (group1.length - 1);
    const variance2 =
      group2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) /
      (group2.length - 1);
    const sd1 = Math.sqrt(variance1);
    const sd2 = Math.sqrt(variance2);

    // Calculate pooled standard deviation
    const sp = Math.sqrt(
      ((group1.length - 1) * variance1 + (group2.length - 1) * variance2) /
        (group1.length + group2.length - 2)
    );

    // Calculate t-statistic (pooled)
    const t =
      (mean1 - mean2) / (sp * Math.sqrt(1 / group1.length + 1 / group2.length));

    // Degrees of freedom
    const df = group1.length + group2.length - 2;

    // Interpret significance
    const isSignificant = Math.abs(t) > 2.101;

    results = { mean1, mean2, t, df, isSignificant, sd1, sd2, sp };
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Independent Samples t-Test</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Group 1 Data (comma-separated values):
          </label>
          <input
            type="text"
            value={group1Input}
            onChange={(e) => setGroup1Input(e.target.value)}
            placeholder="e.g., 1.2, 2.3, 3.4, 4.5"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-sm text-gray-600 mt-1">
            {group1.length} values entered
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Group 2 Data (comma-separated values):
          </label>
          <input
            type="text"
            value={group2Input}
            onChange={(e) => setGroup2Input(e.target.value)}
            placeholder="e.g., 2.1, 3.2, 4.3, 5.4"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-sm text-gray-600 mt-1">
            {group2.length} values entered
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Significance Level (α):
          </label>
          <input
            type="number"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            min="0.001"
            max="0.999"
            step="0.001"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {!canCalculate && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Please enter at least 2 values for each group to perform the t-test.
        </div>
      )}

      {results && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-3">Results</h3>
          <div className="space-y-2">
            <p>
              Group 1: n = {group1.length}, Mean = {results.mean1.toFixed(3)},
              SD = {results.sd1.toFixed(3)}
            </p>
            <p>
              Group 2: n = {group2.length}, Mean = {results.mean2.toFixed(3)},
              SD = {results.sd2.toFixed(3)}
            </p>
            <p>Pooled SD = {results.sp.toFixed(3)}</p>
            <p>
              t({results.df}) = {results.t.toFixed(3)}, α = {alpha}
            </p>
            <p
              className="mt-3 p-3 rounded font-semibold"
              style={{
                backgroundColor: results.isSignificant ? "#d4edda" : "#f8d7da",
                color: results.isSignificant ? "#155724" : "#721c24",
              }}
            >
              {results.isSignificant
                ? "✅ The result is statistically significant."
                : "❌ The result is not statistically significant."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndependentTtest;
