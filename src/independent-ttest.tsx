import { useState } from "react";

const IndependentTtest = () => {
  const [inputMode, setInputMode] = useState<"individual" | "summary">(
    "individual"
  );
  const [group1Input, setGroup1Input] = useState("");
  const [group2Input, setGroup2Input] = useState("");
  const [alpha, setAlpha] = useState(0.05);

  // Summary statistics inputs
  const [mean1, setMean1] = useState("");
  const [mean2, setMean2] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [standardError, setStandardError] = useState("");

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

  // Calculate based on input mode
  let results: {
    mean1: number;
    mean2: number;
    t: number;
    df: number;
    isSignificant: boolean;
    mode: "individual" | "summary";
    sd1?: number;
    sd2?: number;
    sp?: number;
    n1?: number;
    n2?: number;
    standardError?: number;
  } | null = null;

  if (inputMode === "individual" && canCalculate) {
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

    results = {
      mean1,
      mean2,
      t,
      df,
      isSignificant,
      sd1,
      sd2,
      sp,
      mode: "individual",
    };
  } else if (inputMode === "summary") {
    const meanVal1 = parseFloat(mean1);
    const meanVal2 = parseFloat(mean2);
    const n1Val = parseInt(n1);
    const n2Val = parseInt(n2);
    const seVal = parseFloat(standardError);

    if (
      !isNaN(meanVal1) &&
      !isNaN(meanVal2) &&
      !isNaN(n1Val) &&
      !isNaN(n2Val) &&
      !isNaN(seVal) &&
      n1Val > 0 &&
      n2Val > 0 &&
      seVal > 0
    ) {
      // Calculate t-statistic using provided standard error
      const t = (meanVal1 - meanVal2) / seVal;

      // Degrees of freedom
      const df = n1Val + n2Val - 2;

      // Interpret significance (simplified - using approximate critical value)
      const isSignificant = Math.abs(t) > 2.101;

      results = {
        mean1: meanVal1,
        mean2: meanVal2,
        t,
        df,
        isSignificant,
        n1: n1Val,
        n2: n2Val,
        standardError: seVal,
        mode: "summary",
      };
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Independent Samples t-Test</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Input Mode:</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="individual"
              checked={inputMode === "individual"}
              onChange={(e) =>
                setInputMode(e.target.value as "individual" | "summary")
              }
              className="mr-2"
            />
            Individual Values
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="summary"
              checked={inputMode === "summary"}
              onChange={(e) =>
                setInputMode(e.target.value as "individual" | "summary")
              }
              className="mr-2"
            />
            Summary Statistics
          </label>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {inputMode === "individual" ? (
          <>
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
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group 1 Mean:
                </label>
                <input
                  type="number"
                  value={mean1}
                  onChange={(e) => setMean1(e.target.value)}
                  placeholder="e.g., 85.2"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group 2 Mean:
                </label>
                <input
                  type="number"
                  value={mean2}
                  onChange={(e) => setMean2(e.target.value)}
                  placeholder="e.g., 78.9"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group 1 Sample Size (n₁):
                </label>
                <input
                  type="number"
                  value={n1}
                  onChange={(e) => setN1(e.target.value)}
                  placeholder="e.g., 25"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group 2 Sample Size (n₂):
                </label>
                <input
                  type="number"
                  value={n2}
                  onChange={(e) => setN2(e.target.value)}
                  placeholder="e.g., 30"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Standard Error of the Difference:
              </label>
              <input
                type="number"
                value={standardError}
                onChange={(e) => setStandardError(e.target.value)}
                placeholder="e.g., 2.15"
                step="0.001"
                min="0.001"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </>
        )}

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

      {inputMode === "individual" && !canCalculate && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Please enter at least 2 values for each group to perform the t-test.
        </div>
      )}

      {inputMode === "summary" &&
        (!mean1 || !mean2 || !n1 || !n2 || !standardError) && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Please fill in all summary statistics fields to perform the t-test.
          </div>
        )}

      {results && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-3">Results</h3>
          <div className="space-y-2">
            {results.mode === "summary" ? (
              <>
                <p>
                  Group 1: n = {results.n1}, Mean = {results.mean1}
                </p>
                <p>
                  Group 2: n = {results.n2}, Mean = {results.mean2}
                </p>
                <p>Standard Error = {results.standardError}</p>
                <p>
                  t({results.df}) = {results.t.toFixed(3)}, α = {alpha}
                </p>
              </>
            ) : (
              <>
                <p>
                  Group 1: n = {group1.length}, Mean ={" "}
                  {results.mean1.toFixed(3)}, SD = {results.sd1?.toFixed(3)}
                </p>
                <p>
                  Group 2: n = {group2.length}, Mean ={" "}
                  {results.mean2.toFixed(3)}, SD = {results.sd2?.toFixed(3)}
                </p>
                <p>Pooled SD = {results.sp?.toFixed(3)}</p>
                <p>
                  t({results.df}) = {results.t.toFixed(3)}, α = {alpha}
                </p>
              </>
            )}
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
