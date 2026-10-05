import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home/Home'
import Products from './pages/Products/Products'
import ProductDetails from './pages/ProductDetails/ProductDetails'
import RoutineFinder from './pages/RoutineFinder/RoutineFinder'
import IngredientTracker from './pages/IngredientTracker/IngredientTracker'
import Wishlist from './pages/Wishlist/Wishlist'
import Cart from './pages/Cart/Cart'
import Checkout from './pages/Checkout/Checkout'
import Orders from './pages/Orders/Orders'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Contact from './pages/Contact/Contact'
import Profile from './pages/Profile/Profile'
import Admin from './pages/Admin/Admin'
import About from './pages/About/About'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* public (guest + logged in) */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/routine" element={<RoutineFinder />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* logged in only */}
        <Route path="/tracker" element={<ProtectedRoute><IngredientTracker /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* admin only */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

        <Route path="*" element={<div className="container empty"><h2>404</h2></div>} />
      </Route>
    </Routes>
  )
}
