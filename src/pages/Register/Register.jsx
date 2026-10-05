import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { isEmail } from '../../utils/helpers'

export default function Register() {
  const { t } = useLang()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (form.name.trim().length < 3) errs.name = t('Name must be at least 3 characters.', 'الاسم 3 أحرف على الأقل.')
    if (!isEmail(form.email)) errs.email = t('Enter a valid email address.', 'اكتبي بريدًا إلكترونيًا صحيحًا.')
    if (form.password.length < 6) errs.password = t('Password must be at least 6 characters.', 'كلمة المرور 6 أحرف على الأقل.')
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      errs.password = t('Use letters and numbers.', 'استخدمي حروفًا وأرقامًا.')
    if (form.confirm !== form.password) errs.confirm = t('Passwords do not match.', 'كلمتا المرور غير متطابقتين.')
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setServerError('')
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(
        err.message === 'This email is already registered'
          ? t('This email is already registered.', 'هذا البريد مسجل بالفعل.')
          : t('Could not reach the server. Is JSON Server running?', 'تعذر الاتصال بالسيرفر. هل JSON Server شغال؟')
      )
    } finally {
      setLoading(false)
    }
  }

  const field = (name, label, type = 'text', auto) => (
    <div className={`form-group ${errors[name] ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} type={type} value={form[name]} onChange={set(name)} autoComplete={auto} />
      {errors[name] && <div className="error-text">{errors[name]}</div>}
    </div>
  )

  return (
    <div className="auth-wrap">
      <form className="card" onSubmit={submit} noValidate>
        <h1>{t('Create your account', 'أنشئي حسابك')}</h1>
        <p className="muted" style={{ marginBottom: '1.2rem' }}>{t('Join GlowCraft for a better skincare journey', 'انضمي إلى GlowCraft لرحلة عناية أفضل')}</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        {field('name', t('Full name', 'الاسم بالكامل'), 'text', 'name')}
        {field('email', t('Email address', 'البريد الإلكتروني'), 'email', 'email')}
        {field('password', t('Password', 'كلمة المرور'), 'password', 'new-password')}
        {field('confirm', t('Confirm password', 'تأكيد كلمة المرور'), 'password', 'new-password')}

        <button className="btn btn-block" disabled={loading}>{loading ? t('Creating...', 'جاري الإنشاء...') : t('Create account', 'إنشاء الحساب')}</button>

        <p className="muted center" style={{ marginTop: '1rem' }}>
          {t('Already have an account?', 'لديك حساب بالفعل؟')} <Link to="/login" className="link-btn">{t('Login', 'تسجيل الدخول')}</Link>
        </p>
      </form>
    </div>
  )
}
