import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ef4444", "#f97316", "#22c55e"]; // red, orange, green

const Analytics = ({ incidents }) => {
  // Last 7 days data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  });

  const dailyData = last7Days.map((date) => ({
    date,
    count: incidents.filter(
      (i) =>
        i.createdAt &&
        i.createdAt.split("T")[0] === date
    ).length,
  })).reverse();

  const severityData = [
    {
      name: "High",
      value: incidents.filter((i) => i.severity === "high").length,
    },
    {
      name: "Medium",
      value: incidents.filter((i) => i.severity === "medium").length,
    },
    {
      name: "Low",
      value: incidents.filter((i) => i.severity === "low").length,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      {/* Bar Chart */}
      <div className="bg-white text-black p-4 rounded shadow">
        <h3 className="font-bold mb-3">
          Last 7 Days Incidents
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white text-black p-4 rounded shadow">
        <h3 className="font-bold mb-3">
          Severity Distribution
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={severityData}
              dataKey="value"
              outerRadius={80}
              label
            >
              {severityData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;