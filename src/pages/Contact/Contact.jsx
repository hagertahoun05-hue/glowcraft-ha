import { useState } from 'react'
import api from '../../services/api'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { isEmail, today } from '../../utils/helpers'

export default function Contact() {
  const { t } = useLang()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (form.name.trim().length < 3) errs.name = t('Enter your name.', 'اكتبي اسمك.')
    if (!isEmail(form.email)) errs.email = t('Enter a valid email address.', 'اكتبي بريدًا إلكترونيًا صحيحًا.')
    if (form.subject.trim().length < 3) errs.subject = t('Enter a subject.', 'اكتبي عنوان الرسالة.')
    if (form.message.trim().length < 10) errs.message = t('Message must be at least 10 characters.', 'الرسالة 10 أحرف على الأقل.')
    setErrors(errs)
    setStatus('')
    if (Object.keys(errs).length) return

    setSending(true)
    try {
      await api.post('/messages', { ...form, userId: user?.id || null, date: today() })
      setStatus('ok')
      setForm({ ...form, subject: '', message: '' })
    } catch {
      setStatus('error')
    } finally {
      setSending(false)
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
      <div className="page-head">
        <h1>{t('Get in touch', 'تواصلي معنا')}</h1>
        <p>{t("We'd love to hear from you!", 'يسعدنا سماع رأيك!')}</p>
      </div>

      <div className="two-col">
        <form className="card" onSubmit={submit} noValidate>
          {status === 'ok' && <div className="alert alert-success">{t('Message sent. We will get back to you soon.', 'تم إرسال رسالتك. سنرد عليك قريبًا.')}</div>}
          {status === 'error' && <div className="alert alert-error">{t('Could not send your message. Is JSON Server running?', 'تعذر إرسال الرسالة. هل JSON Server شغال؟')}</div>}

          {field('name', t('Name', 'الاسم'))}
          {field('email', t('Email', 'البريد الإلكتروني'), 'email')}
          {field('subject', t('Subject', 'العنوان'))}
          <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
            <label htmlFor="message">{t('Message', 'الرسالة')}</label>
            <textarea id="message" value={form.message} onChange={set('message')} />
            {errors.message && <div className="error-text">{errors.message}</div>}
          </div>
          <button className="btn btn-block" disabled={sending}>{sending ? t('Sending...', 'جاري الإرسال...') : t('Send message', 'إرسال')}</button>
        </form>

        <div className="stack">
          <div className="card"><strong>📍 {t('Our location', 'موقعنا')}</strong><p className="muted">{t('Cairo, Egypt', 'القاهرة، مصر')}</p></div>
          <div className="card"><strong>✉️ {t('Email us', 'راسلينا')}</strong><p className="muted">support@glowcraft.com</p></div>
          <div className="card"><strong>📞 {t('Call us', 'اتصلي بنا')}</strong><p className="muted" dir="ltr">+20 123 456 789</p></div>
        </div>
      </div>
    </div>
  )
}
