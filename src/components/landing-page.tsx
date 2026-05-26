"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BookingModal } from "@/components/ui/booking-modal";
import { MapPin, Phone, Clock, Star, Scissors, CheckCircle2, ChevronRight } from "lucide-react";
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
  "For over 23 years, The Lounge Barber Salon has been a cornerstone of grooming excellence in Trinidad and Tobago. Renowned for our premium services, our skilled team of barbers delivers personalised attention and exceptional grooming experiences. Combining traditional techniques with modern styles, we remain at the forefront of industry trends, ensuring each haircut, hairstyle, and beard trim is executed with precision and finesse.";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({ children, id, style }: { children: React.ReactNode; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={style}
    >
      {children}
    </motion.section>
  );
}

export function LandingPage({ barbers, services }: { barbers: Barber[]; services: Service[] }) {
  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)", overflowX: "hidden" }}>
      <TopBar variant="public" onBookNow={() => { document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }} />

      {/* ── HERO ── */}
      <section
        id="hero"
        className="hero-section"
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0a 55%, #1c0d00 100%)",
          padding: "clamp(80px, 10vh, 120px) 5vw clamp(60px, 8vh, 80px)",
        }}
      >
        {/* Subtle background glow behind text */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "15%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,121,32,0.09) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Two-column layout ── */}
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 56,
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* LEFT — text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(244,121,32,0.12)",
                border: "1px solid rgba(244,121,32,0.3)",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 28,
              }}
            >
              <Scissors size={14} color="var(--accent)" />
              <span
                style={{
                  color: "var(--accent)",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
              >
                Serving Trinidad Since 2001
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              style={{
                fontSize: "clamp(2.8rem, 5.5vw, 5.2rem)",
                fontWeight: 900,
                lineHeight: 1.02,
                marginBottom: 16,
                letterSpacing: "-0.03em",
              }}
            >
              Icon Barbers
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                fontSize: "clamp(1rem, 2vw, 1.4rem)",
                color: "var(--accent)",
                marginBottom: 16,
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              Precision Cuts. Personal Service.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              style={{
                fontSize: 16,
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: 460,
                marginBottom: 44,
              }}
            >
              Trinidad&apos;s premier barbershop. Over 23 years of professional grooming in Aranguez.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <a
                href="#book"
                className="btn btn-primary btn-lg"
                style={{ animation: "pulseGlow 2.5s ease-in-out infinite", textDecoration: "none" }}
              >
                Book Appointment
                <ChevronRight size={16} />
              </a>
              <a
                href="#about"
                className="btn btn-ghost btn-lg"
                style={{ textDecoration: "none" }}
              >
                Learn More
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              style={{
                display: "flex",
                marginTop: 52,
                flexWrap: "wrap",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                width: "fit-content",
                maxWidth: "100%",
              }}
            >
              {[
                { value: "23+", label: "Years of Service" },
                { value: "5.0 ★", label: "Average Rating" },
                { value: "174+", label: "5-Star Reviews" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    padding: "16px 24px",
                    borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                    textAlign: "center",
                    flex: "1 1 auto",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — floating video bubble */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 520,
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid rgba(244,121,32,0.25)",
                boxShadow: "0 0 60px rgba(244,121,32,0.18), 0 24px 80px rgba(0,0,0,0.6)",
                background: "#0d0d0d",
                position: "relative",
              }}
            >
              {/* fake window chrome */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.04)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {["#e63946", "#f0a500", "#2dc653"].map((c) => (
                  <div
                    key={c}
                    style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }}
                  />
                ))}
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    color: "var(--muted)",
                    fontFamily: "monospace",
                  }}
                >
                  icon-barbers-aranguez.mp4
                </span>
              </div>
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", display: "block" }}
              >
                <source src="/assets/iconbarbers.mp4" type="video/mp4" />
              </video>
              {/* orange bottom glow */}
              <div
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── INLINE BOOKING ── */}
      <section
        id="book"
        style={{
          borderTop: "2px solid var(--accent)",
          background: "var(--panel)",
          padding: "72px 5vw",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 52,
            alignItems: "start",
          }}
          className="book-grid"
        >
          {/* Left: embedded booking widget */}
          <BookingModal
            variant="inline"
            isOpen={true}
            onClose={() => {}}
            barbers={barbers}
            services={services}
          />

          {/* Right: CTA copy */}
          <div style={{ paddingTop: 4 }}>
            <span
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Book Online
            </span>
            <h2
              style={{
                fontSize: "clamp(1.9rem, 3vw, 2.8rem)",
                fontWeight: 900,
                marginTop: 12,
                marginBottom: 16,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
              }}
            >
              Book Your<br />Next Cut
            </h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: 15, marginBottom: 28 }}>
              Pick your service, choose your barber, lock in your slot — all in under a minute. No account needed.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  icon: <Clock size={16} color="var(--accent)" />,
                  label: "Hours",
                  value: "Mon – Sat · 9:00 AM – 7:00 PM",
                },
                {
                  icon: <MapPin size={16} color="var(--accent)" />,
                  label: "Location",
                  value: "#3 Chotoo Rd, Aranguez, Trinidad",
                },
                {
                  icon: <Phone size={16} color="var(--accent)" />,
                  label: "Phone",
                  value: "(868) 779-8508",
                  href: "tel:+18687798508",
                },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(244,121,32,0.1)",
                      border: "1px solid rgba(244,121,32,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        style={{ fontSize: 14, color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div style={{ fontSize: 14, color: "var(--ink)" }}>{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} fill="var(--accent)" color="var(--accent)" />
              ))}
              <span style={{ fontWeight: 700, fontSize: 15, marginLeft: 4, fontFamily: "'JetBrains Mono', monospace" }}>5.0</span>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>· 174 reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <Section id="about" style={{ padding: "96px 24px", maxWidth: 1060, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
          className="about-grid"
        >
          <motion.div variants={fadeUp}>
            <span
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              About Us
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 800,
                marginTop: 12,
                marginBottom: 20,
                lineHeight: 1.2,
              }}
            >
              23 Years of Grooming Excellence
            </h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: 15 }}>{ABOUT_TEXT}</p>

            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Professional & Certified Barbers",
                "Modern & Traditional Techniques",
                "Clean, Welcoming Environment",
                "Child-Friendly · Accessible · Parking",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 size={16} color="var(--accent)" />
                  <span style={{ fontSize: 14, color: "var(--ink)" }}>{item}</span>
                </div>
              ))}
            </div>

            <a
              href="#book"
              className="btn btn-secondary"
              style={{ marginTop: 36, textDecoration: "none" }}
            >
              Book a Visit
              <ChevronRight size={14} />
            </a>
          </motion.div>

          {/* Storefront photo */}
          <motion.div
            variants={fadeUp}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid var(--line)",
              position: "relative",
              boxShadow: "0 0 60px rgba(244,121,32,0.08)",
            }}
          >
            <img
              src="/assets/iconbarber1.jpeg"
              alt="Icon Barbers storefront, #3 Chotoo Rd, Aranguez"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px 20px 16px",
                background: "linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 100%)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MapPin size={14} color="var(--accent)" />
              <span style={{ fontSize: 13, color: "rgba(240,240,240,0.85)", fontWeight: 500 }}>
                #3 Chotoo Rd, Aranguez, Trinidad
              </span>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── SERVICES ── */}
      <Section
        id="services"
        style={{
          padding: "96px 24px",
          background: "var(--panel)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 56 }}>
            <span
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              What We Offer
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, marginTop: 12 }}>
              Our Services
            </h2>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3, scale: 1.015 }}
                className="card card-hover"
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{service.name}</h3>
                  <span
                    style={{
                      background: "rgba(244,121,32,0.15)",
                      color: "var(--accent)",
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: 15,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                  >
                    TT${service.price}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={13} color="var(--muted)" />
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{service.durationMinutes} min</span>
                </div>
                <a
                  href="#book"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 8, textDecoration: "none", textAlign: "center", display: "block" }}
                >
                  Book This Service
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── REVIEWS ── */}
      <Section id="reviews" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 56 }}>
            <span
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              What Clients Say
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 800,
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              Trusted by Trinidad
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} fill="var(--accent)" color="var(--accent)" />
              ))}
              <span style={{ fontWeight: 700, fontSize: 18, marginLeft: 6 }}>5.0</span>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>· 174 reviews on Booksy</span>
            </div>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {REVIEWS.map((review, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3, scale: 1.015 }}
                className="card card-hover"
                style={{ padding: "28px 24px" }}
              >
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: review.stars }).map((_, s) => (
                    <Star key={s} size={14} fill="var(--accent)" color="var(--accent)" />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "var(--ink)",
                    marginBottom: 16,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{review.text}&rdquo;
                </p>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>— {review.author}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── BOOKING CTA BAND ── */}
      <section
        style={{
          padding: "100px 24px",
          background: "linear-gradient(135deg, #1c0d00 0%, #0a0a0a 60%, #1a0800 100%)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,121,32,0.1) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Scissors size={28} color="var(--accent)" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Ready for a Fresh Cut?
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 36, lineHeight: 1.7, fontSize: 16 }}>
            Book your appointment online in seconds. Choose your barber, pick a time, and we&apos;ll see you at the shop.
          </p>
          <a
            href="#book"
            className="btn btn-primary btn-lg"
            style={{ animation: "pulseGlow 2.5s ease-in-out infinite", textDecoration: "none" }}
          >
            Book Now — It&apos;s Free
          </a>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <Section id="contact" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: 56 }}>
            <span
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Find Us
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, marginTop: 12 }}>
              Visit the Shop
            </h2>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
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
                whileHover={{ y: -3, scale: 1.015 }}
                className="card card-hover"
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                {item.icon}
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 6,
                    }}
                  >
                    {item.label}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--accent)",
                        textDecoration: "none",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                      {item.value}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          padding: "32px 24px",
          background: "var(--panel)",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Scissors size={16} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Icon Barbers</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { href: "#services", label: "Services" },
              { href: "#about", label: "About" },
              { href: "#reviews", label: "Reviews" },
              { href: "#contact", label: "Contact" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none" }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            © {new Date().getFullYear()} Icon Barbers · (868) 779-8508
          </span>
        </div>
      </footer>

    </div>
  );
}
