import styles from './landing.module.css'

export const metadata = {
  title: 'FlowTime – AI Time Planner for Freelancers',
  description: 'Stop losing track of time. FlowTime uses AI to plan your day, track your hours, and keep you on top of deadlines.',
}

export default function Landing() {
  return (
    <div className={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: #111118; }
      `}</style>

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>⚡</div>
            FlowTime
          </div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className={styles.navCta}>
            <a href="/login" className={styles.btnOutline}>Sign in</a>
            <a href="/login" className={styles.btnPrimary}>Start free →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>✦ AI-powered · Free to start</div>
        <h1 className={styles.heroTitle}>
          The AI planner built<br/>for <span className={styles.accent}>freelancers</span>
        </h1>
        <p className={styles.heroSub}>
          Stop guessing where your time goes. FlowTime tracks your hours, plans your day with AI, and keeps you on top of every deadline — automatically.
        </p>
        <div className={styles.heroCtas}>
          <a href="/login" className={styles.btnPrimaryLg}>Start for free →</a>
          <a href="#features" className={styles.btnGhostLg}>See how it works</a>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}><span>100%</span> Automated</div>
          <div className={styles.statDivider}/>
          <div className={styles.stat}><span>3</span> Languages</div>
          <div className={styles.statDivider}/>
          <div className={styles.stat}><span>AI</span> Scheduling</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features} id="features">
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>Everything a freelancer needs</h2>
        <div className={styles.featureGrid}>
          {[
            { icon:'✦', title:'AI Day Planner', desc:'Describe your tasks and constraints. AI builds your optimal daily schedule in seconds.' },
            { icon:'◷', title:'Time Tracker', desc:'Track hours per client and project. Know exactly where your time goes — no manual logging.' },
            { icon:'☑', title:'Smart Tasks', desc:'Prioritize by deadline and urgency. Never miss an important task again.' },
            { icon:'◎', title:'Deadline Alerts', desc:'Visual deadline tracking with urgency indicators. Stay ahead of every delivery.' },
            { icon:'◈', title:'Project Overview', desc:'See progress, hours logged, and deadlines for all your active projects at a glance.' },
            { icon:'🌙', title:'Dark & Light Mode', desc:'Works the way you work — switch between themes and choose your language.' },
          ].map((f,i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionLabel}>Pricing</div>
        <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <div className={styles.pricingPlan}>Free</div>
            <div className={styles.pricingPrice}><span>$0</span>/month</div>
            <div className={styles.pricingDesc}>Perfect for getting started</div>
            <ul className={styles.pricingFeatures}>
              <li>✓ Up to 10 tasks</li>
              <li>✓ 2 active projects</li>
              <li>✓ Basic time tracking</li>
              <li>✓ 3 AI plans per day</li>
            </ul>
            <a href="/login" className={styles.btnOutlineFull}>Get started free</a>
          </div>
          <div className={`${styles.pricingCard} ${styles.pricingCardPro}`}>
            <div className={styles.pricingBadge}>Most popular</div>
            <div className={styles.pricingPlan}>Pro</div>
            <div className={styles.pricingPrice}><span>$6.99</span>/month</div>
            <div className={styles.pricingDesc}>For serious freelancers</div>
            <ul className={styles.pricingFeatures}>
              <li>✓ Unlimited tasks & projects</li>
              <li>✓ Unlimited AI day plans</li>
              <li>✓ Advanced time tracking</li>
              <li>✓ Deadline alerts</li>
              <li>✓ Priority support</li>
              <li>✓ 7-day free trial</li>
            </ul>
            <a href="/login" className={styles.btnPrimaryFull}>Start 7-day trial →</a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to take control of your time?</h2>
        <p className={styles.ctaSub}>Join freelancers who use FlowTime to work smarter, not harder.</p>
        <a href="/login" className={styles.btnPrimaryLg}>Start for free →</a>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.logo} style={{color:'#9090a8'}}>
            <div className={styles.logoIcon}>⚡</div>
            FlowTime
          </div>
          <div className={styles.footerLinks}>
            <a href="/login">Sign in</a>
            <a href="/login">Sign up</a>
          </div>
          <div className={styles.footerCopy}>© 2025 FlowTime. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
