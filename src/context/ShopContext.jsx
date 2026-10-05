import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { finalPrice } from '../utils/helpers'

const ShopContext = createContext(null)

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}

export function ShopProvider({ children }) {
  const { user } = useAuth()
  const uid = user ? user.id : 'guest'

  const [cart, setCart] = useState(() => read('cart'))
  const [compare, setCompare] = useState(() => read('compare'))
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    setWishlist(read(`wishlist_${uid}`))
  }, [uid])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('compare', JSON.stringify(compare))
  }, [compare])

  // ---------- cart ----------
  const addToCart = (p, qty = 1) =>
    setCart((prev) => {
      const exists = prev.find((i) => i.id === p.id)
      if (exists) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i))
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          nameAr: p.nameAr,
          price: finalPrice(p),
          emoji: p.emoji,
          color: p.color,
          image: p.image,
          qty,
        },
      ]
    })

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id))

  const setQty = (id, qty) =>
    setCart((prev) =>
      qty < 1 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    )

  const clearCart = () => setCart([])
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  // ---------- wishlist ----------
  const toggleWishlist = (id) => {
    const next = wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id]
    setWishlist(next)
    localStorage.setItem(`wishlist_${uid}`, JSON.stringify(next))
  }

  // ---------- compare (max 3) ----------
  const toggleCompare = (id) => {
    if (compare.includes(id)) {
      setCompare(compare.filter((x) => x !== id))
      return true
    }
    if (compare.length >= 3) return false
    setCompare([...compare, id])
    return true
  }

  return (
    <ShopContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        setQty,
        clearCart,
        wishlist,
        toggleWishlist,
        compare,
        toggleCompare,
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export const useShop = () => useContext(ShopContext)
