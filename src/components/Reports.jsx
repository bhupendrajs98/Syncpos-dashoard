import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

function Reports() {
  const [dateRange, setDateRange] = useState("today");
  const [reportData, setReportData] = useState({
    sales: [],
    topItems: [],
    summary: {},
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = () => {
    const orders = JSON.parse(localStorage.getItem("syncpos_orders") || "[]");
    const now = new Date();

    let filteredOrders = [];

    switch (dateRange) {
      case "today":
        filteredOrders = orders.filter(
          (order) => new Date(order.date).toDateString() === now.toDateString()
        );
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredOrders = orders.filter(
          (order) => new Date(order.date) >= weekAgo
        );
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredOrders = orders.filter(
          (order) => new Date(order.date) >= monthAgo
        );
        break;
      default:
        filteredOrders = orders;
    }

    // Calculate summary
    const totalSales = filteredOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Top items
    const itemCounts = {};
    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (itemCounts[item.name]) {
          itemCounts[item.name].quantity += item.quantity;
          itemCounts[item.name].revenue += item.price * item.quantity;
        } else {
          itemCounts[item.name] = {
            name: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          };
        }
      });
    });

    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by day
    const salesByDay = {};
    filteredOrders.forEach((order) => {
      const date = new Date(order.date).toLocaleDateString();
      salesByDay[date] = (salesByDay[date] || 0) + order.total;
    });

    const sales = Object.entries(salesByDay).map(([date, amount]) => ({
      date,
      amount,
    }));

    setReportData({
      sales,
      topItems,
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        totalCustomers: new Set(filteredOrders.map((o) => o.customer?.phone))
          .size,
      },
    });
  };

  const exportReport = () => {
    const csvContent = [
      ["Date", "Total Sales", "Orders", "Average Order Value"],
      ...reportData.sales.map((day) => [
        day.date,
        day.amount.toFixed(2),
        reportData.summary.totalOrders,
        reportData.summary.averageOrderValue.toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Track your business performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{reportData.summary.totalSales?.toFixed(0) || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.summary.totalOrders || 0}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{reportData.summary.averageOrderValue?.toFixed(0) || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.summary.totalCustomers || 0}
              </p>
            </div>
            <Filter className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Trend
          </h3>
          {reportData.sales.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No sales data for selected period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportData.sales.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.max(
                            10,
                            (day.amount /
                              Math.max(
                                ...reportData.sales.map((s) => s.amount)
                              )) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      ₹{day.amount.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Selling Items
          </h3>
          {reportData.topItems.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No item data for selected period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportData.topItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      ₹{item.revenue.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.quantity} sold
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Footer */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Report generated on {new Date().toLocaleDateString()} at{" "}
            {new Date().toLocaleTimeString()}
          </span>
          <span>
            Period:{" "}
            {dateRange === "today"
              ? "Today"
              : dateRange === "week"
              ? "Last 7 Days"
              : dateRange === "month"
              ? "Last 30 Days"
              : "All Time"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Reports;
