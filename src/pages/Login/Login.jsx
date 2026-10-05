import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { isEmail } from '../../utils/helpers'

export default function Login() {
  const { t } = useLang()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!isEmail(form.email)) errs.email = t('Enter a valid email address.', 'اكتبي بريدًا إلكترونيًا صحيحًا.')
    if (form.password.length < 6) errs.password = t('Password must be at least 6 characters.', 'كلمة المرور 6 أحرف على الأقل.')
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setServerError('')
    try {
      const user = await login(form.email, form.password)
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/'), { replace: true })
    } catch (err) {
      setServerError(
        err.message === 'Invalid email or password'
          ? t('Wrong email or password.', 'البريد أو كلمة المرور غير صحيحة.')
          : t('Could not reach the server. Is JSON Server running?', 'تعذر الاتصال بالسيرفر. هل JSON Server شغال؟')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card" onSubmit={submit} noValidate>
        <h1>{t('Welcome back', 'أهلًا بعودتك')}</h1>
        <p className="muted" style={{ marginBottom: '1.2rem' }}>{t('Sign in to your GlowCraft account', 'سجّلي الدخول إلى حسابك في GlowCraft')}</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
          <label htmlFor="email">{t('Email address', 'البريد الإلكتروني')}</label>
          <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>

        <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
          <label htmlFor="password">{t('Password', 'كلمة المرور')}</label>
          <input id="password" type="password" value={form.password} onChange={set('password')} autoComplete="current-password" />
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>

        <button className="btn btn-block" disabled={loading}>{loading ? t('Signing in...', 'جاري الدخول...') : t('Login', 'تسجيل الدخول')}</button>

        <p className="muted center" style={{ marginTop: '1rem' }}>
          {t("Don't have an account?", 'ليس لديك حساب؟')} <Link to="/register" className="link-btn">{t('Register', 'أنشئي حسابًا')}</Link>
        </p>
      </form>
    </div>
  )
}
