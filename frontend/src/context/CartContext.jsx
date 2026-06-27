/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("canteen.cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [slot, setSlot] = useState(() => {
    return localStorage.getItem("canteen.slot") || "";
  });

  useEffect(() => {
    localStorage.setItem("canteen.cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (slot) {
      localStorage.setItem("canteen.slot", slot);
    } else {
      localStorage.removeItem("canteen.slot");
    }
  }, [slot]);

  const addToCart = (food) => {
    if (food.inStock === false) return false;
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === food._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === food._id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [
          ...prevCart,
          {
            _id: food._id,
            name: food.name,
            price: food.price,
            category: food.category,
            image: food.image,
            qty: 1,
          },
        ];
      }
    });
    return true;
  };

  const updateQty = (foodId, qty) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item._id === foodId ? { ...item, qty: Number(qty) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (foodId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== foodId));
  };

  const clearCart = () => {
    setCart([]);
    setSlot("");
    localStorage.removeItem("canteen.cart");
    localStorage.removeItem("canteen.slot");
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.qty, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.qty, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        slot,
        setSlot,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;