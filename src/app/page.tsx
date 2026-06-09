import Link from 'next/link';
import { BookOpen, Users, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import Card from '@/components/Card';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.nav}>
          <div className={styles.logo}>
            <span className={styles.logoDot} />
            EMBA Connect
          </div>
          <div className={styles.navLinks}>
            <Link href="/login" className={styles.navLink}>
              Login
            </Link>
            <Link href="/signup" className={styles.primaryBtn} style={{ padding: '6px 16px', fontSize: '12px' }}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="animate-fade-in">
        <section className={styles.hero}>
          <span className={styles.badge}>Next-Gen Academic Hub</span>
          <h1 className={styles.title}>Academic management, simplified.</h1>
          <p className={styles.subtitle}>
            A secure, role-based platform designed for Executive MBA candidates, professors, and administrators. Manage syllabi, Zoom links, and grading in one unified experience.
          </p>
          <div className={styles.cta}>
            <Link href="/login" className={styles.primaryBtn}>
              Sign In to Dashboard
            </Link>
            <Link href="/signup" className={styles.secondaryBtn}>
              Register New Account
            </Link>
          </div>
        </section>

        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>Designed for every role</h2>
          <div className={styles.grid}>
            <Card>
              <div className={styles.iconWrapper}>
                <ShieldCheck size={24} />
              </div>
              <h3 className={styles.featTitle}>Super Admin</h3>
              <p className={styles.featDesc}>
                Take full control of the platform. Manage system settings, view system-wide analytics, and configure user registrations.
              </p>
            </Card>

            <Card>
              <div className={styles.iconWrapper}>
                <Users size={24} />
              </div>
              <h3 className={styles.featTitle}>Admin</h3>
              <p className={styles.featDesc}>
                Keep the institution running. Approve user registrations, manage professors and students, and monitor platform logs.
              </p>
            </Card>

            <Card>
              <div className={styles.iconWrapper}>
                <BookOpen size={24} />
              </div>
              <h3 className={styles.featTitle}>Professor</h3>
              <p className={styles.featDesc}>
                Teach without barriers. Share syllabus documents, schedule classes with Zoom broadcast links, and grade homework sheets.
              </p>
            </Card>

            <Card>
              <div className={styles.iconWrapper}>
                <Calendar size={24} />
              </div>
              <h3 className={styles.featTitle}>Student</h3>
              <p className={styles.featDesc}>
                Learn without friction. Download syllabus sheets, join Zoom meetings, submit class assignments, and track attendance.
              </p>
            </Card>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} EMBA Connect. Premium Academic Systems. Inspired by minimalist aesthetics.</p>
      </footer>
    </div>
  );
}
