import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
  social?: boolean;
}

const footerLinks: FooterSection[] = [
  {
    label: 'Browse',
    links: [
      { title: 'Home', href: '#home' },
      { title: 'Series', href: '#series' },
      { title: 'Films', href: '#films' },
      { title: 'New & Popular', href: '#new' },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'About CineFind', href: '#about' },
      { title: 'FAQs', href: '#faqs' },
      { title: 'Privacy Policy', href: '#privacy' },
      { title: 'Terms of Service', href: '#terms' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { title: 'Help Center', href: '#help' },
      { title: 'Contact Us', href: '#contact' },
      { title: 'Careers', href: '#careers' },
      { title: 'Press', href: '#press' },
    ],
  },
  {
    label: 'Follow Us',
    social: true,
    links: [
      { title: 'Facebook', href: '#', icon: FacebookIcon },
      { title: 'Instagram', href: '#', icon: InstagramIcon },
      { title: 'YouTube', href: '#', icon: YoutubeIcon },
      { title: 'LinkedIn', href: '#', icon: LinkedinIcon },
    ],
  },
];

export interface FooterProps {
  /** Small print rendered under the copyright line (e.g. TMDB attribution). */
  note?: ReactNode;
}

/** A single nav-style footer link: dot marker that stretches + glows, underline that draws in on hover. */
function FooterLinkRow({ link, index }: { link: FooterLink; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={link.href}
        className="group relative inline-flex items-center gap-2 py-0.5 text-sm text-muted-foreground no-underline transition-colors duration-300 hover:text-[var(--accent-hover)]"
      >
        <span
          aria-hidden="true"
          className="h-1 w-1 shrink-0 rounded-full bg-[var(--fg-dim)] transition-all duration-300 ease-out group-hover:w-3 group-hover:bg-[var(--accent)] group-hover:shadow-[0_0_8px_var(--accent-glow)]"
        />
        <span className="relative">
          {link.title}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--accent-hover)] transition-all duration-300 ease-out group-hover:w-full" />
        </span>
      </a>
    </motion.li>
  );
}

/** Social row: glowing circular icon buttons with a tooltip that rises on hover. */
function SocialRow({ links }: { links: FooterLink[] }) {
  return (
    <ul className="mt-4 flex list-none items-center justify-center gap-3 p-0">
      {links.map((link, i) => {
        const Icon = link.icon!;
        return (
          <motion.li
            key={link.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.a
              href={link.href}
              aria-label={link.title}
              whileHover={{ y: -4, scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 380, damping: 20 }}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-black/40 text-muted-foreground no-underline transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--accent-hover)] hover:shadow-[0_0_18px_var(--accent-glow)]"
            >
              <Icon className="size-4" />
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--surface-2)] px-2 py-1 text-[11px] font-semibold text-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                {link.title}
              </span>
            </motion.a>
          </motion.li>
        );
      })}
    </ul>
  );
}

export function Footer({ note }: FooterProps) {
  return (
    <footer className="md:rounded-t-6xl relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-4xl border-t border-[var(--border)] bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)] px-6 py-12 lg:py-16">

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] blur-[2px] shadow-[0_0_20px_var(--accent-glow)]"
      />

      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-4">
          <motion.p
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-fit cursor-default text-2xl tracking-[0.06em]"
            style={{ fontFamily: 'var(--display)', color: 'var(--fg)' }}
          >
            Cine<span style={{ color: 'var(--accent)', textShadow: '0 0 22px var(--accent-glow)' }}>Find</span>
          </motion.p>
          <p className="text-muted-foreground mt-8 text-sm md:mt-0">
            © {new Date().getFullYear()} CineFind. All rights reserved.
          </p>
          {note && (
            <p className="text-muted-foreground/80 max-w-xs border-l-2 border-[var(--border)] pl-3 text-xs leading-relaxed">
              {note}
            </p>
          )}
        </AnimatedContainer>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="relative inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="h-3 w-[3px] rounded-full"
                    style={{
                      background: 'linear-gradient(to bottom, var(--accent-hover), var(--accent))',
                      boxShadow: '0 0 8px var(--accent-glow)',
                    }}
                  />
                  {section.label}
                </h3>

                {section.social ? (
                  <SocialRow links={section.links} />
                ) : (
                  <ul className="mt-4 list-none space-y-2 p-0 text-sm">
                    {section.links.map((link, i) => (
                      <FooterLinkRow key={link.title} link={link} index={i} />
                    ))}
                  </ul>
                )}
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

type AnimatedContainerProps = {
  delay?: number;
  className?: string;
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}