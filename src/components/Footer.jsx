import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo light">GlowCraft</div>
          <p>{t('Your skin. Our priority.', 'بشرتك أولويتنا.')}</p>
        </div>
        <div>
          <h4>{t('Quick links', 'روابط سريعة')}</h4>
          <Link to="/">{t('Home', 'الرئيسية')}</Link>
          <Link to="/products">{t('Products', 'المنتجات')}</Link>
          <Link to="/about">{t('About', 'من نحن')}</Link>
          <Link to="/contact">{t('Contact', 'تواصل معنا')}</Link>
        </div>
        <div>
          <h4>{t('Customer care', 'خدمة العملاء')}</h4>
          <Link to="/orders">{t('My orders', 'طلباتي')}</Link>
          <Link to="/contact">{t('Support', 'الدعم')}</Link>
          <Link to="/routine">{t('Find my routine', 'روتين بشرتك')}</Link>
        </div>
        <div>
          <h4>{t('Payment', 'طرق الدفع')}</h4>
          <p>{t('Cash on delivery · Fawry · Card', 'الدفع عند الاستلام - فوري - بطاقة')}</p>
        </div>
      </div>
      <div className="footer-bottom">© 2026 GlowCraft. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}</div>
    </footer>
  )
}
