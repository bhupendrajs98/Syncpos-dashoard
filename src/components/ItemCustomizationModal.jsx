import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

function ItemCustomizationModal({ isOpen, onClose, item, onAddToCart }) {
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  if (!isOpen || !item) return null;

  const handleCustomizationChange = (category, option) => {
    setSelectedCustomizations((prev) => {
      const current = prev[category] || [];
      const isSelected = current.some((c) => c.name === option.name);

      if (isSelected) {
        // Remove option
        return {
          ...prev,
          [category]: current.filter((c) => c.name !== option.name),
        };
      } else {
        // Add option
        return {
          ...prev,
          [category]: [...current, option],
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    let baseTotal = item.basePrice * quantity;
    let customizationTotal = 0;

    Object.values(selectedCustomizations).forEach((options) => {
      if (Array.isArray(options)) {
        options.forEach((option) => {
          customizationTotal += option.price * quantity;
        });
      }
    });

    return {
      baseTotal,
      customizationTotal,
      total: baseTotal + customizationTotal,
    };
  };

  const prices = calculateTotalPrice();

  const handleAddToCart = () => {
    const prices = calculateTotalPrice();
    const customizedItem = {
      ...item,
      price: prices.total / quantity, // Price per item with customizations
      basePrice: item.basePrice,
      customizations: selectedCustomizations,
      specialInstructions,
      customizationDisplay: Object.entries(selectedCustomizations)
        .map(([category, options]) =>
          Array.isArray(options)
            ? options.map((opt) => opt.name).join(", ")
            : ""
        )
        .filter(Boolean)
        .join(" • "),
    };

    onAddToCart(customizedItem, quantity);
    onClose();

    // Reset form
    setSelectedfCustomizations({});
    setQuantity(1);
    setSpecialInstructions("");
  };

  return (
    <div className="fixed inset-0 bg-transparant bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Base Price */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Base Price
              </span>
              <span className="text-lg font-bold text-gray-900">
                ₹{item.basePrice} × {quantity} = ₹{prices.baseTotal}
              </span>
            </div>
            {prices.customizationTotal > 0 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-blue-700">
                  Customizations
                </span>
                <span className="text-sm font-bold text-blue-700">
                  +₹{prices.customizationTotal}
                </span>
              </div>
            )}
          </div>

          {/* Customizations */}
          {item.customizations &&
            Object.entries(item.customizations).map(([category, options]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                  {category}
                </h3>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedCustomizations[category]?.some(
                              (c) => c.name === option.name
                            ) || false
                          }
                          onChange={() =>
                            handleCustomizationChange(category, option)
                          }
                          className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {option.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {option.price > 0 ? `+₹${option.price}` : "Free"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

          {/* Special Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              rows="3"
              placeholder="Any special requests or modifications..."
            />
          </div>

          {/* Quantity & Total */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Quantity
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ₹{prices.total}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex space-x-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Add to Cart • ₹{prices.total}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemCustomizationModal;
