import { useState, useMemo } from "react";

// Error function implementation for Math.erf
const erf = (x: number): number => {
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};

// T-Test Result Interpretation Component
const TTestResult = ({
  tValue,
  pValue,
  df,
  alpha = 0.05,
}: {
  tValue: number;
  pValue: number;
  df: number;
  alpha?: number;
}) => {
  const isSignificant = pValue < alpha;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">T-Test Interpretation</h1>
      <p>
        t({df}) = {tValue.toFixed(3)}, p = {pValue.toFixed(4)}, α = {alpha}
      </p>
      <p className="mt-2">
        {isSignificant ? (
          <span className="text-green-600 font-semibold">
            ✅ The result is statistically significant. The sample mean is
            significantly different from the population mean.
          </span>
        ) : (
          <span className="text-red-600 font-semibold">
            ❌ The result is not statistically significant. There is not enough
            evidence to conclude the sample mean is different from the
            population mean.
          </span>
        )}
      </p>
      <p className="mt-2">
        <strong>APA Style:</strong> t({df}) = {tValue.toFixed(3)}, p{" "}
        {isSignificant ? "<" : ">="} {alpha}
      </p>
    </div>
  );
};

// Simple approximation for t-distribution CDF (two-tailed p-value)
const calculatePValue = (tStat: number, df: number): number => {
  const absTStat = Math.abs(tStat);

  // Approximate p-value calculation using normal approximation for large df
  if (df > 30) {
    const z = absTStat;
    const pOneTailed = 0.5 * (1 - erf(z / Math.sqrt(2)));
    return 2 * pOneTailed; // Two-tailed
  }

  // Simple approximation for smaller df
  const normalizedT = absTStat / Math.sqrt(df);
  const approximateP =
    Math.exp((-normalizedT * normalizedT) / 2) / Math.sqrt(2 * Math.PI);
  return Math.min(2 * approximateP, 1); // Two-tailed, capped at 1
};

const OneSampleTTest = () => {
  const [dataInput, setDataInput] = useState("");
  const [populationMean, setPopulationMean] = useState(3.8);
  const [alpha, setAlpha] = useState(0.05);

  const calculations = useMemo(() => {
    try {
      // Parse data from input string
      const data = dataInput
        .split(",")
        .map((val) => parseFloat(val.trim()))
        .filter((val) => !isNaN(val));

      if (data.length === 0) return null;

      // Calculate sample mean
      const sampleMean =
        data.reduce((sum, value) => sum + value, 0) / data.length;

      // Calculate sample standard deviation
      const sampleVariance =
        data.reduce((sum, value) => sum + Math.pow(value - sampleMean, 2), 0) /
        (data.length - 1);
      const sampleStd = Math.sqrt(sampleVariance);

      // Calculate t-statistic
      const tStat =
        (sampleMean - populationMean) / (sampleStd / Math.sqrt(data.length));

      // Degrees of freedom
      const df = data.length - 1;

      // Calculate p-value
      const pValue = calculatePValue(tStat, df);

      return {
        data,
        sampleMean,
        sampleStd,
        tStat,
        df,
        pValue,
      };
    } catch (error) {
      return null;
    }
  }, [dataInput, populationMean]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">One-Sample T-Test Calculator</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Sample Data (comma-separated values):
        </label>
        <textarea
          value={dataInput}
          onChange={(e) => setDataInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="4.1, 3.9, 3.5, 4.0..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Population Mean (μ):
        </label>
        <input
          type="number"
          step="any"
          value={populationMean}
          onChange={(e) => setPopulationMean(parseFloat(e.target.value) || 0)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Significance Level (α):
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max="0.99"
          value={alpha}
          onChange={(e) => setAlpha(parseFloat(e.target.value) || 0.05)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {calculations && (
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h2 className="text-lg font-semibold mb-3">
            One-Sample T-Test Results
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Sample Size (n):</strong> {calculations.data.length}
            </p>
            <p>
              <strong>Sample Mean (x̄):</strong>{" "}
              {calculations.sampleMean.toFixed(3)}
            </p>
            <p>
              <strong>Sample Standard Deviation (s):</strong>{" "}
              {calculations.sampleStd.toFixed(3)}
            </p>
            <p>
              <strong>Degrees of Freedom (df):</strong> {calculations.df}
            </p>
            <p>
              <strong>t-statistic:</strong> t({calculations.df}) ={" "}
              {calculations.tStat.toFixed(3)}
            </p>
            <p>
              <strong>p-value:</strong> {calculations.pValue.toFixed(4)}
            </p>
          </div>
        </div>
      )}

      {calculations && (
        <TTestResult
          tValue={calculations.tStat}
          pValue={calculations.pValue}
          df={calculations.df}
          alpha={alpha}
        />
      )}

      {!calculations && dataInput && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">
            Please enter valid numeric data separated by commas.
          </p>
        </div>
      )}
    </div>
  );
};

export default OneSampleTTest;
