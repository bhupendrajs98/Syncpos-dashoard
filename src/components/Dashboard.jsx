import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  IndianRupee,
  Clock,
  Calendar,
  Package,
  AlertCircle,
} from "lucide-react";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    todayOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    recentOrders: [],
    topItems: [],
    lowStockItems: [],
    savedOrders: [],
  });

  useEffect(() => {
    // Load dashboard data from localStorage
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Get all orders from localStorage
    const orders = JSON.parse(localStorage.getItem("syncpos_orders") || "[]");
    const today = new Date().toDateString();

    // Filter today's orders
    const todayOrders = orders.filter(
      (order) => new Date(order.date).toDateString() === today
    );

    // Calculate metrics
    const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue =
      todayOrders.length > 0 ? todaySales / todayOrders.length : 0;

    // Get recent orders (last 5)
    const recentOrders = orders.slice(-5).reverse();

    // Calculate top items
    const itemCounts = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const topItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get low stock items from inventory (synced with Inventory component)
    const inventory = JSON.parse(
      localStorage.getItem("syncpos_inventory") || "[]"
    );
    const lowStockItems = inventory
      .filter((item) => item.currentStock <= item.minStock)
      .map((item) => ({
        name: item.name,
        stock: item.currentStock,
        minStock: item.minStock,
        unit: item.unit,
      }))
      .slice(0, 10); // Show up to 10 low stock items

    // Get saved orders
    const savedOrders = JSON.parse(
      localStorage.getItem("syncpos_pending_orders") || "[]"
    );

    setDashboardData({
      todaySales,
      todayOrders: todayOrders.length,
      averageOrderValue,
      totalCustomers: orders.length, // Using total orders as proxy for customers
      recentOrders,
      topItems,
      lowStockItems,
      savedOrders,
    });
  };

  const handleDeleteSavedOrder = (orderId) => {
    const savedOrders = JSON.parse(
      localStorage.getItem("syncpos_pending_orders") || "[]"
    );
    const updatedOrders = savedOrders.filter((order) => order.id !== orderId);
    localStorage.setItem(
      "syncpos_pending_orders",
      JSON.stringify(updatedOrders)
    );
    loadDashboardData();
  };

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  const StatCard = ({ icon: Icon, title, value, color = "gray" }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={IndianRupee}
            title="Today's Sales"
            value={formatCurrency(dashboardData.todaySales)}
            color="green"
          />
          <StatCard
            icon={ShoppingBag}
            title="Today's Orders"
            value={dashboardData.todayOrders}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Average Order Value"
            value={formatCurrency(dashboardData.averageOrderValue)}
            color="purple"
          />
          <StatCard
            icon={Users}
            title="Total Customers"
            value={dashboardData.totalCustomers}
            color="orange"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Orders & Saved Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <div
              className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col"
              style={{ maxHeight: "500px" }}
            >
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h2>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {dashboardData.recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet today</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {dashboardData.recentOrders.map((order, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {order.id?.slice(-2) || "01"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Order #{order.id?.slice(-4) || "1001"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.customer?.name || "Walk-in Customer"} •{" "}
                                {order.items?.length || 0} items
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(order.total || 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.date).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Saved Orders */}
            {dashboardData.savedOrders.length > 0 && (
              <div
                className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col"
                style={{ maxHeight: "400px" }}
              >
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Saved Orders ({dashboardData.savedOrders.length})
                    </h2>
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    {dashboardData.savedOrders.map((order, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {order.orderNumber?.toString().slice(-2) ||
                                  "01"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-xs text-gray-600">
                                {order.tableName} • {order.itemCount} items
                              </p>
                              <p className="text-xs text-gray-500">
                                Saved:{" "}
                                {new Date(order.savedAt).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatCurrency(order.total || 0)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteSavedOrder(order.id)}
                            className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Top Items */}
            <div
              className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col"
              style={{ maxHeight: "300px" }}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Top Items
                  </h2>
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {dashboardData.topItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    No sales data yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.topItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {item.count} sold
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div
              className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col"
              style={{ maxHeight: "300px" }}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Low Stock Alerts
                  </h2>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {dashboardData.lowStockItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      All stock levels are good!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      No items below minimum stock
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.lowStockItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-red-600">
                            {item.stock} {item.unit} left (Min: {item.minStock}{" "}
                            {item.unit})
                          </p>
                        </div>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
