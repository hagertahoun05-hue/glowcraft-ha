import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useShop } from '../context/ShopContext'

export default function Navbar() {
  const { t, lang, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { cartCount, wishlist } = useShop()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const links = [
    ['/', t('Home', 'الرئيسية')],
    ['/products', t('Products', 'المنتجات')],
    ['/routine', t('Routine Finder', 'روتين بشرتك')],
    ['/tracker', t('Ingredient Tracker', 'متتبع المكونات')],
    ['/about', t('About', 'من نحن')],
    ['/contact', t('Contact', 'تواصل معنا')],
  ]

  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>GlowCraft</Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={close}>
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={close}>{t('Dashboard', 'لوحة التحكم')}</NavLink>
          )}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="icon-btn text" onClick={toggleLang} aria-label="Toggle language">
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
            ♡{wishlist.length > 0 && <span className="count">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            🛒{cartCount > 0 && <span className="count">{cartCount}</span>}
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="icon-btn text user-chip">
                {user.name.split(' ')[0]}
              </Link>
              <button className="btn btn-sm btn-outline" onClick={handleLogout}>
                {t('Logout', 'خروج')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-outline">{t('Login', 'دخول')}</Link>
              <Link to="/register" className="btn btn-sm hide-sm">{t('Register', 'حساب جديد')}</Link>
            </>
          )}

          <button className="icon-btn burger" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        </div>
      </div>
    </header>
  )
}
