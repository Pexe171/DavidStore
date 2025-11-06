import { createContext, useContext, useMemo, useReducer } from 'react'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((item) => item.id === action.payload.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload)
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    default:
      return state
  }
}

const initialState = {
  items: []
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const value = useMemo(() => {
    const total = state.items.reduce(
      (acc, item) => acc + item.quantity * item.finalPrice,
      0
    )
    return {
      items: state.items,
      total,
      addItem: (product, quantity = 1) =>
        dispatch({
          type: 'ADD_ITEM',
          payload: {
            id: product.id,
            name: product.name,
            image: product.images?.[0],
            finalPrice: product.finalPrice,
            quantity
          }
        }),
      removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' })
    }
  }, [state.items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
