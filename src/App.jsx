import { CartProvider, useCart } from "./context/CartContext";

// Import components
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Customers from "./components/Customers";
import Inventory from "./components/Inventory";
import MenuManagement from "./components/MenuManagement";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Expenses from "./components/Expenses";
import PaymentModal from "./components/PaymentModal";
import BillSummary from "./components/BillSummary";
import ItemCustomizationModal from "./components/ItemCustomizationModal";
import { menuItems, menuCategories } from "./utils/menuData";
import { useState, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Boxes,
  Wallet,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  UserCircle,
  PlusCircle,
  Trash2,
  Menu,
  CreditCard,
  Search,
  ChefHat,
} from "lucide-react";

function POSLayout({ user, onLogout }) {
  const {
    itemCount,
    total,
    subtotal,
    gstAmount,
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    discount,
    applyDiscount,
    discountAmount,
  } = useCart();
  const [selectedTable, setSelectedTable] = useState("T-01");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [orderNumber] = useState(() => Math.floor(Math.random() * 9000) + 1000);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("orders");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBillSummary, setShowBillSummary] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] =
    useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [displayMenuItems, setDisplayMenuItems] = useState([]);

  // Load menu items from LocalStorage or use defaults
  useEffect(() => {
    const savedMenu = localStorage.getItem("syncpos_menu");
    if (savedMenu) {
      setDisplayMenuItems(JSON.parse(savedMenu));
    } else {
      setDisplayMenuItems(menuItems);
    }
  }, [currentView]); // Reload when view changes to pick up menu updates

  // Dummy table data (will come from backend)
  const tables = [
    { id: "T-01", name: "Table 01", status: "available" },
    { id: "T-02", name: "Table 02", status: "occupied" },
    { id: "T-03", name: "Table 03", status: "available" },
    { id: "T-04", name: "Table 04", status: "reserved" },
    { id: "TAKEAWAY", name: "Take Away", status: "available" },
    { id: "DELIVERY", name: "Delivery", status: "available" },
    { id: "Random", name: "Random", status: "available" },
  ];

  // Handle payment processing
  const handlePayment = () => {
    if (cartItems.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (orderData) => {
    setLastOrder(orderData);
    setShowBillSummary(true);
    clearCart();
  };

  // Handle item customization
  const handleItemClick = (item) => {
    if (item.customizations && Object.keys(item.customizations).length > 0) {
      // Ensure basePrice exists
      const itemWithBasePrice = {
        ...item,
        basePrice: item.basePrice || item.price,
        price: item.basePrice || item.price,
      };
      setSelectedItemForCustomization(itemWithBasePrice);
      setShowCustomizationModal(true);
    } else {
      addToCart(item);
    }
  };

  const handleCustomizedItemAdd = (customizedItem, quantity) => {
    for (let i = 0; i < quantity; i++) {
      addToCart(customizedItem);
    }
  };

  // Handle saving order (for later)
  const handleSaveOrder = () => {
    if (cartItems.length === 0) return;

    const savedOrder = {
      id: `ORD${orderNumber}`,
      orderNumber: orderNumber,
      table: selectedTable,
      tableName: tables.find((t) => t.id === selectedTable)?.name,
      items: cartItems,
      itemCount,
      subtotal,
      discount,
      discountAmount,
      gstAmount,
      total,
      status: "saved",
      savedAt: new Date().toISOString(),
    };

    // Save to pending orders
    const pendingOrders = JSON.parse(
      localStorage.getItem("syncpos_pending_orders") || "[]"
    );
    pendingOrders.push(savedOrder);
    localStorage.setItem(
      "syncpos_pending_orders",
      JSON.stringify(pendingOrders)
    );

    alert(
      `Order #${orderNumber} saved successfully!\nTable: ${savedOrder.tableName}\nYou can retrieve it later.`
    );
    clearCart();
  };

  // Handle printing KOT (Kitchen Order Ticket)
  const handlePrintKOT = () => {
    if (cartItems.length === 0) return;

    // Create KOT content
    const kotContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>KOT - Order #${orderNumber}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 10px; 
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px dashed #000; 
            padding-bottom: 10px; 
            margin-bottom: 10px;
          }
          .kot-title { 
            font-size: 20px; 
            font-weight: bold; 
            margin: 5px 0;
          }
          .info { 
            margin: 5px 0; 
          }
          .items { 
            margin: 10px 0; 
          }
          .item { 
            display: flex; 
            justify-content: space-between; 
            margin: 5px 0;
            padding: 5px 0;
            border-bottom: 1px solid #ddd;
          }
          .item-name { 
            font-weight: bold; 
          }
          .item-details {
            font-size: 11px;
            color: #555;
            margin-left: 20px;
          }
          .footer { 
            border-top: 2px dashed #000; 
            margin-top: 10px; 
            padding-top: 10px; 
            text-align: center;
          }
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="kot-title">KITCHEN ORDER TICKET</div>
          <div class="info"><strong>Order #:</strong> ${orderNumber}</div>
          <div class="info"><strong>Table:</strong> ${
            tables.find((t) => t.id === selectedTable)?.name
          }</div>
          <div class="info"><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
          <div class="info"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        </div>
        
        <div class="items">
          ${cartItems
            .map(
              (item) => `
            <div class="item">
              <div>
                <div class="item-name">${item.quantity}x ${item.name}</div>
                ${
                  item.customizationDisplay
                    ? `<div class="item-details">+ ${item.customizationDisplay}</div>`
                    : ""
                }
                ${
                  item.specialInstructions
                    ? `<div class="item-details" style="color: #d97706;">Note: ${item.specialInstructions}</div>`
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="footer">
          <div><strong>Total Items: ${itemCount}</strong></div>
          <div style="margin-top: 10px; font-size: 10px;">--- END OF KOT ---</div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #1f2937; color: white; border: none; border-radius: 5px;">Print KOT</button>
          <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #6b7280; color: white; border: none; border-radius: 5px; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;

    // Open in new window and print
    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(kotContent);
    printWindow.document.close();
  };

  const categories = menuCategories;

  // Use imported menu items from menuData.js

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SyncPOS</h1>
                <p className="text-xs text-gray-500">Point of Sale System</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-700">Table:</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-2 py-1 bg-white border border-gray-300 rounded-md text-xs text-gray-700 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all"
              >
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name}{" "}
                    {table.status === "occupied"
                      ? "(Occupied)"
                      : table.status === "reserved"
                      ? "(Reserved)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <UserCircle className="w-6 h-6 text-gray-600" />
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-900">
                  {user.username}
                </div>
                <div className="text-xs text-gray-500">
                  {user.role} • {user.shift}
                </div>
              </div>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <button className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-semibold hover:bg-gray-800 transition-all">
              Hold Order
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside
          className={`${
            sidebarExpanded ? "w-56" : "w-16"
          } bg-white border-r border-gray-200 transition-all duration-300`}
        >
          <nav className="p-3">
            <div className="space-y-1">
              {[
                { icon: ShoppingCart, label: "Orders", id: "orders" },
                { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
                { icon: Users, label: "Customers", id: "customers" },
                { icon: Boxes, label: "Inventory", id: "inventory" },
                { icon: ChefHat, label: "Menu", id: "menu" },
                { icon: Wallet, label: "Expenses", id: "expenses" },
                { icon: BarChart3, label: "Reports", id: "reports" },
                { icon: SettingsIcon, label: "Settings", id: "settings" },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center px-2.5 py-2 rounded-md text-left transition-all group ${
                    currentView === item.id
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarExpanded && (
                    <span className="ml-2.5 text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          {currentView === "dashboard" ? (
            <div className="flex-1 overflow-hidden">
              <Dashboard />
            </div>
          ) : currentView === "customers" ? (
            <div className="flex-1 overflow-hidden">
              <Customers />
            </div>
          ) : currentView === "inventory" ? (
            <div className="flex-1 overflow-hidden">
              <Inventory />
            </div>
          ) : currentView === "menu" ? (
            <div className="flex-1 overflow-hidden">
              <MenuManagement />
            </div>
          ) : currentView === "reports" ? (
            <div className="flex-1 overflow-hidden">
              <Reports />
            </div>
          ) : currentView === "settings" ? (
            <div className="flex-1 overflow-hidden">
              <Settings />
            </div>
          ) : currentView === "expenses" ? (
            <div className="flex-1 overflow-hidden">
              <Expenses />
            </div>
          ) : currentView === "orders" ? (
            <>
              {/* Orders Content */}
              <div className="flex-1 bg-gray-50">
                <div className="border-b border-gray-200 px-4 py-3 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex space-x-1.5">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            activeCategory === category.id
                              ? "bg-gray-900 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-7 pr-3 py-1.5 bg-gray-100 border-0 rounded-md text-xs text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:bg-white transition-all w-48"
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 overflow-y-auto"
                  style={{ height: "calc(100vh - 180px)" }}
                >
                  <div className="grid grid-cols-5 gap-3">
                    {displayMenuItems
                      .filter((item) => {
                        const matchesCategory =
                          activeCategory === "all" ||
                          item.category === activeCategory;
                        const matchesSearch =
                          searchQuery === "" ||
                          item.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          item.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        return matchesCategory && matchesSearch;
                      })
                      .map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md cursor-pointer transition-all group hover:border-gray-300"
                        >
                          <div className="aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ display: item.image ? "none" : "flex" }}
                            >
                              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                                <span className="text-sm text-white font-bold">
                                  {item.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900">
                              ₹{item.basePrice || item.price}
                            </span>
                            <button
                              onClick={() => handleItemClick(item)}
                              className="px-2 py-1 bg-gray-900 text-white rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-800 flex items-center space-x-1"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>
                                {item.customizations &&
                                Object.keys(item.customizations).length > 0
                                  ? "Customize"
                                  : "Add"}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Cart Sidebar - Only in Orders View */}
              <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                      Current Order
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-full">
                        {itemCount} items
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {tables.find((t) => t.id === selectedTable)?.name} • Order #
                    {orderNumber}
                  </div>
                </div>

                <div
                  className="flex-1 p-3 overflow-y-auto bg-gray-50"
                  style={{ maxHeight: "calc(100vh - 400px)" }}
                >
                  {itemCount === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm font-medium mb-1">
                        Cart is empty
                      </p>
                      <p className="text-gray-500 text-xs">
                        Add items from menu to start ordering
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {item.name}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Base: ₹{item.basePrice || item.price}
                              </p>
                              {item.customizationDisplay && (
                                <p className="text-xs text-blue-600 font-medium mt-1">
                                  + {item.customizationDisplay}
                                </p>
                              )}
                              {item.specialInstructions && (
                                <p className="text-xs text-orange-600 italic mt-1">
                                  Note: {item.specialInstructions}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-600 p-0.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.max(0, item.quantity - 1)
                                  )
                                }
                                className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all"
                              >
                                <span className="text-xs font-semibold">−</span>
                              </button>
                              <span className="text-xs font-semibold text-gray-900 min-w-[16px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all"
                              >
                                <span className="text-xs font-semibold">+</span>
                              </button>
                            </div>
                            <span className="font-bold text-gray-900 text-sm">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-semibold">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Discount ({discount}%)
                        </span>
                        <span className="text-green-600 font-semibold">
                          -₹{discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST (18%)</span>
                      <span className="text-gray-900 font-semibold">
                        ₹{gstAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-900 font-bold">Total</span>
                        <span className="text-gray-900 font-bold">
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Discount Input */}
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="number"
                        placeholder="Discount %"
                        value={discount || ""}
                        onChange={(e) =>
                          applyDiscount(
                            Math.max(
                              0,
                              Math.min(100, parseFloat(e.target.value) || 0)
                            )
                          )
                        }
                        className="flex-1 px-2 py-1 bg-gray-100 border-0 rounded-md text-xs text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:bg-white transition-all"
                        min="0"
                        max="100"
                      />
                      <button
                        onClick={() => applyDiscount(0)}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md text-xs transition-all"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Payment Method Selection */}
                    <div className="flex space-x-1 mb-2">
                      {["cash", "card", "upi"].map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                            paymentMethod === method
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {method.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={cartItems.length === 0}
                      className="w-full py-3 bg-gray-900 text-white rounded-md font-semibold text-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Now • ₹{total.toFixed(2)}</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleSaveOrder}
                        disabled={cartItems.length === 0}
                        className="py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-md text-xs font-semibold transition-all"
                      >
                        Save Order
                      </button>
                      <button
                        onClick={handlePrintKOT}
                        disabled={cartItems.length === 0}
                        className="py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-md text-xs font-semibold transition-all"
                      >
                        Print KOT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">🚧</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-500">
                  {currentView.charAt(0).toUpperCase() + currentView.slice(1)}{" "}
                  feature is under development
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={{
          items: cartItems,
          itemCount,
          subtotal,
          discount,
          discountAmount,
          gstAmount,
          total,
          table: tables.find((t) => t.id === selectedTable)?.name,
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ItemCustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        item={selectedItemForCustomization}
        onAddToCart={handleCustomizedItemAdd}
      />

      {showBillSummary && (
        <BillSummary
          order={lastOrder}
          onClose={() => setShowBillSummary(false)}
        />
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("syncpos_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("syncpos_user");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">S</span>
          </div>
          <p className="text-gray-600">Loading SyncPOS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <CartProvider>
        <POSLayout user={user} onLogout={handleLogout} />
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
