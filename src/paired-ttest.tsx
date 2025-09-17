import { useState } from "react";

// Dynamic import for jStat
let jStat: any;

const loadJStat = async () => {
  if (!jStat) {
    jStat = await import("jstat");
  }
  return jStat.default || jStat;
};

/**
 * Paired t-test function with interpretation
 */
async function pairedTTest(before: number[], after: number[], alpha = 0.05) {
  const jStatLib = await loadJStat();

  if (before.length !== after.length) {
    throw new Error("Both arrays must have the same number of values.");
  }

  const n = before.length;
  const differences = before.map((x, i) => x - after[i]);
  const meanDiff = differences.reduce((a: number, b: number) => a + b, 0) / n;

  const varianceDiff =
    differences.reduce(
      (sum: number, d: number) => sum + Math.pow(d - meanDiff, 2),
      0
    ) /
    (n - 1);
  const sdDiff = Math.sqrt(varianceDiff);
  const seDiff = sdDiff / Math.sqrt(n);

  const tStatistic = meanDiff / seDiff;
  const df = n - 1;

  const pValue = 2 * (1 - jStatLib.studentt.cdf(Math.abs(tStatistic), df));

  let interpretation;
  if (pValue < alpha) {
    interpretation = `Reject H₀: There is a significant difference between the two conditions (p = ${pValue.toFixed(
      3
    )}).`;
  } else {
    interpretation = `Fail to reject H₀: There is no statistically significant difference between the two conditions (p = ${pValue.toFixed(
      3
    )}).`;
  }

  return {
    n,
    meanDiff,
    sdDiff,
    seDiff,
    tStatistic,
    df,
    pValue,
    interpretation,
  };
}

const PairedTest = () => {
  const [beforeData, setBeforeData] = useState("");
  const [afterData, setAfterData] = useState("");
  const [alpha, setAlpha] = useState(0.05);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    try {
      setError("");

      const beforeArray = beforeData
        .split(",")
        .map((x) => parseFloat(x.trim()))
        .filter((x) => !isNaN(x));
      const afterArray = afterData
        .split(",")
        .map((x) => parseFloat(x.trim()))
        .filter((x) => !isNaN(x));

      if (beforeArray.length === 0 || afterArray.length === 0) {
        throw new Error("Please enter valid numeric data for both conditions.");
      }

      const testResults = await pairedTTest(beforeArray, afterArray, alpha);
      setResults(testResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Paired t-Test Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Before/Condition 1 Data (comma-separated):
          </label>
          <textarea
            className="w-full p-3 border rounded-md"
            rows={4}
            value={beforeData}
            onChange={(e) => setBeforeData(e.target.value)}
            placeholder="e.g., 12, 15, 18, 20, 22"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            After/Condition 2 Data (comma-separated):
          </label>
          <textarea
            className="w-full p-3 border rounded-md"
            rows={4}
            value={afterData}
            onChange={(e) => setAfterData(e.target.value)}
            placeholder="e.g., 14, 16, 19, 21, 24"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Significance Level (α):
        </label>
        <input
          type="number"
          className="w-32 p-2 border rounded-md"
          value={alpha}
          onChange={(e) => setAlpha(parseFloat(e.target.value))}
          step="0.01"
          min="0.01"
          max="0.99"
        />
      </div>

      <button
        onClick={handleCalculate}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 mb-6"
      >
        Calculate Paired t-Test
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {results && (
        <div className="bg-gray-50 p-6 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Results</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded">
              <h3 className="font-medium text-gray-700">Sample Size</h3>
              <p className="text-2xl font-bold">{results.n}</p>
            </div>
            <div className="bg-white p-4 rounded">
              <h3 className="font-medium text-gray-700">Mean Difference</h3>
              <p className="text-2xl font-bold">
                {results.meanDiff.toFixed(4)}
              </p>
            </div>
            <div className="bg-white p-4 rounded">
              <h3 className="font-medium text-gray-700">t-Statistic</h3>
              <p className="text-2xl font-bold">
                {results.tStatistic.toFixed(4)}
              </p>
            </div>
            <div className="bg-white p-4 rounded">
              <h3 className="font-medium text-gray-700">p-Value</h3>
              <p className="text-2xl font-bold">{results.pValue.toFixed(4)}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded mb-4">
            <h3 className="font-medium text-gray-700 mb-2">
              Statistical Details
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">
                  Standard Deviation of Differences:
                </span>
                <p>{results.sdDiff.toFixed(4)}</p>
              </div>
              <div>
                <span className="font-medium">Standard Error:</span>
                <p>{results.seDiff.toFixed(4)}</p>
              </div>
              <div>
                <span className="font-medium">Degrees of Freedom:</span>
                <p>{results.df}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded">
            <h3 className="font-medium text-gray-700 mb-2">Interpretation</h3>
            <p className="text-gray-800">{results.interpretation}</p>
          </div>

          <div className="bg-white p-4 rounded mt-4">
            <h3 className="font-medium text-gray-700 mb-2">
              APA-Style Reporting
            </h3>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
              t({results.df}) = {results.tStatistic.toFixed(3)}, p{" "}
              {results.pValue < 0.001
                ? "< .001"
                : results.pValue < 0.01
                ? "< .01"
                : results.pValue < 0.05
                ? "< .05"
                : `= ${results.pValue.toFixed(3)}`}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                <strong>Explanation:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  t({results.df}) → degrees of freedom (n - 1 = {results.n} - 1
                  = {results.df})
                </li>
                <li>
                  {results.tStatistic.toFixed(3)} → calculated t-statistic
                </li>
                <li>
                  p{" "}
                  {results.pValue < 0.001
                    ? "< .001"
                    : results.pValue < 0.01
                    ? "< .01"
                    : results.pValue < 0.05
                    ? "< .05"
                    : `= ${results.pValue.toFixed(3)}`}{" "}
                  → probability value{" "}
                  {results.pValue < 0.001
                    ? "(very small, reported as < .001)"
                    : ""}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PairedTest;
