import { useState, useEffect } from "react";
import { User, Phone, Mail, Calendar, Search, Plus } from "lucide-react";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    // Extract unique customers from orders
    const orders = JSON.parse(localStorage.getItem("syncpos_orders") || "[]");
    const uniqueCustomers = [];
    const phoneNumbers = new Set();

    orders.forEach((order) => {
      if (
        order.customer &&
        order.customer.phone &&
        !phoneNumbers.has(order.customer.phone)
      ) {
        phoneNumbers.add(order.customer.phone);
        uniqueCustomers.push({
          ...order.customer,
          lastOrder: order.date,
          totalOrders: orders.filter(
            (o) => o.customer?.phone === order.customer.phone
          ).length,
          totalSpent: orders
            .filter((o) => o.customer?.phone === order.customer.phone)
            .reduce((sum, o) => sum + o.total, 0),
        });
      }
    });

    setCustomers(uniqueCustomers);
  };

  const validateCustomer = () => {
    const newErrors = {};

    if (!newCustomer.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!newCustomer.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(newCustomer.phone)) {
      newErrors.phone = "Enter valid 10-digit phone number";
    }

    if (
      newCustomer.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)
    ) {
      newErrors.email = "Enter valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCustomer = () => {
    if (!validateCustomer()) return;

    // Create a dummy order for this customer
    const order = {
      id: `CUST${Date.now()}`,
      date: new Date().toISOString(),
      customer: newCustomer,
      items: [],
      total: 0,
      subtotal: 0,
      gstAmount: 0,
      status: "customer-only",
    };

    // Save to orders
    const existingOrders = JSON.parse(
      localStorage.getItem("syncpos_orders") || "[]"
    );
    existingOrders.push(order);
    localStorage.setItem("syncpos_orders", JSON.stringify(existingOrders));

    // Reload customers
    loadCustomers();

    // Reset form
    setNewCustomer({ name: "", phone: "", email: "" });
    setErrors({});
    setShowAddCustomer(false);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">Manage your customer database</p>
        </div>
        <button
          onClick={() => setShowAddCustomer(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
      </div>

      {/* Customers List */}
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        style={{ maxHeight: "600px" }}
      >
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No customers found</p>
            <p className="text-sm text-gray-400">
              {customers.length === 0
                ? "Customers will appear here after their first order"
                : "Try adjusting your search query"}
            </p>
          </div>
        ) : (
          <div
            className="divide-y divide-gray-200 overflow-y-auto"
            style={{ maxHeight: "600px" }}
          >
            {filteredCustomers.map((customer, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-sm text-white font-bold">
                        {customer.name?.charAt(0)?.toUpperCase() || "C"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {customer.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">
                          {customer.totalOrders}
                        </p>
                        <p className="text-gray-500">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">
                          ₹{customer.totalSpent.toFixed(0)}
                        </p>
                        <p className="text-gray-500">Total Spent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">
                          {new Date(customer.lastOrder).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500">Last Order</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-xl font-bold text-gray-900">
                {customers.length}
              </p>
            </div>
            <User className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Orders/Customer</p>
              <p className="text-xl font-bold text-gray-900">
                {customers.length > 0
                  ? (
                      customers.reduce((sum, c) => sum + c.totalOrders, 0) /
                      customers.length
                    ).toFixed(1)
                  : "0"}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Spend/Customer</p>
              <p className="text-xl font-bold text-gray-900">
                ₹
                {customers.length > 0
                  ? (
                      customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                      customers.length
                    ).toFixed(0)
                  : "0"}
              </p>
            </div>
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add New Customer
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter customer name"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                      errors.phone
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="customer@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddCustomer(false);
                    setNewCustomer({ name: "", phone: "", email: "" });
                    setErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
