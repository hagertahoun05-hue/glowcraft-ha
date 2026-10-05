import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { isEmail, isPhone } from '../../utils/helpers'

export default function Profile() {
  const { t } = useLang()
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    const errs = {}
    if (form.name.trim().length < 3) errs.name = t('Name must be at least 3 characters.', 'الاسم 3 أحرف على الأقل.')
    if (!isEmail(form.email)) errs.email = t('Enter a valid email address.', 'اكتبي بريدًا إلكترونيًا صحيحًا.')
    if (form.phone && !isPhone(form.phone)) errs.phone = t('Enter a valid Egyptian mobile number.', 'اكتبي رقم موبايل مصري صحيح.')
    setErrors(errs)
    setStatus('')
    if (Object.keys(errs).length) return

    try {
      await updateUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      })
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }

  const field = (name, label, type = 'text') => (
    <div className={`form-group ${errors[name] ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} type={type} value={form[name]} onChange={set(name)} />
      {errors[name] && <div className="error-text">{errors[name]}</div>}
    </div>
  )

  return (
    <div className="container">
      <div className="page-head"><h1>{t('My profile', 'حسابي')}</h1></div>

      <div className="sidebar-layout">
        <aside className="card stack">
          <div>
            <strong>{user.name}</strong>
            <div className="muted" style={{ fontSize: '0.85rem' }}>{user.email}</div>
          </div>
          <Link to="/orders" className="btn btn-outline btn-block">{t('My orders', 'طلباتي')}</Link>
          <Link to="/wishlist" className="btn btn-outline btn-block">{t('Wishlist', 'المفضلة')}</Link>
          <Link to="/tracker" className="btn btn-outline btn-block">{t('Expiry tracker', 'متتبع الصلاحية')}</Link>
          <button className="btn btn-danger btn-block" onClick={() => { logout(); navigate('/') }}>{t('Logout', 'تسجيل الخروج')}</button>
        </aside>

        <form className="card" onSubmit={save} noValidate>
          <h3 style={{ marginBottom: '1rem' }}>{t('Edit profile', 'تعديل البيانات')}</h3>
          {status === 'ok' && <div className="alert alert-success">{t('Changes saved.', 'تم حفظ التغييرات.')}</div>}
          {status === 'error' && <div className="alert alert-error">{t('Could not save changes. Is JSON Server running?', 'تعذر حفظ التغييرات. هل JSON Server شغال؟')}</div>}
          {field('name', t('Full name', 'الاسم بالكامل'))}
          {field('email', t('Email address', 'البريد الإلكتروني'), 'email')}
          {field('phone', t('Phone number', 'رقم الموبايل'), 'tel')}
          {field('address', t('Address', 'العنوان'))}
          <button className="btn">{t('Save changes', 'حفظ التغييرات')}</button>
        </form>
      </div>
    </div>
  )
}
