import { Link } from 'react-router-dom'
import { useLang } from '../../context/LangContext'

export default function About() {
  const { t } = useLang()

  const values = [
    ['🌿', t('Natural ingredients', 'مكونات طبيعية'), t('Formulas built around gentle, skin-friendly ingredients.', 'تركيبات مبنية على مكونات لطيفة وصديقة للبشرة.')],
    ['🩺', t('Expert guidance', 'إرشاد متخصص'), t('Routines and tips shaped by skincare knowledge.', 'روتين ونصائح مبنية على معرفة بالعناية بالبشرة.')],
    ['💎', t('Trusted quality', 'جودة موثوقة'), t('Every product is checked before it reaches you.', 'كل منتج يُفحص قبل أن يصلك.')],
  ]

  const why = [
    t('High-quality products', 'منتجات عالية الجودة'),
    t('Personalized recommendations', 'ترشيحات مخصصة'),
    t('Safe and effective ingredients', 'مكونات آمنة وفعّالة'),
    t('A better, healthier you', 'نسخة أفضل وأكثر صحة منك'),
  ]

  return (
    <div className="container">
      <div className="card two-col" style={{ alignItems: 'center', padding: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.8rem' }}>{t('About GlowCraft', 'عن GlowCraft')}</h1>
          <p className="muted">
            {t(
              'GlowCraft is your personalised skincare shopping experience. We believe that healthy, glowing skin is not a luxury, it is a lifestyle.',
              'GlowCraft هي تجربتك الشخصية للتسوق في العناية بالبشرة. نؤمن أن البشرة الصحية المشرقة ليست رفاهية، بل أسلوب حياة.'
            )}
          </p>
          <Link to="/products" className="btn" style={{ marginTop: '1.2rem' }}>{t('Shop now', 'تسوقي الآن')}</Link>
        </div>
        <div className="center" style={{ fontSize: '7rem' }} aria-hidden="true">🧴🌸</div>
      </div>

      <section className="section two-col">
        <div>
          <h2 style={{ marginBottom: '0.6rem' }}>{t('Our mission', 'مهمتنا')}</h2>
          <p className="muted">
            {t(
              'To make skincare simple, accessible and personalised for everyone.',
              'أن نجعل العناية بالبشرة بسيطة ومتاحة ومخصصة للجميع.'
            )}
          </p>
        </div>
        <div>
          <h2 style={{ marginBottom: '0.6rem' }}>{t('Why choose us?', 'لماذا نحن؟')}</h2>
          {why.map((w) => <div key={w} className="check">✓ {w}</div>)}
        </div>
      </section>

      <section className="section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {values.map(([icon, title, text]) => (
          <div className="card center" key={title}>
            <div style={{ fontSize: '2rem' }}>{icon}</div>
            <h3 style={{ margin: '0.4rem 0' }}>{title}</h3>
            <p className="muted">{text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
