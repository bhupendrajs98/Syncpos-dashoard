import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  APPLY_DISCOUNT: 'APPLY_DISCOUNT'
};

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      const cartId = Date.now() + Math.random();
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1, cartId }]
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        discount: 0
      };

    case CART_ACTIONS.APPLY_DISCOUNT:
      return {
        ...state,
        discount: action.payload.discount
      };

    default:
      return state;
  }
}

// Initial state
const initialState = {
  items: [],
  discount: 0
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('syncpos_cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      cartData.items.forEach(item => {
        dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: item });
      });
      if (cartData.discount) {
        dispatch({ type: CART_ACTIONS.APPLY_DISCOUNT, payload: { discount: cartData.discount } });
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('syncpos_cart', JSON.stringify(state));
  }, [state]);

  // Calculate totals
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * state.discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * 0.18; // 18% GST
  const total = taxableAmount + gstAmount;

  // Cart actions
  const addItem = (item) => {
    dispatch({ 
      type: CART_ACTIONS.ADD_ITEM, 
      payload: item 
    });
  };

  const removeItem = (id) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { id } });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const applyDiscount = (discount) => {
    dispatch({ type: CART_ACTIONS.APPLY_DISCOUNT, payload: { discount } });
  };

  const value = {
    cartItems: state.items,
    items: state.items,
    discount: state.discount,
    subtotal,
    discountAmount,
    gstAmount,
    total,
    itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
    addToCart: addItem,
    addItem,
    removeFromCart: removeItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}