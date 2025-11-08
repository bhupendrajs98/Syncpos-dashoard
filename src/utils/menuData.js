// Sample menu data for a food outlet/cafe
export const menuCategories = [
  {
    id: 'all',
    name: 'All',
    icon: '🍽️'
  },
  {
    id: 'pizzas',
    name: 'Pizzas',
    icon: '🍕'
  },
  {
    id: 'burgers',
    name: 'Burgers',
    icon: '🍔'
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🥤'
  },
  {
    id: 'desserts',
    name: 'Desserts',
    icon: '🍰'
  }
];

export const menuItems = [
  // Pizzas
  {
    id: 'pizza_margherita',
    name: 'Margherita Pizza',
    category: 'pizzas',
    basePrice: 299,
    price: 299,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    customizations: {
      size: [
        { name: 'Regular', price: 0 },
        { name: 'Medium', price: 50 },
        { name: 'Large', price: 100 }
      ],
      crust: [
        { name: 'Thin Crust', price: 0 },
        { name: 'Thick Crust', price: 30 }
      ],
      toppings: [
        { name: 'Extra Cheese', price: 40 },
        { name: 'Mushrooms', price: 30 },
        { name: 'Olives', price: 25 },
        { name: 'Bell Peppers', price: 20 }
      ]
    }
  },
  {
    id: 'pizza_pepperoni',
    name: 'Pepperoni Pizza',
    category: 'pizzas',
    basePrice: 399,
    price: 399,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop',
    description: 'Pepperoni slices with mozzarella cheese and tomato sauce',
    customizations: {
      size: [
        { name: 'Regular', price: 0 },
        { name: 'Medium', price: 50 },
        { name: 'Large', price: 100 }
      ],
      crust: [
        { name: 'Thin Crust', price: 0 },
        { name: 'Thick Crust', price: 30 }
      ],
      toppings: [
        { name: 'Extra Cheese', price: 40 },
        { name: 'Extra Pepperoni', price: 60 },
        { name: 'Jalapeños', price: 25 }
      ]
    }
  },

  // Burgers
  {
    id: 'burger_classic',
    name: 'Classic Beef Burger',
    category: 'burgers',
    basePrice: 249,
    price: 249,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    customizations: {
      patty: [
        { name: 'Single', price: 0 },
        { name: 'Double', price: 80 }
      ],
      cheese: [
        { name: 'No Cheese', price: 0 },
        { name: 'American Cheese', price: 30 },
        { name: 'Cheddar Cheese', price: 35 }
      ],
      extras: [
        { name: 'Bacon', price: 50 },
        { name: 'Avocado', price: 40 },
        { name: 'Mushrooms', price: 25 }
      ]
    }
  },
  {
    id: 'burger_chicken',
    name: 'Grilled Chicken Burger',
    category: 'burgers',
    basePrice: 229,
    price: 229,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=400&fit=crop',
    description: 'Grilled chicken breast with fresh vegetables and mayo',
    customizations: {
      style: [
        { name: 'Grilled', price: 0 },
        { name: 'Crispy', price: 20 }
      ],
      cheese: [
        { name: 'No Cheese', price: 0 },
        { name: 'American Cheese', price: 30 }
      ],
      extras: [
        { name: 'Avocado', price: 40 },
        { name: 'Extra Sauce', price: 10 }
      ]
    }
  },

  // Beverages
  {
    id: 'beverage_coke',
    name: 'Coca Cola',
    category: 'beverages',
    basePrice: 49,
    price: 49,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
    description: 'Refreshing cola drink',
    customizations: {
      size: [
        { name: 'Regular', price: 0 },
        { name: 'Large', price: 20 }
      ],
      ice: [
        { name: 'Regular Ice', price: 0 },
        { name: 'Extra Ice', price: 0 },
        { name: 'No Ice', price: 0 }
      ]
    }
  },
  {
    id: 'beverage_coffee',
    name: 'Cappuccino',
    category: 'beverages',
    basePrice: 89,
    price: 89,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
    description: 'Rich espresso with steamed milk and foam',
    customizations: {
      size: [
        { name: 'Small', price: 0 },
        { name: 'Medium', price: 20 },
        { name: 'Large', price: 40 }
      ],
      extras: [
        { name: 'Extra Shot', price: 25 },
        { name: 'Decaf', price: 0 },
        { name: 'Extra Foam', price: 10 }
      ]
    }
  },

  // Desserts
  {
    id: 'dessert_brownie',
    name: 'Chocolate Brownie',
    category: 'desserts',
    basePrice: 129,
    price: 129,
    image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=400&fit=crop',
    description: 'Rich chocolate brownie with nuts',
    customizations: {
      serving: [
        { name: 'Regular', price: 0 },
        { name: 'With Ice Cream', price: 40 }
      ],
      extras: [
        { name: 'Extra Chocolate', price: 20 },
        { name: 'Whipped Cream', price: 15 }
      ]
    }
  }
];

// Get items by category
export const getItemsByCategory = (categoryId) => {
  return menuItems.filter(item => item.category === categoryId);
};

// Calculate item price with customizations
export const calculateItemPrice = (item, selectedCustomizations = {}) => {
  let totalPrice = item.basePrice;
  
  Object.entries(selectedCustomizations).forEach(([customizationType, selectedOptions]) => {
    if (Array.isArray(selectedOptions)) {
      selectedOptions.forEach(option => {
        totalPrice += option.price || 0;
      });
    } else if (selectedOptions) {
      totalPrice += selectedOptions.price || 0;
    }
  });
  
  return totalPrice;
};