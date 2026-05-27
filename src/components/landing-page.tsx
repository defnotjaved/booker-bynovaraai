"use client";

import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BookingModal } from "@/components/ui/booking-modal";
import { MapPin, Phone, Clock, Star, Scissors, CheckCircle2 } from "lucide-react";
import type { Service } from "@/lib/types";

interface Barber {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

const REVIEWS = [
  {
    text: "Excellent service. Got exactly what I asked for on all occasions",
    author: "Icon Barbers Customer",
    stars: 5,
  },
  {
    text: "Great and professional service",
    author: "Icon Barbers Customer",
    stars: 5,
  },
  {
    text: "Best barbers in Trinidad. Always clean and professional. Highly recommend!",
    author: "Icon Barbers Customer",
    stars: 5,
  },
];

const ABOUT_TEXT =
  "For over 23 years, Icon Barbers has been a trusted destination for grooming excellence in Trinidad and Tobago. Our team blends clean fades, sharp beard work, and consistent personal service so every client leaves looking polished and feeling taken care of.";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

function Section({
  children,
  id,
  style,
}: {
  children: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.section
      id={id}
      variants={staggerContainer}
      initial={false}
      animate="visible"
      style={style}
    >
      {children}
    </motion.section>
  );
}

/* ─── Shared label style ─── */
const EYEBROW: React.CSSProperties = {
  color: "var(--accent)",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: 10,
};

export function LandingPage({ barbers, services }: { barbers: Barber[]; services: Service[] }) {
  const scrollToBook = () =>
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)", overflowX: "hidden" }}>
      <TopBar variant="public" onBookNow={scrollToBook} />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        id="hero"
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #0e0e0e 55%, #1c0d00 100%)",
          padding: "clamp(80px, 10vh, 120px) clamp(20px, 5vw, 80px) clamp(60px, 8vh, 80px)",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute", top: "40%", left: "18%",
            transform: "translate(-50%, -50%)",
            width: 640, height: 640, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,123,32,0.1) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="hero-grid"
          style={{
            width: "100%", maxWidth: 1200, margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60, alignItems: "center",
          }}
        >
          {/* LEFT — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(244,123,32,0.1)", border: "1px solid rgba(244,123,32,0.28)",
                borderRadius: 100, padding: "6px 16px", marginBottom: 28,
              }}
            >
              <Scissors size={13} color="var(--accent)" />
              <span style={{ color: "var(--accent)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 11 }}>
                Serving Trinidad Since 2001
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(3rem, 6vw, 5.5rem)",
                fontWeight: 900,
                lineHeight: 1.0,
                marginBottom: 14,
                letterSpacing: "-0.03em",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg, var(--ink) 40%, #ffb68b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Icon Barbers
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              style={{
                fontSize: "clamp(1rem, 2vw, 1.35rem)",
                color: "var(--accent-soft)",
                marginBottom: 14,
                fontWeight: 500,
                letterSpacing: "0.03em",
              }}
            >
              Precision Cuts. Personal Service.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ fontSize: 16, color: "var(--ink-3)", lineHeight: 1.7, maxWidth: 460, marginBottom: 40 }}
            >
              Trinidad&apos;s premier barbershop. Over 23 years of professional grooming in Aranguez.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.52 }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <button
                onClick={scrollToBook}
                className="btn btn-primary btn-lg btn-glow"
                style={{ animation: "pulseGlow 3s ease-in-out infinite" }}
              >
                Book Appointment
              </button>
              <a href="#about" className="btn btn-secondary btn-lg" style={{ textDecoration: "none" }}>
                Learn More
              </a>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.68 }}
              style={{
                display: "flex", marginTop: 52, flexWrap: "wrap",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                width: "fit-content", maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              {[
                { value: "23+",    label: "Years of Service" },
                { value: "5.0 ★", label: "Average Rating" },
                { value: "174+",   label: "5-Star Reviews" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    padding: "16px 24px",
                    borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
                    textAlign: "center", flex: "1 1 auto",
                  }}
                >
                  <div style={{
                    fontSize: "1.45rem", fontWeight: 800, color: "var(--accent)",
                    fontFamily: "var(--font-code)",
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3, letterSpacing: "0.04em" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — video bubble */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div
              style={{
                width: "100%", maxWidth: 520,
                borderRadius: 22, overflow: "hidden",
                border: "1px solid rgba(244,123,32,0.28)",
                boxShadow: "0 0 60px rgba(244,123,32,0.16), 0 24px 80px rgba(0,0,0,0.64)",
                background: "#0d0d0d", position: "relative",
              }}
            >
              {/* Window chrome */}
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {["#EF4444", "#F59E0B", "#22C55E"].map((c) => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
                ))}
                <span style={{ marginLeft: 8, fontSize: 11, color: "var(--ink-3)", fontFamily: "monospace" }}>
                  icon-barbers-aranguez.mp4
                </span>
              </div>
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="/assets/iconbarber1.jpeg"
                style={{ width: "100%", display: "block", aspectRatio: "4 / 5", objectFit: "cover" }}
              >
                <source src="/assets/iconbarbers.mp4" type="video/mp4" />
                Your browser does not support the shop preview video.
              </video>
              <div
                style={{
                  position: "absolute", bottom: -1, left: 0, right: 0, height: 3,
                  background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INLINE BOOKING
      ══════════════════════════════════════════ */}
      <section
        id="book"
        style={{
          borderTop: "2px solid var(--accent)",
          background: "var(--panel)",
          padding: "72px clamp(20px, 5vw, 80px)",
        }}
      >
        <div
          className="book-grid"
          style={{
            maxWidth: 1200, margin: "0 auto",
            display: "grid", gridTemplateColumns: "3fr 2fr",
            gap: 52, alignItems: "start",
          }}
        >
          {/* Booking widget */}
          <BookingModal
            variant="inline"
            isOpen={true}
            onClose={() => {}}
            barbers={barbers}
            services={services}
          />

          {/* CTA copy */}
          <div style={{ paddingTop: 4 }}>
            <span style={EYEBROW}>Book Online</span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 900, lineHeight: 1.1,
                letterSpacing: "-0.025em", marginBottom: 16,
              }}
            >
              Book Your<br />Next Cut
            </h2>
            <p style={{ color: "var(--ink-3)", lineHeight: 1.8, fontSize: 15, marginBottom: 28 }}>
              Pick your service, choose your barber, lock in your slot — all in under a minute. No account needed.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: <Clock size={16} color="var(--accent)" />, label: "Hours", value: "Mon – Sat · 9:00 AM – 7:00 PM" },
                { icon: <MapPin size={16} color="var(--accent)" />, label: "Location", value: "#3 Chotoo Rd, Aranguez, Trinidad" },
                { icon: <Phone size={16} color="var(--accent)" />, label: "Phone", value: "(868) 779-8508", href: "tel:+18687798508" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "rgba(244,123,32,0.1)", border: "1px solid rgba(244,123,32,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
                      {item.label}
                    </div>
                    {item.href ? (
                      <a href={item.href} style={{ fontSize: 14, color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
                        {item.value}
                      </a>
                    ) : (
                      <div style={{ fontSize: 14, color: "var(--ink)" }}>{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--line)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill="var(--accent)" color="var(--accent)" />
              ))}
              <span style={{ fontWeight: 700, fontSize: 15, marginLeft: 4, fontFamily: "var(--font-code)" }}>5.0</span>
              <span style={{ color: "var(--ink-3)", fontSize: 13 }}>· 174 reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════ */}
      <Section id="about" style={{ padding: "96px clamp(20px, 5vw, 80px)", maxWidth: 1100, margin: "0 auto" }}>
        <div
          className="about-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}
        >
          <motion.div variants={fadeUp}>
            <span style={EYEBROW}>About Us</span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 800, lineHeight: 1.15,
                marginBottom: 18,
              }}
            >
              23 Years of Grooming Excellence
            </h2>
            <p style={{ color: "var(--ink-3)", lineHeight: 1.8, fontSize: 15 }}>{ABOUT_TEXT}</p>

            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Professional & Certified Barbers",
                "Modern & Traditional Techniques",
                "Clean, Welcoming Environment",
                "Child-Friendly · Accessible · Parking",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 size={16} color="var(--accent)" />
                  <span style={{ fontSize: 14, color: "var(--ink-2)" }}>{item}</span>
                </div>
              ))}
            </div>

            <button onClick={scrollToBook} className="btn btn-secondary" style={{ marginTop: 36 }}>
              Book a Visit
            </button>
          </motion.div>

          {/* Storefront photo */}
          <motion.div
            variants={fadeUp}
            style={{
              borderRadius: 22, overflow: "hidden",
              border: "1px solid var(--line)", position: "relative",
              boxShadow: "0 0 60px rgba(244,123,32,0.07), var(--shadow-lg)",
            }}
          >
            <img
              src="/assets/iconbarber1.jpeg"
              alt="Icon Barbers storefront, #3 Chotoo Rd, Aranguez"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            <div
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "20px 20px 16px",
                background: "linear-gradient(to top, rgba(19,19,19,0.9) 0%, transparent 100%)",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <MapPin size={14} color="var(--accent)" />
              <span style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>
                #3 Chotoo Rd, Aranguez, Trinidad
              </span>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════
          SERVICES
      ══════════════════════════════════════════ */}
      <Section
        id="services"
        style={{
          padding: "96px clamp(20px, 5vw, 80px)",
          background: "var(--panel)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={EYEBROW}>What We Offer</span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 800,
              }}
            >
              Our Services
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                variants={fadeUp}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3 }}
                className="card"
                style={{ padding: "26px 24px", display: "flex", flexDirection: "column", gap: 14, cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 17, fontWeight: 700, lineHeight: 1.3,
                    }}
                  >
                    {service.name}
                  </h3>
                  <span
                    style={{
                      background: "rgba(244,123,32,0.12)", color: "var(--accent)",
                      borderRadius: 8, padding: "4px 10px",
                      fontSize: 15, fontWeight: 800, whiteSpace: "nowrap",
                      fontFamily: "var(--font-code)",
                    }}
                  >
                    TT${service.price}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={13} color="var(--ink-3)" />
                  <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{service.durationMinutes} min</span>
                </div>
                <button onClick={scrollToBook} className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
                  Book This Service
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════ */}
      <Section id="reviews" style={{ padding: "96px clamp(20px, 5vw, 80px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={EYEBROW}>What Clients Say</span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 800, marginBottom: 10,
              }}
            >
              Trusted by Trinidad
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={17} fill="var(--accent)" color="var(--accent)" />
              ))}
              <span style={{ fontWeight: 700, fontSize: 16, marginLeft: 6, fontFamily: "var(--font-code)" }}>5.0</span>
              <span style={{ color: "var(--ink-3)", fontSize: 14 }}>· 174 reviews on Google</span>
            </div>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {REVIEWS.map((review, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -2 }}
                className="card"
                style={{ padding: "26px 24px" }}
              >
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: review.stars }).map((_, s) => (
                    <Star key={s} size={14} fill="var(--accent)" color="var(--accent)" />
                  ))}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--ink-2)", marginBottom: 14, fontStyle: "italic" }}>
                  &ldquo;{review.text}&rdquo;
                </p>
                <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>— {review.author}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════
          BOOKING CTA BAND
      ══════════════════════════════════════════ */}
      <section
        style={{
          padding: "96px clamp(20px, 5vw, 80px)",
          background: "linear-gradient(135deg, #1c0d00 0%, #0e0e0e 60%, #1a0800 100%)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 560, height: 560, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,123,32,0.1) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Scissors size={28} color="var(--accent)" style={{ marginBottom: 20 }} />
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 900, marginBottom: 14, letterSpacing: "-0.025em",
            }}
          >
            Ready for a Fresh Cut?
          </h2>
          <p style={{ color: "var(--ink-3)", marginBottom: 36, lineHeight: 1.7, fontSize: 16 }}>
            Book your appointment online in seconds. Choose your barber, pick a time, and we&apos;ll see you at the shop.
          </p>
          <button
            onClick={scrollToBook}
            className="btn btn-primary btn-lg btn-glow"
            style={{ animation: "pulseGlow 3s ease-in-out infinite" }}
          >
            Book Now — It&apos;s Free
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════ */}
      <Section id="contact" style={{ padding: "96px clamp(20px, 5vw, 80px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={EYEBROW}>Find Us</span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800,
              }}
            >
              Visit the Shop
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            {[
              {
                icon: <MapPin size={22} color="var(--accent)" />,
                label: "Address",
                value: "#3 Chotoo Rd, Aranguez\nSan Juan-Laventille, Trinidad",
              },
              {
                icon: <Phone size={22} color="var(--accent)" />,
                label: "Phone",
                value: "(868) 779-8508",
                href: "tel:+18687798508",
              },
              {
                icon: <Clock size={22} color="var(--accent)" />,
                label: "Hours",
                value: "Mon – Sat\n9:00 AM – 7:00 PM",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -2 }}
                className="card"
                style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: "rgba(244,123,32,0.1)", border: "1px solid rgba(244,123,32,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    {item.label}
                  </div>
                  {item.href ? (
                    <a href={item.href} style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
                      {item.value}
                    </a>
                  ) : (
                    <div style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)", whiteSpace: "pre-line" }}>
                      {item.value}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          padding: "36px clamp(20px, 5vw, 80px)",
          background: "var(--panel)",
        }}
      >
        <div
          style={{
            maxWidth: 1000, margin: "0 auto",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="brand-icon" style={{ width: 30, height: 30 }}>
              <Scissors size={14} />
            </span>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 16 }}>
              <span style={{ color: "var(--ink-3)" }}>Icon</span>
              <span style={{ color: "var(--ink)" }}>Book</span>
            </span>
          </div>
          <nav style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { href: "#services", label: "Services" },
              { href: "#about",    label: "About" },
              { href: "#reviews",  label: "Reviews" },
              { href: "#contact",  label: "Contact" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{ color: "var(--ink-3)", fontSize: 14, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--ink)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--ink-3)")}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <span style={{ color: "var(--ink-3)", fontSize: 13 }}>
            © {new Date().getFullYear()} Icon Barbers · (868) 779-8508
          </span>
        </div>
      </footer>
    </div>
  );
}
