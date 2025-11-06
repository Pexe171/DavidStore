'use client'

import { createContext, useContext, useMemo, useReducer } from 'react'
import type { FC, ReactNode } from 'react'

import type { Product } from '@/services/api'

type ProductSummary = Pick<Product, 'id' | 'name' | 'images' | 'finalPrice'>

type CartItem = {
  id: string
  name: string
  image?: string
  finalPrice: number
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }

type CartContextValue = {
  items: CartItem[]
  total: number
  addItem: (product: ProductSummary, quantity?: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
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

const initialState: CartState = {
  items: []
}

type CartProviderProps = {
  children: ReactNode
}

export const CartProvider: FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const value = useMemo<CartContextValue>(() => {
    const total = state.items.reduce((acc, item) => acc + item.quantity * item.finalPrice, 0)
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

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider')
  }

  return context
}
