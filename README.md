# GlowCraft 🌸 (React + Vite + JSON Server)

## تشغيل المشروع
```bash
npm install
npm run server     # JSON Server على http://localhost:3001
npm run dev        # React على http://localhost:5173
```
(افتحوا تيرمنالين: واحد للـ server وواحد للـ dev)

حسابات تجريبية:
- أدمن: `admin@glowcraft.com` / `Admin@123`
- يوزر: `eman@example.com` / `123456`

## توزيع الملفات على البرانشات

| رقم | البرانش | الملفات (جوه `src/`) |
|---|---|---|
| الأساس (الليدر على develop) | `develop` | `package.json`, `vite.config.js`, `index.html`, `db.json`, `main.jsx`, `App.jsx`, `index.css`, `services/api.js`, `utils/helpers.js`, `context/AuthContext.jsx`, `context/ShopContext.jsx`, `components/Layout`, `ProtectedRoute`, `ProductCard`, `ProductImage` |
| 1 | `feature/home-page` | `pages/Home/*` + `components/Navbar.jsx`, `components/Footer.jsx` |
| 2 | `feature/products` | `pages/Products/*` + `pages/ProductDetails/*` |
| 3 | `feature/routine-compare-wishlist` | `pages/RoutineFinder/*` + `pages/IngredientTracker/*` + `pages/Wishlist/*` (المقارنة جواها) |
| 4 | `feature/cart-checkout-orders` | `pages/Cart/*` + `pages/Checkout/*` + `pages/Orders/*` |
| 5 | `feature/auth-contact` | `pages/Login/*` + `pages/Register/*` + `pages/Contact/*` |
| 6 | `feature/profile-admin` | `pages/Profile/*` + `pages/Admin/*` |
| 7 | `feature/about-theme-i18n` | `pages/About/*` + `context/ThemeContext.jsx` + `context/LangContext.jsx` |

## قواعد مهمة
- أي نص في الواجهة يتكتب كده: `t('English', 'عربي')`، وبيانات المنتج: `pick(product, 'name')`.
- الألوان من متغيرات `index.css` (`var(--primary)` وغيره) عشان الدارك مود يشتغل.
- الاتصال بالـ API من `services/api.js` فقط.
- اللي يحتاج يعدل ملف مشترك (`index.css`, `App.jsx`, `helpers.js`) يكلم الليدر الأول.

## ملاحظة
الباسوردات في `db.json` نص عادي لأنه Fake API للتدريب فقط.
