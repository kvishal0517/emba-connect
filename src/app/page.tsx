import Link from 'next/link';
import { BookOpen, Users, ShieldCheck, GraduationCap } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.nav}>
          <div className={styles.logo}>
            <span className={styles.logoSeal}>EC</span>
            EMBA Connect
          </div>
          <div className={styles.navLinks}>
            <Link href="/login" className={styles.navLink}>
              Login
            </Link>
            <Link href="/signup" className={styles.primaryBtn} style={{ padding: '8px 20px', fontSize: '13px' }}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="animate-fade-in">
        <section className={styles.hero}>
          <span className={styles.badge}>Executive Admissions & Leadership Portal</span>
          <h1 className={styles.title}>
            Shaping the Future of <br />
            <span className={styles.titleEmphasis}>Global Leadership</span>
          </h1>
          <p className={styles.subtitle}>
            A prestigious, unified console custom-tailored for Executive MBA candidates, distinguished faculty, and program administrators. Seamlessly manage course curricula, live lectures, and academic performance.
          </p>
          <div className={styles.cta}>
            <Link href="/login" className={styles.primaryBtn}>
              Enter Portal Console
            </Link>
            <Link href="/signup" className={styles.secondaryBtn}>
              Request New Registration
            </Link>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>An Integrated Academic Core</h2>
            <p className={styles.sectionSubtitle}>
              Tailored workspace consoles designed to support every role in the executive educational lifecycle with high-level efficiency.
            </p>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.featCard}>
              <div className={styles.cardContent}>
                <div className={styles.iconWrapper}>
                  <ShieldCheck size={26} />
                </div>
                <h3 className={styles.featTitle}>Program Directors</h3>
                <p className={styles.featDesc}>
                  Maintain full system authority. Oversee platform configurations, toggle registration requirements, rename the institutional portal, and analyze high-level metrics.
                </p>
              </div>
            </div>

            <div className={styles.featCard}>
              <div className={styles.cardContent}>
                <div className={styles.iconWrapper}>
                  <Users size={26} />
                </div>
                <h3 className={styles.featTitle}>Registrar & Admins</h3>
                <p className={styles.featDesc}>
                  Manage admissions and student records. Review and approve incoming executive registrations, coordinate student course enrollments, and audit active users.
                </p>
              </div>
            </div>

            <div className={styles.featCard}>
              <div className={styles.cardContent}>
                <div className={styles.iconWrapper}>
                  <GraduationCap size={26} />
                </div>
                <h3 className={styles.featTitle}>Distinguished Faculty</h3>
                <p className={styles.featDesc}>
                  Deliver curricular content without administrative friction. Upload term syllabi, broadcast scheduled Zoom lectures, distribute grades, and oversee attendance.
                </p>
              </div>
            </div>

            <div className={styles.featCard}>
              <div className={styles.cardContent}>
                <div className={styles.iconWrapper}>
                  <BookOpen size={26} />
                </div>
                <h3 className={styles.featTitle}>Executive Candidates</h3>
                <p className={styles.featDesc}>
                  Engage in executive learning. Access documents, join interactive Zoom meetings, submit assignment solutions, track grades, and log class attendance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerMotto}>SAPIENTIA ET DOCTRINA &bull; WISDOM AND LEARNING</span>
        <p>&copy; {new Date().getFullYear()} EMBA Connect. Prestigious Academic Leadership Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
