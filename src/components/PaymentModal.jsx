import { useState } from "react";
import { X, CreditCard, Banknote, Smartphone, User, Phone } from "lucide-react";

function PaymentModal({ isOpen, onClose, orderData, onPaymentSuccess }) {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { id: "cash", name: "Cash", icon: Banknote, color: "green" },
    { id: "card", name: "Card", icon: CreditCard, color: "blue" },
    { id: "upi", name: "UPI/Digital", icon: Smartphone, color: "purple" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = "Customer name is required";
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(customerInfo.phone)) {
      newErrors.phone = "Enter valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const orderNumber = `ORD${Date.now().toString().slice(-6)}`;
      const order = {
        id: `ORD${Date.now()}`,
        orderNumber: orderNumber,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString(),
        items: orderData.items,
        subtotal: orderData.subtotal,
        discount: orderData.discount || 0,
        discountAmount: orderData.discountAmount || 0,
        gstAmount: orderData.gstAmount,
        total: orderData.total,
        customer: customerInfo,
        paymentMethod: paymentMethod,
        table: orderData.table,
        status: "completed",
      };

      // Save order to localStorage
      const existingOrders = JSON.parse(
        localStorage.getItem("syncpos_orders") || "[]"
      );
      existingOrders.push(order);
      localStorage.setItem("syncpos_orders", JSON.stringify(existingOrders));

      setIsProcessing(false);
      onPaymentSuccess(order);
      onClose();

      // Reset form
      setCustomerInfo({ name: "", phone: "", email: "" });
      setPaymentMethod("cash");
      setErrors({});
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Payment & Customer Info
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Items ({orderData.itemCount})
                </span>
                <span className="text-gray-900">
                  ₹{orderData.subtotal?.toFixed(2)}
                </span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Discount ({orderData.discount}%)
                  </span>
                  <span className="text-green-600">
                    -₹{orderData.discountAmount?.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">GST (18%)</span>
                <span className="text-gray-900">
                  ₹{orderData.gstAmount?.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  ₹{orderData.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    className={`w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all ${
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter customer name"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    className={`w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all ${
                      errors.phone
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  placeholder="Enter email for e-receipt"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Payment Method
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${
                    paymentMethod === method.id
                      ? `border-${method.color}-500 bg-${method.color}-50`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <method.icon
                    className={`w-5 h-5 ${
                      paymentMethod === method.id
                        ? `text-${method.color}-600`
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      paymentMethod === method.id
                        ? `text-${method.color}-700`
                        : "text-gray-600"
                    }`}
                  >
                    {method.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{orderData.total?.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
