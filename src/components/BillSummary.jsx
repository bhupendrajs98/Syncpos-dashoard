import React from "react";
import { X, Download, Share2, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BillSummary = ({ order, onClose }) => {
  if (!order) return null;

  const handleDownloadPDF = () => {
    // This will be implemented with jsPDF later
    alert("PDF download functionality will be implemented with jsPDF library");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById("invoice-content");
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`SyncPOS-Invoice-${order.orderNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `SyncPOS Invoice #${order.orderNumber}`,
        text: `Order total: ₹${order.total} - ${order.items.length} items`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      const shareText = `🧾 SyncPOS Invoice #${
        order.orderNumber
      }\n📅 ${new Date(order.timestamp).toLocaleString()}\n💰 Total: ₹${
        order.total
      }\n📱 Customer: ${order.customer.name} - ${order.customer.phone}`;
      navigator.clipboard.writeText(shareText);
      alert("Invoice details copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Invoice</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Content */}
        <div className="p-6" id="invoice-content">
          {/* Restaurant Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              SyncPOS Restaurant
            </h1>
            <p className="text-sm text-gray-600">
              123 Food Street, City - 400001
            </p>
            <p className="text-sm text-gray-600">Phone: +91 98765 43210</p>
            <p className="text-sm text-gray-600">GSTIN: 27AAAAA0000A1Z5</p>
          </div>

          {/* Invoice Details */}
          <div className="border-t border-b border-gray-200 py-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Invoice #</p>
                <p className="text-gray-600">{order.orderNumber}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Date</p>
                <p className="text-gray-600">
                  {new Date(order.timestamp).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Time</p>
                <p className="text-gray-600">
                  {new Date(order.timestamp).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Table</p>
                <p className="text-gray-600">{order.table || "Takeaway"}</p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Customer Details</h3>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {order.customer?.name}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {order.customer?.phone}
              </p>
              {order.customer?.email && (
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {order.customer?.email}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-3">Items Ordered</h3>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-600">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  ₹{order.subtotal?.toFixed(2)}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Discount ({order.discount}%)
                  </span>
                  <span className="text-green-600">
                    -₹{order.discountAmount?.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">CGST (9%)</span>
                <span className="text-gray-900">
                  ₹{(order.gstAmount / 2)?.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">SGST (9%)</span>
                <span className="text-gray-900">
                  ₹{(order.gstAmount / 2)?.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-gray-900">
                  ₹{order.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method</span>
              <span className="text-gray-900 font-medium capitalize">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Status</span>
              <span className="text-green-600 font-medium">Paid</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Thank you for your business!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Visit us again at SyncPOS Restaurant
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex space-x-2">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillSummary;
