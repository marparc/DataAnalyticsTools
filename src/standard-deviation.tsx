import { useState } from "react";

const StandardDev = () => {
  const [input, setInput] = useState("");
  const [data, setData] = useState<number[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Parse comma-separated values
    const numbers = value
      .split(",")
      .map((num) => parseFloat(num.trim()))
      .filter((num) => !isNaN(num));

    setData(numbers);
  };

  // Calculate mean
  const mean =
    data.length > 0
      ? data.reduce((sum, value) => sum + value, 0) / data.length
      : 0;

  // Calculate sample standard deviation
  const variance =
    data.length > 1
      ? data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
        (data.length - 1)
      : 0;

  const stdDev = Math.sqrt(variance);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Sample Standard Deviation Calculator
      </h1>

      <div className="mb-4">
        <label htmlFor="data-input" className="block text-sm font-medium mb-2">
          Enter numbers (comma-separated):
        </label>
        <input
          id="data-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="e.g., 1, 2, 3, 4, 5"
        />
      </div>

      {data.length > 0 && (
        <div className="space-y-2">
          <p>
            <strong>Data:</strong> [{data.join(", ")}]
          </p>
          <p>
            <strong>Count:</strong> {data.length}
          </p>
          <p>
            <strong>Mean:</strong> {mean.toFixed(2)}
          </p>
          <p>
            <strong>Standard Deviation:</strong> {stdDev.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default StandardDev;
