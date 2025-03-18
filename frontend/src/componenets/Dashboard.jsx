import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectIncomeVsExpense, setselectIncomeVsExpense] = useState("ALL TIME");
  const [selectIncomeDetails, setselectIncomeDetails] = useState("ALL TIME");
  const [selectExpenseDetails, setselectExpenseDetails] = useState("ALL TIME");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Detect mobile screen
  const mode = useSelector((state) => state.auth.mode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/dashboard/`, {
          withCredentials: true,
        });
        console.log(response);
        setDashboardData(response.data.message);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle window resize to update isMobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!dashboardData) return <p className="text-center text-gray-600">Loading...</p>;

  const {
    incomeDetails,
    expenseDetails,
    statusBreakdown,
    debtByCreditor,
    paymentsByFrequency,
    upcomingPayments,
    monthlyExpenses,
    monthlyIncomes,
  } = dashboardData;

  const getMonthlyIncome = () => {
    let total = 0;
    monthlyIncomes.forEach((obj) => {
      total += obj.totalAmount;
    });
    return total;
  };

  const getMonthlyExpenses = () => {
    let total = 0;
    monthlyExpenses.forEach((obj) => {
      total += obj.totalAmount;
    });
    return total;
  };

  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const monthlyIncomeDetails = incomeDetails.filter((item) => item.month === todayMonth);
  const monthlyExpensesDetails = expenseDetails.filter((item) => item.month === todayMonth);

  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
    "#A569BD", "#1ABC9C", "#2ECC71", "#3498DB",
    "#E74C3C", "#F1C40F", "#E67E22", "#9B59B6",
    "#34495E", "#16A085", "#27AE60", "#2980B9",
    "#D35400", "#C0392B", "#BDC3C7", "#7F8C8D",
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const shortMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const aggregatedData = Object.values(
    incomeDetails.reduce((acc, item) => {
      const key = `${item.month}-${item.year}`;
      if (!acc[key]) {
        acc[key] = { month: item.month, year: item.year, totalAmount: 0 };
      }
      acc[key].totalAmount += item.totalAmount;
      return acc;
    }, {})
  ).map((item) => ({
    ...item,
    month: `${monthNames[item.month - 1]} ${item.year}`,
  }));

  // Format x-axis ticks for mobile
  const formatTick = (tick) => {
    if (isMobile) {
      const [month, year] = tick.split(" ");
      const monthIndex = monthNames.indexOf(month);
      if (monthIndex !== -1) {
        const shortMonth = shortMonthNames[monthIndex];
        const shortYear = year.slice(-2);
        return `${shortMonth} ${shortYear}`;
      }
    }
    return tick;
  };

  return (
    <div className={`container mx-auto p-2 sm:p-4 md:p-6 space-y-10 ${mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <h1 className="text-4xl font-bold text-center mb-6">Dashboard</h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Total Income</h3>
          <p className="text-3xl font-bold mt-2">₹{dashboardData.totalIncome}</p>
        </div>
        <div className="bg-gradient-to-r from-red-400 to-red-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Total Expenses</h3>
          <p className="text-3xl font-bold mt-2">₹{dashboardData.totalExpenses}</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Net Savings</h3>
          <p className="text-3xl font-bold mt-2">₹{dashboardData.totalIncome - dashboardData.totalExpenses}</p>
        </div>
      </div>

      {/* This Month Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">This Month Income</h3>
          <p className="text-3xl font-bold mt-2">₹{getMonthlyIncome()}</p>
        </div>
        <div className="bg-gradient-to-r from-red-400 to-red-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">This Month Expenses</h3>
          <p className="text-3xl font-bold mt-2">₹{getMonthlyExpenses()}</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">This Month Net Saving</h3>
          <p className="text-3xl font-bold mt-2">₹{getMonthlyIncome() - getMonthlyExpenses()}</p>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className={`${mode === "dark" ? "bg-gray-900" : "bg-gray-50"} shadow-md rounded-lg p-4 md:p-6 flex flex-col gap-5`}>
        <select
          value={selectIncomeVsExpense}
          onChange={(e) => setselectIncomeVsExpense(e.target.value)}
          className={`${mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} w-52`}
        >
          <option value="ALL TIME">All Time</option>
          <option value="THIS MONTH">This Month</option>
        </select>
        {selectIncomeVsExpense === "ALL TIME" ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Income vs Expenses (All time)</h2>
            <div className="w-full max-w-md mx-auto">
              <ResponsiveContainer width="100%" height={300} className="chart-container">
                <BarChart
                  data={[
                    { name: "Income", total: dashboardData.totalIncome },
                    { name: "Expenses", total: dashboardData.totalExpenses },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Income vs Expenses (This month)</h2>
            <div className="w-full max-w-md mx-auto">
              <ResponsiveContainer width="100%" height={300} className="chart-container">
                <BarChart
                  data={[
                    { name: "Income", total: getMonthlyIncome() },
                    { name: "Expenses", total: getMonthlyExpenses() },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Expense Breakdown */}
      <div className={`${mode === "dark" ? "bg-gray-900" : "bg-gray-50"} shadow-md rounded-lg p-4 md:p-6 flex flex-col gap-5`}>
        <select
          value={selectExpenseDetails}
          onChange={(e) => setselectExpenseDetails(e.target.value)}
          className={`${mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} w-52`}
        >
          <option value="ALL TIME">All Time</option>
          <option value="THIS MONTH">This Month</option>
        </select>
        {selectExpenseDetails === "ALL TIME" ? (
          <div className="shadow-md rounded-lg p-4 md:p-6">
            <h2 className="text-2xl font-semibold mb-4">Expense Breakdown (ALL Time)</h2>
            <div className="w-full max-w-sm mx-auto">
              <ResponsiveContainer width="100%" aspect={1} className="chart-container">
                <PieChart>
                  <Pie
                    data={expenseDetails}
                    dataKey="totalAmount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label
                  >
                    {expenseDetails.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="shadow-md rounded-lg p-4 md:p-6">
            <h2 className="text-2xl font-semibold mb-4">Expense Breakdown (This month)</h2>
            <div className="w-full max-w-sm mx-auto">
              <ResponsiveContainer width="100%" aspect={1} className="chart-container">
                <PieChart>
                  <Pie
                    data={monthlyExpensesDetails}
                    dataKey="totalAmount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label
                  >
                    {monthlyExpensesDetails.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Income Breakdown */}
      <div className={`${mode === "dark" ? "bg-gray-900" : "bg-gray-50"} shadow-md rounded-lg p-4 md:p-6 flex flex-col gap-5`}>
        <select
          value={selectIncomeDetails}
          onChange={(e) => setselectIncomeDetails(e.target.value)}
          className={`${mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} w-52`}
        >
          <option value="ALL TIME">All Time</option>
          <option value="THIS MONTH">This Month</option>
        </select>
        {selectIncomeDetails === "ALL TIME" ? (
          <div className="shadow-md rounded-lg p-4 md:p-6">
            <h2 className="text-2xl font-semibold mb-4">Income Breakdown (ALL Time)</h2>
            <div className="w-full max-w-sm mx-auto">
              <ResponsiveContainer width="100%" aspect={1} className="chart-container">
                <PieChart>
                  <Pie
                    data={incomeDetails}
                    dataKey="totalAmount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label
                  >
                    {incomeDetails.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="shadow-md rounded-lg p-4 md:p-6">
            <h2 className="text-2xl font-semibold mb-4">Income Breakdown (This month)</h2>
            <div className="w-full max-w-sm mx-auto">
              <ResponsiveContainer width="100%" aspect={1} className="chart-container">
                <PieChart>
                  <Pie
                    data={monthlyIncomeDetails}
                    dataKey="totalAmount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label
                  >
                    {monthlyIncomeDetails.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Trends */}
      <div className={`${mode === "dark" ? "bg-gray-900" : "bg-gray-50"} shadow-md rounded-lg p-4 md:p-6`}>
        <h2 className="text-2xl font-semibold mb-4">Monthly Trends</h2>
        <div className="w-full max-w-2xl mx-auto">
          <ResponsiveContainer width="100%" height={300} className="chart-container">
            <LineChart data={aggregatedData}>
              <XAxis dataKey="month" tickFormatter={formatTick} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalAmount" stroke="#0088FE" name="Income" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Debt Status */}
      {Object.keys(statusBreakdown).length !== 0 && (
        <div className={`${mode === "dark" ? "bg-gray-900" : "bg-gray-50"} shadow-md rounded-lg p-4 md:p-6`}>
          <h2 className="text-2xl font-semibold mb-4">Debt Status</h2>
          <div className="w-full max-w-md mx-auto">
            <ResponsiveContainer width="100%" height={300} className="chart-container">
              <BarChart data={statusBreakdown}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalDebt" fill="#FF8042" />
                <Bar dataKey="totalOutstanding" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recurring Payments by Frequency */}
      <div className={`${mode === "dark" ? "bg-gray-900" : "bg-gray-50"} shadow-md rounded-lg p-4 md:p-6`}>
        <h2 className="text-2xl font-semibold mb-4">Recurring Payments by Frequency</h2>
        <div className="w-full max-w-md mx-auto">
          <ResponsiveContainer width="100%" height={300} className="chart-container">
            <AreaChart data={paymentsByFrequency}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="totalAmount" stroke="#00C49F" fill="#00C49F" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className={`${mode === "dark" ? "bg-gray-900" : "bg-gray-50"} shadow-md rounded-lg p-4 md:p-6`}>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Payments</h2>
        <ul className="space-y-3">
          {upcomingPayments.map((payment, index) => (
            <li
              key={index}
              className={`p-4 ${mode === "dark" ? "bg-gray-900" : "bg-gray-50"} rounded-lg shadow-sm`}
            >
              <div className="flex justify-between">
                <span className="font-medium">{payment.title}</span>
                <span className="font-semibold text-indigo-500">₹{payment.amount}</span>
              </div>
              <div className="text-sm">
                Next Payment: {new Date(payment.nextPaymentDate).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;